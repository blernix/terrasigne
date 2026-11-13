#!/bin/sh
# Installe la veille de terrasigne.fr (root requis).
#
#   sh deploy/installer-veille.sh            installe et arme le timer
#   sh deploy/installer-veille.sh --desinstaller
#
# Ce que fait le script :
#   1. prépare /var/log/terrasigne et /var/lib/terrasigne pour l'utilisateur webapp ;
#   2. écrit /etc/terrasigne-veille.conf s'il n'existe pas (destinataire de l'alerte) ;
#   3. copie les unités systemd, recharge, active le timer.
set -eu

APP_DIR=/var/www/terrasigne/terrasigne
UTILISATEUR=webapp
CONF=/etc/terrasigne-veille.conf

if [ "$(id -u)" -ne 0 ]; then
  echo "à lancer en root" >&2
  exit 1
fi

if [ "${1:-}" = "--desinstaller" ]; then
  systemctl disable --now terrasigne-veille.timer 2>/dev/null || true
  rm -f /etc/systemd/system/terrasigne-veille.service /etc/systemd/system/terrasigne-veille.timer
  systemctl daemon-reload
  echo "veille désinstallée (les données restent dans /var/log/terrasigne et /var/lib/terrasigne)"
  exit 0
fi

install -d -o "$UTILISATEUR" -g "$UTILISATEUR" -m 750 /var/log/terrasigne
install -d -o "$UTILISATEUR" -g "$UTILISATEUR" -m 750 /var/lib/terrasigne

if [ ! -f "$CONF" ]; then
  cat > "$CONF" <<'EOF'
# Veille terrasigne.fr — /etc/terrasigne-veille.conf
# Adresse qui reçoit les alertes.
ALERTE_EMAIL=killian.lecrut@gmail.com
# Seuils (facultatifs)
# MIN_SERVICES=10
# MIN_ARTICLES=3
# SEUIL_DISQUE=90
# FENETRE_ALERTE=6
# HEURES_CRON=3
EOF
  chmod 600 "$CONF"
  echo "conf créée : $CONF"
else
  echo "conf existante conservée : $CONF"
fi

install -m 644 "$APP_DIR/deploy/terrasigne-veille.service" /etc/systemd/system/terrasigne-veille.service
install -m 644 "$APP_DIR/deploy/terrasigne-veille.timer" /etc/systemd/system/terrasigne-veille.timer
systemctl daemon-reload
systemctl enable --now terrasigne-veille.timer

echo
systemctl list-timers terrasigne-veille.timer --no-pager || true
echo
echo "Premier passage manuel :"
echo "  sudo systemctl start terrasigne-veille.service"
echo "  journalctl -u terrasigne-veille.service -n 30 --no-pager"
echo
echo "Test du canal d'alerte (envoie un vrai mail) :"
echo "  sudo -u $UTILISATEUR /usr/bin/python3 $APP_DIR/scripts/veille-terrasigne.py --auto-test"
