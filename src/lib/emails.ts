// Palette alignee sur le site : vert dominant, violet = spiritualite.
const BRAND = {
  primary: "#2e5940",
  primaryDark: "#234530",
  accent: "#6e5498",
  paper: "#f8fbf5",
  soft: "#e5f1df",
  text: "#2b3530",
  muted: "#66706a",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getZoomLink(meetingType?: string): string | undefined {
  if (!meetingType || !/visio/i.test(meetingType)) return undefined;
  const link = process.env.ZOOM_LINK?.trim();
  return link || undefined;
}

function zoomBlock(zoomLink: string, intro: string): string {
  return `<tr>
    <td style="padding:16px 32px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#efebf7;border-left:4px solid ${BRAND.primary};border-radius:8px;padding:12px 16px;">
        <tr><td style="font-size:14px;color:${BRAND.text};line-height:1.6;">
          <strong>${intro}</strong><br/>
          Lien de la réunion Zoom : <a href="${escapeHtml(zoomLink)}" style="color:${BRAND.primary};font-weight:600;word-break:break-all;">${escapeHtml(zoomLink)}</a>
        </td></tr>
      </table>
    </td>
  </tr>`;
}

function pdfNoticeBlock(title: string, body: string, url?: string): string {
  const link = url
    ? `<br><a href="${escapeHtml(url)}" style="display:inline-block;margin-top:12px;background-color:#ffffff;color:${BRAND.accent};font-size:14px;font-weight:700;text-decoration:none;border-radius:999px;padding:10px 22px;">Ouvrir le document</a>`
    : "";
  return `<tr>
    <td style="padding:24px 32px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.accent};border-radius:12px;padding:20px 24px;">
        <tr>
          <td style="font-size:16px;font-weight:700;color:#ffffff;line-height:1.5;">
            ${title}<br>
            <span style="font-weight:400;font-size:14px;color:#ffffff;">${body}</span>${link}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// Bouton "Gérer ce rendez-vous" des mails destinés à la praticienne : il porte
// le lien signé qui ouvre la page praticienne (déplacer / annuler + motif).
function ownerManageBlock(manageUrl?: string): string {
  if (!manageUrl) return "";
  return `<tr>
    <td style="padding:24px 32px 0;text-align:center;">
      <a href="${escapeHtml(manageUrl)}" style="display:inline-block;background-color:${BRAND.accent};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Gérer ce rendez-vous</a>
      <p style="margin:10px 0 0;font-size:12px;color:${BRAND.muted};line-height:1.5;">Déplacer ou annuler depuis cette page prévient la cliente par email.<br>N'annulez pas l'événement à la main dans l'agenda : personne ne serait prévenu.</p>
    </td>
  </tr>`;
}

// Pied des mails praticienne : bouton agenda quand aucun lien de gestion
// n'existe (fonctionnalité désactivée), simple lien texte sinon.
function ownerAgendaBlock(manageUrl?: string): string {
  if (manageUrl) {
    return `<tr>
    <td style="padding:12px 32px 32px;text-align:center;">
      <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">Ou consultez <a href="https://calendar.google.com" style="color:${BRAND.primary};font-weight:600;text-decoration:none;">votre agenda</a>.</p>
    </td>
  </tr>`;
  }
  return `<tr>
    <td style="padding:0 32px 32px;text-align:center;">
      <a href="https://calendar.google.com" style="display:inline-block;background-color:${BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Ouvrir mon agenda</a>
    </td>
  </tr>`;
}

function layout(inner: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${BRAND.paper};font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.paper};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;width:100%;">
          ${inner}
          <tr>
            <td align="center" style="padding:24px 16px 8px;">
              <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
                Terrasigne — Terre de Bas, Guadeloupe<br>
                <a href="https://terrasigne.fr" style="color:${BRAND.primary};text-decoration:none;">terrasigne.fr</a>
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
  <td style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryDark} 100%);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;">
    <div style="display:inline-block;background-color:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:999px;padding:6px 16px;margin-bottom:16px;">Terrasigne</div>
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
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.soft};border-radius:12px;padding:8px 20px;">
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
  supplement?: number | null;
  timezoneLabel?: string;
  manageUrl?: string;
  pdfNote?: boolean;
  zoomLink?: string;
}

export function bookingConfirmationEmailHtml(params: BookingEmailParams): string {
  const { name, service, dateLabel, durationMin, price, supplement, timezoneLabel, manageUrl, pdfNote, zoomLink } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
    { label: "Durée", value: `${durationMin} min` },
  ];
  if (price) rows.push({ label: "Tarif", value: `${price} €` });
  if (supplement)
    rows.push({
      label: `Créneau majoré (+${supplement} €)`,
      value: "à régler sur place, non facturé",
    });

  const manageBlock = manageUrl
    ? `<tr>
    <td style="padding:24px 32px 4px;text-align:center;">
      <a href="${escapeHtml(manageUrl)}" style="display:inline-block;background-color:${BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Modifier ou annuler mon rendez-vous</a>
    </td>
  </tr>`
    : "";

  const pdfBlock = pdfNote
    ? pdfNoticeBlock(
        "Document à remplir et signer",
        "Merci de prendre connaissance du document ci-joint avant votre rendez-vous, de le signer et de le renvoyer par email."
      )
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
  ${pdfBlock}
  ${zoomLink ? zoomBlock(zoomLink, "Votre rendez-vous se fera en visioconférence.") : ""}
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
  pdfNote?: boolean;
  documentUrl?: string;
  zoomLink?: string;
}

export function reminderEmailHtml(params: ReminderEmailParams): string {
  const { name, service, dateLabel, pdfNote, documentUrl, zoomLink } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
  ];

  const pdfBlock = pdfNote
    ? pdfNoticeBlock(
        "Document à signer",
        "Vérifiez que tout est en ordre avant votre rendez-vous : avez-vous bien pris connaissance et signé le document ?",
        documentUrl
      )
    : "";

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
  ${pdfBlock}
  ${zoomLink ? zoomBlock(zoomLink, "Rappel : votre rendez-vous se fait en visioconférence.") : ""}
  <tr>
    <td style="padding:16px 32px 32px;text-align:center;">
      <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
        À très bientôt chez Terrasigne.
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
      <a href="https://terrasigne.fr/rendez-vous" style="display:inline-block;background-color:${BRAND.accent};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Prendre un nouveau rendez-vous</a>
    </td>
  </tr>`;

  return layout(inner);
}

export interface RescheduleEmailParams {
  name: string;
  service: string;
  oldDateLabel: string;
  newDateLabel: string;
  /** Supplément de la nouvelle plage (0 ou absent : aucune ligne). */
  supplement?: number | null;
  manageUrl?: string;
}

export function rescheduleEmailHtml(params: RescheduleEmailParams): string {
  const { name, service, oldDateLabel, newDateLabel, supplement, manageUrl } =
    params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Ancienne date", value: escapeHtml(oldDateLabel) },
    { label: "Nouvelle date", value: escapeHtml(newDateLabel) },
  ];
  if (supplement)
    rows.push({
      label: `Créneau majoré (+${supplement} €)`,
      value: "à régler sur place, non facturé",
    });

  const manageBlock = manageUrl
    ? `<tr>
    <td style="padding:24px 32px 32px;text-align:center;">
      <a href="${escapeHtml(manageUrl)}" style="display:inline-block;background-color:${BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Modifier ou annuler mon rendez-vous</a>
    </td>
  </tr>`
    : "";

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
  ${card(rows)}
  ${manageBlock}`;

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
  supplement?: number | null;
  message?: string;
  zoomLink?: string;
  manageUrl?: string;
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
    supplement,
    message,
    zoomLink,
    manageUrl,
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
  if (supplement)
    rows.push({
      label: `Créneau majoré (+${supplement} €)`,
      value: "à encaisser sur place",
    });

  const messageHtml = message
    ? `<tr><td style="padding:0 32px 24px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f6eb;border-left:4px solid ${BRAND.accent};border-radius:8px;padding:12px 16px;"><tr><td style="font-size:14px;color:${BRAND.text};line-height:1.6;"><strong>Message du client :</strong><br>${escapeHtml(message)}</td></tr></table></td></tr>`
    : "";

  const zoomHtml = zoomLink
    ? `<tr><td style="padding:0 32px 24px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#efebf7;border-left:4px solid ${BRAND.primary};border-radius:8px;padding:12px 16px;"><tr><td style="font-size:14px;color:${BRAND.text};line-height:1.6;"><strong>Rendez-vous en visioconférence — lien Zoom :</strong><br><a href="${escapeHtml(zoomLink)}" style="color:${BRAND.primary};font-weight:600;word-break:break-all;">${escapeHtml(zoomLink)}</a></td></tr></table></td></tr>`
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
  ${zoomHtml}
  ${messageHtml}
  ${ownerManageBlock(manageUrl)}
  ${ownerAgendaBlock(manageUrl)}`;

  return layout(inner);
}

export interface OwnerCancellationEmailParams {
  name: string;
  email: string;
  phone?: string;
  service: string;
  dateLabel: string;
  manageUrl?: string;
}

export function ownerCancellationEmailHtml(
  params: OwnerCancellationEmailParams
): string {
  const { name, email, phone, service, dateLabel, manageUrl } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
    { label: "Client", value: escapeHtml(name) },
    { label: "Email", value: escapeHtml(email) },
  ];
  if (phone) rows.push({ label: "Téléphone", value: escapeHtml(phone) });

  const inner = `
  ${header("Rendez-vous annulé")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Un rendez-vous vient d'être annulé par le client :
      </p>
    </td>
  </tr>
  ${card(rows)}
  ${ownerManageBlock(manageUrl)}
  ${ownerAgendaBlock(manageUrl)}`;

  return layout(inner);
}

export interface OwnerRescheduleEmailParams {
  name: string;
  email: string;
  phone?: string;
  service: string;
  oldDateLabel: string;
  newDateLabel: string;
  /** Supplément de la nouvelle plage (0 ou absent : aucune ligne). */
  supplement?: number | null;
  manageUrl?: string;
}

export function ownerRescheduleEmailHtml(
  params: OwnerRescheduleEmailParams
): string {
  const {
    name,
    email,
    phone,
    service,
    oldDateLabel,
    newDateLabel,
    supplement,
    manageUrl,
  } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Ancienne date", value: escapeHtml(oldDateLabel) },
    { label: "Nouvelle date", value: escapeHtml(newDateLabel) },
    { label: "Client", value: escapeHtml(name) },
    { label: "Email", value: escapeHtml(email) },
  ];
  if (phone) rows.push({ label: "Téléphone", value: escapeHtml(phone) });
  if (supplement)
    rows.push({
      label: `Créneau majoré (+${supplement} €)`,
      value: "à encaisser sur place",
    });

  const inner = `
  ${header("Rendez-vous modifié")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Un rendez-vous vient d'être déplacé par le client :
      </p>
    </td>
  </tr>
  ${card(rows)}
  ${ownerManageBlock(manageUrl)}
  ${ownerAgendaBlock(manageUrl)}`;

  return layout(inner);
}

export interface ClientServiceChangedEmailParams {
  name: string;
  oldService: string;
  newService: string;
  dateLabel: string;
  durationMin: number;
  price?: number | null;
  supplement?: number | null;
  /** Qui a changé la prestation : la cliente elle-même ou Cindy. */
  changedBy?: "client" | "owner";
  manageUrl?: string;
}

/**
 * Mail envoyé à la cliente après un changement de prestation. La date et
 * l'heure ne bougent pas : seules la prestation, la durée et le prix changent.
 * Le paiement sur place est rappelé, comme dans le mail de Cindy (B4).
 */
export function clientServiceChangedEmailHtml(
  params: ClientServiceChangedEmailParams
): string {
  const {
    name,
    oldService,
    newService,
    dateLabel,
    durationMin,
    price,
    supplement,
    changedBy,
    manageUrl,
  } = params;
  const rows = [
    { label: "Ancienne prestation", value: escapeHtml(oldService) },
    { label: "Nouvelle prestation", value: escapeHtml(newService) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
    { label: "Nouvelle durée", value: `${durationMin} min` },
  ];
  if (price) rows.push({ label: "Tarif", value: `${price} €` });
  if (supplement)
    rows.push({
      label: `Créneau majoré (+${supplement} €)`,
      value: "à régler sur place, non facturé",
    });

  const intro =
    changedBy === "owner"
      ? "Cindy a modifié la prestation de votre rendez-vous. La date et l'heure ne changent pas :"
      : "Vous avez modifié la prestation de votre rendez-vous. La date et l'heure ne changent pas :";

  const manageBlock = manageUrl
    ? `<tr>
    <td style="padding:24px 32px 0;text-align:center;">
      <a href="${escapeHtml(manageUrl)}" style="display:inline-block;background-color:${BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Modifier ou annuler mon rendez-vous</a>
    </td>
  </tr>`
    : "";

  const inner = `
  ${header("Prestation modifiée")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 8px;font-size:16px;color:${BRAND.text};line-height:1.6;">
        Bonjour <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        ${intro}
      </p>
    </td>
  </tr>
  ${card(rows)}
  <tr>
    <td style="padding:16px 32px 0;text-align:center;">
      <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
        Le paiement se fait sur place.
      </p>
    </td>
  </tr>
  ${manageBlock}`;

  return layout(inner);
}

export interface OwnerServiceChangedEmailParams {
  name: string;
  email: string;
  phone?: string;
  oldService: string;
  newService: string;
  dateLabel: string;
  durationMin: number;
  price?: number | null;
  supplement?: number | null;
  /** Qui a changé la prestation : la cliente depuis son lien, ou Cindy. */
  changedBy?: "client" | "owner";
  manageUrl?: string;
}

/**
 * Mail envoyé à Cindy quand la prestation d'un rendez-vous change : qui a
 * changé quoi, l'ancienne et la nouvelle prestation, la nouvelle durée et le
 * prix. Le paiement sur place est rappelé (B4).
 */
export function ownerServiceChangedEmailHtml(
  params: OwnerServiceChangedEmailParams
): string {
  const {
    name,
    email,
    phone,
    oldService,
    newService,
    dateLabel,
    durationMin,
    price,
    supplement,
    changedBy,
    manageUrl,
  } = params;
  const rows = [
    { label: "Client", value: escapeHtml(name) },
    { label: "Email", value: escapeHtml(email) },
  ];
  if (phone) rows.push({ label: "Téléphone", value: escapeHtml(phone) });
  rows.push(
    { label: "Ancienne prestation", value: escapeHtml(oldService) },
    { label: "Nouvelle prestation", value: escapeHtml(newService) },
    { label: "Date & heure", value: escapeHtml(dateLabel) },
    { label: "Nouvelle durée", value: `${durationMin} min` }
  );
  if (price) rows.push({ label: "Tarif", value: `${price} €` });
  if (supplement)
    rows.push({
      label: `Créneau majoré (+${supplement} €)`,
      value: "à encaisser sur place",
    });

  const intro =
    changedBy === "client"
      ? "La cliente a changé la prestation de son rendez-vous depuis son lien de gestion :"
      : "Vous avez changé la prestation de ce rendez-vous :";

  const inner = `
  ${header("Prestation modifiée")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        ${intro}
      </p>
    </td>
  </tr>
  ${card(rows)}
  <tr>
    <td style="padding:16px 32px 0;text-align:center;">
      <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
        Le paiement se fait sur place.
      </p>
    </td>
  </tr>
  ${ownerManageBlock(manageUrl)}
  ${ownerAgendaBlock(manageUrl)}`;

  return layout(inner);
}

export interface NewsletterConfirmationEmailParams {
  confirmUrl: string;
}

export function newsletterConfirmationEmailHtml(
  params: NewsletterConfirmationEmailParams
): string {
  const { confirmUrl } = params;

  const inner = `
  ${header("Confirmez votre inscription")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 16px;font-size:16px;color:${BRAND.text};line-height:1.6;">
        Bonjour,
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Merci de vous être inscrit(e) à la newsletter Terrasigne. Pour finaliser votre inscription, merci de confirmer votre adresse email en cliquant sur le bouton ci-dessous :
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:8px 32px 32px;text-align:center;">
      <a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background-color:${BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Confirmer mon inscription</a>
    </td>
  </tr>`;

  return layout(inner);
}

/* ------------------------------------------------------------------------- *
 * Mails déclenchés par la praticienne (annulation / déplacement + récap)
 * ------------------------------------------------------------------------- */

function reasonBlock(reason?: string): string {
  if (!reason) return "";
  return `<tr>
    <td style="padding:0 32px 16px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f6eb;border-left:4px solid ${BRAND.accent};border-radius:8px;padding:12px 16px;">
        <tr><td style="font-size:14px;color:${BRAND.text};line-height:1.6;"><strong>Motif indiqué :</strong><br>${escapeHtml(reason)}</td></tr>
      </table>
    </td>
  </tr>`;
}

function ctaBlock(url: string, label: string, tone: "primary" | "accent" = "primary"): string {
  const bg = tone === "accent" ? BRAND.accent : BRAND.primary;
  return `<tr>
    <td style="padding:24px 32px 32px;text-align:center;">
      <a href="${escapeHtml(url)}" style="display:inline-block;background-color:${bg};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">${label}</a>
    </td>
  </tr>`;
}

export interface ClientCancelledByOwnerParams {
  name: string;
  service: string;
  dateLabel: string;
  reason?: string;
  rebookUrl?: string;
}

/**
 * Mail envoyé à la cliente quand la praticienne annule le rendez-vous depuis
 * sa page. Distinct de `cancellationEmailHtml` (annulation par la cliente) :
 * ici on dit qui a annulé, et le motif s'il y en a un.
 */
export function clientCancelledByOwnerEmailHtml(
  params: ClientCancelledByOwnerParams
): string {
  const { name, service, dateLabel, reason, rebookUrl } = params;
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
        Cindy a dû annuler votre rendez-vous. Toutes nos excuses pour ce contretemps :
      </p>
    </td>
  </tr>
  ${card(rows)}
  ${reasonBlock(reason)}
  ${
    rebookUrl
      ? ctaBlock(rebookUrl, "Reprendre un rendez-vous", "accent")
      : ""
  }`;

  return layout(inner);
}

export interface ClientRescheduledByOwnerParams {
  name: string;
  service: string;
  oldDateLabel: string;
  newDateLabel: string;
  /** Supplément de la nouvelle plage (0 ou absent : aucune ligne). */
  supplement?: number | null;
  reason?: string;
  manageUrl?: string;
}

/**
 * Mail envoyé à la cliente quand la praticienne déplace le rendez-vous.
 * L'ancienne et la nouvelle date sont affichées, dans le fuseau de la cliente.
 */
export function clientRescheduledByOwnerEmailHtml(
  params: ClientRescheduledByOwnerParams
): string {
  const {
    name,
    service,
    oldDateLabel,
    newDateLabel,
    supplement,
    reason,
    manageUrl,
  } = params;
  const rows = [
    { label: "Service", value: escapeHtml(service) },
    { label: "Ancienne date", value: escapeHtml(oldDateLabel) },
    { label: "Nouvelle date", value: escapeHtml(newDateLabel) },
  ];
  if (supplement)
    rows.push({
      label: `Créneau majoré (+${supplement} €)`,
      value: "à régler sur place, non facturé",
    });

  const manageBlock = manageUrl
    ? `<tr>
    <td style="padding:24px 32px 32px;text-align:center;">
      <a href="${escapeHtml(manageUrl)}" style="display:inline-block;background-color:${BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;padding:14px 32px;">Modifier ou annuler mon rendez-vous</a>
    </td>
  </tr>`
    : "";

  const inner = `
  ${header("Rendez-vous déplacé")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 8px;font-size:16px;color:${BRAND.text};line-height:1.6;">
        Bonjour <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Cindy a déplacé votre rendez-vous. Voici les nouvelles informations :
      </p>
    </td>
  </tr>
  ${card(rows)}
  ${reasonBlock(reason)}
  ${manageBlock}`;

  return layout(inner);
}

export interface OwnerRecapItem {
  timeLabel: string;
  service: string;
  clientName: string;
  email: string;
  phone?: string;
  manageUrl?: string;
}

export interface OwnerDailyRecapParams {
  /** Libellé du jour, ex. « mercredi 5 novembre ». */
  dateLabel: string;
  items: OwnerRecapItem[];
}

/**
 * Récap quotidien de la praticienne : les rendez-vous du lendemain, avec les
 * coordonnées de chaque cliente et son lien de gestion.
 */
export function ownerDailyRecapEmailHtml(
  params: OwnerDailyRecapParams
): string {
  const { dateLabel, items } = params;

  const blocks = items
    .map((it) => {
      const rows = [
        { label: "Prestation", value: escapeHtml(it.service) },
        { label: "Cliente", value: escapeHtml(it.clientName) },
        ...(it.phone ? [{ label: "Téléphone", value: escapeHtml(it.phone) }] : []),
        { label: "Email", value: escapeHtml(it.email) },
      ]
        .map(
          (r) => `<tr>
            <td style="font-size:13px;color:${BRAND.muted};width:110px;vertical-align:top;padding-right:12px;">${r.label}</td>
            <td style="font-size:14px;color:${BRAND.text};font-weight:600;text-align:right;word-break:break-word;">${r.value}</td>
          </tr>`
        )
        .join("");

      return `<tr>
        <td style="padding:0 32px 16px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND.soft};border-radius:12px;padding:16px 20px;">
            <tr>
              <td style="padding-bottom:10px;">
                <span style="font-size:20px;font-weight:700;color:${BRAND.primary};">${escapeHtml(it.timeLabel)}</span>
              </td>
            </tr>
            ${rows}
            ${
              it.manageUrl
                ? `<tr><td style="padding-top:12px;text-align:center;"><a href="${escapeHtml(it.manageUrl)}" style="display:inline-block;background-color:${BRAND.accent};color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;border-radius:999px;padding:9px 20px;">Gérer ce rendez-vous</a></td></tr>`
                : ""
            }
          </table>
        </td>
      </tr>`;
    })
    .join("");

  const inner = `
  ${header("Rendez-vous de demain")}
  <tr>
    <td style="background-color:#ffffff;padding:32px 32px 8px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
        Voici les rendez-vous prévus pour <strong style="color:${BRAND.text};">${escapeHtml(dateLabel)}</strong> :
      </p>
    </td>
  </tr>
  ${blocks}
  <tr>
    <td style="padding:8px 32px 32px;text-align:center;">
      <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
        ${items.length} rendez-vous au total. Pour annuler ou déplacer, passez par le lien de gestion : la cliente est prévenue automatiquement.
      </p>
    </td>
  </tr>`;

  return layout(inner);
}
