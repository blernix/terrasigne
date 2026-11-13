#!/usr/bin/env node
/**
 * Tests unitaires du journal d'incidents.
 *
 * Aucun appel réseau, aucune écriture hors d'un dossier temporaire : on
 * vérifie le format des lignes et surtout que rien ne lève jamais.
 *
 *   node --experimental-strip-types scripts/test-incidents.mjs
 */
import { mkdtempSync, readFileSync, existsSync, chmodSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dossier = mkdtempSync(join(tmpdir(), "incidents-test-"));
const fichier = join(dossier, "incidents.jsonl");
process.env.INCIDENTS_FILE = fichier;

const { noterIncident } = await import("../src/lib/incidents.ts");

let pass = 0;
const failures = [];

function check(nom, condition, detail = "") {
  if (condition) {
    pass++;
    console.log(`  ✓ ${nom}`);
  } else {
    failures.push({ nom, detail });
    console.log(`  ✗ ${nom}${detail ? ` — ${detail}` : ""}`);
  }
}

function lignes() {
  if (!existsSync(fichier)) return [];
  return readFileSync(fichier, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

console.log("\nÉcriture et format\n");

noterIncident("email", new Error("Erreur Brevo 400: name is missing"), {
  route: "/api/contact",
  action: "envoi formulaire",
});
let l = lignes();
check("une ligne écrite", l.length === 1, `obtenu ${l.length}`);
check("champ ts ISO valide", !Number.isNaN(Date.parse(l[0]?.ts || "")), l[0]?.ts);
check("champ type conservé", l[0]?.type === "email", l[0]?.type);
check("route et action conservées", l[0]?.route === "/api/contact" && l[0]?.action === "envoi formulaire");
check(
  "une Error est rendue « Name: message »",
  l[0]?.message === "Error: Erreur Brevo 400: name is missing",
  l[0]?.message
);

noterIncident("reservation", "   trop   d'espaces\net des retours   ", { route: "/api/booking" });
l = lignes();
check("message normalisé sur une ligne", l[1]?.message === "trop d'espaces et des retours", l[1]?.message);

noterIncident("catalogue", { code: 503, source: "directus" });
check("objet sérialisé en JSON", lignes()[2]?.message === '{"code":503,"source":"directus"}', lignes()[2]?.message);

noterIncident("serveur", "x".repeat(500));
check("message tronqué à 300 caractères", lignes()[3]?.message.length === 300, String(lignes()[3]?.message.length));

noterIncident("cron", undefined);
check("message absent -> chaîne vide", lignes()[4]?.message === "", JSON.stringify(lignes()[4]?.message));

check("cinq lignes au total", lignes().length === 5, `obtenu ${lignes().length}`);
check("champs inconnus absents", Object.keys(lignes()[0]).sort().join(",") === "action,message,route,ts,type");

console.log("\nRotation : le journal ne grossit pas sans fin\n");

const repet = "y".repeat(280);
let ecrites = 0;
while (statSync(fichier).size <= 2 * 1024 * 1024 && ecrites < 20000) {
  noterIncident("serveur", repet);
  ecrites++;
}
check("le journal dépasse 2 Mo après une boucle d'erreurs", statSync(fichier).size > 2 * 1024 * 1024);
noterIncident("serveur", "après rotation");
check("l'ancien journal est conservé en .1", existsSync(fichier + ".1"));
const apresRotation = lignes();
check(
  "le journal reparti de zéro ne contient que la nouvelle erreur",
  apresRotation.length === 1 && apresRotation[0].message === "après rotation",
  `${apresRotation.length} ligne(s)`
);
check("le fichier .1 garde les anciennes lignes", statSync(fichier + ".1").size > 2 * 1024 * 1024);

console.log("\nRobustesse : ne doit jamais lever\n");

const dossierFerme = mkdtempSync(join(tmpdir(), "incidents-ferme-"));
chmodSync(dossierFerme, 0o500); // lecture seule
process.env.INCIDENTS_FILE = join(dossierFerme, "sous", "incidents.jsonl");
let leve = false;
try {
  noterIncident("serveur", "écriture impossible");
} catch {
  leve = true;
}
check("chemin non inscriptible -> aucune exception", !leve);

let leve2 = false;
try {
  // @ts-ignore volontaire : on vérifie qu'un type inattendu ne casse rien
  noterIncident("type-inconnu", Symbol("bizarre"));
} catch {
  leve2 = true;
}
check("valeur exotique -> aucune exception", !leve2);

console.log(`\n${pass} vérifications passées, ${failures.length} échec(s).`);
if (failures.length) {
  for (const f of failures) console.log(`  - ${f.nom}`);
  process.exit(1);
}
