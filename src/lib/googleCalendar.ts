import { google } from "googleapis";
import path from "path";
import { randomUUID } from "crypto";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const OPEN_MARKER = "dispo";

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
  }));
}

export interface Slot {
  start: Date;
  end: Date;
}

function splitWindowIntoSlots(
  windowStart: Date,
  windowEnd: Date,
  durationMin: number,
  pauseMin: number
): Slot[] {
  const slots: Slot[] = [];
  const durationMs = durationMin * 60000;
  const stepMs = (durationMin + pauseMin) * 60000;
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
    slots.push(...splitWindowIntoSlots(start, end, durationMin, pauseMin));
  }

  const now = Date.now();

  return slots.filter(
    (slot) =>
      slot.start.getTime() >= now &&
      !busy.some((b) => {
        const bs = new Date(b.start);
        const be = new Date(b.end);
        if (Number.isNaN(bs.getTime()) || Number.isNaN(be.getTime()))
          return false;
        return overlaps(slot, bs, be);
      })
  );
}

export interface BookingInput {
  serviceName: string;
  serviceId?: string;
  durationMin?: number;
  prix?: number | null;
  bookingToken?: string;
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
    `Client : ${input.client.name}`,
    `Email : ${input.client.email}`,
    input.client.phone ? `Téléphone : ${input.client.phone}` : null,
    input.client.meetingType
      ? `Mode de rencontre : ${input.client.meetingType}`
      : null,
    input.client.profession
      ? `Profession : ${input.client.profession}`
      : null,
    input.client.suivi ? `Suivi psy en cours : ${input.client.suivi}` : null,
    input.client.typeSeance
      ? `Type de séance désirée : ${input.client.typeSeance}`
      : null,
    input.client.consent ? "Consentement RGPD : Oui" : null,
    input.client.message ? `Message : ${input.client.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await calendar.events.insert({
    calendarId: getCalendarId(),
    requestBody: {
      summary: `RDV ${input.serviceName} - ${input.client.name}`,
      description,
      start: { dateTime: input.start.toISOString(), timeZone: BUSINESS_TIMEZONE },
      end: { dateTime: input.end.toISOString(), timeZone: BUSINESS_TIMEZONE },
      extendedProperties: {
        private: {
          bookingToken: input.bookingToken || randomUUID(),
          serviceId: input.serviceId || "",
          durationMin: String(input.durationMin || 0),
          clientEmail: input.client.email,
          clientName: input.client.name,
          serviceName: input.serviceName,
          clientTimezone: input.clientTimezone || BUSINESS_TIMEZONE,
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
  const events = await listEvents(start, end);
  const busy = events.filter(
    (e) => !isOpenWindow(e.summary) && e.id !== excludeEventId
  );
  return !busy.some((b) => {
    const bs = new Date(b.start);
    const be = new Date(b.end);
    if (Number.isNaN(bs.getTime()) || Number.isNaN(be.getTime())) return false;
    return overlaps({ start, end }, bs, be);
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
  await calendar.events.patch({
    calendarId: getCalendarId(),
    eventId: booking.id,
    requestBody: {
      start: { dateTime: newStart.toISOString(), timeZone: BUSINESS_TIMEZONE },
      end: { dateTime: newEnd.toISOString(), timeZone: BUSINESS_TIMEZONE },
    },
  });

  return {
    ...booking,
    start: newStart.toISOString(),
    end: newEnd.toISOString(),
  };
}
