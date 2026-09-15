import { NextResponse } from "next/server";
import {
  listPendingReminders,
  markReminderSent,
  BUSINESS_TIMEZONE,
} from "@/lib/googleCalendar";
import { sendBrevoEmail } from "@/lib/brevo";
import { reminderEmailHtml } from "@/lib/emails";

function formatDateLabel(date: Date, timeZone: string): string {
  const label = new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret =
      url.searchParams.get("secret") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const hoursBefore = Number(process.env.REMINDER_HOURS_BEFORE || 24);
    const timeMin = new Date();
    const timeMax = new Date(Date.now() + hoursBefore * 3600000);

    const bookings = await listPendingReminders(timeMin, timeMax);

    let sent = 0;
    for (const b of bookings) {
      try {
        const dateLabel = formatDateLabel(
          new Date(b.start),
          b.clientTimezone || BUSINESS_TIMEZONE
        );

        await sendBrevoEmail({
          to: [{ email: b.clientEmail, name: b.clientName }],
          subject: `Rappel : votre rendez-vous - ${b.serviceName}`,
          htmlContent: reminderEmailHtml({
            name: b.clientName,
            service: b.serviceName,
            dateLabel,
          }),
        });

        await markReminderSent(b.id);
        sent++;
      } catch (e) {
        console.error(`Erreur rappel pour l'événement ${b.id} :`, e);
      }
    }

    return NextResponse.json({ message: "OK", sent });
  } catch (error) {
    console.error("Erreur cron rappels :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
