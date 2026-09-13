import { getDict } from "@/lib/i18n";
import CreateListForm from "@/components/CreateListForm";

export default async function HomePage() {
  const { t } = await getDict();

  return (
    <main>
      <h1 className="font-serif text-[2rem] leading-tight text-ink">{t.tagline}</h1>
      <div className="my-6 h-[3px] w-16 bg-ochre" />
      <CreateListForm
        labels={{
          newList: t.newList,
          listTitle: t.listTitle,
          listTitlePh: t.listTitlePh,
          eventDate: t.eventDate,
          eventDateHint: t.eventDateHint,
          note: t.note,
          notePh: t.notePh,
          create: t.create,
          titleRequired: t.titleRequired,
        }}
      />
    </main>
  );
}
