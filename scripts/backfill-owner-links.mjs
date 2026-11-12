#!/usr/bin/env node
/**
 * Ajoute le lien de gestion praticienne aux rendez-vous DÉJÀ présents dans
 * l'agenda (ceux créés avant la fonctionnalité).
 *
 * Sûr par défaut : DRY_RUN=1 (aucune écriture), on affiche seulement.
 *
 *   node --experimental-strip-types --env-file=.env scripts/backfill-owner-links.mjs
 *   DRY_RUN=0 node --experimental-strip-types --env-file=.env scripts/backfill-owner-links.mjs
 *
 * Options :
 *   JOURS=180   horizon en jours (défaut 120)
 *   ORIGINE=https://terrasigne.fr   base des liens (défaut SITE_URL)
 */
import { google } from "googleapis";
import path from "path";
import { buildOwnerUrl, ownerLinkAvailable } from "../src/lib/ownerLink.ts";

const DRY_RUN = process.env.DRY_RUN !== "0";
const JOURS = Number(process.env.JOURS || 120);
const ORIGIN =
  process.env.ORIGINE || process.env.SITE_URL || "https://terrasigne.fr";
const OPEN_MARKER = "dispo";

const calendarId = process.env.GOOGLE_CALENDAR_ID;
if (!calendarId) {
  console.error("❌ GOOGLE_CALENDAR_ID manquant");
  process.exit(1);
}
if (!ownerLinkAvailable()) {
  console.error(
    "❌ Ni OWNER_LINK_SECRET ni CRON_SECRET : impossible de signer les liens."
  );
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(
    process.cwd(),
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
      "generique-450417-2aa30cb6faea.json"
  ),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });

const timeMin = new Date().toISOString();
const timeMax = new Date(Date.now() + JOURS * 86400000).toISOString();

const res = await calendar.events.list({
  calendarId,
  timeMin,
  timeMax,
  singleEvents: true,
  orderBy: "startTime",
  maxResults: 2500,
});

const items = res.data.items || [];
const bookings = items.filter((e) => {
  const summary = (e.summary || "").trim().toLowerCase();
  if (summary.startsWith(OPEN_MARKER)) return false;
  const token = e.extendedProperties?.private?.bookingToken;
  return Boolean(token);
});

console.log(
  `${items.length} événement(s) sur ${JOURS} jours, ${bookings.length} rendez-vous avec token.`
);
console.log(DRY_RUN ? "Mode DRY_RUN (aucune écriture)." : "Mode ÉCRITURE.\n");

let updated = 0;
let already = 0;
let failed = 0;

for (const e of bookings) {
  const token = e.extendedProperties.private.bookingToken;
  const description = e.description || "";
  const start = e.start?.dateTime || e.start?.date || "";

  if (description.includes("/praticienne/rdv")) {
    already++;
    continue;
  }

  const url = buildOwnerUrl(ORIGIN, token);
  const nextDescription = [
    description.trim(),
    "",
    "———",
    "Gérer ce rendez-vous (déplacer / annuler) :",
    url,
    "",
    "Passer par ce lien prévient la cliente par email.",
    "Ne supprimez pas cet événement à la main : personne ne serait prévenu.",
  ]
    .join("\n")
    .trim();

  const label = `${start} — ${e.summary || "(sans titre)"}`;
  if (DRY_RUN) {
    console.log(`  [dry] ${label}`);
    updated++;
    continue;
  }

  try {
    await calendar.events.patch({
      calendarId,
      eventId: e.id,
      requestBody: { description: nextDescription },
    });
    console.log(`  ✓ ${label}`);
    updated++;
  } catch (err) {
    console.error(`  ✗ ${label} : ${err.message}`);
    failed++;
  }
}

console.log(
  `\n${updated} ${DRY_RUN ? "à mettre à jour" : "mis à jour"}, ${already} déjà ok, ${failed} échec(s).`
);
if (DRY_RUN && updated > 0) {
  console.log("Relancer avec DRY_RUN=0 pour écrire réellement.");
}
if (failed) process.exit(1);
