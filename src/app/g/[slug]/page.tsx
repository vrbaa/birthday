import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getDict, formatDate, formatPrice } from "@/lib/i18n";
import GiftRow from "@/components/GiftRow";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const list = await prisma.list.findUnique({ where: { publicSlug: slug }, select: { title: true } });
  if (!list) return { title: "Popis želja" };
  return {
    title: list.title,
    description: "Popis želja — odaberi dar koji ćeš pokloniti.",
    openGraph: {
      title: list.title,
      description: "Popis želja — odaberi dar koji ćeš pokloniti.",
      type: "website",
    },
  };
}

export default async function GiverPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hide?: string }>;
}) {
  const { slug } = await params;
  const { hide } = await searchParams;
  const { lang, t } = await getDict();
  const store = await cookies();
  const giverId = store.get("giver")?.value ?? null;

  const list = await prisma.list.findUnique({
    where: { publicSlug: slug },
    select: {
      title: true,
      note: true,
      eventDate: true,
      archived: true,
      items: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          url: true,
          imageUrl: true,
          siteName: true,
          priceCents: true,
          currency: true,
          note: true,
          priority: true,
          status: true,
          // claimCode is never selected — it only ever leaves the server once,
          // in the response to the person who created the claim.
          claim: { select: { claimerName: true, giverId: true } },
        },
      },
    },
  });

  if (!list) notFound();

  if (list.archived) {
    return (
      <main>
        <h1 className="font-serif text-2xl text-ink">{list.title}</h1>
        <p className="mt-3 text-[15px] text-inksoft">{t.closed}</p>
      </main>
    );
  }

  const hideTaken = hide === "1";
  const sorted = [...list.items].sort((a, b) => Number(!!a.claim) - Number(!!b.claim));
  const shown = hideTaken ? sorted.filter((i) => !i.claim) : sorted;

  const labels = {
    claimIt: t.claimIt,
    youTake: t.youTake,
    undo: t.undo,
    notYou: t.notYou,
    releaseCode: t.releaseCode,
    release: t.release,
    wrongCode: t.wrongCode,
    yourName: t.yourName,
    yourNamePh: t.yourNamePh,
    nameRequired: t.nameRequired,
    confirm: t.confirm,
    cancel: t.cancel,
    claimedTitle: t.claimedTitle,
    yourCodeIs: t.yourCodeIs,
    keepCode: t.keepCode,
    gotIt: t.gotIt,
    tooLate: t.tooLate,
    prioNice: t.prioNice,
    prioLove: t.prioLove,
  };

  return (
    <main>
      <h1 className="font-serif text-3xl leading-tight text-ink">{list.title}</h1>
      {list.eventDate ? <p className="mt-1 text-sm text-inksoft">{formatDate(list.eventDate, lang)}</p> : null}
      {list.note ? <p className="mt-3 text-[15px] leading-relaxed text-inksoft">{list.note}</p> : null}

      <div className="my-4">
        <Link href={hideTaken ? `/g/${slug}` : `/g/${slug}?hide=1`} className="btn btn-quiet btn-sm">
          {hideTaken ? t.showTaken : t.hideTaken}
        </Link>
      </div>

      {list.items.length === 0 ? <p className="text-[15px] text-inksoft">{t.emptyPublic}</p> : null}

      <ul className="space-y-2.5">
        {shown.map((item) => (
          <GiftRow
            key={item.id}
            slug={slug}
            labels={labels}
            item={{
              id: item.id,
              title: item.title,
              url: item.url,
              imageUrl: item.imageUrl,
              siteName: item.siteName,
              note: item.note,
              priority: item.priority,
              priceLabel: formatPrice(item.priceCents, item.currency, lang),
              claimerName: item.claim?.claimerName ?? null,
              isMine: !!item.claim && !!giverId && item.claim.giverId === giverId,
            }}
          />
        ))}
      </ul>
    </main>
  );
}
