import { createHmac, timingSafeEqual } from "crypto";

// Lien "praticienne" : le même bookingToken que la cliente, accompagné d'une
// signature HMAC. Le token seul ouvre la page cliente (`/rendez-vous/gerer`) ;
// sans signature valide, aucune page praticienne n'est servie et aucune action
// avec motif n'est possible. Un client ne peut donc pas se faire passer pour
// Cindy ni écrire un motif d'annulation à sa place.
//
// Secret : OWNER_LINK_SECRET, avec repli sur CRON_SECRET (déjà présent sur les
// deux environnements). Si aucun des deux n'existe, la fonctionnalité se
// désactive proprement : aucun lien n'est envoyé plutôt qu'un lien mort.

const SECRET =
  (process.env.OWNER_LINK_SECRET || process.env.CRON_SECRET || "").trim();

function digest(token: string): string {
  return createHmac("sha256", SECRET).update(`praticienne:${token}`).digest("base64url");
}

export function ownerLinkAvailable(): boolean {
  return SECRET.length > 0;
}

export function signOwnerToken(token: string): string {
  if (!SECRET || !token) return "";
  return digest(token);
}

export function verifyOwnerToken(token: string, sig?: string | null): boolean {
  if (!SECRET || !token || !sig) return false;
  const expected = digest(token);
  const given = Buffer.from(sig);
  const want = Buffer.from(expected);
  if (given.length !== want.length) return false;
  return timingSafeEqual(given, want);
}

export function buildOwnerUrl(origin: string, token: string): string {
  const sig = signOwnerToken(token);
  if (!sig) return "";
  const base = origin.replace(/\/+$/, "");
  return `${base}/praticienne/rdv?token=${encodeURIComponent(
    token
  )}&sig=${encodeURIComponent(sig)}`;
}
