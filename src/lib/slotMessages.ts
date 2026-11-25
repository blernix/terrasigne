/**
 * Messages de refus de créneau, écrits pour être compris.
 *
 * Le 24 novembre, Cindy a voulu changer la prestation d'un rendez-vous resté au
 * même créneau et le site a répondu « Ce créneau n'est pas proposé à la
 * réservation. » — sans dire pourquoi. La cause réelle était ailleurs dans son
 * agenda : elle avait fermé la plage « Dispo » 06:00–19:00 et laissé la seule
 * ouverture « Dispo majo » 05:00–06:00. Le contrôle était juste, la phrase
 * inutilisable.
 *
 * Ce module est PUR : il ne lit ni l'agenda ni l'horloge, il met en mots ce
 * qu'on lui donne. Les deux variantes demandées :
 *
 *   - aucune plage ce jour-là     → on nomme le jour et l'absence d'ouverture ;
 *   - des plages, créneau dehors  → on nomme les plages qui existent.
 *
 * Côté cliente, le détail de l'agenda de Cindy ne regarde personne : la phrase
 * reste neutre.
 */

/** Une plage ouverte, telle que la rend l'agenda. */
export interface PlageOuverte {
  start: string | Date;
  end: string | Date;
}

export type ActeurMessage = "owner" | "client";

const DEFAULT_TIMEZONE = "America/Guadeloupe";

function fuseau(timezone?: string): string {
  return timezone || process.env.BUSINESS_TIMEZONE || DEFAULT_TIMEZONE;
}

function formatter(timeZone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone, ...options });
}

/**
 * « mardi 1er décembre » — le jour du rendez-vous, dans le fuseau de la
 * praticienne. Pas d'année : un rendez-vous se déplace à quelques jours.
 */
export function jourLisible(date: Date, timezone?: string): string {
  const tz = fuseau(timezone);
  const jour = formatter(tz, { weekday: "long" }).format(date);
  const quantieme = formatter(tz, { day: "numeric" }).format(date);
  const mois = formatter(tz, { month: "long" }).format(date);
  /* « 1 décembre » se dit « 1er décembre » en français ; les autres jours non. */
  const nombre = quantieme === "1" ? "1er" : quantieme;
  return `${jour} ${nombre} ${mois}`;
}

/** « 13:30 » — l'heure d'une borne, dans le fuseau de la praticienne. */
export function heureLisible(date: Date, timezone?: string): string {
  return formatter(fuseau(timezone), {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** « 13:30–15:00 » — le créneau refusé. */
export function creneauLisible(
  debut: Date,
  fin: Date,
  timezone?: string
): string {
  return `${heureLisible(debut, timezone)}–${heureLisible(fin, timezone)}`;
}

/** « 05:00–06:00, 18:00–19:00 » — les plages qui existent ce jour-là. */
export function plagesLisibles(
  plages: PlageOuverte[],
  timezone?: string
): string {
  return plages
    .map((p) => {
      const debut = new Date(p.start);
      const fin = new Date(p.end);
      if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
        return "";
      }
      return creneauLisible(debut, fin, timezone);
    })
    .filter(Boolean)
    .join(", ");
}

export interface MessageCreneauInput {
  debut: Date;
  fin: Date;
  /** Les plages ouvertes trouvées ce jour-là (vide = journée sans ouverture). */
  plages?: PlageOuverte[];
  timezone?: string;
  acteur: ActeurMessage;
}

/**
 * La phrase qui explique le refus. Deux cas, deux phrases — jamais « ce n'est
 * pas proposé » tout court.
 */
export function messageCreneauRefuse(input: MessageCreneauInput): string {
  if (input.acteur === "client") {
    return "Ce créneau ne fait plus partie des horaires d'ouverture. Choisissez un autre créneau.";
  }

  const jour = jourLisible(input.debut, input.timezone);
  const plages = input.plages ?? [];

  if (plages.length === 0) {
    return `Le ${jour} n'a aucune plage « dispo » ouverte dans l'agenda. Rouvrez une plage dans Google Agenda, ou choisissez un autre jour.`;
  }

  return `Le créneau ${creneauLisible(
    input.debut,
    input.fin,
    input.timezone
  )} sort des plages ouvertes du ${jour} (${plagesLisibles(
    plages,
    input.timezone
  )}). Choisissez un autre créneau ou rouvrez une plage.`;
}
