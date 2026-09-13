import { switchLang } from "@/app/actions";

export default function LangSwitch({ label }: { label: string }) {
  return (
    <form action={switchLang}>
      <button type="submit" className="rounded border border-line px-2.5 py-1 text-[13px] text-inksoft hover:text-ink">
        {label}
      </button>
    </form>
  );
}
