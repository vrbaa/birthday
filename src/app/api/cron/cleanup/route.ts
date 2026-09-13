import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deletes lists 30 days past their event date (or creation date when no date was
 * given), unless the owner archived them. Vercel calls this daily; see vercel.json.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.$executeRaw`
    DELETE FROM "List"
    WHERE "archived" = false
      AND COALESCE("eventDate", "createdAt") < NOW() - INTERVAL '30 days'
  `;

  return NextResponse.json({ deleted });
}
