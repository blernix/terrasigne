import { google } from "googleapis";
import path from "path";
import { randomUUID } from "crypto";
import {
  EARLY_SLOT_MIN_BEFORE,
  EARLY_SLOT_SUPPLEMENT,
} from "@/lib/bookingOptions";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const OPEN_MARKER = "dispo";

const SLOT_STEP_MIN = 30;

export const MIN_LEAD_HOURS = 48;
export const MAX_AHEAD_DAYS = 90;

export const BUSINESS_TIMEZONE =
  process.env.BUSINESS_TIMEZONE || "America/Guadeloupe";

function getAuth() {
  const keyFile = path.join(
    process.cwd(),
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
      "generique-450417-2aa30cb6faea.json"
  );
  return new google.auth.GoogleAuth({ keyFile, scopes: SCOPES });
}

async function getCalendarClient() {
  const auth = getAuth();
  return google.calendar({ version: "v3", auth });
}

export function getCalendarId() {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error("GOOGLE_CALENDAR_ID manquante");
  return id;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  pauseMin: number;
}

export function isOpenWindow(summary: string): boolean {
  return summary.trim().toLowerCase().startsWith(OPEN_MARKER);
}

export async function listEvents(
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const calendar = await getCalendarClient();
  const res = await calendar.events.list({
    calendarId: getCalendarId(),
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 2500,
  });

  return (res.data.items || []).map((e) => ({
    id: e.id || "",
    summary: e.summary || "",
    start: e.start?.dateTime || e.start?.date || "",
    end: e.end?.dateTime || e.end?.date || "",
    pauseMin: Number(e.extendedProperties?.private?.pauseMin || 0),
  }));
}

export interface Slot {
  start: Date;
  end: Date;
  /** Créneau proposé avant l'ouverture, avec supplément. */
  early?: boolean;
}

function splitWindowIntoSlots(
  windowStart: Date,
  windowEnd: Date,
  durationMin: number
): Slot[] {
  const slots: Slot[] = [];
  const durationMs = durationMin * 60000;
  const stepMs = SLOT_STEP_MIN * 60000;
  let t = windowStart.getTime();
  const endMs = windowEnd.getTime();

  while (t + durationMs <= endMs) {
    slots.push({ start: new Date(t), end: new Date(t + durationMs) });
    t += stepMs;
  }

  return slots;
}

function overlaps(a: Slot, bStart: Date, bEnd: Date): boolean {
  return a.start.getTime() < bEnd.getTime() && bStart.getTime() < a.end.getTime();
}

export async function getAvailability(
  durationMin: number,
  pauseMin: number,
  timeMin: Date,
  timeMax: Date
): Promise<Slot[]> {
  const events = await listEvents(timeMin, timeMax);

  const openWindows = events.filter((e) => isOpenWindow(e.summary));
  const busy = events.filter((e) => !isOpenWindow(e.summary));

  const slots: Slot[] = [];
  for (const w of openWindows) {
    const start = new Date(w.start);
    const end = new Date(w.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
    slots.push(...splitWindowIntoSlots(start, end, durationMin));

    // Créneaux anticipés : ils commencent avant l'ouverture de la plage et
    // débordent dedans, d'où le +20 €. On ne remonte jamais plus d'une heure.
    for (let m = EARLY_SLOT_MIN_BEFORE; m >= SLOT_STEP_MIN; m -= SLOT_STEP_MIN) {
      const s = new Date(start.getTime() - m * 60000);
      const e = new Date(s.getTime() + durationMin * 60000);
      if (e.getTime() <= start.getTime()) continue;
      slots.push({ start: s, end: e, early: true });
    }
  }

  const now = Date.now();
  const minStart = now + MIN_LEAD_HOURS * 3600000;
  const maxStart = now + MAX_AHEAD_DAYS * 86400000;

  const seen = new Set<number>();
  const unique = slots.filter((slot) => {
    const key = slot.start.getTime();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const free = unique.filter(
    (slot) =>
      slot.start.getTime() >= minStart &&
      slot.start.getTime() <= maxStart &&
      !busy.some((b) => {
        const bs = new Date(b.start);
        const be = new Date(b.end);
        if (Number.isNaN(bs.getTime()) || Number.isNaN(be.getTime()))
          return false;
        const pauseMs = (b.pauseMin > 0 ? b.pauseMin : pauseMin) * 60000;
        return overlaps(slot, bs, new Date(be.getTime() + pauseMs));
      })
  );

  // Les creneaux anticipes sont ajoutes apres la plage : on retrie pour
  // garder un affichage chronologique.
  return free.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export interface BookingInput {
  serviceName: string;
  serviceId?: string;
  durationMin?: number;
  pauseMin?: number;
  prix?: number | null;
  bookingToken?: string;
  pdf?: { url: string; name: string } | null;
  supplement?: number;
  consentAt?: string;
  zoomLink?: string;
  start: Date;
  end: Date;
  clientTimezone?: string;
  client: {
    name: string;
    email: string;
    phone?: string;
    meetingType?: string;
    profession?: string;
    suivi?: string;
    typeSeance?: string;
    message?: string;
    consent?: boolean;
  };
}

export async function createBookingEvent(input: BookingInput) {
  const calendar = await getCalendarClient();

  const description = [
    `Service : ${input.serviceName}`,
    input.prix ? `Prix : ${input.prix} €` : null,
    input.supplement
      ? `Supplément créneau anticipé (+${EARLY_SLOT_MIN_BEFORE / 60} h) : ${input.supplement} € (à régler sur place, non facturé)`
      : null,
    `Client : ${input.client.name}`,
    `Email : ${input.client.email}`,
    input.client.phone ? `Téléphone : ${input.client.phone}` : null,
    input.client.meetingType
      ? `Mode de rencontre : ${input.client.meetingType}`
      : null,
    input.zoomLink ? `Lien visio (Zoom) : ${input.zoomLink}` : null,
    input.client.profession
      ? `Profession : ${input.client.profession}`
      : null,
    input.client.suivi ? `Suivi psy en cours : ${input.client.suivi}` : null,
    input.client.typeSeance
      ? `Type de séance désirée : ${input.client.typeSeance}`
      : null,
    input.client.consent
      ? `Consentement RGPD : Oui${
          input.consentAt ? ` (le ${input.consentAt})` : ""
        }`
      : null,
    input.client.message ? `Message : ${input.client.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await calendar.events.insert({
    calendarId: getCalendarId(),
    requestBody: {
      summary: `RDV ${input.serviceName} - ${input.client.name}`,
      description,
      location: input.zoomLink || undefined,
      start: { dateTime: input.start.toISOString(), timeZone: BUSINESS_TIMEZONE },
      end: { dateTime: input.end.toISOString(), timeZone: BUSINESS_TIMEZONE },
      extendedProperties: {
        private: {
          bookingToken: input.bookingToken || randomUUID(),
          serviceId: input.serviceId || "",
          durationMin: String(input.durationMin || 0),
          pauseMin: String(input.pauseMin || 0),
          supplement: String(input.supplement || 0),
          clientEmail: input.client.email,
          clientName: input.client.name,
          serviceName: input.serviceName,
          clientTimezone: input.clientTimezone || BUSINESS_TIMEZONE,
          clientPhone: input.client.phone || "",
          meetingType: input.client.meetingType || "",
          pdfName: input.pdf?.name || "",
          pdfUrl: input.pdf?.url || "",
          consentAt: input.consentAt || "",
          reminderSent: "false",
        },
      },
    },
  });

  return res.data;
}

export interface ReminderBooking {
  id: string;
  start: string;
  clientEmail: string;
  clientName: string;
  serviceName: string;
  clientTimezone: string;
  meetingType: string;
  pdfName: string;
  pdfUrl: string;
}

export async function listPendingReminders(
  timeMin: Date,
  timeMax: Date
): Promise<ReminderBooking[]> {
  const calendar = await getCalendarClient();
  const res = await calendar.events.list({
    calendarId: getCalendarId(),
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 2500,
  });

  return (res.data.items || [])
    .filter((e) => !isOpenWindow(e.summary || ""))
    .filter((e) => e.extendedProperties?.private?.reminderSent !== "true")
    .map((e) => ({
      id: e.id || "",
      start: e.start?.dateTime || e.start?.date || "",
      clientEmail: e.extendedProperties?.private?.clientEmail || "",
      clientName: e.extendedProperties?.private?.clientName || "",
      serviceName:
        e.extendedProperties?.private?.serviceName || e.summary || "",
      clientTimezone:
        e.extendedProperties?.private?.clientTimezone || BUSINESS_TIMEZONE,
      meetingType: e.extendedProperties?.private?.meetingType || "",
      pdfName: e.extendedProperties?.private?.pdfName || "",
      pdfUrl: e.extendedProperties?.private?.pdfUrl || "",
    }))
    .filter((e) => e.clientEmail);
}

export async function markReminderSent(eventId: string) {
  const calendar = await getCalendarClient();
  const existing = await calendar.events.get({
    calendarId: getCalendarId(),
    eventId,
  });
  const privateProps = existing.data.extendedProperties?.private || {};
  await calendar.events.patch({
    calendarId: getCalendarId(),
    eventId,
    requestBody: {
      extendedProperties: {
        private: { ...privateProps, reminderSent: "true" },
      },
    },
  });
}

export async function isSlotFree(
  start: Date,
  end: Date,
  excludeEventId?: string
): Promise<boolean> {
  const lookback = new Date(start.getTime() - 24 * 3600000);
  const events = await listEvents(lookback, end);
  const busy = events.filter(
    (e) => !isOpenWindow(e.summary) && e.id !== excludeEventId
  );
  return !busy.some((b) => {
    const bs = new Date(b.start);
    const be = new Date(b.end);
    if (Number.isNaN(bs.getTime()) || Number.isNaN(be.getTime())) return false;
    const pauseMs = (b.pauseMin || 0) * 60000;
    return overlaps({ start, end }, bs, new Date(be.getTime() + pauseMs));
  });
}

export interface ManagedBooking {
  id: string;
  token: string;
  start: string;
  end: string;
  summary: string;
  serviceName: string;
  serviceId: string;
  durationMin: number;
  clientName: string;
  clientEmail: string;
  clientTimezone: string;
  meetingType?: string;
  phone?: string;
}

export async function findBookingByToken(
  token: string
): Promise<ManagedBooking | null> {
  const calendar = await getCalendarClient();
  const res = await calendar.events.list({
    calendarId: getCalendarId(),
    timeMin: new Date(Date.now() - 86400000).toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 2500,
  });

  const e = (res.data.items || []).find(
    (ev) => ev.extendedProperties?.private?.bookingToken === token
  );
  if (!e) return null;

  const p = e.extendedProperties?.private || {};
  return {
    id: e.id || "",
    token,
    start: e.start?.dateTime || e.start?.date || "",
    end: e.end?.dateTime || e.end?.date || "",
    summary: e.summary || "",
    serviceName: p.serviceName || "",
    serviceId: p.serviceId || "",
    durationMin: Number(p.durationMin || 0),
    clientName: p.clientName || "",
    clientEmail: p.clientEmail || "",
    clientTimezone: p.clientTimezone || BUSINESS_TIMEZONE,
    phone: p.clientPhone || "",
  };
}

export async function cancelBooking(
  token: string
): Promise<ManagedBooking | null> {
  const booking = await findBookingByToken(token);
  if (!booking) return null;

  const calendar = await getCalendarClient();
  await calendar.events.delete({
    calendarId: getCalendarId(),
    eventId: booking.id,
  });
  return booking;
}

export async function rescheduleBooking(
  token: string,
  newStart: Date,
  newEnd: Date
): Promise<ManagedBooking | null> {
  const booking = await findBookingByToken(token);
  if (!booking) return null;

  const calendar = await getCalendarClient();
  const existing = await calendar.events.get({
    calendarId: getCalendarId(),
    eventId: booking.id,
  });
  const privateProps = existing.data.extendedProperties?.private || {};

  await calendar.events.patch({
    calendarId: getCalendarId(),
    eventId: booking.id,
    requestBody: {
      start: { dateTime: newStart.toISOString(), timeZone: BUSINESS_TIMEZONE },
      end: { dateTime: newEnd.toISOString(), timeZone: BUSINESS_TIMEZONE },
      extendedProperties: {
        private: { ...privateProps, reminderSent: "false" },
      },
    },
  });

  return {
    ...booking,
    start: newStart.toISOString(),
    end: newEnd.toISOString(),
  };
}

/**
 * Vérifie qu'un créneau demandé correspond bien à une plage ouverte de l'agenda,
 * ou à sa marge anticipée (EARLY_SLOT_MIN_BEFORE, avec supplément).
 * Sans ce contrôle, l'API acceptait n'importe quelle heure libre du calendrier.
 */
export async function getSlotAllowance(
  start: Date,
  end: Date
): Promise<{ allowed: boolean; early: boolean }> {
  const lookback = new Date(start.getTime() - 24 * 3600000);
  const events = await listEvents(lookback, end);
  const windows = events.filter((e) => isOpenWindow(e.summary));

  for (const w of windows) {
    const ws = new Date(w.start);
    const we = new Date(w.end);
    if (Number.isNaN(ws.getTime()) || Number.isNaN(we.getTime())) continue;
    const earliest = ws.getTime() - EARLY_SLOT_MIN_BEFORE * 60000;
    if (start.getTime() >= earliest && end.getTime() <= we.getTime()) {
      return { allowed: true, early: start.getTime() < ws.getTime() };
    }
  }
  return { allowed: false, early: false };
}

export { EARLY_SLOT_SUPPLEMENT };
