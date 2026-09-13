import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDict, formatPrice, formatDate } from "@/lib/i18n";
import CopyField from "@/components/CopyField";
import SubmitButton from "@/components/SubmitButton";
import ItemForm from "@/components/ItemForm";
import { archiveList, deleteItem, deleteList, moveItem, reopenList } from "./actions";

export const dynamic = "force-dynamic";

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "";
}

export default async function OwnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ adminToken: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { adminToken } = await params;
  const { created } = await searchParams;
  const { lang, t } = await getDict();

  /**
   * The owner query deliberately does NOT select the claim relation or the item
   * status. Claim names are invisible here at the query level, not filtered out
   * later, so a future refactor of the view can't leak them.
   */
  const list = await prisma.list.findUnique({
    where: { adminToken },
    select: {
      id: true,
      publicSlug: true,
      title: true,
      note: true,
      eventDate: true,
      archived: true,
      createdAt: true,
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
        },
      },
    },
  });

  if (!list) notFound();

  const claimedCount = await prisma.item.count({
    where: { listId: list.id, status: "CLAIMED" },
  });

  const shareUrl = `${baseUrl()}/g/${list.publicSlug}`;
  const adminUrl = `${baseUrl()}/l/${adminToken}`;

  const expiryBase = list.eventDate ?? list.createdAt;
  const daysLeft = Math.ceil((expiryBase.getTime() + 30 * 864e5 - Date.now()) / 864e5);
  const showExpiry = !list.archived && daysLeft <= 7;

  const itemLabels = {
    addGift: t.addGift,
    giftUrl: t.giftUrl,
    giftUrlHint: t.giftUrlHint,
    fetch: t.fetch,
    fetching: t.fetching,
    fetchFailed: t.fetchFailed,
    giftTitle: t.giftTitle,
    giftTitlePh: t.giftTitlePh,
    giftPrice: t.giftPrice,
    giftNote: t.giftNote,
    giftNotePh: t.giftNotePh,
    priority: t.priority,
    prioNone: t.prioNone,
    prioNice: t.prioNice,
    prioLove: t.prioLove,
    save: t.save,
    cancel: t.cancel,
    urlChangeWarn: t.urlChangeWarn,
  };

  return (
    <main>
      {created ? (
        <section className="card mb-6">
          <h2 className="mb-4 font-serif text-xl text-ink">{t.savedTitle}</h2>
          <div className="mb-4">
            <CopyField
              value={shareUrl}
              label={t.shareLinkLabel}
              hint={t.shareLinkHelp}
              copyLabel={t.copy}
              copiedLabel={t.copied}
            />
          </div>
          <CopyField
            value={adminUrl}
            label={t.adminLinkLabel}
            hint={t.adminLinkHelp}
            copyLabel={t.copy}
            copiedLabel={t.copied}
            highlight
          />
          <div className="mt-4">
            <Link href={`/l/${adminToken}`} className="btn btn-primary w-full">
              {t.toMyList}
            </Link>
          </div>
        </section>
      ) : null}

      <h1 className="font-serif text-3xl leading-tight text-ink">{list.title}</h1>
      {list.eventDate ? <p className="mt-1 text-sm text-inksoft">{formatDate(list.eventDate, lang)}</p> : null}

      <section className="card my-5">
        <p className="font-serif text-xl text-pinedark">{t.counter(claimedCount, list.items.length)}</p>
        <p className="hint">{t.counterHelp}</p>
        <div className="mt-3 border-t border-line pt-3">
          <CopyField
            value={shareUrl}
            label={t.shareLinkLabel}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        </div>
      </section>

      {showExpiry ? (
        <div className="mb-5 rounded-lg border border-ochre bg-ochrebg p-3">
          <p className="text-sm text-ink">{t.expiresIn(Math.max(daysLeft, 0))}</p>
          <form action={archiveList.bind(null, adminToken)} className="mt-2">
            <SubmitButton className="btn btn-ghost btn-sm">{t.keepIt}</SubmitButton>
          </form>
        </div>
      ) : null}

      {list.archived ? (
        <div className="mb-5 rounded-lg border border-ochre bg-ochrebg p-3">
          <p className="mb-3 text-sm text-ink">{t.archived}</p>
          <form action={reopenList.bind(null, adminToken)} className="flex flex-wrap items-end gap-2">
            <div>
              <label className="label" htmlFor="reopenDate">
                {t.eventDate}
              </label>
              <input id="reopenDate" name="eventDate" type="date" className="input" />
            </div>
            <SubmitButton className="btn btn-ghost btn-sm" confirm={t.reopenWarn}>
              {t.reopen}
            </SubmitButton>
          </form>
        </div>
      ) : null}

      <ul className="space-y-2.5">
        {list.items.map((item) => (
          <li key={item.id} className="card border-l-4 border-l-pine">
            <div className="flex gap-3">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-pine font-serif text-2xl text-white">
                  {item.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{item.title}</p>
                {item.priceCents != null ? (
                  <p className="text-sm text-inksoft">{formatPrice(item.priceCents, item.currency, lang)}</p>
                ) : null}
                {item.siteName || item.url ? (
                  <p className="truncate text-[13px] text-muted">{item.siteName || item.url}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1">
                  <Link href={`/l/${adminToken}/item/${item.id}`} className="btn btn-quiet btn-sm">
                    {t.edit}
                  </Link>
                  <form action={deleteItem.bind(null, adminToken)}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <SubmitButton className="btn btn-quiet btn-sm" confirm={t.deleteItemWarn}>
                      {t.del}
                    </SubmitButton>
                  </form>
                  <form action={moveItem.bind(null, adminToken)}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="dir" value="up" />
                    <SubmitButton className="btn btn-quiet btn-sm">↑</SubmitButton>
                  </form>
                  <form action={moveItem.bind(null, adminToken)}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="dir" value="down" />
                    <SubmitButton className="btn btn-quiet btn-sm">↓</SubmitButton>
                  </form>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {list.items.length === 0 ? <p className="text-[15px] leading-relaxed text-inksoft">{t.emptyOwner}</p> : null}

      <section className="mt-6">
        <ItemForm adminToken={adminToken} labels={itemLabels} />
      </section>

      <section className="mt-10 border-t border-line pt-5">
        <h2 className="mb-3 font-serif text-lg text-ink">{t.listSettings}</h2>
        {!list.archived ? (
          <form action={archiveList.bind(null, adminToken)} className="mb-3">
            <SubmitButton className="btn btn-ghost btn-sm">{t.archive}</SubmitButton>
            <p className="hint">{t.archiveHelp}</p>
          </form>
        ) : null}
        <form action={deleteList.bind(null, adminToken)}>
          <SubmitButton className="btn btn-danger btn-sm" confirm={t.deleteListWarn}>
            {t.deleteList}
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}
