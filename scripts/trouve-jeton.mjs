#!/usr/bin/env node
/**
 * Trouve, en LECTURE SEULE, un rendez-vous à venir dont la description porte un
 * jeton de gestion — pour ouvrir la page praticienne sur un cas réel.
 *
 *   node --env-file=.env --experimental-strip-types scripts/trouve-jeton.mjs
 *
 * Aucune écriture : events.list uniquement. Affiche le jeton tronqué.
 */
import { google } from "googleapis";
import { parseWindow } from "../src/lib/plages.ts";

const TIMEZONE = process.env.BUSINESS_TIMEZONE || "America/Guadeloupe";

const auth = new google.auth.GoogleAuth({
  keyFile: "generique-450417-2aa30cb6faea.json",
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });
const calendarId = process.env.GOOGLE_CALENDAR_ID;

const { data } = await calendar.events.list({
  calendarId,
  timeMin: new Date().toISOString(),
  timeMax: new Date(Date.now() + 90 * 86400000).toISOString(),
  singleEvents: true,
  orderBy: "startTime",
  maxResults: 2500,
});

const fmt = (d) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);

let trouves = 0;
for (const e of data.items || []) {
  if (parseWindow(e.summary || "").open) continue;
  const texte = `${e.description || ""} ${e.location || ""}`;
  const jeton = /token=([A-Za-z0-9_-]{8,})/.exec(texte)?.[1];
  if (!jeton) continue;
  trouves += 1;
  if (trouves > 5) break;
  const debut = new Date(e.start?.dateTime || e.start?.date);
  console.log(
    `${fmt(debut)}  « ${e.summary} »  jeton ${jeton.slice(0, 8)}…  (${e.id})`
  );
}
if (trouves === 0) console.log("aucun rendez-vous à venir ne porte de jeton");
console.log("");
console.log("aucune écriture : events.list uniquement");
