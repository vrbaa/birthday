"use client";

import { useState } from "react";
import { addItem, updateItem } from "@/app/l/[adminToken]/actions";
import SubmitButton from "./SubmitButton";

export type ItemLabels = {
  addGift: string;
  giftUrl: string;
  giftUrlHint: string;
  fetch: string;
  fetching: string;
  fetchFailed: string;
  giftTitle: string;
  giftTitlePh: string;
  giftPrice: string;
  giftNote: string;
  giftNotePh: string;
  priority: string;
  prioNone: string;
  prioNice: string;
  prioLove: string;
  save: string;
  cancel: string;
  urlChangeWarn: string;
};

export type ExistingItem = {
  id: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
  siteName: string | null;
  priceCents: number | null;
  currency: string | null;
  note: string | null;
  priority: "NICE_TO_HAVE" | "WOULD_LOVE_IT" | null;
};

export default function ItemForm({
  adminToken,
  labels,
  item,
  cancelHref,
}: {
  adminToken: string;
  labels: ItemLabels;
  item?: ExistingItem;
  cancelHref?: string;
}) {
  const [url, setUrl] = useState(item?.url ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [price, setPrice] = useState(item?.priceCents != null ? (item.priceCents / 100).toFixed(2) : "");
  const [currency, setCurrency] = useState(item?.currency ?? "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [siteName, setSiteName] = useState(item?.siteName ?? "");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const action = item
    ? updateItem.bind(null, adminToken, item.id)
    : addItem.bind(null, adminToken);

  /**
   * Best effort only. The form stays fully usable if this fails or times out —
   * a shop that blocks scrapers must never stop the owner saving the gift.
   */
  const lookup = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("lookup failed");
      const data = await res.json();
      if (data.title && !title) setTitle(data.title);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.siteName) setSiteName(data.siteName);
      if (data.price && !price) setPrice(String(data.price));
      if (data.currency && !currency) setCurrency(data.currency);
      if (!data.title && !data.imageUrl && !data.price) setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={action} className="card">
      <h2 className="mb-4 font-serif text-xl text-ink">{labels.addGift}</h2>

      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="siteName" value={siteName} />
      <input type="hidden" name="currency" value={currency} />

      <div className="mb-4">
        <label className="label" htmlFor="url">
          {labels.giftUrl}
        </label>
        <div className="flex gap-2">
          <input
            id="url"
            name="url"
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            inputMode="url"
          />
          <button type="button" onClick={lookup} className="btn btn-ghost btn-sm shrink-0" disabled={loading}>
            {loading ? labels.fetching : labels.fetch}
          </button>
        </div>
        <p className="hint">{labels.giftUrlHint}</p>
        {failed ? <p className="mt-1.5 text-sm text-danger">{labels.fetchFailed}</p> : null}
      </div>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="mb-4 h-24 w-24 rounded object-cover" />
      ) : null}

      <div className="mb-4">
        <label className="label" htmlFor="title">
          {labels.giftTitle}
        </label>
        <input
          id="title"
          name="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={labels.giftTitlePh}
          maxLength={200}
          required
        />
      </div>

      <div className="mb-4">
        <label className="label" htmlFor="price">
          {labels.giftPrice}
        </label>
        <input
          id="price"
          name="price"
          className="input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="120"
          inputMode="decimal"
        />
      </div>

      <div className="mb-4">
        <label className="label" htmlFor="note">
          {labels.giftNote}
        </label>
        <input
          id="note"
          name="note"
          className="input"
          defaultValue={item?.note ?? ""}
          placeholder={labels.giftNotePh}
          maxLength={500}
        />
      </div>

      <div className="mb-5">
        <label className="label" htmlFor="priority">
          {labels.priority}
        </label>
        <select id="priority" name="priority" className="input" defaultValue={item?.priority ?? ""}>
          <option value="">{labels.prioNone}</option>
          <option value="NICE_TO_HAVE">{labels.prioNice}</option>
          <option value="WOULD_LOVE_IT">{labels.prioLove}</option>
        </select>
      </div>

      <div className="flex gap-2">
        <SubmitButton
          className="btn btn-primary"
          confirm={item && url !== (item.url ?? "") ? labels.urlChangeWarn : undefined}
        >
          {labels.save}
        </SubmitButton>
        {cancelHref ? (
          <a href={cancelHref} className="btn btn-quiet">
            {labels.cancel}
          </a>
        ) : null}
      </div>
    </form>
  );
}
