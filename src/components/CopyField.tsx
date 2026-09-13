"use client";

import { useState } from "react";

export default function CopyField({
  value,
  label,
  hint,
  copyLabel,
  copiedLabel,
  highlight,
}: {
  value: string;
  label: string;
  hint?: string;
  copyLabel: string;
  copiedLabel: string;
  highlight?: boolean;
}) {
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard blocked — the value is on screen anyway */
    }
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  return (
    <div className={highlight ? "rounded-lg border border-ochre bg-ochrebg p-3" : ""}>
      <div className="label">{label}</div>
      <div className="flex gap-2">
        <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} className="input font-mono text-sm" />
        <button type="button" onClick={copy} className="btn btn-ghost btn-sm shrink-0">
          {done ? copiedLabel : copyLabel}
        </button>
      </div>
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}
