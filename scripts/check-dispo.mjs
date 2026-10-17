import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "generique-450417-2aa30cb6faea.json",
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });
const calendarId = process.env.GOOGLE_CALENDAR_ID;

const now = new Date();
const res = await calendar.events.list({
  calendarId,
  timeMin: now.toISOString(),
  timeMax: new Date(now.getTime() + 90 * 86400000).toISOString(),
  singleEvents: true,
  orderBy: "startTime",
  maxResults: 2500,
});

const dispo = (res.data.items || []).filter((e) =>
  (e.summary || "").trim().toLowerCase().startsWith("dispo")
);

console.log('Événements "dispo" à venir :', dispo.length);
console.log("");
for (const e of dispo) {
  const s = e.start.dateTime || e.start.date;
  const en = e.end.dateTime || e.end.date;
  console.log(
    "•",
    JSON.stringify(e.summary),
    "|",
    s,
    "→",
    en,
    e.start.date ? "(journée entière)" : ""
  );
}
if (dispo.length === 0) {
  console.log('(aucun événement "dispo" dans les 90 prochains jours)');
}
