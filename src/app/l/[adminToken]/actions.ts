"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { newPublicSlug } from "@/lib/ids";

async function requireList(adminToken: string) {
  const list = await prisma.list.findUnique({
    where: { adminToken },
    select: { id: true, adminToken: true },
  });
  if (!list) notFound();
  return list;
}

const itemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  url: z.string().trim().url().max(2000).optional().or(z.literal("")),
  imageUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
  siteName: z.string().trim().max(120).optional().or(z.literal("")),
  price: z.string().trim().max(20).optional().or(z.literal("")),
  currency: z.string().trim().max(8).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  priority: z.enum(["", "NICE_TO_HAVE", "WOULD_LOVE_IT"]).optional(),
});

function readItemForm(formData: FormData) {
  const parsed = itemSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    siteName: formData.get("siteName") ?? "",
    price: formData.get("price") ?? "",
    currency: formData.get("currency") ?? "",
    note: formData.get("note") ?? "",
    priority: (formData.get("priority") as string) ?? "",
  });
  if (!parsed.success) return null;
  const d = parsed.data;

  const priceNumber = d.price ? Number(d.price.replace(",", ".").replace(/[^\d.]/g, "")) : NaN;

  return {
    title: d.title,
    url: d.url || null,
    imageUrl: d.imageUrl || null,
    siteName: d.siteName || null,
    priceCents: Number.isFinite(priceNumber) ? Math.round(priceNumber * 100) : null,
    currency: d.currency || (Number.isFinite(priceNumber) ? "EUR" : null),
    note: d.note || null,
    priority: d.priority ? d.priority : null,
  };
}

export async function addItem(adminToken: string, formData: FormData) {
  const list = await requireList(adminToken);
  const data = readItemForm(formData);
  if (!data) return;

  const last = await prisma.item.findFirst({
    where: { listId: list.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.item.create({
    data: { ...data, listId: list.id, position: (last?.position ?? -1) + 1 },
  });

  revalidatePath(`/l/${adminToken}`);
}

export async function updateItem(adminToken: string, itemId: string, formData: FormData) {
  const list = await requireList(adminToken);
  const data = readItemForm(formData);
  if (!data) return;

  await prisma.item.updateMany({ where: { id: itemId, listId: list.id }, data });

  revalidatePath(`/l/${adminToken}`);
  redirect(`/l/${adminToken}`);
}

export async function deleteItem(adminToken: string, formData: FormData) {
  const list = await requireList(adminToken);
  const itemId = String(formData.get("itemId") || "");
  await prisma.item.deleteMany({ where: { id: itemId, listId: list.id } });
  revalidatePath(`/l/${adminToken}`);
}

export async function moveItem(adminToken: string, formData: FormData) {
  const list = await requireList(adminToken);
  const itemId = String(formData.get("itemId") || "");
  const dir = formData.get("dir") === "up" ? -1 : 1;

  const items = await prisma.item.findMany({
    where: { listId: list.id },
    orderBy: { position: "asc" },
    select: { id: true, position: true },
  });

  const idx = items.findIndex((i) => i.id === itemId);
  const swap = idx + dir;
  if (idx < 0 || swap < 0 || swap >= items.length) return;

  await prisma.$transaction([
    prisma.item.update({ where: { id: items[idx].id }, data: { position: items[swap].position } }),
    prisma.item.update({ where: { id: items[swap].id }, data: { position: items[idx].position } }),
  ]);

  revalidatePath(`/l/${adminToken}`);
}

export async function updateList(adminToken: string, formData: FormData) {
  const list = await requireList(adminToken);
  const title = String(formData.get("title") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const eventDate = String(formData.get("eventDate") || "").trim();

  if (!title) return;

  await prisma.list.update({
    where: { id: list.id },
    data: { title, note: note || null, eventDate: eventDate ? new Date(eventDate) : null },
  });

  revalidatePath(`/l/${adminToken}`);
}

export async function archiveList(adminToken: string) {
  const list = await requireList(adminToken);
  await prisma.list.update({ where: { id: list.id }, data: { archived: true } });
  revalidatePath(`/l/${adminToken}`);
}

/**
 * Reopen for another year: every claim is dropped, every item goes back to
 * available, and the share link is rotated so last year's link can't resurface.
 */
export async function reopenList(adminToken: string, formData: FormData) {
  const list = await requireList(adminToken);
  const eventDate = String(formData.get("eventDate") || "").trim();

  await prisma.$transaction([
    prisma.claim.deleteMany({ where: { item: { listId: list.id } } }),
    prisma.item.updateMany({ where: { listId: list.id }, data: { status: "AVAILABLE" } }),
    prisma.list.update({
      where: { id: list.id },
      data: {
        archived: false,
        publicSlug: newPublicSlug(),
        eventDate: eventDate ? new Date(eventDate) : null,
      },
    }),
  ]);

  revalidatePath(`/l/${adminToken}`);
}

export async function deleteList(adminToken: string) {
  const list = await requireList(adminToken);
  await prisma.list.delete({ where: { id: list.id } });
  redirect("/");
}
