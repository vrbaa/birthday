import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Crude per-instance limiter. Serverless means several instances, so treat this
 *  as a speed bump, not a guarantee. Swap in Upstash if it ever matters. */
const hits = new Map<string, { n: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now > row.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  row.n += 1;
  return row.n > 20;
}

/** Keep the fetcher pointed at the public internet. */
function isPublicHttpUrl(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;

  const host = u.hostname.toLowerCase();
  const blocked =
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host.startsWith("[");
  return blocked ? null : u;
}

function meta(html: string, names: string[]): string | null {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["']`, "i"),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return decode(m[1].trim());
    }
  }
  return null;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const url = isPublicHttpUrl(body.url ?? "");
  if (!url) return NextResponse.json({ error: "bad_url" }, { status: 400 });

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PopisZeljaBot/1.0; +link preview)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "hr,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return NextResponse.json({}, { status: 200 });

    const type = res.headers.get("content-type") || "";
    if (!type.includes("html")) return NextResponse.json({}, { status: 200 });

    // Only the head matters, and some product pages are enormous.
    const html = (await res.text()).slice(0, 400_000);

    const title =
      meta(html, ["og:title", "twitter:title"]) ||
      decode(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || "") ||
      null;

    let imageUrl = meta(html, ["og:image:secure_url", "og:image", "twitter:image"]);
    if (imageUrl) {
      try {
        imageUrl = new URL(imageUrl, url).toString();
      } catch {
        imageUrl = null;
      }
    }

    const rawPrice = meta(html, ["product:price:amount", "og:price:amount", "twitter:data1"]);
    const price = rawPrice ? Number(rawPrice.replace(/[^\d.,]/g, "").replace(",", ".")) : null;

    return NextResponse.json({
      title: title?.slice(0, 200) ?? null,
      imageUrl,
      siteName: meta(html, ["og:site_name"]) || url.hostname.replace(/^www\./, ""),
      price: Number.isFinite(price) && price ? price : null,
      currency: meta(html, ["product:price:currency", "og:price:currency"]) || null,
    });
  } catch {
    // Timeouts and blocked scrapers are routine; the form handles an empty answer.
    return NextResponse.json({}, { status: 200 });
  }
}
