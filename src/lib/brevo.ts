const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface BrevoRecipient {
  email: string;
  name?: string;
}

interface BrevoAttachment {
  url?: string;
  content?: string;
  name: string;
}

interface SendBrevoEmailParams {
  to: BrevoRecipient[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  /** Adresse de réponse. Brevo refuse un replyTo sans `name` non vide. */
  replyTo?: string;
  replyToName?: string;
  attachments?: BrevoAttachment[];
}

/**
 * Brevo rejette la requête entière (`missing_parameter: name is missing in
 * replyTo`) dès que `replyTo.name` est vide : un message de contact partait donc
 * en erreur 500. On garantit toujours un nom non vide.
 */
export function buildReplyTo(replyTo?: string, replyToName?: string) {
  if (!replyTo) return undefined;
  const nom = (replyToName || "").trim();
  return { email: replyTo, name: nom || replyTo };
}

export async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  textContent,
  replyTo,
  replyToName,
  attachments,
}: SendBrevoEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY manquante");

  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || "votre-rendez-vous@terrasigne.fr";
  const senderName = process.env.BREVO_SENDER_NAME || "Terrasigne";

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to,
      replyTo: buildReplyTo(replyTo, replyToName),
      subject,
      htmlContent,
      textContent,
      attachment: attachments?.length ? attachments : undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erreur Brevo ${res.status}: ${body}`);
  }

  return res.json();
}

export interface AddContactParams {
  email: string;
  listIds: number[];
  attributes?: Record<string, string>;
}

export async function addContactToList({
  email,
  listIds,
  attributes,
}: AddContactParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY manquante");

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email,
      listIds,
      attributes: attributes || {},
      updateEnabled: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erreur Brevo contacts ${res.status}: ${body}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
