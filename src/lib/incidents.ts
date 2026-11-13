import { appendFileSync, renameSync, statSync } from "node:fs";

/**
 * Journal d'incidents du site.
 *
 * Une ligne JSON par événement, dans un fichier que la veille systemd relit
 * toutes les 15 minutes (scripts/veille-terrasigne.py). Pas de base de données :
 * Terrasigne n'en a pas, et un fichier suffit largement à ce volume.
 *
 * Règle absolue : cette fonction ne lève JAMAIS. Un journal d'erreurs qui plante
 * masque l'erreur d'origine, ce qui est pire que perdre la trace.
 */

export type TypeIncident =
  | "email" // un mail n'est pas parti (Brevo)
  | "reservation" // création, report, annulation, changement de prestation
  | "catalogue" // Directus : prestations ou articles indisponibles
  | "cron" // rappels quotidiens
  | "serveur"; // tout le reste

export interface ContexteIncident {
  route?: string;
  action?: string;
}

const FICHIER =
  process.env.INCIDENTS_FILE || "/var/log/terrasigne/incidents.jsonl";

const MESSAGE_MAX = 300;

// Un journal d'erreurs qui boucle (Directus en panne, page très visitée) ne doit pas
// remplir le disque : au-delà de 2 Mo, on repart d'un fichier neuf et l'ancien reste
// en `.1` pour le diagnostic.
const TAILLE_MAX = 2 * 1024 * 1024;

function texteDe(valeur: unknown): string {
  if (valeur instanceof Error) {
    return `${valeur.name}: ${valeur.message}`;
  }
  if (typeof valeur === "string") return valeur;
  if (valeur === undefined || valeur === null) return "";
  try {
    // JSON.stringify(undefined) rend `undefined`, pas une chaîne : d'où le repli.
    const serialise = JSON.stringify(valeur);
    return serialise === undefined ? String(valeur) : serialise;
  } catch {
    return String(valeur);
  }
}

/** Écrit une ligne d'incident. Ne lève jamais, ne bloque jamais l'appelant. */
export function noterIncident(
  type: TypeIncident,
  valeur: unknown,
  contexte: ContexteIncident = {}
): void {
  try {
    ecrireSiSousLaLimite();
    const ligne = JSON.stringify({
      ts: new Date().toISOString(),
      type,
      message: texteDe(valeur).replace(/\s+/g, " ").trim().slice(0, MESSAGE_MAX),
      route: contexte.route?.slice(0, 120),
      action: contexte.action?.slice(0, 60),
    });
    appendFileSync(FICHIER, ligne + "\n");
  } catch {
    // volontairement silencieux : voir l'en-tête du fichier
  }
}

/** Bascule le journal en `.1` quand il dépasse la limite. Ne lève jamais. */
function ecrireSiSousLaLimite(): void {
  try {
    if (statSync(FICHIER).size > TAILLE_MAX) {
      renameSync(FICHIER, `${FICHIER}.1`);
    }
  } catch {
    // fichier absent ou dossier non inscriptible : l'append décidera
  }
}
