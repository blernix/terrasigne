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

export interface MergedPeriod {
  start: Date;
  end: Date;
  /** Les plages ouvertes qui composent cette période continue. */
  windows: NormalizedWindow[];
}

/**
 * Fusionne les plages ouvertes qui se chevauchent ou se TOUCHENT en périodes
 * continues.
 *
 * Pourquoi : le 26/11, une plage « Dispo majo » de 60 min suivie d'une plage
 * normale collait si bien que 05:30 n'était jamais proposé (un créneau de 60
 * min ne tenait pas dans 05:00–06:00, et la plage normale commençait à 06:00).
 * Cindy voulait « 5h30 et pas juste 5h ». Une période continue rend les départs
 * de 30 en 30 possibles d'un bout à l'autre.
 *
 * Deux plages séparées par un trou (ex. 09:00–12:00 puis 15:00–19:00) restent
 * deux périodes : on n'ouvre jamais un créneau dans le trou.
 */
export function mergeOpenWindows(windows: WindowInput[]): MergedPeriod[] {
  const normalized = windows
    .map((window) => normalizeWindow(window))
    .filter((window): window is NormalizedWindow => window !== null)
    .sort(
      (a, b) =>
        a.start.getTime() - b.start.getTime() ||
        a.end.getTime() - b.end.getTime()
    );

  const periods: MergedPeriod[] = [];
  for (const window of normalized) {
    const last = periods[periods.length - 1];
    if (last && window.start.getTime() <= last.end.getTime()) {
      last.windows.push(window);
      if (window.end.getTime() > last.end.getTime()) {
        last.end = window.end;
      }
      continue;
    }
    periods.push({
      start: window.start,
      end: window.end,
      windows: [window],
    });
  }
  return periods;
}

/**
 * Plages ouvertes qui contiennent entièrement [start, end].
 * Contrôle strict : start >= ouverture et end <= fermeture, sans marge.
 *
 * Attention : ce n'est PAS la règle d'acceptation (elle est dans `validateSlot`,
 * qui raisonne sur les périodes fusionnées). Cette fonction reste le contrôle
 * « une seule plage contient le créneau », utile au diagnostic.
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
 *
 * Règle du 26/11 : le créneau doit tenir dans une PÉRIODE OUVERTE CONTINUE
 * (plages fusionnées), pas dans une seule plage. Son supplément est celui de la
 * plage qui contient son DÉBUT — 05:30 dans une plage majorée qui court jusqu'à
 * 06:00 reste majoré, même si le créneau déborde sur la plage normale qui suit.
 *
 * Le début doit aussi tomber sur la grille de 30 min comptée depuis le début de
 * la période : ce que la route accepte est exactement ce que l'écran propose.
 */
export function validateSlot(
  windows: WindowInput[],
  start: Date | string,
  end: Date | string,
  stepMin: number = SLOT_STEP_MIN
): { allowed: boolean; supplement: number } {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return { allowed: false, supplement: 0 };
  }

  const stepMs = Number(stepMin) * 60000;
  const period = mergeOpenWindows(windows).find(
    (candidate) =>
      startMs >= candidate.start.getTime() && endMs <= candidate.end.getTime()
  );
  if (!period) return { allowed: false, supplement: 0 };

  if (stepMs > 0 && (startMs - period.start.getTime()) % stepMs !== 0) {
    return { allowed: false, supplement: 0 };
  }

  const contenantes = period.windows.filter(
    (window) =>
      startMs >= window.start.getTime() && startMs < window.end.getTime()
  );

  return {
    allowed: true,
    supplement:
      contenantes.length === 0
        ? 0
        : Math.max(...contenantes.map((window) => window.supplement)),
  };
}

/**
 * Créneaux proposables pour un ensemble de plages.
 * Les départs sont pris sur chaque période ouverte continue, de 30 en 30 depuis
 * son début ; chaque départ est validé par `validateSlot` (même règle qu'à la
 * réservation), filtré par minStart/maxStart et trié.
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
  for (const period of mergeOpenWindows(windows)) {
    for (const slot of splitWindowIntoSlots(
      period.start,
      period.end,
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
    const allowance = validateSlot(windows, start, end, stepMin);
    if (!allowance.allowed) continue;
    slots.push({ start, end, supplement: allowance.supplement });
  }
  return slots;
}
