import type { Metadata } from "next";
import "./globals.css";
import { getDict } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Popis želja",
  description: "Napravi popis darova i pošalji ga svojima.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getDict();
  return (
    <html lang={lang}>
      <body className="min-h-screen bg-paper font-sans antialiased">
        <div className="mx-auto max-w-app px-4 pb-20 pt-5">
          <header className="mb-6 flex items-center justify-between">
            <Link href="/" className="font-serif text-lg text-pinedark">
              {t.appName}
            </Link>
            <LangSwitch label={t.langSwitch} />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
