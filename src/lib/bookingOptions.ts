// Options de réservation partagées entre l'API et l'interface.
//
// Créneau anticipé : la cliente peut réserver 1 h avant l'ouverture officielle
// de la journée, avec un supplément de 20 €. Aucune facturation n'est générée :
// le supplément est seulement mentionné (interface, agenda, emails).
export const EARLY_SLOT_MIN_BEFORE = 60;
export const EARLY_SLOT_SUPPLEMENT = 20;
