#!/usr/bin/env node
/**
 * Liste, en LECTURE SEULE, les plages ouvertes de l'agenda de Cindy avec le
 * supplément que le code leur attribue — pour confronter la règle des créneaux
 * majorés aux vrais titres d'événements.
 *
 *   node --env-file=.env --experimental-strip-types scripts/liste-plages.mjs 2026-11-25 2026-11-28
 *
 * Aucune écriture : events.list uniquement.
 */
import { google } from "googleapis";
import { parseWindow, SUPPLEMENT_MAJO } from "../src/lib/plages.ts";

const TIMEZONE = process.env.BUSINESS_TIMEZONE || "America/Guadeloupe";

const depuis = process.argv[2];
const jusqua = process.argv[3];
if (!depuis || !jusqua) {
  console.error("usage: liste-plages.mjs <AAAA-MM-JJ> <AAAA-MM-JJ>");
  process.exit(2);
}

const auth = new google.auth.GoogleAuth({
  keyFile: "generique-450417-2aa30cb6faea.json",
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });
const calendarId = process.env.GOOGLE_CALENDAR_ID;

const fmt = (d) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);

const timeMin = new Date(`${depuis}T00:00:00-04:00`);
const timeMax = new Date(`${jusqua}T00:00:00-04:00`);

const { data } = await calendar.events.list({
  calendarId,
  timeMin: timeMin.toISOString(),
  timeMax: timeMax.toISOString(),
  singleEvents: true,
  orderBy: "startTime",
  maxResults: 2500,
});

let ouvertes = 0;
for (const e of data.items || []) {
  const parsed = parseWindow(e.summary || "");
  if (!parsed.open) continue;
  ouvertes += 1;
  const debut = new Date(e.start?.dateTime || e.start?.date);
  const fin = new Date(e.end?.dateTime || e.end?.date);
  const minutes = Math.round((fin - debut) / 60000);
  const marque = parsed.supplement === SUPPLEMENT_MAJO ? " +20 €" : "";
  console.log(
    `${fmt(debut)} → ${fmt(fin)}  (${minutes} min)${marque}   « ${e.summary} »`
  );
}

console.log("");
console.log(`${ouvertes} plage(s) ouverte(s) entre le ${depuis} et le ${jusqua}.`);
console.log("aucune écriture : events.list uniquement");
