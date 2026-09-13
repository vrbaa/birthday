# Popis želja

Wishlist app built to the v2 spec. Croatian is the default language; English is a
toggle in the header.

The owner creates a list, gets two links, and shares one of them. Givers claim
gifts without signing up. Claimed gifts grey out and lock. The owner never sees
who claimed what.

## Deploy

You need a Postgres database and a Vercel account. About ten minutes.

### 1. Database

Any Postgres works. Neon and Supabase both have a free tier and give you a
connection string on signup. Copy it.

### 2. Push the code

```bash
git init
git add .
git commit -m "Popis želja"
gh repo create popis-zelja --private --source=. --push
```

(Or create the repo on github.com and push to it the usual way.)

### 3. Import into Vercel

On vercel.com: **Add New → Project → Import** your repo. Before clicking Deploy,
add these environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | your Postgres connection string |
| `DIRECT_URL` | same string; if your provider gives a separate non-pooled URL, use that here |
| `NEXT_PUBLIC_BASE_URL` | `https://your-project.vercel.app` — fill it in after the first deploy and redeploy |
| `CRON_SECRET` | any long random string |

Deploy. The build runs `prisma generate` automatically.

### 4. Create the tables

Once, from your machine, with `DATABASE_URL` set in a local `.env`:

```bash
npm install
npx prisma db push
```

That creates the schema. For real migrations later, use `npx prisma migrate dev`
instead.

### 5. Check the cron

`vercel.json` registers a daily job at 03:00 UTC hitting `/api/cron/cleanup`,
which deletes lists 30 days past their event date unless archived. Vercel sends
the `CRON_SECRET` as a bearer token; the route rejects anything else. Cron jobs
run on Hobby plans at most once a day, which is what this uses.

## Local development

```bash
cp .env.example .env     # fill in DATABASE_URL
npm install
npx prisma db push
npm run dev
```

## How the parts fit together

```
src/app/page.tsx                    landing + create form
src/app/l/[adminToken]/             owner view, items, list settings
src/app/g/[slug]/                   giver view, claiming
src/app/api/metadata/route.ts       Open Graph scraper for pasted product URLs
src/app/api/cron/cleanup/route.ts   daily deletion job
src/lib/i18n.ts                     both languages, in one file
prisma/schema.prisma                the data model
```

Mutations are Next.js server actions rather than the REST endpoints sketched in
the spec's §10. Same operations, same guarantees, less plumbing — the two API
routes that remain are the ones that genuinely need to be HTTP endpoints.

### The claim lock

This is the part worth understanding before you change anything.

`Claim.itemId` has a unique index. Claiming runs in a transaction that first does
a conditional update:

```sql
UPDATE "Item" SET status='CLAIMED' WHERE id=? AND listId=? AND status='AVAILABLE'
```

If that matches zero rows, someone else already has it and the transaction aborts.
If two requests somehow both pass that check, the `Claim` insert violates the
unique index and Prisma raises `P2002`. Either way the loser gets a "someone just
grabbed this" message, never a duplicate or a 500.

Do not replace this with a read-then-write, however much simpler it looks.

### Keeping claim names away from the owner

The owner's query in `src/app/l/[adminToken]/page.tsx` does not select the `claim`
relation or the item `status` at all. The data never reaches the server component,
so no view change can leak it. The owner gets one aggregate count.

This is a courtesy, not a security boundary: the owner also holds the share link
and can open the giver view. Nothing in the design should depend on them not doing
that.

### Identifying givers

A `giver` cookie (httpOnly, 400 days) marks which claims belong to this browser,
so people see "you're getting this" with an undo button. The 6-character claim code
is the cross-device fallback: shown once at claim time, accepted by the "not you?"
form on any device.

## Two places I deviated from the spec

**Delete and edit warnings are unconditional.** §5.3 asks for a warning when the
owner deletes or re-links a *claimed* item, but §5.4 says items must look identical
to the owner whether claimed or not. A warning that only fires on claimed items
tells the owner exactly which ones are taken. So the warnings fire on every delete
and every URL change, worded so they don't reveal status. You keep the caution and
the surprise; you lose a little precision.

**Price is stored as integer cents plus a currency code**, not a decimal. Avoids
float rounding and Prisma `Decimal` serialization across the server/client boundary.

## Known limits

- The metadata scraper is best effort. Large retailers block unknown user agents,
  and many pages have no `product:price:amount`. The form never blocks on it.
- Rate limiting on `/api/metadata` is per serverless instance, so it is a speed
  bump rather than a guarantee. Use Upstash if it ever gets abused.
- There is no email, so the "list expires in N days" warning only helps an owner
  who happens to visit.
- Lists are not searchable or listable anywhere. Losing the admin link means losing
  edit access, by design.
