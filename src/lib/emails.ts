const BRAND = {
  purple: "#6B46C1",
  purpleDark: "#553C9A",
  orange: "#ED8936",
  green: "#38A169",
  cream: "#F6E8D6",
  greenLight: "#def1e4",
  text: "#3E3E3E",
  muted: "#8A8A8A",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(inner: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;width:100%;">
          ${inner}
          <tr>
            <td align="center" style="padding:24px 16px 8px;">
              <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
                TerraSigne — Terre de Bas, Guadeloupe<br>
                <a href="https://terrasigne.fr" style="color:${BRAND.purple};text-decoration:none;">terrasigne.fr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function header(badgeText: string): string {
  return `<tr>
  <td style="background:linear-gradient(135deg,${BRAND.purple} 0%,${BRAND.purpleDark} 100%);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;">
    <div style="display:inline-block;background-color:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:999px;padding:6px 16px;margin-bottom:16px;">TerraSigne</div>
    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">${badgeText}</h1>
  </td>
</tr>`;
}

function card(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (r, i) => `<tr>
        <td style="padding:14px 0;border-bottom:${i === rows.length - 1 ? "none" : "1px solid #EFE6F9"};">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size:14px;color:${BRAND.muted};width:120px;vertical-align:top;padding-right:12px;">${r.label}</td>
              <td style="font-size:15px;color:${BRAND.text};font-weight:600;text-align:right;">${r.value}</td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `<tr>
  <td style="padding:0 32px;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.greenLight};border-radius:12px;padding:8px 20px;">
      ${rowsHtml}
    </table>
  </td>
</tr>`;
}

export interface BookingEmailParams {
  name: string;
  service: string;
  dateLabel: string;
  durationMin: number;
  price?: number | null;
  timezoneLabel?: string;
  manageUrl?: string;
}

export function bookingConfirmationEmailHtml(params: BookingEmailParams): string {
  const { name, service, dateLabel, durationMin, price, timezoneLabel, manageUrl } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
    { label: "Durée", value: `${durationMin} min` },
  ];
  if (price) rows.push({ label: "Tarif", value: `${price} €` });

  const manageBlock = manageUrl
    ? `<tr>
    <td style="padding:24px 32px 4px;text-align:center;">
      <a href="${escapeHtml(manageUrl)}" style="display:inline-block;background-color:${BRAND.purple};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Modifier ou annuler mon rendez-vous</a>
    </td>
  </tr>`
    : "";

  const inner = `
  ${header("Rendez-vous confirmé")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 8px;font-size:16px;color:${BRAND.text};line-height:1.6;">
        Bonjour <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Merci pour votre réservation. Votre rendez-vous est bien enregistré, voici le récapitulatif :
      </p>
    </td>
  </tr>
  ${card(rows)}
  ${
    timezoneLabel
      ? `<tr><td style="padding:12px 32px 0;text-align:center;"><p style="margin:0;font-size:12px;color:${BRAND.muted};">Horaires affichés en heure de ${escapeHtml(timezoneLabel)}</p></td></tr>`
      : ""
  }
  ${manageBlock}
  <tr>
    <td style="padding:16px 32px 32px;text-align:center;">
      <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
        Besoin de modifier ou annuler ? Utilisez le bouton ci-dessus.
      </p>
    </td>
  </tr>`;

  return layout(inner);
}

export interface ReminderEmailParams {
  name: string;
  service: string;
  dateLabel: string;
}

export function reminderEmailHtml(params: ReminderEmailParams): string {
  const { name, service, dateLabel } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
  ];

  const inner = `
  ${header("Rappel de rendez-vous")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 8px;font-size:16px;color:${BRAND.text};line-height:1.6;">
        Bonjour <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Ceci est un petit rappel concernant votre rendez-vous à venir :
      </p>
    </td>
  </tr>
  ${card(rows)}
  <tr>
    <td style="padding:16px 32px 32px;text-align:center;">
      <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
        À très bientôt chez TerraSigne.
      </p>
    </td>
  </tr>`;

  return layout(inner);
}

export interface CancellationEmailParams {
  name: string;
  service: string;
  dateLabel: string;
}

export function cancellationEmailHtml(params: CancellationEmailParams): string {
  const { name, service, dateLabel } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
  ];

  const inner = `
  ${header("Rendez-vous annulé")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 8px;font-size:16px;color:${BRAND.text};line-height:1.6;">
        Bonjour <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Votre rendez-vous a bien été annulé :
      </p>
    </td>
  </tr>
  ${card(rows)}
  <tr>
    <td style="padding:24px 32px 32px;text-align:center;">
      <a href="https://terrasigne.fr/rendez-vous" style="display:inline-block;background-color:${BRAND.orange};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Prendre un nouveau rendez-vous</a>
    </td>
  </tr>`;

  return layout(inner);
}

export interface RescheduleEmailParams {
  name: string;
  service: string;
  oldDateLabel: string;
  newDateLabel: string;
}

export function rescheduleEmailHtml(params: RescheduleEmailParams): string {
  const { name, service, oldDateLabel, newDateLabel } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Ancienne date", value: escapeHtml(oldDateLabel) },
    { label: "Nouvelle date", value: escapeHtml(newDateLabel) },
  ];

  const inner = `
  ${header("Rendez-vous modifié")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 8px;font-size:16px;color:${BRAND.text};line-height:1.6;">
        Bonjour <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Votre rendez-vous a bien été déplacé :
      </p>
    </td>
  </tr>
  ${card(rows)}`;

  return layout(inner);
}


export interface OwnerNotificationEmailParams {
  name: string;
  email: string;
  phone?: string;
  meetingType?: string;
  profession?: string;
  suivi?: string;
  typeSeance?: string;
  service: string;
  dateLabel: string;
  price?: number | null;
  message?: string;
}

export function ownerNotificationEmailHtml(
  params: OwnerNotificationEmailParams
): string {
  const {
    name,
    email,
    phone,
    meetingType,
    profession,
    suivi,
    typeSeance,
    service,
    dateLabel,
    price,
    message,
  } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
    { label: "Client", value: escapeHtml(name) },
    { label: "Email", value: escapeHtml(email) },
  ];
  if (phone) rows.push({ label: "Téléphone", value: escapeHtml(phone) });
  if (meetingType)
    rows.push({ label: "Rencontre", value: escapeHtml(meetingType) });
  if (profession) rows.push({ label: "Profession", value: escapeHtml(profession) });
  if (suivi) rows.push({ label: "Suivi psy", value: escapeHtml(suivi) });
  if (typeSeance)
    rows.push({ label: "Type de séance", value: escapeHtml(typeSeance) });
  if (price) rows.push({ label: "Tarif", value: `${price} €` });

  const messageHtml = message
    ? `<tr><td style="padding:0 32px 24px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FFF7EE;border-left:4px solid ${BRAND.orange};border-radius:8px;padding:12px 16px;"><tr><td style="font-size:14px;color:${BRAND.text};line-height:1.6;"><strong>Message du client :</strong><br>${escapeHtml(message)}</td></tr></table></td></tr>`
    : "";

  const inner = `
  ${header("Nouveau rendez-vous")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Une nouvelle réservation vient d'être effectuée sur le site :
      </p>
    </td>
  </tr>
  ${card(rows)}
  ${messageHtml}
  <tr>
    <td style="padding:0 32px 32px;text-align:center;">
      <a href="https://calendar.google.com" style="display:inline-block;background-color:${BRAND.purple};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Ouvrir mon agenda</a>
    </td>
  </tr>`;

  return layout(inner);
}
