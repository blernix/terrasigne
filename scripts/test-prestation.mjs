#!/usr/bin/env node
/**
 * Tests unitaires du socle du changement de prestation (lot B).
 *
 * Aucun appel réseau, aucune écriture dans l'agenda : uniquement des objets en
 * mémoire, les fonctions pures de src/lib/serviceChange.ts et la réécriture de
 * description de src/lib/eventDescription.ts.
 *
 *   node --experimental-strip-types scripts/test-prestation.mjs
 *   npm run test:prestation
 */
import {
  SERVICE_CHANGE_MIN_LEAD_HOURS,
  validateServiceChange,
  buildChangeServicePatch,
} from "../src/lib/serviceChange.ts";
import {
  rewriteDescriptionFields,
  supplementLine,
} from "../src/lib/eventDescription.ts";

let pass = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

/** Horloge figée : 5 novembre 2026, 12:00 UTC. */
const NOW = new Date(Date.UTC(2026, 10, 5, 12, 0, 0));
/** 10 novembre 2026, 10:00 UTC : 118 h après NOW, au-delà des 48 h. */
const BOOKING_START = new Date(Date.UTC(2026, 10, 10, 10, 0, 0));

const target = {
  serviceId: "svc-reiki-90",
  titre: "Reiki 90 min",
  duree: 90,
  pause: 15,
  prix: 120,
  pdf: {
    name: "reiki-90.pdf",
    url: "https://storage.test/uploads/reiki-90.pdf",
  },
};

const booking = {
  id: "evt-123",
  token: "tok-abc",
  start: BOOKING_START.toISOString(),
  summary: "RDV Reiki 60 min - Marie Dupont",
  clientName: "Marie Dupont",
  privateProps: {
    bookingToken: "tok-abc",
    serviceId: "svc-reiki-60",
    serviceName: "Reiki 60 min",
    durationMin: "60",
    pauseMin: "0",
    supplement: "0",
    prix: "80",
    clientEmail: "marie@example.test",
    clientName: "Marie Dupont",
    clientPhone: "+590 690 00 00 00",
    clientTimezone: "America/Guadeloupe",
    meetingType: "visio",
    pdfName: "reiki-60.pdf",
    pdfUrl: "https://storage.test/uploads/reiki-60.pdf",
    consentAt: "2026-11-01T09:00:00.000Z",
    reminderSent: "true",
    ownerReminderSent: "true",
  },
};

const validate = (overrides = {}) =>
  validateServiceChange({
    booking,
    target,
    allowed: true,
    free: true,
    now: NOW,
    minLeadHours: SERVICE_CHANGE_MIN_LEAD_HOURS,
    ...overrides,
  });

function checkRefusal(name, result, status, message = "") {
  const valid =
    result.ok === false &&
    result.status === status &&
    typeof result.message === "string" &&
    result.message.length > 0 &&
    !/erreur serveur/i.test(result.message) &&
    (message === "" || result.message === message);
  check(name, valid, JSON.stringify(result));
}

/* ------------------------------------------------------------------ */
section("Constantes");

check(
  "SERVICE_CHANGE_MIN_LEAD_HOURS vaut 48",
  SERVICE_CHANGE_MIN_LEAD_HOURS === 48,
  String(SERVICE_CHANGE_MIN_LEAD_HOURS)
);

/* ------------------------------------------------------------------ */
section("Refus — prestation non réservable");

checkRefusal(
  "prestation absente → 400",
  validate({ target: null }),
  400,
  "Cette prestation n'est pas proposée à la réservation."
);
checkRefusal(
  "service non réservable (null) → 400",
  validate({ target: undefined }),
  400,
  "Cette prestation n'est pas proposée à la réservation."
);
checkRefusal(
  "durée 0 → 400",
  validate({ target: { ...target, duree: 0 } }),
  400,
  "La durée de cette prestation est invalide."
);
checkRefusal(
  "durée négative → 400",
  validate({ target: { ...target, duree: -30 } }),
  400,
  "La durée de cette prestation est invalide."
);
checkRefusal(
  "durée non numérique → 400",
  validate({ target: { ...target, duree: Number.NaN } }),
  400,
  "La durée de cette prestation est invalide."
);
checkRefusal(
  "pause négative → 400",
  validate({ target: { ...target, pause: -1 } }),
  400,
  "La pause de cette prestation est invalide."
);
checkRefusal(
  "pause non numérique → 400",
  validate({ target: { ...target, pause: Number.NaN } }),
  400,
  "La pause de cette prestation est invalide."
);

/* ------------------------------------------------------------------ */
section("Refus — délai de 48 h et rendez-vous passé");

const inHours = (hours) => new Date(NOW.getTime() + hours * 3600000).toISOString();

checkRefusal(
  "rendez-vous passé → 400",
  validate({ booking: { ...booking, start: inHours(-1) } }),
  400,
  "Ce rendez-vous est passé : il ne peut plus être modifié."
);
checkRefusal(
  "rendez-vous à l'instant → 400 (passé)",
  validate({ booking: { ...booking, start: NOW.toISOString() } }),
  400,
  "Ce rendez-vous est passé : il ne peut plus être modifié."
);
checkRefusal(
  "rendez-vous à 47 h → 400",
  validate({ booking: { ...booking, start: inHours(47) } }),
  400,
  "Ce rendez-vous a lieu dans moins de 48 h : il ne peut plus être modifié."
);
checkRefusal(
  "rendez-vous à 47 h 59 → 400",
  validate({
    booking: { ...booking, start: new Date(NOW.getTime() + (48 * 60 - 1) * 60000).toISOString() },
  }),
  400,
  "Ce rendez-vous a lieu dans moins de 48 h : il ne peut plus être modifié."
);

const at48h = validate({ booking: { ...booking, start: inHours(48) } });
check(
  "rendez-vous à exactement 48 h → accepté",
  at48h.ok === true,
  JSON.stringify(at48h)
);

checkRefusal(
  "délai personnalisé 24 h : rendez-vous à 23 h → 400",
  validate({ booking: { ...booking, start: inHours(23) }, minLeadHours: 24 }),
  400,
  "Ce rendez-vous a lieu dans moins de 24 h : il ne peut plus être modifié."
);
const at24h = validate({ booking: { ...booking, start: inHours(24) }, minLeadHours: 24 });
check(
  "délai personnalisé 24 h : rendez-vous à exactement 24 h → accepté",
  at24h.ok === true,
  JSON.stringify(at24h)
);
checkRefusal(
  "date de début invalide → 400",
  validate({ booking: { ...booking, start: "pas une date" } }),
  400,
  "Ce rendez-vous est introuvable."
);

/* ------------------------------------------------------------------ */
section("Refus — plage et chevauchement");

checkRefusal(
  "créneau hors plage (allowed false) → 400",
  validate({ allowed: false }),
  400,
  "Ce créneau n'est pas proposé à la réservation."
);
checkRefusal(
  "créneau occupé (free false) → 409",
  validate({ free: false }),
  409,
  "Ce créneau chevauche un autre rendez-vous."
);
checkRefusal(
  "hors plage ET occupé → 400 (la plage est jugée d'abord)",
  validate({ allowed: false, free: false }),
  400,
  "Ce créneau n'est pas proposé à la réservation."
);
checkRefusal(
  "prestation invalide ET hors plage → 400 (la prestation est jugée d'abord)",
  validate({ target: { ...target, duree: 0 }, allowed: false }),
  400,
  "La durée de cette prestation est invalide."
);

/* ------------------------------------------------------------------ */
section("Cas accepté");

const accepted = validate();
check("prestation valide, délai et plage ok → { ok: true }", accepted.ok === true, JSON.stringify(accepted));
check(
  "aucun champ parasite dans le succès",
  Object.keys(accepted).length === 1 && accepted.ok === true,
  JSON.stringify(accepted)
);
const acceptedPauseZero = validate({ target: { ...target, pause: 0 } });
check("pause 0 acceptée", acceptedPauseZero.ok === true, JSON.stringify(acceptedPauseZero));

/* ------------------------------------------------------------------ */
section("Patch de l'événement existant");

const description = "Service : Reiki 60 min\nClient : Marie Dupont";
const patch = buildChangeServicePatch({
  booking,
  target,
  supplement: 20,
  description,
});

check(
  "titre « RDV <titre> - <nom cliente> »",
  patch.summary === "RDV Reiki 90 min - Marie Dupont",
  patch.summary
);
check(
  "fin = début + 90 min",
  new Date(patch.end).getTime() === BOOKING_START.getTime() + 90 * 60000,
  patch.end
);
check("description passée telle quelle", patch.description === description);
check(
  "aucune clé start ou id dans le patch (place et identité conservées)",
  !("start" in patch) && !("id" in patch) && !("token" in patch),
  JSON.stringify(Object.keys(patch))
);
check(
  "aucun insert/delete d'événement",
  !("insert" in patch) && !("delete" in patch),
  JSON.stringify(Object.keys(patch))
);
check(
  "bookingToken conservé",
  patch.privateProps.bookingToken === "tok-abc",
  patch.privateProps.bookingToken
);
check(
  "serviceId mis à jour",
  patch.privateProps.serviceId === "svc-reiki-90",
  patch.privateProps.serviceId
);
check(
  "serviceName mis à jour",
  patch.privateProps.serviceName === "Reiki 90 min",
  patch.privateProps.serviceName
);
check(
  "durationMin mis à jour",
  patch.privateProps.durationMin === "90",
  patch.privateProps.durationMin
);
check(
  "pauseMin mis à jour",
  patch.privateProps.pauseMin === "15",
  patch.privateProps.pauseMin
);
check("prix mis à jour", patch.privateProps.prix === "120", patch.privateProps.prix);
check(
  "supplément mis à jour",
  patch.privateProps.supplement === "20",
  patch.privateProps.supplement
);
check(
  "document joint remplacé",
  patch.privateProps.pdfName === "reiki-90.pdf" &&
    patch.privateProps.pdfUrl === "https://storage.test/uploads/reiki-90.pdf",
  `${patch.privateProps.pdfName} / ${patch.privateProps.pdfUrl}`
);
check(
  "rappel cliente réarmé",
  patch.privateProps.reminderSent === "false",
  patch.privateProps.reminderSent
);
check(
  "rappel praticienne réarmé",
  patch.privateProps.ownerReminderSent === "false",
  patch.privateProps.ownerReminderSent
);

const preservedKeys = Object.keys(booking.privateProps);
check(
  "aucune propriété privée existante supprimée",
  preservedKeys.every((key) => key in patch.privateProps),
  preservedKeys.filter((key) => !(key in patch.privateProps)).join(",")
);
check(
  "consentement RGPD conservé",
  patch.privateProps.consentAt === "2026-11-01T09:00:00.000Z",
  patch.privateProps.consentAt
);
check(
  "infos cliente conservées",
  patch.privateProps.clientEmail === "marie@example.test" &&
    patch.privateProps.clientPhone === "+590 690 00 00 00" &&
    patch.privateProps.meetingType === "visio" &&
    patch.privateProps.clientTimezone === "America/Guadeloupe",
  JSON.stringify(patch.privateProps)
);

const withoutSupplement = buildChangeServicePatch({
  booking,
  target: { ...target, prix: null, pdf: null },
  supplement: 0,
  description,
});
check(
  "supplément 0 → propriété « 0 »",
  withoutSupplement.privateProps.supplement === "0",
  withoutSupplement.privateProps.supplement
);
check(
  "prix absent → 0 (jamais NaN)",
  withoutSupplement.privateProps.prix === "0",
  withoutSupplement.privateProps.prix
);
check(
  "nouvelle prestation sans document → ancien document vidé",
  withoutSupplement.privateProps.pdfName === "" &&
    withoutSupplement.privateProps.pdfUrl === "",
  `${withoutSupplement.privateProps.pdfName} / ${withoutSupplement.privateProps.pdfUrl}`
);
check(
  "fin recalculée aussi sans supplément",
  new Date(withoutSupplement.end).getTime() ===
    BOOKING_START.getTime() + 90 * 60000,
  withoutSupplement.end
);

const withoutName = buildChangeServicePatch({
  booking: { ...booking, clientName: "" },
  target,
  supplement: 0,
  description,
});
check(
  "nom cliente absent → titre sans tiret orphelin",
  withoutName.summary === "RDV Reiki 90 min",
  withoutName.summary
);

/* ------------------------------------------------------------------ */
section("Description — réécriture chirurgicale puis patch");

const LEGACY = [
  "Service : Reiki 60 min",
  "Prix : 80 €",
  "Supplément créneau anticipé (+1 h) : +20 € (à régler sur place, non facturé)",
  "Client : Marie Dupont",
  "Email : marie@example.test",
  "Téléphone : +590 690 00 00 00",
  "Mode de rencontre : visio",
  "Profession : Architecte",
  "Suivi psy en cours : non",
  "Type de séance désirée : à distance",
  "Consentement RGPD : Oui (le 01/11/2026)",
  "Message : Merci de me rappeler la veille.",
  "",
  "———",
  "Gérer ce rendez-vous (déplacer / annuler) :",
  "https://terrasigne.test/praticienne/rdv?token=tok-abc&sig=signature",
  "",
  "Passer par ce lien prévient la cliente par email.",
  "Ne supprimez pas cet événement à la main : personne ne serait prévenu.",
].join("\n");

const rewritten = rewriteDescriptionFields(LEGACY, {
  serviceName: target.titre,
  prix: target.prix,
  supplement: 20,
});
const rewrittenLines = rewritten.split("\n");

check(
  "ligne Service remplacée",
  rewritten.includes("Service : Reiki 90 min") &&
    !rewritten.includes("Service : Reiki 60 min"),
  rewritten.split("\n").find((line) => line.startsWith("Service :"))
);
check(
  "ligne Prix remplacée",
  rewritten.includes("Prix : 120 €") && !rewritten.includes("Prix : 80 €")
);
check(
  "ligne Supplément remplacée par le libellé majoré",
  rewritten.includes(supplementLine(20)),
  rewritten.split("\n").find((line) => line.startsWith("Supplément"))
);
check(
  "plus aucune trace de « anticipé »",
  !/anticip/i.test(rewritten),
  rewritten.split("\n").find((line) => /anticip/i.test(line))
);
check(
  "une seule ligne Service",
  rewrittenLines.filter((line) => /^\s*Service\s*:/.test(line)).length === 1
);
check(
  "une seule ligne Prix",
  rewrittenLines.filter((line) => /^\s*Prix\s*:/.test(line)).length === 1
);
check(
  "une seule ligne Supplément",
  rewrittenLines.filter((line) => /^\s*Supplément/.test(line)).length === 1
);

const preservedLines = [
  "Client : Marie Dupont",
  "Email : marie@example.test",
  "Téléphone : +590 690 00 00 00",
  "Mode de rencontre : visio",
  "Profession : Architecte",
  "Suivi psy en cours : non",
  "Type de séance désirée : à distance",
  "Consentement RGPD : Oui (le 01/11/2026)",
  "Message : Merci de me rappeler la veille.",
];
for (const line of preservedLines) {
  check(`« ${line.split(" : ")[0]} » conservée`, rewritten.includes(line));
}

const tailOf = (text) => text.slice(text.indexOf("———"));
check(
  "bloc de gestion praticienne identique (lien signé intact)",
  tailOf(rewritten) === tailOf(LEGACY)
);

const rewrittenTwice = rewriteDescriptionFields(rewritten, {
  serviceName: target.titre,
  prix: target.prix,
  supplement: 20,
});
check("réécriture idempotente", rewrittenTwice === rewritten);

const withoutSupplementLine = rewriteDescriptionFields(rewritten, {
  supplement: 0,
});
check(
  "supplément 0 → ligne retirée",
  !withoutSupplementLine
    .split("\n")
    .some((line) => /^\s*Supplément/.test(line))
);
check(
  "retrait du supplément ne touche pas aux infos cliente",
  withoutSupplementLine.includes("Client : Marie Dupont") &&
    withoutSupplementLine.includes("Consentement RGPD : Oui (le 01/11/2026)") &&
    tailOf(withoutSupplementLine) === tailOf(LEGACY)
);

const withoutPriceLine = rewriteDescriptionFields(rewritten, { prix: null });
check(
  "prix null → ligne Prix retirée",
  !withoutPriceLine.split("\n").some((line) => /^\s*Prix\s*:/.test(line))
);

const combined = buildChangeServicePatch({
  booking,
  target,
  supplement: 20,
  description: rewritten,
});
check(
  "patch final porte la description réécrite",
  combined.description === rewritten
);
check(
  "patch final : mêmes infos cliente que l'original",
  combined.description.includes("Client : Marie Dupont") &&
    combined.description.includes("Email : marie@example.test") &&
    combined.description.includes("Consentement RGPD : Oui (le 01/11/2026)") &&
    combined.description.includes("sig=signature")
);
check(
  "patch final : supplément 20 et fin recalculée",
  combined.privateProps.supplement === "20" &&
    new Date(combined.end).getTime() === BOOKING_START.getTime() + 90 * 60000,
  `${combined.privateProps.supplement} / ${combined.end}`
);

/* ------------------------------------------------------------------ */
console.log(`\n${pass} vérifications passées, ${failures.length} échec(s).`);
if (failures.length) {
  for (const failure of failures) console.log(`  - ${failure.name}`);
  process.exit(1);
}
