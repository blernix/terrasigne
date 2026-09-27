import { createHmac, timingSafeEqual } from "crypto";
import { sendBrevoEmail } from "./brevo";
import { newsletterConfirmationEmailHtml } from "./emails";

const SECRET = process.env.NEWSLETTER_CONFIRM_SECRET || "";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function generateConfirmationToken(
  email: string,
  listIds: number[]
): string {
  const payload = Buffer.from(
    JSON.stringify({ email, listIds, exp: Date.now() + 7 * 86400000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyConfirmationToken(
  token: string
): { email: string; listIds: number[] } | null {
  if (!SECRET) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.email || !Array.isArray(data.listIds)) return null;
    if (!data.exp || data.exp < Date.now()) return null;
    return { email: data.email, listIds: data.listIds };
  } catch {
    return null;
  }
}

export function getRequestOrigin(req: Request): string {
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return host
    ? `${proto}://${host}`
    : process.env.SITE_URL || "https://terrasigne.fr";
}

export async function sendNewsletterConfirmation(
  email: string,
  listIds: number[],
  origin: string
) {
  const token = generateConfirmationToken(email, listIds);
  const confirmUrl = `${origin}/api/newsletter/confirm?token=${token}`;

  await sendBrevoEmail({
    to: [{ email }],
    subject: "Confirmez votre inscription à la newsletter TerraSigne",
    htmlContent: newsletterConfirmationEmailHtml({ confirmUrl }),
  });
}
