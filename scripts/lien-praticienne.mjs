#!/usr/bin/env node
/**
 * Construit, en LECTURE SEULE, un lien praticienne signé pour un rendez-vous
 * réel — sert à vérifier que la page et la disponibilité s'ouvrent bien avec
 * le jeton, sans écrire dans l'agenda.
 *
 *   node --env-file=.env --experimental-strip-types scripts/tmp-lien-praticienne.mjs <eventId>
 */
import { google } from "googleapis";
import { buildOwnerUrl, ownerLinkAvailable } from "../src/lib/ownerLink.ts";

if (!ownerLinkAvailable()) {
  console.error("OWNER_LINK_SECRET absent de l'environnement");
  process.exit(2);
}

const eventId = process.argv[2];
const auth = new google.auth.GoogleAuth({
  keyFile: "generique-450417-2aa30cb6faea.json",
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });
const { data: event } = await calendar.events.get({
  calendarId: process.env.GOOGLE_CALENDAR_ID,
  eventId,
});

const texte = `${event.description || ""} ${event.location || ""}`;
const token =
  /token=([A-Za-z0-9_-]{8,})/.exec(texte)?.[1] ||
  event.extendedProperties?.private?.bookingToken;

if (!token) {
  console.error("jeton de réservation introuvable dans l'événement");
  console.error("description :", (event.description || "").slice(0, 300));
  process.exit(3);
}

console.log("jeton      :", token);
console.log("origine    :", process.env.SITE_ORIGIN || "https://terra.killian-lecrut.com");
console.log("lien       :", buildOwnerUrl("https://terra.killian-lecrut.com", token));
