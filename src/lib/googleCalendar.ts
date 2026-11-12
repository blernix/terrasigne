import { google } from "googleapis";
import path from "path";
import { randomUUID } from "crypto";
import {
  buildSlots,
  parseWindow,
  validateSlot,
  type WindowInput,
} from "@/lib/plages";
import { buildEventDescription, rewriteDescriptionFields } from "@/lib/eventDescription";
import type { ServiceChangePatch } from "@/lib/serviceChange";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

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
  return parseWindow(summary).open;
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
  /** 0 = créneau normal, SUPPLEMENT_MAJO = créneau d'une plage majorée. */
  supplement: number;
}

function overlaps(
  a: { start: Date; end: Date },
  bStart: Date,
  bEnd: Date
): boolean {
  return a.start.getTime() < bEnd.getTime() && bStart.getTime() < a.end.getTime();
}

export async function getAvailability(
  durationMin: number,
  pauseMin: number,
  timeMin: Date,
  timeMax: Date
): Promise<Slot[]> {
  const events = await listEvents(timeMin, timeMax);

  const windows: WindowInput[] = events
    .filter((e) => isOpenWindow(e.summary))
    .map((e) => ({ summary: e.summary, start: e.start, end: e.end }));
  const busy = events.filter((e) => !isOpenWindow(e.summary));

  const now = Date.now();
  const minStart = new Date(now + MIN_LEAD_HOURS * 3600000);
  const maxStart = new Date(now + MAX_AHEAD_DAYS * 86400000);

  // plages.ts découpe les plages et valide chaque début de façon stricte :
  // aucun créneau hors plage, aucune marge, supplément = max des plages
  // couvrantes (indépendant de l'ordre de lecture de Google).
  const slots = buildSlots(windows, durationMin, { minStart, maxStart });

  const free = slots.filter(
    (slot) =>
      !busy.some((b) => {
        const bs = new Date(b.start);
        const be = new Date(b.end);
        if (Number.isNaN(bs.getTime()) || Number.isNaN(be.getTime()))
          return false;
        const pauseMs = (b.pauseMin > 0 ? b.pauseMin : pauseMin) * 60000;
        return overlaps(slot, bs, new Date(be.getTime() + pauseMs));
      })
  );

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
  /** Lien signé de la page praticienne, ajouté à la description de l'événement. */
  ownerManageUrl?: string;
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

  const description = buildEventDescription({
    serviceName: input.serviceName,
    prix: input.prix,
    supplement: input.supplement,
    zoomLink: input.zoomLink,
    consentAt: input.consentAt,
    ownerManageUrl: input.ownerManageUrl,
    client: input.client,
  });

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

export interface OwnerRecapBooking {
  id: string;
  start: string;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bookingToken: string;
}

/**
 * Rendez-vous d'une plage destinés au récap quotidien de la praticienne.
 * Marqueur distinct de `reminderSent` (rappel client) : sinon envoyer le récap
 * empêcherait le rappel de la cliente, et inversement.
 */
export async function listOwnerRecap(
  timeMin: Date,
  timeMax: Date
): Promise<OwnerRecapBooking[]> {
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
    .filter((e) => e.extendedProperties?.private?.ownerReminderSent !== "true")
    .map((e) => ({
      id: e.id || "",
      start: e.start?.dateTime || e.start?.date || "",
      serviceName:
        e.extendedProperties?.private?.serviceName || e.summary || "",
      clientName: e.extendedProperties?.private?.clientName || "",
      clientEmail: e.extendedProperties?.private?.clientEmail || "",
      clientPhone: e.extendedProperties?.private?.clientPhone || "",
      bookingToken: e.extendedProperties?.private?.bookingToken || "",
    }))
    .filter((e) => e.clientEmail && e.start);
}

export async function markOwnerReminderSent(eventId: string) {
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
        private: { ...privateProps, ownerReminderSent: "true" },
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
  /** Prix stocké dans l'événement (0 si absent : rendez-vous antérieur). */
  prix: number;
  pauseMin: number;
  supplement: number;
  pdfName: string;
  pdfUrl: string;
  /**
   * Description Google de l'événement. Lue seulement sur demande explicite
   * (`findBookingByToken(token, { withDescription: true })`) : c'est le seul
   * stockage des infos clientes, du consentement et du lien praticienne signé,
   * donc elle ne doit jamais sortir d'une réponse HTTP.
   */
  description?: string;
}

export async function findBookingByToken(
  token: string,
  options: { withDescription?: boolean } = {}
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
  const prix = Number(p.prix);
  const pauseMin = Number(p.pauseMin);
  const supplement = Number(p.supplement);
  const booking: ManagedBooking = {
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
    meetingType: p.meetingType || "",
    phone: p.clientPhone || "",
    // Champs ajoutés pour le changement de prestation : additifs, aucune clé
    // existante n'est renommée. Un rendez-vous antérieur n'a pas de prix
    // stocké : 0, jamais NaN.
    prix: Number.isFinite(prix) ? prix : 0,
    pauseMin: Number.isFinite(pauseMin) ? pauseMin : 0,
    supplement: Number.isFinite(supplement) ? supplement : 0,
    pdfName: p.pdfName || "",
    pdfUrl: p.pdfUrl || "",
  };

  if (options.withDescription) {
    booking.description = e.description || "";
  }

  return booking;
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

export interface RescheduleOptions {
  /**
   * Supplément recalculé de la nouvelle plage (0 = créneau normal).
   * Absent : la valeur stockée n'est pas touchée (appel praticienne historique).
   */
  supplement?: number;
  /**
   * Description complète de remplacement. Si elle est absente et que le
   * supplément est fourni, la description existante est réécrite sur place
   * (seules les lignes Service / Prix / Supplément changent).
   */
  description?: string;
}

export async function rescheduleBooking(
  token: string,
  newStart: Date,
  newEnd: Date,
  options: RescheduleOptions = {}
): Promise<ManagedBooking | null> {
  const booking = await findBookingByToken(token);
  if (!booking) return null;

  const calendar = await getCalendarClient();
  const existing = await calendar.events.get({
    calendarId: getCalendarId(),
    eventId: booking.id,
  });
  const privateProps = existing.data.extendedProperties?.private || {};

  const privatePatch: Record<string, string> = {
    ...privateProps,
    reminderSent: "false",
    // Réarmé aussi : sinon un rendez-vous reporté après le récap de la
    // veille n'apparaît plus jamais dans le récap de Cindy.
    ownerReminderSent: "false",
  };

  let description = options.description;
  if (options.supplement !== undefined) {
    privatePatch.supplement = String(options.supplement);
    if (description === undefined) {
      description = rewriteDescriptionFields(existing.data.description || "", {
        supplement: options.supplement,
      });
    }
  }

  await calendar.events.patch({
    calendarId: getCalendarId(),
    eventId: booking.id,
    requestBody: {
      start: { dateTime: newStart.toISOString(), timeZone: BUSINESS_TIMEZONE },
      end: { dateTime: newEnd.toISOString(), timeZone: BUSINESS_TIMEZONE },
      ...(description !== undefined ? { description } : {}),
      extendedProperties: {
        private: privatePatch,
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
 * Applique un changement de prestation sur l'événement existant : même id,
 * même début, même `bookingToken`. `If-Match` porte sur l'`etag` relu juste
 * avant le patch : une modification concurrente de Cindy n'est pas écrasée
 * (Google répond 412, l'appelant traduit en 409).
 *
 * Les propriétés privées existantes (`consentAt`, `bookingToken`,
 * `clientEmail`, `meetingType`…) sont étalées, jamais reconstruites : le patch
 * n'en supprime aucune.
 */
export async function changeBookingService(
  eventId: string,
  patch: ServiceChangePatch
): Promise<void> {
  const calendar = await getCalendarClient();
  const existing = await calendar.events.get({
    calendarId: getCalendarId(),
    eventId,
  });

  const privateProps = existing.data.extendedProperties?.private || {};
  const etag = existing.data.etag;

  await calendar.events.patch(
    {
      calendarId: getCalendarId(),
      eventId,
      requestBody: {
        summary: patch.summary,
        // Pas de `start` : la place du rendez-vous dans l'agenda ne bouge pas.
        end: { dateTime: patch.end, timeZone: BUSINESS_TIMEZONE },
        description: patch.description,
        extendedProperties: {
          private: { ...privateProps, ...patch.privateProps },
        },
      },
    },
    etag ? { headers: { "If-Match": etag } } : undefined
  );
}

/**
 * Vérifie qu'un créneau demandé correspond bien à une plage ouverte de l'agenda,
 * entièrement contenue dans cette plage (aucune marge), et rend le supplément
 * de la plage (maximum si plusieurs plages le couvrent).
 */
export async function getSlotAllowance(
  start: Date,
  end: Date
): Promise<{ allowed: boolean; supplement: number }> {
  const lookback = new Date(start.getTime() - 24 * 3600000);
  const events = await listEvents(lookback, end);
  const windows: WindowInput[] = events
    .filter((e) => isOpenWindow(e.summary))
    .map((e) => ({ summary: e.summary, start: e.start, end: e.end }));

  return validateSlot(windows, start, end);
}
