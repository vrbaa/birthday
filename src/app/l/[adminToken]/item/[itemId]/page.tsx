import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n";
import ItemForm from "@/components/ItemForm";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ adminToken: string; itemId: string }>;
}) {
  const { adminToken, itemId } = await params;
  const { t } = await getDict();

  const list = await prisma.list.findUnique({ where: { adminToken }, select: { id: true } });
  if (!list) notFound();

  const item = await prisma.item.findFirst({
    where: { id: itemId, listId: list.id },
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
  });
  if (!item) notFound();

  return (
    <main>
      <ItemForm
        adminToken={adminToken}
        item={item}
        cancelHref={`/l/${adminToken}`}
        labels={{
          addGift: t.editGift,
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
        }}
      />
    </main>
  );
}
