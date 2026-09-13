import { randomBytes } from "crypto";

/** No O/0/I/1 — these get read aloud over the phone and copied off a screen. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function fromAlphabet(length: number): string {
  const bytes = randomBytes(length * 2);
  let out = "";
  for (let i = 0; out.length < length && i < bytes.length; i++) {
    // Reject values that would bias the modulo (256 % 32 === 0, so no bias here,
    // but keep the guard in case ALPHABET changes length).
    const max = Math.floor(256 / ALPHABET.length) * ALPHABET.length;
    if (bytes[i] >= max) continue;
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Public share slug — appears in the URL everyone receives. */
export const newPublicSlug = () => fromAlphabet(12);

/** Owner's admin token — the only thing standing between a stranger and edit access. */
export const newAdminToken = () => fromAlphabet(24);

/** Short code the giver writes down so they can release a claim from another device. */
export const newClaimCode = () => fromAlphabet(6);

/** Opaque per-browser id, stored in a cookie, so a giver sees their own claims. */
export const newGiverId = () => randomBytes(16).toString("hex");
