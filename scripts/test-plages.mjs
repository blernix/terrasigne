#!/usr/bin/env node
/**
 * Tests unitaires du socle des plages de disponibilité.
 *
 * Aucun appel réseau, aucune écriture dans l'agenda : uniquement des dates en
 * mémoire et les fonctions pures de src/lib/plages.ts.
 *
 *   node --experimental-strip-types scripts/test-plages.mjs
 *   npm run test:plages
 */
import {
  SLOT_STEP_MIN,
  SUPPLEMENT_MAJO,
  parseWindow,
  splitWindowIntoSlots,
  findCoveringWindows,
  buildSlots,
  validateSlot,
} from "../src/lib/plages.ts";
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

function hhmm(date) {
  return date.toISOString().slice(11, 16);
}

function starts(slots) {
  return slots.map((slot) => hhmm(slot.start)).join(",");
}

/** Date UTC du 5 novembre 2026 : les comparaisons ne dépendent pas du fuseau. */
const at = (hours, minutes = 0) =>
  new Date(Date.UTC(2026, 10, 5, hours, minutes, 0, 0));

const windowOf = (summary, startHour, endHour, startMin = 0, endMin = 0) => ({
  summary,
  start: at(startHour, startMin),
  end: at(endHour, endMin),
});

/* ------------------------------------------------------------------ */
section("Constantes");

check("SLOT_STEP_MIN vaut 30", SLOT_STEP_MIN === 30, String(SLOT_STEP_MIN));
check("SUPPLEMENT_MAJO vaut 20", SUPPLEMENT_MAJO === 20, String(SUPPLEMENT_MAJO));

/* ------------------------------------------------------------------ */
section("Titres majorés (plage ouverte + supplément 20 €)");

const supplementedTitles = [
  "dispo majo",
  "dispo majo France",
  "dispo +20",
  "dispo 20€",
  "dispo 20 €",
  "dispo 20",
  "dispo majorée",
  "dispo MAJORÉE",
  "DISPO MAJO",
  "  dispo   majo  ",
  "Dispo Majo.",
  "dispo   +20",
];

for (const title of supplementedTitles) {
  const parsed = parseWindow(title);
  check(
    `« ${title} » → ouvert + ${SUPPLEMENT_MAJO} €`,
    parsed.open === true && parsed.supplement === SUPPLEMENT_MAJO,
    JSON.stringify(parsed)
  );
}

/* ------------------------------------------------------------------ */
section("Titres ouverts sans supplément");

const plainTitles = [
  "dispo",
  "Dispo",
  "  dispo  ",
  "dispo 9h-12h",
  "dispo 20h",
  "dispo 20:00",
  "dispo 20/12",
  "dispo 200",
  "dispo 200 €",
  "dispo 2026",
  "dispo majoration",
  "dispo sans majoration",
  "dispo France",
  "disponible",
];

for (const title of plainTitles) {
  const parsed = parseWindow(title);
  check(
    `« ${title} » → ouvert sans supplément`,
    parsed.open === true && parsed.supplement === 0,
    JSON.stringify(parsed)
  );
}

/* ------------------------------------------------------------------ */
section("Titres fermés (aucune plage, aucun supplément)");

const closedTitles = ["RDV Reiki", "indispo", "pause", "+20", "majo", ""];

for (const title of closedTitles) {
  const parsed = parseWindow(title);
  check(
    `« ${title} » → fermé sans supplément`,
    parsed.open === false && parsed.supplement === 0,
    JSON.stringify(parsed)
  );
}

/* ------------------------------------------------------------------ */
section("Découpage des plages (aucune marge)");

const split60 = splitWindowIntoSlots(at(9), at(12), 60);
check("09:00–12:00 / 60 min → 5 créneaux", split60.length === 5, starts(split60));
check(
  "09:00–12:00 / 60 min → débuts 09:00 à 11:00",
  starts(split60) === "09:00,09:30,10:00,10:30,11:00",
  starts(split60)
);
check(
  "09:00–12:00 / 60 min → dernier créneau finit à 12:00",
  split60[split60.length - 1].end.getTime() === at(12).getTime()
);

const split90 = splitWindowIntoSlots(at(9), at(12), 90);
check("09:00–12:00 / 90 min → 4 créneaux", split90.length === 4, starts(split90));

const split180 = splitWindowIntoSlots(at(9), at(12), 180);
check(
  "09:00–12:00 / 180 min → 1 créneau qui remplit la plage",
  split180.length === 1 && starts(split180) === "09:00",
  starts(split180)
);

const split181 = splitWindowIntoSlots(at(9), at(12), 181);
check("09:00–12:00 / 181 min → 0 créneau", split181.length === 0, String(split181.length));

const splitZero = splitWindowIntoSlots(at(9), at(12), 0);
check("durée 0 → 0 créneau", splitZero.length === 0, String(splitZero.length));

const splitStep60 = splitWindowIntoSlots(at(9), at(12), 60, 60);
check(
  "pas de 60 min → 3 créneaux (09:00, 10:00, 11:00)",
  splitStep60.length === 3 && starts(splitStep60) === "09:00,10:00,11:00",
  starts(splitStep60)
);

check(
  "aucun créneau ne commence avant l'ouverture (pas de −1 h)",
  split60.every((slot) => slot.start.getTime() >= at(9).getTime())
);
check(
  "aucun créneau ne dépasse la fermeture",
  split60.every((slot) => slot.end.getTime() <= at(12).getTime())
);

/* ------------------------------------------------------------------ */
section("Autorisation stricte d'un créneau");

const plainWindow = [windowOf("dispo", 9, 12)];

const refused = [
  ["08:00–09:00 (avant l'ouverture)", at(8), at(9)],
  ["08:30–09:30 (à cheval sur l'ouverture)", at(8, 30), at(9, 30)],
  ["11:30–12:30 (déborde la fermeture)", at(11, 30), at(12, 30)],
  ["13:00–14:00 (hors plage)", at(13), at(14)],
];
for (const [label, start, end] of refused) {
  const allowance = validateSlot(plainWindow, start, end);
  check(
    `${label} → refusé`,
    allowance.allowed === false && allowance.supplement === 0,
    JSON.stringify(allowance)
  );
}

const accepted = [
  ["09:00–10:00", at(9), at(10)],
  ["11:00–12:00", at(11), at(12)],
  ["09:00–12:00 (plage entière)", at(9), at(12)],
];
for (const [label, start, end] of accepted) {
  const allowance = validateSlot(plainWindow, start, end);
  check(
    `${label} → accepté sans supplément`,
    allowance.allowed === true && allowance.supplement === 0,
    JSON.stringify(allowance)
  );
}

const majorWindow = [windowOf("dispo majo", 9, 12)];
const majorSlot = validateSlot(majorWindow, at(9), at(10));
check(
  "plage majorée 09:00–10:00 → accepté avec 20 €",
  majorSlot.allowed === true && majorSlot.supplement === SUPPLEMENT_MAJO,
  JSON.stringify(majorSlot)
);
const majorOutside = validateSlot(majorWindow, at(8), at(9));
check(
  "plage majorée : 08:00 reste refusé (aucune marge)",
  majorOutside.allowed === false,
  JSON.stringify(majorOutside)
);

/* ------------------------------------------------------------------ */
section("Maximum des plages couvrantes (ordre Google indifférent)");

const overlapping = [windowOf("dispo", 9, 13), windowOf("dispo majo", 9, 12)];
const overlappingReversed = [windowOf("dispo majo", 9, 12), windowOf("dispo", 9, 13)];

const inBoth = validateSlot(overlapping, at(9), at(10));
check(
  "09:00–10:00 couvert par les deux plages → 20 €",
  inBoth.allowed === true && inBoth.supplement === SUPPLEMENT_MAJO,
  JSON.stringify(inBoth)
);
const inBothReversed = validateSlot(overlappingReversed, at(9), at(10));
check(
  "ordre des plages inversé → toujours 20 €",
  inBothReversed.allowed === true &&
    inBothReversed.supplement === SUPPLEMENT_MAJO,
  JSON.stringify(inBothReversed)
);

const onlyPlain = validateSlot(overlapping, at(12), at(13));
check(
  "12:00–13:00 couvert par la plage normale seule → 0 €",
  onlyPlain.allowed === true && onlyPlain.supplement === 0,
  JSON.stringify(onlyPlain)
);

const straddling = validateSlot(overlapping, at(11, 30), at(12, 30));
check(
  "11:30–12:30 à cheval sur la fin de la plage majorée → 0 €",
  straddling.allowed === true && straddling.supplement === 0,
  JSON.stringify(straddling)
);

const covering = findCoveringWindows(overlapping, at(9), at(10));
check(
  "findCoveringWindows rend les deux plages couvrantes",
  covering.length === 2,
  String(covering.length)
);

const partialOverlap = [windowOf("dispo", 9, 12), windowOf("dispo majo", 9, 30, 12)];
const beforeMajor = validateSlot(partialOverlap, at(9), at(9, 30));
check(
  "09:00–09:30 commence avant la plage majorée → 0 €",
  beforeMajor.allowed === true && beforeMajor.supplement === 0,
  JSON.stringify(beforeMajor)
);
const insideMajor = validateSlot(partialOverlap, at(9, 30), at(10));
check(
  "09:30–10:00 entièrement dans la plage majorée → 20 €",
  insideMajor.allowed === true && insideMajor.supplement === SUPPLEMENT_MAJO,
  JSON.stringify(insideMajor)
);

/* ------------------------------------------------------------------ */
section("Créneaux proposés (buildSlots)");

const plainSlots = buildSlots(plainWindow, 60);
check("plage normale → 5 créneaux", plainSlots.length === 5, starts(plainSlots));
check(
  "plage normale → aucun créneau avant 09:00",
  plainSlots[0].start.getTime() === at(9).getTime(),
  starts(plainSlots)
);
check(
  "plage normale → supplément 0 partout",
  plainSlots.every((slot) => slot.supplement === 0)
);

const majorSlots = buildSlots(majorWindow, 60);
check("plage majorée → 5 créneaux", majorSlots.length === 5, starts(majorSlots));
check(
  "plage majorée → supplément 20 partout",
  majorSlots.every((slot) => slot.supplement === SUPPLEMENT_MAJO)
);

const mergedSlots = buildSlots(overlapping, 60);
check(
  "plages chevauchantes → 7 créneaux (union)",
  mergedSlots.length === 7,
  starts(mergedSlots)
);
check(
  "plages chevauchantes → 09:00 majoré à 20 €",
  mergedSlots[0].start.getTime() === at(9).getTime() &&
    mergedSlots[0].supplement === SUPPLEMENT_MAJO,
  JSON.stringify(mergedSlots[0])
);
check(
  "plages chevauchantes → 12:00 normal à 0 €",
  mergedSlots[mergedSlots.length - 1].start.getTime() === at(12).getTime() &&
    mergedSlots[mergedSlots.length - 1].supplement === 0,
  JSON.stringify(mergedSlots[mergedSlots.length - 1])
);
check(
  "plages chevauchantes → 11:30 hors plage majorée à 0 €",
  mergedSlots.find((slot) => slot.start.getTime() === at(11, 30).getTime())
    ?.supplement === 0
);

const mergedReversed = buildSlots(overlappingReversed, 60);
check(
  "ordre des plages inversé → mêmes suppléments",
  mergedReversed.length === mergedSlots.length &&
    mergedReversed.every(
      (slot, index) => slot.supplement === mergedSlots[index].supplement
    )
);

check(
  "plage au titre inconnu → aucun créneau",
  buildSlots([windowOf("RDV Reiki", 9, 12)], 60).length === 0
);

const eveningSlots = buildSlots([windowOf("dispo 20h", 19, 22)], 60);
check(
  "« dispo 20h » ouvre une plage normale (aucun +20)",
  eveningSlots.length === 5 && eveningSlots.every((slot) => slot.supplement === 0),
  starts(eveningSlots)
);

check(
  "durée 181 min sur 09:00–12:00 → aucun créneau",
  buildSlots(plainWindow, 181).length === 0
);

const filteredSlots = buildSlots(plainWindow, 60, {
  minStart: at(10),
  maxStart: at(10, 30),
});
check(
  "minStart/maxStart filtrent les débuts",
  starts(filteredSlots) === "10:00,10:30",
  starts(filteredSlots)
);

/* ------------------------------------------------------------------ */
section("Recalcul du supplément au report (RDV existant)");

// Même appel que les routes de report : le créneau visé est validé contre les
// plages AVANT le patch, et son supplément remplace celui de l'ancienne plage.
const reportWindows = [windowOf("dispo majo", 14, 17)];
const reportSlot = validateSlot(reportWindows, at(14), at(15));
check(
  "report vers une plage majorée : le créneau vaut 20 €",
  reportSlot.allowed === true && reportSlot.supplement === SUPPLEMENT_MAJO,
  JSON.stringify(reportSlot)
);

// Description réelle d'un RDV normal (aucune ligne Supplément), telle que la
// produit buildEventDescription : le bloc de gestion ne doit pas bouger.
const NORMAL_DESCRIPTION = [
  "Service : Reiki",
  "Prix : 60 €",
  "Client : Marie Dupont",
  "Email : marie@example.test",
  "Consentement RGPD : Oui (le 2 novembre 2026)",
  "",
  "———",
  "Gérer ce rendez-vous (déplacer / annuler) :",
  "https://terrasigne.test/praticienne/rdv?token=tok-abc&sig=signature",
].join("\n");

const movedToMajor = rewriteDescriptionFields(NORMAL_DESCRIPTION, {
  supplement: SUPPLEMENT_MAJO,
});
const movedLines = movedToMajor.split("\n");
check(
  "report normal → plage majorée : ligne Supplément majoré insérée après Prix",
  movedLines[2] ===
    "Supplément créneau majoré : +20 € (à régler sur place, non facturé)" &&
    movedLines[2] === supplementLine(SUPPLEMENT_MAJO),
  movedLines[2]
);
check(
  "report vers une plage majorée : le reste de la description est intact",
  movedLines.filter((line) => !/^\s*Supplément/.test(line)).join("\n") ===
    NORMAL_DESCRIPTION
);

const backToNormal = rewriteDescriptionFields(movedToMajor, { supplement: 0 });
check(
  "report plage majorée → plage normale : ligne Supplément supprimée",
  !/^\s*Supplément/m.test(backToNormal) && backToNormal === NORMAL_DESCRIPTION,
  JSON.stringify(backToNormal)
);

/* ------------------------------------------------------------------ */
console.log(`\n${pass} vérifications passées, ${failures.length} échec(s).`);
if (failures.length) {
  for (const failure of failures) console.log(`  - ${failure.name}`);
  process.exit(1);
}
