"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { newClaimCode, newGiverId } from "@/lib/ids";

const GIVER_COOKIE = "giver";

async function getGiverId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GIVER_COOKIE)?.value;
  if (existing) return existing;

  const id = newGiverId();
  store.set(GIVER_COOKIE, id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}

export type ClaimState = { ok?: boolean; code?: string; taken?: boolean; nameMissing?: boolean } | null;

const nameSchema = z.string().trim().min(1).max(60);

/**
 * The whole point of the app. Two people tapping at the same moment must not
 * both win, so this never reads-then-writes: the conditional updateMany only
 * matches a row that is still AVAILABLE, and the unique index on Claim.itemId
 * rejects a second insert even if the updates somehow interleave.
 */
export async function claimItem(slug: string, itemId: string, _prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const parsedName = nameSchema.safeParse(formData.get("name"));
  if (!parsedName.success) return { nameMissing: true };

  const list = await prisma.list.findUnique({ where: { publicSlug: slug }, select: { id: true, archived: true } });
  if (!list || list.archived) return { taken: true };

  const giverId = await getGiverId();
  const claimCode = newClaimCode();

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.item.updateMany({
        where: { id: itemId, listId: list.id, status: "AVAILABLE" },
        data: { status: "CLAIMED" },
      });
      if (updated.count === 0) throw new Error("ALREADY_CLAIMED");

      await tx.claim.create({
        data: { itemId, claimerName: parsedName.data, claimCode, giverId },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      revalidatePath(`/g/${slug}`);
      return { taken: true };
    }
    if (e instanceof Error && e.message === "ALREADY_CLAIMED") {
      revalidatePath(`/g/${slug}`);
      return { taken: true };
    }
    throw e;
  }

  revalidatePath(`/g/${slug}`);
  return { ok: true, code: claimCode };
}

export type ReleaseState = { wrongCode?: boolean } | null;

/** Release own claim, identified by the browser cookie. */
export async function releaseOwn(slug: string, itemId: string) {
  const store = await cookies();
  const giverId = store.get(GIVER_COOKIE)?.value;
  if (!giverId) return;

  const claim = await prisma.claim.findUnique({ where: { itemId }, select: { giverId: true } });
  if (!claim || claim.giverId !== giverId) return;

  await prisma.$transaction([
    prisma.claim.delete({ where: { itemId } }),
    prisma.item.update({ where: { id: itemId }, data: { status: "AVAILABLE" } }),
  ]);

  revalidatePath(`/g/${slug}`);
}

/** Release from any device using the 6-character code. */
export async function releaseByCode(
  slug: string,
  itemId: string,
  _prev: ReleaseState,
  formData: FormData,
): Promise<ReleaseState> {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const claim = await prisma.claim.findUnique({ where: { itemId }, select: { claimCode: true } });

  if (!claim || claim.claimCode !== code) return { wrongCode: true };

  await prisma.$transaction([
    prisma.claim.delete({ where: { itemId } }),
    prisma.item.update({ where: { id: itemId }, data: { status: "AVAILABLE" } }),
  ]);

  revalidatePath(`/g/${slug}`);
  return null;
}
