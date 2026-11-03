#!/usr/bin/env node
/**
 * Tests unitaires des mails de rendez-vous.
 *
 * Aucun appel réseau, aucune écriture dans l'agenda, aucun envoi : on rend les
 * gabarits HTML en mémoire et on vérifie leurs conditions d'affichage.
 *
 *   node --experimental-strip-types scripts/test-mails-rdv.mjs
 *
 * Le secret du lien praticienne est fourni ici : les modules le lisent à
 * l'import, d'où les imports dynamiques après avoir posé la variable.
 */
process.env.OWNER_LINK_SECRET = process.env.OWNER_LINK_SECRET || "secret-de-test";

const emails = await import("../src/lib/emails.ts");
const ownerLink = await import("../src/lib/ownerLink.ts");
const motifs = await import("../src/lib/motifsAnnulation.ts");
const tz = await import("../src/lib/timezones.ts");
const desc = await import("../src/lib/eventDescription.ts");

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

/** Texte visible d'un mail (balises retirées, entités laissées telles quelles). */
function plain(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

const MANAGE = "https://terrasigne.fr/praticienne/rdv?token=abc&sig=def";
/** Les URL sont écrites dans le HTML avec &amp; — l'égalité se fait sur la forme échappée. */
const MANAGE_HTML = MANAGE.replace(/&/g, "&amp;");
const base = {
  name: "Marie Dupont",
  service: "Reiki",
  dateLabel: "Jeudi 5 novembre 2026 à 09:00",
  durationMin: 90,
};

/* ------------------------------------------------------------------ */
section("Document (PDF) — la mention suit la donnée, jamais l'inverse");

const confPdf = emails.bookingConfirmationEmailHtml({ ...base, pdfNote: true });
const confNoPdf = emails.bookingConfirmationEmailHtml({ ...base, pdfNote: false });
check("confirmation avec document : parle du document", /document/i.test(plain(confPdf)));
check("confirmation sans document : n'en parle pas", !/document/i.test(plain(confNoPdf)));

const remPdf = emails.reminderEmailHtml({
  name: base.name,
  service: base.service,
  dateLabel: base.dateLabel,
  pdfNote: true,
  documentUrl: "https://storage.googleapis.com/stock_clients/uploads/x.pdf",
});
const remNoPdf = emails.reminderEmailHtml({
  name: base.name,
  service: base.service,
  dateLabel: base.dateLabel,
  pdfNote: false,
});
check("rappel avec document : parle du document", /document/i.test(plain(remPdf)));
check(
  "rappel avec document : donne le lien du document",
  remPdf.includes("https://storage.googleapis.com/stock_clients/uploads/x.pdf")
);
check("rappel sans document : n'en parle pas", !/document/i.test(plain(remNoPdf)));

/* ------------------------------------------------------------------ */
section("Lien de gestion praticienne dans les mails de Cindy");

const ownerNew = emails.ownerNotificationEmailHtml({
  name: base.name,
  email: "marie@example.com",
  service: base.service,
  dateLabel: base.dateLabel,
  manageUrl: MANAGE,
});
const ownerNewNoLink = emails.ownerNotificationEmailHtml({
  name: base.name,
  email: "marie@example.com",
  service: base.service,
  dateLabel: base.dateLabel,
});
check("nouveau RDV : contient le lien de gestion", ownerNew.includes(MANAGE_HTML));
check(
  "nouveau RDV : le lien est échappé proprement",
  !ownerNew.includes(`href="${MANAGE}"`)
);
check(
  "nouveau RDV : avertit que la cliente est prévenue",
  /prévient la cliente/.test(plain(ownerNew))
);
check(
  "nouveau RDV sans lien : pas de bouton de gestion",
  !plain(ownerNewNoLink).includes("Gérer ce rendez-vous")
);

const ownerResched = emails.ownerRescheduleEmailHtml({
  name: base.name,
  email: "marie@example.com",
  service: base.service,
  oldDateLabel: "Lundi 2 novembre 2026 à 09:00",
  newDateLabel: base.dateLabel,
  manageUrl: MANAGE,
});
check("RDV déplacé (reçu par Cindy) : contient le lien", ownerResched.includes(MANAGE_HTML));

const ownerCancel = emails.ownerCancellationEmailHtml({
  name: base.name,
  email: "marie@example.com",
  service: base.service,
  dateLabel: base.dateLabel,
});
check(
  "RDV annulé (reçu par Cindy) : pas de lien mort vers un RDV supprimé",
  !plain(ownerCancel).includes("Gérer ce rendez-vous")
);

/* ------------------------------------------------------------------ */
section("Mails déclenchés par la praticienne, vers la cliente");

const cancelledWithReason = emails.clientCancelledByOwnerEmailHtml({
  name: base.name,
  service: base.service,
  dateLabel: base.dateLabel,
  reason: "Imprévu de dernière minute — empêchement familial",
  rebookUrl: "https://terrasigne.fr/rendez-vous",
});
check(
  "annulation par la praticienne : dit qui a annulé",
  /Cindy a dû annuler/.test(plain(cancelledWithReason))
);
check(
  "annulation par la praticienne : affiche le motif",
  plain(cancelledWithReason).includes("empêchement familial")
);
check(
  "annulation par la praticienne : propose de reprendre rendez-vous",
  cancelledWithReason.includes("https://terrasigne.fr/rendez-vous")
);

const cancelledNoReason = emails.clientCancelledByOwnerEmailHtml({
  name: base.name,
  service: base.service,
  dateLabel: base.dateLabel,
});
check(
  "annulation sans motif : aucun bloc motif",
  !plain(cancelledNoReason).includes("Motif indiqué")
);

const rescheduledByOwner = emails.clientRescheduledByOwnerEmailHtml({
  name: base.name,
  service: base.service,
  oldDateLabel: "Lundi 2 novembre 2026 à 09:00",
  newDateLabel: base.dateLabel,
  reason: "Indisponibilité",
  manageUrl: "https://terrasigne.fr/rendez-vous/gerer?token=abc",
});
const reschedPlain = plain(rescheduledByOwner);
check(
  "déplacement par la praticienne : ancienne ET nouvelle date",
  reschedPlain.includes("2 novembre 2026") && reschedPlain.includes("5 novembre 2026")
);
check(
  "déplacement par la praticienne : garde le lien de gestion de la cliente",
  rescheduledByOwner.includes("/rendez-vous/gerer?token=abc")
);
check(
  "déplacement par la praticienne : dit qui a déplacé",
  /Cindy a déplacé/.test(reschedPlain)
);

/* ------------------------------------------------------------------ */
section("Récap quotidien de la praticienne");

const recap = emails.ownerDailyRecapEmailHtml({
  dateLabel: "jeudi 5 novembre 2026",
  items: [
    {
      timeLabel: "09:00",
      service: "Reiki",
      clientName: "Marie Dupont",
      email: "marie@example.com",
      phone: "0690 00 00 00",
      manageUrl: MANAGE,
    },
    {
      timeLabel: "14:00",
      service: "Access Bars",
      clientName: "Julie Martin",
      email: "julie@example.com",
    },
  ],
});
const recapPlain = plain(recap);
check("récap : les deux rendez-vous sont listés", recapPlain.includes("Marie Dupont") && recapPlain.includes("Julie Martin"));
check("récap : les horaires sont là", recapPlain.includes("09:00") && recapPlain.includes("14:00"));
check("récap : annonce le total", recapPlain.includes("2 rendez-vous au total"));
check(
  "récap : lien de gestion seulement sur le RDV qui en a un",
  (recap.match(/praticienne\/rdv/g) || []).length === 1
);

/* ------------------------------------------------------------------ */
section("Signature du lien praticienne");

const token = "11111111-2222-3333-4444-555555555555";
check("signature disponible", ownerLink.ownerLinkAvailable());
check("signature valide acceptée", ownerLink.verifyOwnerToken(token, ownerLink.signOwnerToken(token)));
check(
  "signature tronquée refusée",
  !ownerLink.verifyOwnerToken(token, ownerLink.signOwnerToken(token).slice(0, -2))
);
check("signature d'un autre token refusée", !ownerLink.verifyOwnerToken("autre-token", ownerLink.signOwnerToken(token)));
check("absence de signature refusée", !ownerLink.verifyOwnerToken(token, ""));
check(
  "URL construite avec token et signature",
  ownerLink.buildOwnerUrl("https://terrasigne.fr/", token).startsWith(
    "https://terrasigne.fr/praticienne/rdv?token="
  )
);

/* ------------------------------------------------------------------ */
section("Motifs d'annulation");

check("liste de motifs non vide", motifs.MOTIFS_ANNULATION.length >= 3);
check(
  "un code de la liste est accepté",
  motifs.normalizeMotif({ code: "indisponibilite" })?.code === "indisponibilite"
);
check("« autre » sans texte est refusé", motifs.normalizeMotif({ code: "autre" }) === null);
check("texte seul devient « autre »", motifs.normalizeMotif({ texte: "empêchement" })?.code === "autre");
check("code inconnu est ignoré", motifs.normalizeMotif({ code: "bidon", texte: "x" })?.code === "autre");
check(
  "texte borné à 300 caractères",
  (motifs.normalizeMotif({ texte: "a".repeat(400) })?.texte || "").length === 300
);
check(
  "phrase lisible pour le mail",
  motifs.motifPhrase({ code: "imprevu", texte: "famille" }) ===
    "Imprévu de dernière minute — famille"
);

/* ------------------------------------------------------------------ */
section("Fuseau et jours");

check("31 décembre + 1 jour = 1er janvier", tz.addDaysToDateKey("2026-12-31", 1) === "2027-01-01");
check("1er mars - 1 jour = 28 février", tz.addDaysToDateKey("2026-03-01", -1) === "2026-02-28");
check(
  "minuit local Guadeloupe = 04:00 UTC",
  tz.zonedMidnight("2026-11-05", "America/Guadeloupe").toISOString() ===
    "2026-11-05T04:00:00.000Z"
);
const label = tz.dateKeyLabel("2026-11-05", "America/Guadeloupe");
check("libellé de date en français", /novembre/.test(label) && /2026/.test(label), label);

/* ------------------------------------------------------------------ */
section("Description de l'événement dans l'agenda");

const description = desc.buildEventDescription({
  serviceName: "Reiki",
  prix: 60,
  supplement: 20,
  earlySlotMinBefore: 60,
  ownerManageUrl: MANAGE,
  client: {
    name: "Marie Dupont",
    email: "marie@example.com",
    phone: "0690 00 00 00",
    consent: true,
    consentAt: "2026-11-03T10:00:00.000Z",
  },
});
check("description : contient le lien de gestion", description.includes(MANAGE));
check("description : prévient de ne pas supprimer l'événement", /Ne supprimez pas cet événement/.test(description));
check("description : libellé du supplément anticipé", description.includes("Supplément créneau anticipé (+1 h)"));
check("description : informations client conservées", description.includes("Client : Marie Dupont"));

const noLinkDesc = desc.buildEventDescription({
  serviceName: "Reiki",
  client: { name: "Marie Dupont", email: "marie@example.com" },
});
check("description sans lien : aucun bloc de gestion", !noLinkDesc.includes("Gérer ce rendez-vous"));

/* ------------------------------------------------------------------ */
console.log(
  `\n${pass} vérifications passées, ${failures.length} échec(s).`
);
if (failures.length) {
  for (const f of failures) console.log(`  - ${f.name}`);
  process.exit(1);
}
