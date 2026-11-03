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
  /**
   * Marge du créneau anticipé, en minutes. Passée par l'appelant pour que la
   * description reste alignée sur lib/bookingOptions sans import.
   */
  earlySlotMinBefore?: number;
  zoomLink?: string;
  consentAt?: string;
  ownerManageUrl?: string;
  client: EventDescriptionClient;
}

export function buildEventDescription(input: EventDescriptionInput): string {
  const { client } = input;
  const earlyMin = Number(input.earlySlotMinBefore ?? 60);
  const lines = [
    `Service : ${input.serviceName}`,
    input.prix ? `Prix : ${input.prix} €` : null,
    input.supplement
      ? `Supplément créneau anticipé (+${earlyMin / 60} h) : ${
          input.supplement
        } € (à régler sur place, non facturé)`
      : null,
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
