#!/usr/bin/env python3
"""Veille de terrasigne.fr — contrôle toutes les 15 minutes, un mail s'il y a du neuf.

Aucune dépendance externe, aucun modèle de langage : des règles bêtes qui couvrent
ce qui casse vraiment.

Ce qui est contrôlé
-------------------
1. pm2        : le process `terrasigne` est `online`
2. http       : la page d'accueil répond 200 en moins de 10 s
3. catalogue  : /api/services rend au moins MIN_SERVICES prestations et /api/blog
                au moins MIN_ARTICLES articles (Directus vivant)
4. reservation: /api/booking/availability propose au moins un créneau
5. incidents  : nouvelles lignes du journal d'incidents (mails, réservations, cron)
6. cron       : le cron des rappels a tourné dans les 3 dernières heures (5 h - 23 h)
7. disque     : l'usage du disque reste sous SEUIL_DISQUE %

Discipline anti-bruit
---------------------
- premier passage = référence : on n'envoie rien sauf panne réelle (pm2 ou http) ;
- une même alerte ne revient pas avant FENETRE_ALERTE heures ;
- un seul mail par passage, quel que soit le nombre de problèmes.

Usage
-----
    veille-terrasigne.py                 passage normal (timer systemd)
    veille-terrasigne.py --auto-test     envoie un vrai mail de test et sort
    veille-terrasigne.py --force         ignore l'anti-bruit (diagnostic)
    veille-terrasigne.py --voir-etat     affiche l'état et sort
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

FUSEAU_LOCAL = timezone(timedelta(hours=-4))  # America/Guadeloupe, sans heure d'été

DEFAUTS = {
    "SITE_URL": "http://127.0.0.1:3018",
    # Destinataire de l'alerte : posé dans /etc/terrasigne-veille.conf.
    "ALERTE_EMAIL": "",
    "INCIDENTS_FILE": "/var/log/terrasigne/incidents.jsonl",
    "ETAT_FILE": "/var/lib/terrasigne/veille-etat.json",
    "CRON_LOG": "/home/webapp/cron-reminders.log",
    "CONF_FILE": "/etc/terrasigne-veille.conf",
    "APP_ENV": "/var/www/terrasigne/terrasigne/.env",
    "MIN_SERVICES": "10",
    "MIN_ARTICLES": "3",
    "PM2_APP": "terrasigne",
    "SEUIL_DISQUE": "90",
    "FENETRE_ALERTE": "6",
    "HEURES_CRON": "3",
    # Réservé aux tests : « 1 » fait comme si le mail était parti, sans réseau.
    "MAIL_FACTICE": "",
}

CHEMIN_SCRIPT = os.path.realpath(__file__)


# --------------------------------------------------------------------------- #
# configuration
# --------------------------------------------------------------------------- #
def lire_env(chemin: str) -> dict[str, str]:
    valeurs: dict[str, str] = {}
    try:
        with open(chemin, encoding="utf-8") as f:
            for ligne in f:
                ligne = ligne.strip()
                if not ligne or ligne.startswith("#") or "=" not in ligne:
                    continue
                cle, valeur = ligne.split("=", 1)
                valeurs[cle.strip()] = valeur.strip().strip('"').strip("'")
    except OSError:
        pass
    return valeurs


def charger_conf() -> dict[str, str]:
    """Priorité : environnement, puis /etc/terrasigne-veille.conf, puis le .env de l'app."""
    conf = dict(DEFAUTS)
    conf.update(lire_env(DEFAUTS["CONF_FILE"]))
    app_env = conf.get("APP_ENV") or DEFAUTS["APP_ENV"]
    for cle in ("BREVO_API_KEY", "BREVO_SENDER_EMAIL", "BUSINESS_TIMEZONE"):
        if cle not in conf or not conf.get(cle):
            conf.update({k: v for k, v in lire_env(app_env).items() if k == cle})
    for cle in list(conf):
        if os.environ.get(cle):
            conf[cle] = os.environ[cle]
    return conf


def journal(message: str) -> None:
    print(f"[{datetime.now(FUSEAU_LOCAL):%Y-%m-%d %H:%M:%S}] {message}", flush=True)


# --------------------------------------------------------------------------- #
# état
# --------------------------------------------------------------------------- #
def lire_etat(chemin: str) -> dict:
    try:
        with open(chemin, encoding="utf-8") as f:
            etat = json.load(f)
            return etat if isinstance(etat, dict) else {}
    except (OSError, ValueError):
        return {}


def ecrire_etat(chemin: str, etat: dict) -> None:
    """Écriture atomique : un nom temporaire portant le PID, jamais le fichier en cours."""
    try:
        os.makedirs(os.path.dirname(chemin), exist_ok=True)
        temporaire = f"{chemin}.{os.getpid()}.tmp"
        with open(temporaire, "w", encoding="utf-8") as f:
            json.dump(etat, f, ensure_ascii=False, indent=1)
        os.replace(temporaire, chemin)
    except OSError as e:
        journal(f"impossible d'écrire l'état ({chemin}) : {e}")


def alerte_recente(etat: dict, cle: str, fenetre_h: float) -> bool:
    dernier = (etat.get("alertes") or {}).get(cle)
    if not dernier:
        return False
    try:
        quand = datetime.fromisoformat(dernier)
    except ValueError:
        return False
    return datetime.now(timezone.utc) - quand < timedelta(hours=fenetre_h)


# --------------------------------------------------------------------------- #
# contrôles — chacun rend None (ça va) ou un texte qui explique la panne
# --------------------------------------------------------------------------- #
def requete(url: str, timeout: float = 15.0) -> tuple[int, bytes]:
    entetes = {
        # Brevo et Cloudflare refusent les User-Agent de script
        "User-Agent": "Mozilla/5.0 (compatible; veille-terrasigne/1.0)",
        "Accept": "application/json, text/html",
    }
    req = urllib.request.Request(url, headers=entetes)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as reponse:
            return reponse.status, reponse.read(2_000_000)
    except urllib.error.HTTPError as e:
        return e.code, e.read(200_000)
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        raise RuntimeError(str(e)) from e


def controle_pm2(conf: dict) -> str | None:
    nom_app = conf.get("PM2_APP") or "terrasigne"
    pm2 = shutil.which("pm2") or "/usr/local/bin/pm2"
    if not os.path.exists(pm2):
        return None  # pm2 absent : ce contrôle ne s'applique pas, on ne crie pas
    try:
        sortie = subprocess.run(
            [pm2, "jlist"], capture_output=True, text=True, timeout=20
        ).stdout
        debut = sortie.find("[")
        if debut < 0:
            return None
        for process in json.loads(sortie[debut:]):
            if process.get("name") == nom_app:
                statut = (process.get("pm2_env") or {}).get("status")
                if statut != "online":
                    return f"le process pm2 « {nom_app} » est « {statut} » au lieu de « online »"
                return None
        return f"le process pm2 « {nom_app} » n'existe plus"
    except (subprocess.SubprocessError, ValueError, OSError) as e:
        journal(f"contrôle pm2 ignoré ({e})")
        return None


def controle_http(conf: dict) -> str | None:
    url = conf["SITE_URL"].rstrip("/") + "/"
    try:
        statut, corps = requete(url)
    except RuntimeError as e:
        return f"la page d'accueil ne répond pas ({e})"
    if statut != 200:
        return f"la page d'accueil répond {statut} au lieu de 200"
    if b"<title>" not in corps:
        return "la page d'accueil répond 200 mais sans balise <title> (page vide ?)"
    return None


def lire_services(conf: dict) -> list:
    statut, corps = requete(conf["SITE_URL"].rstrip("/") + "/api/services")
    if statut != 200:
        raise RuntimeError(f"/api/services répond {statut}")
    donnees = json.loads(corps)
    return donnees if isinstance(donnees, list) else []


def controle_catalogue(conf: dict) -> tuple[str | None, list]:
    minimum_services = int(conf["MIN_SERVICES"])
    minimum_articles = int(conf["MIN_ARTICLES"])
    try:
        services = lire_services(conf)
    except (RuntimeError, ValueError) as e:
        return f"les prestations ne se chargent pas : {e}", []
    if len(services) < minimum_services:
        return (
            f"seulement {len(services)} prestations servies (minimum attendu : {minimum_services})",
            services,
        )
    try:
        statut, corps = requete(conf["SITE_URL"].rstrip("/") + "/api/blog")
        if statut != 200:
            raise RuntimeError(f"/api/blog répond {statut}")
        donnees = json.loads(corps)
        articles = donnees.get("articles", []) if isinstance(donnees, dict) else []
    except (RuntimeError, ValueError) as e:
        return f"les articles ne se chargent pas : {e}", services
    if len(articles) < minimum_articles:
        return (
            f"seulement {len(articles)} article(s) servi(s) (minimum attendu : {minimum_articles})",
            services,
        )
    return None, services


def controle_reservation(conf: dict, services: list) -> str | None:
    candidat = next(
        (s for s in services if s.get("rendez_vous") and s.get("duree")),
        None,
    )
    if not candidat:
        return None  # pas de prestation réservable : le contrôle du catalogue le dira
    url = (
        f"{conf['SITE_URL'].rstrip('/')}/api/booking/availability"
        f"?serviceId={candidat['id']}&duree={candidat['duree']}&timezone=America/Guadeloupe"
    )
    try:
        statut, corps = requete(url)
        if statut != 200:
            return f"la disponibilité répond {statut} : plus personne ne peut réserver"
        donnees = json.loads(corps)
    except (RuntimeError, ValueError) as e:
        return f"la disponibilité ne répond pas ({e}) : plus personne ne peut réserver"
    creneaux = sum(len(j.get("slots") or []) for j in (donnees.get("days") or []))
    if creneaux == 0:
        return (
            "aucun créneau proposé sur les prochaines semaines "
            "(agenda déplacé, compte de service expiré ou plages supprimées ?)"
        )
    return None


def controle_incidents(conf: dict, etat: dict) -> tuple[str | None, int]:
    chemin = conf["INCIDENTS_FILE"]
    try:
        taille = os.path.getsize(chemin)
    except OSError:
        return None, 0
    offset = int(etat.get("incidents_offset") or 0)
    if offset > taille:  # fichier remplacé ou tronqué
        offset = 0
    lignes: list[dict] = []
    try:
        with open(chemin, encoding="utf-8") as f:
            f.seek(offset)
            for ligne in f:
                ligne = ligne.strip()
                if not ligne:
                    continue
                try:
                    lignes.append(json.loads(ligne))
                except ValueError:
                    continue
            etat["incidents_offset"] = f.tell()
    except OSError as e:
        journal(f"journal d'incidents illisible : {e}")
        return None, 0
    if not lignes:
        return None, 0
    groupes: dict[tuple[str, str], list[dict]] = {}
    for evenement in lignes:
        cle = (evenement.get("type") or "?", (evenement.get("message") or "")[:120])
        groupes.setdefault(cle, []).append(evenement)
    details = []
    for (type_incident, message), occurrences in sorted(
        groupes.items(), key=lambda item: -len(item[1])
    ):
        route = occurrences[-1].get("route") or "-"
        action = occurrences[-1].get("action") or ""
        details.append(
            f"  • {type_incident} ×{len(occurrences)} [{route} {action}] {message}"
        )
    texte = "nouvelles erreurs enregistrées par le site :\n" + "\n".join(details[:12])
    if len(groupes) > 12:
        texte += f"\n  … et {len(groupes) - 12} autre(s) type(s) d'erreur"
    return texte, len(lignes)


def controle_cron(conf: dict) -> str | None:
    maintenant = datetime.now(FUSEAU_LOCAL)
    if not (5 <= maintenant.hour <= 23):
        return None  # la nuit, personne n'attend de rappel
    chemin = conf["CRON_LOG"]
    try:
        modifie = datetime.fromtimestamp(os.path.getmtime(chemin), FUSEAU_LOCAL)
    except OSError:
        return f"le journal du cron des rappels est introuvable ({chemin})"
    heures = (maintenant - modifie).total_seconds() / 3600
    limite = float(conf["HEURES_CRON"])
    if heures > limite:
        return (
            f"le cron des rappels n'a rien écrit depuis {heures:.1f} h "
            f"(dernier passage : {modifie:%d/%m %H:%M}) — les rappels du jour ne partent plus"
        )
    return None


def controle_disque(conf: dict) -> str | None:
    try:
        usage = shutil.disk_usage("/")
    except OSError:
        return None
    pourcentage = usage.used * 100 / usage.total
    seuil = float(conf["SEUIL_DISQUE"])
    if pourcentage >= seuil:
        libre = usage.free / 1_073_741_824
        return f"disque à {pourcentage:.0f} % ({libre:.1f} Go libres) — au-delà du seuil de {seuil:.0f} %"
    return None


# --------------------------------------------------------------------------- #
# alerte
# --------------------------------------------------------------------------- #
def envoyer_mail(conf: dict, sujet: str, corps: str) -> bool:
    if conf.get("MAIL_FACTICE") == "1":
        # Utilisé uniquement par les tests : aucun réseau, mais on répond « envoyé »
        # pour que le verrou anti-bruit se pose comme en production.
        journal(f"mode factice : mail non envoyé — {sujet}")
        return True
    cle = conf.get("BREVO_API_KEY")
    destinataire = conf.get("ALERTE_EMAIL")
    if not cle or not destinataire:
        journal("ALERTE NON ENVOYÉE : BREVO_API_KEY ou ALERTE_EMAIL manquant")
        journal(corps)
        return False
    expediteur = conf.get("BREVO_SENDER_EMAIL") or "votre-rendez-vous@terrasigne.fr"
    corps_html = "<pre style=\"font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap\">" + (
        corps.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    ) + "</pre>"
    charge = json.dumps(
        {
            "sender": {"name": "Veille Terrasigne", "email": expediteur},
            "to": [{"email": destinataire}],
            "subject": sujet,
            "textContent": corps,
            "htmlContent": corps_html,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=charge,
        headers={
            "api-key": cle,
            "content-type": "application/json",
            "accept": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; veille-terrasigne/1.0)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as reponse:
            journal(f"mail d'alerte accepté par Brevo ({reponse.status})")
            return True
    except urllib.error.HTTPError as e:
        journal(f"Brevo a refusé l'alerte : {e.code} {e.read(500)!r}")
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        journal(f"Brevo injoignable : {e}")
    return False


# --------------------------------------------------------------------------- #
# passage complet
# --------------------------------------------------------------------------- #
def construire_message(problemes: list[tuple[str, str]]) -> str:
    lignes = [f"{len(problemes)} problème(s) détecté(s) sur terrasigne.fr", ""]
    for cle, texte in problemes:
        lignes.append(f"[{cle}] {texte}")
        lignes.append("")
    lignes.append(f"Contrôle du {datetime.now(FUSEAU_LOCAL):%d/%m/%Y à %H:%M} (heure des Antilles).")
    lignes.append("Ce message est envoyé une seule fois par problème et par tranche de 6 h.")
    return "\n".join(lignes)


def passage(conf: dict, force: bool = False) -> int:
    etat = lire_etat(conf["ETAT_FILE"])
    premiere_fois = not etat.get("reference")
    problemes: list[tuple[str, str]] = []

    controle = controle_pm2(conf)
    if controle:
        problemes.append(("processus", controle))

    controle = controle_http(conf)
    if controle:
        problemes.append(("site", controle))

    # Si le site ne répond pas, inutile de l'interroger quatre fois de plus.
    if not any(cle == "site" for cle, _ in problemes):
        controle, services = controle_catalogue(conf)
        if controle:
            problemes.append(("catalogue", controle))
        controle = controle_reservation(conf, services)
        if controle:
            problemes.append(("reservation", controle))

    controle, nombre_incidents = controle_incidents(conf, etat)
    if controle:
        problemes.append(("erreurs", controle))

    controle = controle_cron(conf)
    if controle:
        problemes.append(("rappels", controle))

    controle = controle_disque(conf)
    if controle:
        problemes.append(("disque", controle))

    fenetre = float(conf["FENETRE_ALERTE"])
    a_signaler = [
        (cle, texte)
        for cle, texte in problemes
        if force or not alerte_recente(etat, cle, fenetre)
    ]

    panne_reelle = any(cle in ("processus", "site") for cle, _ in problemes)
    if premiere_fois and not panne_reelle:
        journal(
            f"premier passage : référence enregistrée ({len(problemes)} problème(s) existant(s)), "
            "aucun mail"
        )
        a_signaler = []

    if a_signaler:
        sujet = "Terrasigne : " + (
            "le site ne répond plus"
            if panne_reelle
            else f"{len(a_signaler)} problème(s) à regarder"
        )
        if envoyer_mail(conf, sujet, construire_message(a_signaler)):
            alertes = etat.setdefault("alertes", {})
            maintenant = datetime.now(timezone.utc).isoformat()
            for cle, _ in a_signaler:
                alertes[cle] = maintenant
    elif problemes and not premiere_fois:
        journal(f"{len(problemes)} problème(s), déjà signalé(s) récemment : pas de mail")
    journal(
        f"passage terminé : {len(problemes)} problème(s), {len(a_signaler)} signalé(s), "
        f"{nombre_incidents} incident(s) nouveau(x)"
    )
    etat["reference"] = True
    etat["dernier_passage"] = datetime.now(timezone.utc).isoformat()
    etat["dernier_bilan"] = {cle: texte for cle, texte in problemes}
    ecrire_etat(conf["ETAT_FILE"], etat)
    return 1 if panne_reelle else 0


def main() -> int:
    analyseur = argparse.ArgumentParser(description="Veille de terrasigne.fr")
    analyseur.add_argument("--auto-test", action="store_true", help="envoie un mail de test et sort")
    analyseur.add_argument("--force", action="store_true", help="ignore l'anti-bruit")
    analyseur.add_argument("--voir-etat", action="store_true", help="affiche l'état et sort")
    options = analyseur.parse_args()

    conf = charger_conf()

    if options.voir_etat:
        print(json.dumps(lire_etat(conf["ETAT_FILE"]), ensure_ascii=False, indent=1))
        return 0

    if options.auto_test:
        corps = (
            "Mail de test de la veille Terrasigne.\n\n"
            "Si tu lis ce message, le canal d'alerte fonctionne :\n"
            f"- site contrôlé : {conf['SITE_URL']}\n"
            f"- destinataire : {conf.get('ALERTE_EMAIL')}\n"
            f"- script : {CHEMIN_SCRIPT}\n\n"
            f"Envoyé le {datetime.now(FUSEAU_LOCAL):%d/%m/%Y à %H:%M} (heure des Antilles)."
        )
        ok = envoyer_mail(conf, "Terrasigne : test de la veille", corps)
        return 0 if ok else 1

    return passage(conf, force=options.force)


if __name__ == "__main__":
    sys.exit(main())
