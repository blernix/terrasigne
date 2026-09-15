import { NextResponse } from "next/server";
import { cancelBooking, BUSINESS_TIMEZONE } from "@/lib/googleCalendar";
import { sendBrevoEmail } from "@/lib/brevo";
import { cancellationEmailHtml } from "@/lib/emails";

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

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ message: "Jeton manquant" }, { status: 400 });
    }

    const booking = await cancelBooking(token);
    if (!booking) {
      return NextResponse.json(
        { message: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    const dateLabel = formatDateLabel(
      new Date(booking.start),
      booking.clientTimezone || BUSINESS_TIMEZONE
    );

    await sendBrevoEmail({
      to: [{ email: booking.clientEmail, name: booking.clientName }],
      subject: `Rendez-vous annulé - ${booking.serviceName}`,
      htmlContent: cancellationEmailHtml({
        name: booking.clientName,
        service: booking.serviceName,
        dateLabel,
      }),
    });

    const ownerEmail = process.env.GOOGLE_OWNER_EMAIL;
    if (ownerEmail) {
      await sendBrevoEmail({
        to: [{ email: ownerEmail }],
        subject: `Rendez-vous annulé - ${booking.serviceName}`,
        textContent: `Rendez-vous annulé.\nService : ${booking.serviceName}\nDate : ${dateLabel}\nClient : ${booking.clientName}\nEmail : ${booking.clientEmail}`,
      });
    }

    return NextResponse.json({ message: "Rendez-vous annulé" });
  } catch (error) {
    console.error("Erreur annulation RDV :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
