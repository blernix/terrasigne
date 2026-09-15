import { google } from "googleapis";
import path from "path";

const apiKey = process.env.BREVO_API_KEY;
const calendarId = process.env.GOOGLE_CALENDAR_ID;
const ownerEmail = process.env.GOOGLE_OWNER_EMAIL;
const testEmail = process.env.TEST_EMAIL || ownerEmail;

if (!calendarId) {
  console.error("❌ GOOGLE_CALENDAR_ID manquante dans .env");
  process.exit(1);
}
if (!apiKey) {
  console.error("❌ BREVO_API_KEY manquante dans .env");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(
    process.cwd(),
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
      "generique-450417-2aa30cb6faea.json"
  ),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });

const start = new Date();
start.setDate(start.getDate() + 2);
start.setHours(10, 0, 0, 0);
const end = new Date(start.getTime() + 60 * 60000);

console.log("📅 Création d'un événement de test :", start.toISOString());

try {
  const event = await calendar.events.insert({
    calendarId,
    sendNotifications: true,
    requestBody: {
      summary: "RDV TEST - Simulation",
      description: "Réservation simulée via le script de test.",
      start: { dateTime: start.toISOString(), timeZone: "America/Guadeloupe" },
      end: { dateTime: end.toISOString(), timeZone: "America/Guadeloupe" },
    },
  });
  console.log("✅ Événement créé :", event.data.htmlLink);
} catch (e) {
  console.error("❌ Erreur création événement :", e.message);
  process.exit(1);
}

if (!testEmail) {
  console.warn("⚠️  TEST_EMAIL / GOOGLE_OWNER_EMAIL non défini, email Brevo ignoré.");
  process.exit(0);
}

console.log("📧 Envoi d'un email Brevo de test à :", testEmail);

try {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      sender: {
        name: "TerraSigne",
        email: process.env.BREVO_SENDER_EMAIL || "votre-rendez-vous@terrasigne.fr",
      },
      to: [{ email: testEmail, name: "Test TerraSigne" }],
      subject: "Test réservation TerraSigne",
      htmlContent: "<h1>Test TerraSigne</h1><p>Réservation simulée réussie ✅</p>",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo ${res.status}: ${body}`);
  }
  console.log("✅ Email Brevo envoyé avec succès.");
} catch (e) {
  console.error("❌ Erreur envoi email Brevo :", e.message);
  process.exit(1);
}
