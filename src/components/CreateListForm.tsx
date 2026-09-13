"use client";

import { useActionState } from "react";
import { createList } from "@/app/actions";
import SubmitButton from "./SubmitButton";

export default function CreateListForm({
  labels,
}: {
  labels: {
    newList: string;
    listTitle: string;
    listTitlePh: string;
    eventDate: string;
    eventDateHint: string;
    note: string;
    notePh: string;
    create: string;
    titleRequired: string;
  };
}) {
  const [state, action] = useActionState(createList, null);

  return (
    <form action={action} className="card">
      <h2 className="mb-4 font-serif text-xl text-ink">{labels.newList}</h2>

      <div className="mb-4">
        <label className="label" htmlFor="title">
          {labels.listTitle}
        </label>
        <input id="title" name="title" className="input" placeholder={labels.listTitlePh} maxLength={120} />
        {state?.error ? <p className="mt-1.5 text-sm text-danger">{labels.titleRequired}</p> : null}
      </div>

      <div className="mb-4">
        <label className="label" htmlFor="eventDate">
          {labels.eventDate}
        </label>
        <input id="eventDate" name="eventDate" type="date" className="input" />
        <p className="hint">{labels.eventDateHint}</p>
      </div>

      <div className="mb-5">
        <label className="label" htmlFor="note">
          {labels.note}
        </label>
        <textarea id="note" name="note" className="input min-h-20" placeholder={labels.notePh} maxLength={2000} />
      </div>

      <SubmitButton className="btn btn-primary w-full">{labels.create}</SubmitButton>
    </form>
  );
}
