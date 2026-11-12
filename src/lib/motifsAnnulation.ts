// Motifs d'annulation proposés à la praticienne.
// Elle choisit soit un motif de la liste, soit un texte libre — jamais les deux
// à la fois. Le motif reste facultatif : un rendez-vous peut être annulé sans
// explication, et le mail à la cliente n'en parle alors pas.
//
// Partagé entre la page (import direct) et la route API (validation du code).

export const MOTIFS_ANNULATION = [
  { code: "indisponibilite", label: "Je ne suis pas disponible à ce créneau" },
  { code: "imprevu", label: "Imprévu de dernière minute" },
  { code: "urgence", label: "Urgence personnelle" },
  { code: "autre", label: "Autre (texte libre)" },
] as const;

export type MotifCode = (typeof MOTIFS_ANNULATION)[number]["code"];

const TEXT_MAX = 300;

export function isMotifCode(value: unknown): value is MotifCode {
  return MOTIFS_ANNULATION.some((m) => m.code === value);
}

export function motifLabel(code: unknown): string | null {
  const found = MOTIFS_ANNULATION.find((m) => m.code === code);
  return found && found.code !== "autre" ? found.label : null;
}

/**
 * Réduit le motif reçu du formulaire à ce qui sera écrit dans l'email :
 * - un code de la liste (sauf "autre") ;
 * - et/ou un texte libre, borné à 300 caractères, sans retour à la ligne.
 * Retourne null si rien d'exploitable.
 */
export function normalizeMotif(input: {
  code?: unknown;
  texte?: unknown;
}): { code: MotifCode; texte: string } | null {
  const code = isMotifCode(input.code) ? input.code : null;
  const raw = typeof input.texte === "string" ? input.texte : "";
  const texte = raw.replace(/\s+/g, " ").trim().slice(0, TEXT_MAX);

  if (!code && !texte) return null;
  // "Autre" n'a de sens qu'avec un texte : sans texte, on ne garde rien.
  if ((!code || code === "autre") && !texte) return null;

  return { code: (code || "autre") as MotifCode, texte };
}

/** Phrase lisible insérée dans le mail de la cliente. */
export function motifPhrase(motif: { code: MotifCode; texte: string } | null): string {
  if (!motif) return "";
  const label = motifLabel(motif.code);
  const texte = motif.texte.trim();
  if (label && texte) return `${label} — ${texte}`;
  if (label) return label;
  return texte;
}
