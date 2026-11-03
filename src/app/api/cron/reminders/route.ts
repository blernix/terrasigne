import { NextResponse } from "next/server";
import {
  listPendingReminders,
  markReminderSent,
  listOwnerRecap,
  markOwnerReminderSent,
  BUSINESS_TIMEZONE,
} from "@/lib/googleCalendar";
import { sendBrevoEmail } from "@/lib/brevo";
import {
  reminderEmailHtml,
  getZoomLink,
  ownerDailyRecapEmailHtml,
} from "@/lib/emails";
import {
  formatDateLabel,
  dateKeyInTimezone,
  addDaysToDateKey,
  zonedMidnight,
  dateKeyLabel,
} from "@/lib/timezones";
import { buildOwnerUrl, ownerLinkAvailable } from "@/lib/ownerLink";

// Heure locale (Guadeloupe) à laquelle part le récap quotidien de la praticienne.
const OWNER_RECAP_HOUR = 18;

function hourInBusinessTimezone(): number {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = parts.find((p) => p.type === "hour")?.value;
  return Number(hour || -1);
}

export async function GET(req: Request) {
  try {
    const secret = req.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");

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
            pdfNote: Boolean(b.pdfName),
            // Le document n'était ni joint ni lié dans le rappel : la cliente
            // était invitée à signer un document introuvable.
            documentUrl: b.pdfUrl || undefined,
            zoomLink: getZoomLink(b.meetingType),
          }),
        });

        await markReminderSent(b.id);
        sent++;
      } catch (e) {
        console.error(`Erreur rappel pour l'événement ${b.id} :`, e);
      }
    }

    // --- Récap quotidien de la praticienne (une fois par jour, à 18 h) ------
    let recap = 0;
    const ownerEmail = process.env.GOOGLE_OWNER_EMAIL;
    if (ownerEmail && hourInBusinessTimezone() === OWNER_RECAP_HOUR) {
      try {
        const todayKey = dateKeyInTimezone(new Date(), BUSINESS_TIMEZONE);
        const tomorrowKey = addDaysToDateKey(todayKey, 1);
        const dayStart = zonedMidnight(tomorrowKey, BUSINESS_TIMEZONE);
        const dayEnd = zonedMidnight(
          addDaysToDateKey(tomorrowKey, 1),
          BUSINESS_TIMEZONE
        );

        const items = await listOwnerRecap(dayStart, dayEnd);

        if (items.length) {
          const origin =
            process.env.OWNER_LINK_ORIGIN ||
            process.env.SITE_URL ||
            "https://terrasigne.fr";
          const timeFmt = new Intl.DateTimeFormat("fr-FR", {
            timeZone: BUSINESS_TIMEZONE,
            hour: "2-digit",
            minute: "2-digit",
          });

          await sendBrevoEmail({
            to: [{ email: ownerEmail, name: "Terrasigne" }],
            subject: `Demain : ${items.length} rendez-vous`,
            htmlContent: ownerDailyRecapEmailHtml({
              dateLabel: dateKeyLabel(tomorrowKey, BUSINESS_TIMEZONE),
              items: items.map((b) => ({
                timeLabel: timeFmt.format(new Date(b.start)),
                service: b.serviceName,
                clientName: b.clientName,
                email: b.clientEmail,
                phone: b.clientPhone || undefined,
                manageUrl:
                  ownerLinkAvailable() && b.bookingToken
                    ? buildOwnerUrl(origin, b.bookingToken)
                    : undefined,
              })),
            }),
          });

          for (const b of items) {
            try {
              await markOwnerReminderSent(b.id);
            } catch (e) {
              console.error(
                `Erreur marquage récap praticienne ${b.id} :`,
                e
              );
            }
          }
          recap = items.length;
        }
      } catch (e) {
        console.error("Erreur récap praticienne :", e);
      }
    }

    return NextResponse.json({ message: "OK", sent, recap });
  } catch (error) {
    console.error("Erreur cron rappels :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
