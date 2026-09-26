const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface BrevoRecipient {
  email: string;
  name?: string;
}

interface SendBrevoEmailParams {
  to: BrevoRecipient[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  replyTo?: string;
}

export async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  textContent,
  replyTo,
}: SendBrevoEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY manquante");

  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || "votre-rendez-vous@terrasigne.fr";
  const senderName = process.env.BREVO_SENDER_NAME || "TerraSigne";

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to,
      replyTo: replyTo ? { email: replyTo, name: "" } : undefined,
      subject,
      htmlContent,
      textContent,
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
