// Description de l'événement Google Agenda. Isolée ici pour être testable
// sans appeler l'API Google : c'est le seul endroit où le lien de gestion
// praticienne est écrit dans l'agenda de Cindy.
//
// Module volontairement sans import (ni alias "@/", ni constante partagée) :
// les tests unitaires l'importent directement avec node, hors build Next.

export interface EventDescriptionClient {
  name: string;
  email: string;
  phone?: string;
  meetingType?: string;
  profession?: string;
  suivi?: string;
  typeSeance?: string;
  message?: string;
  consent?: boolean;
}

export interface EventDescriptionInput {
  serviceName: string;
  prix?: number | null;
  supplement?: number;
  zoomLink?: string;
  consentAt?: string;
  ownerManageUrl?: string;
  client: EventDescriptionClient;
}

/**
 * Ligne du supplément, seule source du libellé : le même texte sert à créer
 * l'événement et à le réécrire après un report ou un changement de prestation.
 */
export function supplementLine(supplement: number): string {
  return `Supplément créneau majoré : +${supplement} € (à régler sur place, non facturé)`;
}

export function buildEventDescription(input: EventDescriptionInput): string {
  const { client } = input;
  const lines = [
    `Service : ${input.serviceName}`,
    input.prix ? `Prix : ${input.prix} €` : null,
    input.supplement ? supplementLine(input.supplement) : null,
    `Client : ${client.name}`,
    `Email : ${client.email}`,
    client.phone ? `Téléphone : ${client.phone}` : null,
    client.meetingType ? `Mode de rencontre : ${client.meetingType}` : null,
    input.zoomLink ? `Lien visio (Zoom) : ${input.zoomLink}` : null,
    client.profession ? `Profession : ${client.profession}` : null,
    client.suivi ? `Suivi psy en cours : ${client.suivi}` : null,
    client.typeSeance ? `Type de séance désirée : ${client.typeSeance}` : null,
    client.consent
      ? `Consentement RGPD : Oui${input.consentAt ? ` (le ${input.consentAt})` : ""}`
      : null,
    client.message ? `Message : ${client.message}` : null,
    input.ownerManageUrl
      ? [
          "",
          "———",
          "Gérer ce rendez-vous (déplacer / annuler) :",
          input.ownerManageUrl,
          "",
          "Passer par ce lien prévient la cliente par email.",
          "Ne supprimez pas cet événement à la main : personne ne serait prévenu.",
        ].join("\n")
      : null,
  ];

  return lines.filter(Boolean).join("\n");
}

export interface DescriptionFields {
  /** Absent : ligne non touchée. */
  serviceName?: string;
  /** Absent : ligne non touchée ; null ou 0 : ligne Prix retirée. */
  prix?: number | null;
  /** Absent : ligne non touchée ; null ou 0 : ligne Supplément retirée. */
  supplement?: number | null;
}

const SERVICE_LINE = /^\s*Service\s*:/;
const PRICE_LINE = /^\s*Prix\s*:/;
// Reconnaît l'ancien libellé de la marge d'une heure comme le nouveau : un
// report doit pouvoir remplacer ou retirer cette ligne, quel que soit son texte.
const SUPPLEMENT_LINE = /^\s*Supplément/;

function lineIndexes(lines: string[], pattern: RegExp): number[] {
  const indexes: number[] = [];
  lines.forEach((line, index) => {
    if (pattern.test(line)) indexes.push(index);
  });
  return indexes;
}

function removeAt(lines: string[], indexes: number[]): void {
  for (let k = indexes.length - 1; k >= 0; k--) lines.splice(indexes[k], 1);
}

/**
 * Réécrit SUR PLACE les seules lignes Service / Prix / Supplément d'une
 * description d'événement. Toutes les autres lignes sont rendues identiques
 * octet pour octet : la description est le seul stockage des informations
 * clientes, du consentement RGPD et du lien de gestion praticienne.
 *
 * - champ absent : la ligne n'est pas touchée ;
 * - `prix: null` (ou 0) : la ligne Prix est retirée ;
 * - `supplement: null` ou 0 : la ligne Supplément est retirée ;
 * - valeur : la ligne est remplacée, ou insérée si elle manque (jamais de
 *   doublon : la première occurrence est remplacée, les suivantes retirées).
 */
export function rewriteDescriptionFields(
  description: string,
  fields: DescriptionFields
): string {
  const lines = description ? description.split("\n") : [];

  if (fields.serviceName !== undefined) {
    const line = `Service : ${fields.serviceName}`;
    const indexes = lineIndexes(lines, SERVICE_LINE);
    if (indexes.length === 0) {
      lines.unshift(line);
    } else {
      lines[indexes[0]] = line;
      removeAt(lines, indexes.slice(1));
    }
  }

  if (fields.prix !== undefined) {
    const keepsPrice = typeof fields.prix === "number" && fields.prix > 0;
    const indexes = lineIndexes(lines, PRICE_LINE);
    if (!keepsPrice) {
      removeAt(lines, indexes);
    } else if (indexes.length === 0) {
      const serviceIndexes = lineIndexes(lines, SERVICE_LINE);
      const at = serviceIndexes.length > 0 ? serviceIndexes[0] + 1 : 0;
      lines.splice(at, 0, `Prix : ${fields.prix} €`);
    } else {
      lines[indexes[0]] = `Prix : ${fields.prix} €`;
      removeAt(lines, indexes.slice(1));
    }
  }

  if (fields.supplement !== undefined) {
    const keepsSupplement =
      typeof fields.supplement === "number" && fields.supplement > 0;
    const indexes = lineIndexes(lines, SUPPLEMENT_LINE);
    if (!keepsSupplement) {
      removeAt(lines, indexes);
    } else if (indexes.length === 0) {
      const priceIndexes = lineIndexes(lines, PRICE_LINE);
      const serviceIndexes = lineIndexes(lines, SERVICE_LINE);
      // Juste après Prix, comme à la création de l'événement.
      const at =
        priceIndexes.length > 0
          ? priceIndexes[0] + 1
          : serviceIndexes.length > 0
            ? serviceIndexes[0] + 1
            : 0;
      lines.splice(at, 0, supplementLine(Number(fields.supplement)));
    } else {
      lines[indexes[0]] = supplementLine(Number(fields.supplement));
      removeAt(lines, indexes.slice(1));
    }
  }

  return lines.join("\n");
}
