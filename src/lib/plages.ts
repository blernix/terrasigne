// Socle pur des plages de disponibilité de l'agenda de Cindy.
//
// Une plage est un événement Google dont le titre commence par « dispo ».
// Le supplément de 20 € ne vient plus d'une marge avant l'ouverture : il vient
// du titre de la plage elle-même (« dispo majo », « dispo +20 », « dispo 20€ »…).
// Aucune marge, aucun créneau hors plage : validateSlot est strict.
//
// Module volontairement sans import (ni alias "@/", ni constante partagée) :
// scripts/test-plages.mjs l'importe avec node --experimental-strip-types,
// hors build Next.

/** Pas de découpage des plages, en minutes. */
export const SLOT_STEP_MIN = 30;

/** Supplément d'une plage majorée, en euros. Seule source du montant. */
export const SUPPLEMENT_MAJO = 20;

const OPEN_MARKER = "dispo";

/**
 * Jetons whitelistés après « dispo », comparés exactement après normalisation
 * (minuscules, accents retirés). « majoration », « sans majoration », « 20h »,
 * « 20/12 » ou « 200 » ne majorent donc pas. « majoré » devient « majore ».
 */
const SUPPLEMENT_TOKENS = new Set(["majo", "majore", "majoree", "+20", "20€"]);

const EDGE_PUNCTUATION = /^[.,;:!?()\[\]{}«»"']+|[.,;:!?()\[\]{}«»"']+$/g;

export interface ParsedWindow {
  /** La plage ouvre des créneaux (titre préfixé par « dispo »). */
  open: boolean;
  /** 0 = plage normale, SUPPLEMENT_MAJO = plage majorée. */
  supplement: number;
}

export interface WindowInput {
  summary: string;
  start: Date | string;
  end: Date | string;
}

export interface NormalizedWindow {
  summary: string;
  start: Date;
  end: Date;
  supplement: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface SupplementedSlot extends TimeSlot {
  supplement: number;
}

export interface BuildSlotsOptions {
  /** Pas de découpage, SLOT_STEP_MIN par défaut. */
  stepMin?: number;
  /** Premier début accepté (ex. maintenant + MIN_LEAD_HOURS). */
  minStart?: Date;
  /** Dernier début accepté (ex. maintenant + MAX_AHEAD_DAYS). */
  maxStart?: Date;
}

function normalizeTitle(summary: string): string {
  return String(summary ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // « 20 € » et « 20€ » sont le même jeton : Cindy tape l'un ou l'autre.
    .replace(/\s*€/g, "€")
    .replace(/\s+/g, " ")
    .trim();
}

function trimToken(token: string): string {
  return token.replace(EDGE_PUNCTUATION, "");
}

/**
 * Lit le titre d'un événement d'agenda.
 * Ouverture : préfixe « dispo » (règle inchangée, aucune plage existante ne se
 * ferme). Supplément : jeton whitelisté après « dispo », ou reste valant
 * exactement « 20 ». Une plage fermée n'a jamais de supplément.
 */
export function parseWindow(summary: string): ParsedWindow {
  const title = normalizeTitle(summary);
  if (!title.startsWith(OPEN_MARKER)) {
    return { open: false, supplement: 0 };
  }

  const rest = title.slice(OPEN_MARKER.length).trim();
  if (!rest) return { open: true, supplement: 0 };
  if (rest === "20") return { open: true, supplement: SUPPLEMENT_MAJO };

  const supplemented = rest
    .split(" ")
    .map(trimToken)
    .some((token) => SUPPLEMENT_TOKENS.has(token));

  return {
    open: true,
    supplement: supplemented ? SUPPLEMENT_MAJO : 0,
  };
}

/**
 * Découpe une plage [start, end] en créneaux de durationMin, espacés de stepMin.
 * Un créneau doit tenir entièrement dans la plage : aucune marge, ni avant ni
 * après. Les créneaux sont rendus sans supplément.
 */
export function splitWindowIntoSlots(
  start: Date | string,
  end: Date | string,
  durationMin: number,
  stepMin: number = SLOT_STEP_MIN
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const durationMs = Number(durationMin) * 60000;
  const stepMs = Number(stepMin) * 60000;
  if (!(durationMs > 0) || !(stepMs > 0)) return slots;

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return slots;

  let t = startMs;
  while (t + durationMs <= endMs) {
    slots.push({ start: new Date(t), end: new Date(t + durationMs) });
    t += stepMs;
  }
  return slots;
}

function normalizeWindow(window: WindowInput): NormalizedWindow | null {
  const start = new Date(window.start);
  const end = new Date(window.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  if (end.getTime() <= start.getTime()) return null;

  const parsed = parseWindow(window.summary);
  if (!parsed.open) return null;

  return {
    summary: window.summary,
    start,
    end,
    supplement: parsed.supplement,
  };
}

/**
 * Plages ouvertes qui contiennent entièrement [start, end].
 * Contrôle strict : start >= ouverture et end <= fermeture, sans marge.
 */
export function findCoveringWindows(
  windows: WindowInput[],
  start: Date | string,
  end: Date | string
): NormalizedWindow[] {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return [];
  }

  const covering: NormalizedWindow[] = [];
  for (const window of windows) {
    const normalized = normalizeWindow(window);
    if (!normalized) continue;
    if (
      startMs >= normalized.start.getTime() &&
      endMs <= normalized.end.getTime()
    ) {
      covering.push(normalized);
    }
  }
  return covering;
}

/**
 * Autorise ou refuse un créneau, et rend son supplément.
 * Supplément = maximum des plages qui couvrent le créneau : deux plages qui se
 * chevauchent ne dépendent pas de l'ordre de lecture de Google Agenda.
 */
export function validateSlot(
  windows: WindowInput[],
  start: Date | string,
  end: Date | string
): { allowed: boolean; supplement: number } {
  const covering = findCoveringWindows(windows, start, end);
  if (covering.length === 0) return { allowed: false, supplement: 0 };

  return {
    allowed: true,
    supplement: Math.max(...covering.map((window) => window.supplement)),
  };
}

/**
 * Créneaux proposables pour un ensemble de plages.
 * Chaque début candidat est validé contre toutes les plages (même règle qu'à la
 * réservation), dédoublonné par début, filtré par minStart/maxStart et trié.
 */
export function buildSlots(
  windows: WindowInput[],
  durationMin: number,
  opts: BuildSlotsOptions = {}
): SupplementedSlot[] {
  const stepMin = opts.stepMin ?? SLOT_STEP_MIN;
  const minStart = opts.minStart ? opts.minStart.getTime() : -Infinity;
  const maxStart = opts.maxStart ? opts.maxStart.getTime() : Infinity;
  const durationMs = Number(durationMin) * 60000;
  if (!(durationMs > 0)) return [];

  const starts = new Set<number>();
  for (const window of windows) {
    const normalized = normalizeWindow(window);
    if (!normalized) continue;
    for (const slot of splitWindowIntoSlots(
      normalized.start,
      normalized.end,
      durationMin,
      stepMin
    )) {
      starts.add(slot.start.getTime());
    }
  }

  const slots: SupplementedSlot[] = [];
  for (const startMs of Array.from(starts).sort((a, b) => a - b)) {
    if (startMs < minStart || startMs > maxStart) continue;
    const start = new Date(startMs);
    const end = new Date(startMs + durationMs);
    const allowance = validateSlot(windows, start, end);
    if (!allowance.allowed) continue;
    slots.push({ start, end, supplement: allowance.supplement });
  }
  return slots;
}
