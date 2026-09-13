import Link from "next/link";
import { getDict } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <main>
      <h1 className="font-serif text-2xl text-ink">{t.notFound}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-inksoft">{t.notFoundHelp}</p>
      <Link href="/" className="btn btn-ghost mt-5">
        {t.home}
      </Link>
    </main>
  );
}
