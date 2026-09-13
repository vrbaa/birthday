"use client";

import { useActionState, useState } from "react";
import { claimItem, releaseByCode, releaseOwn, type ClaimState, type ReleaseState } from "@/app/g/[slug]/actions";
import SubmitButton from "./SubmitButton";

type Labels = {
  claimIt: string;
  youTake: string;
  undo: string;
  notYou: string;
  releaseCode: string;
  release: string;
  wrongCode: string;
  yourName: string;
  yourNamePh: string;
  nameRequired: string;
  confirm: string;
  cancel: string;
  claimedTitle: string;
  yourCodeIs: string;
  keepCode: string;
  gotIt: string;
  tooLate: string;
  prioNice: string;
  prioLove: string;
};

type Gift = {
  id: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
  siteName: string | null;
  note: string | null;
  priority: "NICE_TO_HAVE" | "WOULD_LOVE_IT" | null;
  priceLabel: string | null;
  claimerName: string | null;
  isMine: boolean;
};

export default function GiftRow({ slug, item, labels }: { slug: string; item: Gift; labels: Labels }) {
  const [open, setOpen] = useState(false);
  const [showRelease, setShowRelease] = useState(false);
  const [claimState, claimAction] = useActionState<ClaimState, FormData>(
    claimItem.bind(null, slug, item.id),
    null,
  );
  const [releaseState, releaseAction] = useActionState<ReleaseState, FormData>(
    releaseByCode.bind(null, slug, item.id),
    null,
  );

  const taken = !!item.claimerName;

  return (
    <li
      className={`card border-l-4 ${
        item.isMine ? "border-l-ochre" : taken ? "border-l-muted bg-[#F3F5F2]" : "border-l-pine"
      }`}
    >
      <div className="flex gap-3">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className={`h-14 w-14 shrink-0 rounded object-cover ${taken ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded font-serif text-2xl ${
              taken ? "bg-[#D8DDD8] text-muted" : "bg-pine text-white"
            }`}
          >
            {item.title.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${taken ? "text-muted line-through" : "text-ink"}`}>{item.title}</p>
          {item.priceLabel ? (
            <p className={`text-sm ${taken ? "text-muted" : "text-inksoft"}`}>{item.priceLabel}</p>
          ) : null}
          {item.note ? (
            <p className={`mt-0.5 text-[13px] ${taken ? "text-muted" : "text-inksoft"}`}>{item.note}</p>
          ) : null}
          {item.priority && !taken ? (
            <span className="mt-1.5 inline-block rounded border border-ochre px-1.5 py-0.5 text-xs text-ochre">
              {item.priority === "WOULD_LOVE_IT" ? labels.prioLove : labels.prioNice}
            </span>
          ) : null}
          {item.url ? (
            <p className="mt-1.5">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[13px] text-pine underline underline-offset-2"
              >
                {item.siteName || new URL(item.url).hostname.replace(/^www\./, "")}
              </a>
            </p>
          ) : null}

          <div className="mt-2.5">
            {!taken && !open ? (
              <button type="button" onClick={() => setOpen(true)} className="btn btn-primary btn-sm">
                {labels.claimIt}
              </button>
            ) : null}

            {!taken && open ? (
              <form action={claimAction} className="mt-1">
                <label className="label" htmlFor={`name-${item.id}`}>
                  {labels.yourName}
                </label>
                <input
                  id={`name-${item.id}`}
                  name="name"
                  className="input mb-2"
                  placeholder={labels.yourNamePh}
                  maxLength={60}
                  autoFocus
                />
                {claimState?.nameMissing ? <p className="mb-2 text-sm text-danger">{labels.nameRequired}</p> : null}
                <div className="flex gap-2">
                  <SubmitButton className="btn btn-primary btn-sm">{labels.confirm}</SubmitButton>
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-quiet btn-sm">
                    {labels.cancel}
                  </button>
                </div>
              </form>
            ) : null}

            {claimState?.taken ? <p className="mt-2 text-sm text-danger">{labels.tooLate}</p> : null}

            {claimState?.code ? (
              <div className="mt-2 rounded-lg border border-ochre bg-ochrebg p-3">
                <p className="font-serif text-lg text-pinedark">{labels.claimedTitle}</p>
                <p className="text-sm text-ink">{labels.yourCodeIs}</p>
                <p className="my-1 font-serif text-3xl tracking-[0.2em] text-ink">{claimState.code}</p>
                <p className="text-[13px] leading-snug text-inksoft">{labels.keepCode}</p>
              </div>
            ) : null}

            {taken && item.isMine ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ochre">{labels.youTake}</span>
                <form action={releaseOwn.bind(null, slug, item.id)}>
                  <SubmitButton className="btn btn-quiet btn-sm">{labels.undo}</SubmitButton>
                </form>
              </div>
            ) : null}

            {taken && !item.isMine ? (
              <div>
                <span className="text-sm text-muted">{item.claimerName}</span>
                {!showRelease ? (
                  <div>
                    <button type="button" onClick={() => setShowRelease(true)} className="btn btn-quiet btn-sm">
                      {labels.notYou}
                    </button>
                  </div>
                ) : (
                  <form action={releaseAction} className="mt-2">
                    <label className="label" htmlFor={`code-${item.id}`}>
                      {labels.releaseCode}
                    </label>
                    <input
                      id={`code-${item.id}`}
                      name="code"
                      className="input mb-2 uppercase tracking-[0.2em]"
                      maxLength={6}
                      autoFocus
                    />
                    {releaseState?.wrongCode ? <p className="mb-2 text-sm text-danger">{labels.wrongCode}</p> : null}
                    <div className="flex gap-2">
                      <SubmitButton className="btn btn-ghost btn-sm">{labels.release}</SubmitButton>
                      <button type="button" onClick={() => setShowRelease(false)} className="btn btn-quiet btn-sm">
                        {labels.cancel}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
