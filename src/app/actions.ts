"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { newAdminToken, newPublicSlug } from "@/lib/ids";
import { LANG_COOKIE } from "@/lib/i18n";

export async function switchLang() {
  const store = await cookies();
  const current = store.get(LANG_COOKIE)?.value === "en" ? "en" : "hr";
  store.set(LANG_COOKIE, current === "hr" ? "en" : "hr", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  eventDate: z.string().trim().optional(),
  note: z.string().trim().max(2000).optional(),
});

export async function createList(_prev: { error?: string } | null, formData: FormData) {
  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    eventDate: formData.get("eventDate") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) return { error: "title" };

  const { title, eventDate, note } = parsed.data;
  const list = await prisma.list.create({
    data: {
      title,
      note: note || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      publicSlug: newPublicSlug(),
      adminToken: newAdminToken(),
    },
  });

  redirect(`/l/${list.adminToken}?created=1`);
}
