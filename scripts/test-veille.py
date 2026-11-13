#!/usr/bin/env python3
"""Tests de la veille Terrasigne — faux site en local, aucun mail envoyé.

Chaque cas lance scripts/veille-terrasigne.py en sous-processus avec un
environnement isolé (état, incidents et journal du cron dans un dossier
temporaire), puis lit ce qu'il a décidé de faire.

    python3 scripts/test-veille.py
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import tempfile
import threading
import time
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

RACINE = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
SCRIPT = os.path.join(RACINE, "scripts", "veille-terrasigne.py")

passes = 0
echecs: list[str] = []


def check(nom: str, condition: bool, detail: str = "") -> None:
    global passes
    if condition:
        passes += 1
        print(f"  ✓ {nom}")
    else:
        echecs.append(nom)
        print(f"  ✗ {nom}{f' — {detail}' if detail else ''}")


# --------------------------------------------------------------------------- #
# faux site
# --------------------------------------------------------------------------- #
ETAT_SITE = {"services": 12, "articles": 5, "creneaux": 8, "http": 200}


class FauxSite(BaseHTTPRequestHandler):
    def log_message(self, *_args):  # silence
        pass

    def _repondre(self, code: int, charge: dict | list | str) -> None:
        corps = charge if isinstance(charge, str) else json.dumps(charge)
        self.send_response(code)
        self.send_header("Content-Type", "application/json" if not isinstance(charge, str) else "text/html")
        self.end_headers()
        self.wfile.write(corps.encode())

    def do_GET(self):  # noqa: N802
        if self.path == "/":
            if ETAT_SITE["http"] != 200:
                return self._repondre(ETAT_SITE["http"], "erreur")
            return self._repondre(200, "<html><head><title>Terrasigne</title></head></html>")
        if self.path.startswith("/api/services"):
            return self._repondre(
                200,
                [
                    {"id": f"service-{i}", "rendez_vous": True, "duree": 60}
                    for i in range(ETAT_SITE["services"])
                ],
            )
        if self.path.startswith("/api/blog"):
            return self._repondre(
                200,
                {"articles": [{"id": i} for i in range(ETAT_SITE["articles"])], "total": ETAT_SITE["articles"]},
            )
        if self.path.startswith("/api/booking/availability"):
            if ETAT_SITE["creneaux"] == 0:
                return self._repondre(200, {"days": [{"slots": []}]})
            return self._repondre(
                200, {"days": [{"slots": [{"start": "2026-12-01T09:00:00-04:00"}] * ETAT_SITE["creneaux"]}]}
            )
        return self._repondre(404, "inconnu")


def port_libre() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


PORT = port_libre()
SERVEUR = ThreadingHTTPServer(("127.0.0.1", PORT), FauxSite)
threading.Thread(target=SERVEUR.serve_forever, daemon=True).start()

DOSSIER = tempfile.mkdtemp(prefix="veille-test-")
INCIDENTS = os.path.join(DOSSIER, "incidents.jsonl")
ETAT = os.path.join(DOSSIER, "etat.json")
CRON_LOG = os.path.join(DOSSIER, "cron.log")


def environnement(**remplacements: str) -> dict[str, str]:
    env = {
        "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
        "SITE_URL": f"http://127.0.0.1:{PORT}",
        "INCIDENTS_FILE": INCIDENTS,
        "ETAT_FILE": ETAT,
        "CRON_LOG": CRON_LOG,
        "CONF_FILE": os.path.join(DOSSIER, "conf-vide"),
        "APP_ENV": os.path.join(DOSSIER, "env-inexistant"),
        "ALERTE_EMAIL": "test@example.com",
        "BREVO_API_KEY": "",  # vide : aucun mail ne part vraiment
        "MIN_SERVICES": "10",
        "MIN_ARTICLES": "3",
        "HEURES_CRON": "3",
        "SEUIL_DISQUE": "99",
    }
    env.update(remplacements)
    return env


def lancer(*arguments: str, **remplacements: str) -> tuple[int, str]:
    resultat = subprocess.run(
        [sys.executable, SCRIPT, *arguments],
        capture_output=True,
        text=True,
        env=environnement(**remplacements),
        timeout=120,
    )
    return resultat.returncode, resultat.stdout + resultat.stderr


def reinitialiser() -> None:
    for chemin in (ETAT, INCIDENTS):
        if os.path.exists(chemin):
            os.remove(chemin)
    with open(CRON_LOG, "w", encoding="utf-8") as f:
        f.write('{"message":"OK","sent":1,"recap":0}\n')
    ETAT_SITE.update({"services": 12, "articles": 5, "creneaux": 8, "http": 200})


# --------------------------------------------------------------------------- #
print("\nPremier passage : référence, aucun mail")
reinitialiser()
code, sortie = lancer()
check("code de sortie 0", code == 0, f"obtenu {code}")
check("référence enregistrée", "premier passage" in sortie, sortie[-200:])
check("aucun mail tenté", "ALERTE NON ENVOYÉE" not in sortie, sortie[-200:])
check("état écrit", os.path.exists(ETAT))
etat = json.load(open(ETAT))
check("état marque la référence", etat.get("reference") is True)

print("\nDeuxième passage sain : silence")
code, sortie = lancer()
check("code de sortie 0", code == 0)
check("0 problème", "0 problème(s)" in sortie, sortie[-160:])
check("aucun mail", "mail d'alerte" not in sortie and "ALERTE" not in sortie)

print("\nSite en 500 : alerte, code 1")
ETAT_SITE["http"] = 500
code, sortie = lancer("--force")
check("code de sortie 1", code == 1, f"obtenu {code}")
check("problème « site » détecté", "[site]" in sortie, sortie[-400:])
check("mail tenté", "ALERTE NON ENVOYÉE" in sortie, sortie[-300:])
ETAT_SITE["http"] = 200

print("\nCatalogue vide : alerte")
ETAT_SITE["services"] = 2
code, sortie = lancer("--force")
check("prestations insuffisantes détectées", "seulement 2 prestations" in sortie, sortie[-400:])
ETAT_SITE["services"] = 12

print("\nAucun créneau : alerte")
ETAT_SITE["creneaux"] = 0
code, sortie = lancer("--force")
check("absence de créneaux détectée", "aucun créneau proposé" in sortie, sortie[-400:])
ETAT_SITE["creneaux"] = 8

print("\nIncidents enregistrés par le site : remontés")
with open(INCIDENTS, "a", encoding="utf-8") as f:
    f.write(json.dumps({"ts": "2026-11-12T23:00:00Z", "type": "email",
                        "message": "Error: Erreur Brevo 400", "route": "/api/contact",
                        "action": "formulaire"}) + "\n")
    f.write(json.dumps({"ts": "2026-11-12T23:01:00Z", "type": "email",
                        "message": "Error: Erreur Brevo 400", "route": "/api/contact",
                        "action": "formulaire"}) + "\n")
code, sortie = lancer("--force")
check("ligne d'incident remontée", "email ×2" in sortie, sortie[-400:])
check("route citée", "/api/contact" in sortie, sortie[-400:])

code, sortie = lancer()
check("incidents déjà lus : pas de doublon", "email ×2" not in sortie, sortie[-300:])

print("\nCron muet depuis 5 h : alerte")
vieux = (datetime.now() - timedelta(hours=5)).timestamp()
os.utime(CRON_LOG, (vieux, vieux))
etat = json.load(open(ETAT))
etat.get("alertes", {}).clear()
json.dump(etat, open(ETAT, "w"))
code, sortie = lancer()
heure = datetime.now(timezone(timedelta(hours=-4))).hour
if 5 <= heure <= 23:
    check("cron en retard détecté", "cron des rappels n'a rien écrit" in sortie, sortie[-400:])
else:
    check("cron ignoré la nuit", "cron des rappels" not in sortie)
os.utime(CRON_LOG, None)

print("\nAnti-bruit : même alerte deux fois de suite")
ETAT_SITE["http"] = 503
os.remove(ETAT)
code, sortie = lancer(MAIL_FACTICE="1")  # première passe = référence, mais panne réelle -> alerte
check("une panne réelle alerte dès le premier passage", "mail non envoyé" in sortie, sortie[-300:])
code, sortie = lancer(MAIL_FACTICE="1")  # ne doit rien renvoyer dans la fenêtre de 6 h
check("pas de second mail dans la fenêtre", "mail non envoyé" not in sortie, sortie[-400:])
code, sortie = lancer("--force", MAIL_FACTICE="1")
check("--force ignore l'anti-bruit", "mail non envoyé" in sortie, sortie[-400:])
ETAT_SITE["http"] = 200

print("\nUn envoi raté ne verrouille pas l'alerte")
os.remove(ETAT)
ETAT_SITE["http"] = 500
lancer()  # premier passage : alerte tentée, Brevo absent -> échec
code, sortie = lancer()
check("l'alerte repart au passage suivant", "[site]" in sortie, sortie[-400:])
ETAT_SITE["http"] = 200

print("\nAuto-test : le canal d'alerte est joignable")
code, sortie = lancer("--auto-test")
check("auto-test signale l'absence de clé", "ALERTE NON ENVOYÉE" in sortie, sortie[-300:])
check("le destinataire vient bien de la configuration", "destinataire : test@example.com" in sortie, sortie[-400:])
check("code de sortie 1 quand le mail ne peut pas partir", code == 1, f"obtenu {code}")

print("\nVoir l'état")
code, sortie = lancer("--voir-etat")
check("état affiché en JSON", '"dernier_passage"' in sortie, sortie[-300:])
check("code 0", code == 0)

SERVEUR.shutdown()

print(f"\n{passes} vérifications passées, {len(echecs)} échec(s).")
if echecs:
    for nom in echecs:
        print(f"  - {nom}")
    sys.exit(1)
