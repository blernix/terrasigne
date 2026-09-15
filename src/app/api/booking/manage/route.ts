import { NextResponse } from "next/server";
import { findBookingByToken, BUSINESS_TIMEZONE } from "@/lib/googleCalendar";

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
    const token = new URL(req.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ message: "Jeton manquant" }, { status: 400 });
    }

    const booking = await findBookingByToken(token);
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

    return NextResponse.json({ booking, dateLabel });
  } catch (error) {
    console.error("Erreur gestion RDV :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
