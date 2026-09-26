import { NextResponse } from "next/server";
import { cancelBooking, BUSINESS_TIMEZONE } from "@/lib/googleCalendar";
import { sendBrevoEmail } from "@/lib/brevo";
import {
  cancellationEmailHtml,
  ownerCancellationEmailHtml,
} from "@/lib/emails";
import { formatDateLabel } from "@/lib/timezones";

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
        htmlContent: ownerCancellationEmailHtml({
          name: booking.clientName,
          email: booking.clientEmail,
          phone: booking.phone,
          service: booking.serviceName,
          dateLabel,
        }),
      });
    }

    return NextResponse.json({ message: "Rendez-vous annulé" });
  } catch (error) {
    console.error("Erreur annulation RDV :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
