#!/usr/bin/env node
/**
 * Vérifie, en LECTURE SEULE, les phrases de refus de créneau sur les vraies
 * données de l'agenda de Cindy.
 *
 *   node --env-file=.env --experimental-strip-types scripts/verif-message-creneau.mjs <eventId>
 *
 * Pourquoi ce script : la préprod répond 403 sur les routes d'écriture
 * (PREPROD_MODE=1), donc aucun POST ne peut prouver le chemin d'erreur. On
 * rejoue la même logique avec les mêmes primitives que la route
 * (`parseWindow` / `validateSlot` / `messageCreneauRefuse`).
 *
 * Trois sorties :
 *   1. le verdict réel du rendez-vous demandé ;
 *   2. le rejeu de l'état du 24/11 (seules les plages « majo » restaient) ;
 *   3. la première journée à venir sans aucune plage ouverte — la variante
 *      « journée fermée » sur des données réelles.
 *
 * Aucune écriture : seulement events.get et events.list.
 */
import { google } from "googleapis";
import { parseWindow, validateSlot } from "../src/lib/plages.ts";
import {
  messageCreneauRefuse,
  jourLisible,
  creneauLisible,
  cleJour,
} from "../src/lib/slotMessages.ts";

const TIMEZONE = process.env.BUSINESS_TIMEZONE || "America/Guadeloupe";

const eventId = process.argv[2];
if (!eventId) {
  console.error("usage: verif-message-creneau.mjs <eventId>");
  process.exit(2);
}

const auth = new google.auth.GoogleAuth({
  keyFile: "generique-450417-2aa30cb6faea.json",
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });
const calendarId = process.env.GOOGLE_CALENDAR_ID;

function ouvertes(items) {
  return (items || []).map((e) => ({
    summary: e.summary,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
  })).filter((e) => parseWindow(e.summary || "").open);
}

/** Même logique que getSlotAllowance : on lit 24 h avant, puis on ne garde que
 *  les plages du JOUR du créneau (sinon la phrase citerait la veille). */
async function plagesDuJour(debut, fin) {
  const lookback = new Date(debut.getTime() - 24 * 3600000);
  const { data } = await calendar.events.list({
    calendarId,
    timeMin: lookback.toISOString(),
    timeMax: fin.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 2500,
  });
  const jour = cleJour(debut, TIMEZONE);
  return ouvertes(data.items).filter(
    (p) => cleJour(new Date(p.start), TIMEZONE) === jour
  );
}

function phrase(debut, fin, plages, acteur = "owner") {
  return messageCreneauRefuse({ debut, fin, plages, timezone: TIMEZONE, acteur });
}

/* ---------------------------------------------------------------- 1. réel */
const { data: event } = await calendar.events.get({ calendarId, eventId });
const debut = new Date(event.start?.dateTime || event.start?.date);
const fin = new Date(event.end?.dateTime || event.end?.date);

const plages = await plagesDuJour(debut, fin);
const verdict = validateSlot(plages, debut, fin);

console.log("=== 1. rendez-vous réel ===");
console.log("événement     :", event.summary);
console.log("créneau       :", creneauLisible(debut, fin, TIMEZONE));
console.log("jour          :", jourLisible(debut, TIMEZONE));
console.log("modifié le    :", event.updated);
console.log("plage ouverte :", verdict.allowed ? "oui" : "non");
console.log(
  "plages        :",
  plages.length
    ? plages
        .map(
          (p) =>
            `${p.summary} ${creneauLisible(new Date(p.start), new Date(p.end), TIMEZONE)}`
        )
        .join(" | ")
    : "aucune"
);
if (!verdict.allowed) {
  console.log("phrase        :", phrase(debut, fin, plages));
  console.log("phrase cliente:", phrase(debut, fin, plages, "client"));
} else {
  console.log("phrase        : aucune — le créneau est accepté tel quel");
}

/* ------------------------------------- 2. rejeu de l'état du 24 novembre */
const seulementMajo = plages.filter((p) => /majo/i.test(p.summary || ""));
const verdictRejeu = validateSlot(seulementMajo, debut, fin);
console.log("");
console.log("=== 2. rejeu de l'état du 24/11 (seules les plages « majo ») ===");
console.log("plages        :", seulementMajo.length
  ? seulementMajo
      .map((p) => `${p.summary} ${creneauLisible(new Date(p.start), new Date(p.end), TIMEZONE)}`)
      .join(" | ")
  : "aucune");
console.log("plage ouverte :", verdictRejeu.allowed ? "oui" : "non");
console.log("phrase        :", phrase(debut, fin, seulementMajo));
console.log("phrase cliente:", phrase(debut, fin, seulementMajo, "client"));

/* ------------------------------- 3. journée réelle sans aucune plage ouverte */
console.log("");
console.log("=== 3. première journée à venir sans aucune plage ouverte ===");
const dansUnJour = new Date(Date.now() + 86400000);
const horizon = new Date(Date.now() + 60 * 86400000);
const { data: futurs } = await calendar.events.list({
  calendarId,
  timeMin: dansUnJour.toISOString(),
  timeMax: horizon.toISOString(),
  singleEvents: true,
  orderBy: "startTime",
  maxResults: 2500,
});

const parJour = new Map();
for (let i = 0; i < 60; i += 1) {
  const d = new Date(dansUnJour.getTime() + i * 86400000);
  const cle = new Intl.DateTimeFormat("fr-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  if (!parJour.has(cle)) parJour.set(cle, { jour: d, ouvertes: 0 });
}

for (const e of futurs.items || []) {
  if (!parseWindow(e.summary || "").open) continue;
  const d = new Date(e.start?.dateTime || e.start?.date);
  const cle = new Intl.DateTimeFormat("fr-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const entree = parJour.get(cle);
  if (entree) entree.ouvertes += 1;
}

const jourFerme = [...parJour.values()].find((v) => v.ouvertes === 0);
if (!jourFerme) {
  console.log("aucune journée fermée dans les 60 prochains jours");
} else {
  const midi = new Date(jourFerme.jour);
  midi.setUTCHours(16, 0, 0, 0); /* midi en Guadeloupe */
  console.log("jour          :", jourLisible(midi, TIMEZONE));
  console.log("plages        :", jourFerme.ouvertes);
  console.log(
    "phrase        :",
    phrase(new Date(midi.getTime() + 3600000), new Date(midi.getTime() + 7200000), [])
  );
  console.log(
    "phrase cliente:",
    phrase(new Date(midi.getTime() + 3600000), new Date(midi.getTime() + 7200000), [], "client")
  );
}

console.log("");
console.log("aucune écriture : events.get + events.list uniquement");
