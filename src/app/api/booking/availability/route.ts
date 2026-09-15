import { NextResponse } from "next/server";
import { fetchService } from "@/lib/directus";
import { getAvailability } from "@/lib/googleCalendar";
import {
  resolveTimezone,
  dateKeyInTimezone,
  getTimezoneLabel,
} from "@/lib/timezones";

function formatter(timeZone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone, ...options });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const serviceId = url.searchParams.get("serviceId");
    const days = Number(url.searchParams.get("days") || 60);
    const timeZone = resolveTimezone(url.searchParams.get("timezone"));

    if (!serviceId) {
      return NextResponse.json(
        { message: "Paramètre serviceId manquant" },
        { status: 400 }
      );
    }

    const service = await fetchService(serviceId);
    const duration = Number(service.duree);
    const pause = Number(service.pause || 0);

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { message: "Ce service n'est pas réservable" },
        { status: 400 }
      );
    }

    const timeMin = new Date();
    const timeMax = new Date(Date.now() + days * 86400000);

    const slots = await getAvailability(duration, pause, timeMin, timeMax);

    const weekdayFmt = formatter(timeZone, { weekday: "long" });
    const monthFmt = formatter(timeZone, { month: "short" });
    const timeFmt = formatter(timeZone, { hour: "2-digit", minute: "2-digit" });

    const daysMap = new Map<string, any>();
    for (const slot of slots) {
      const d = slot.start;
      const dateKey = dateKeyInTimezone(d, timeZone);
      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, {
          date: dateKey,
          weekday: weekdayFmt.format(d),
          month: monthFmt.format(d),
          dayNum: String(
            Number(
              new Intl.DateTimeFormat("en-US", {
                timeZone,
                day: "2-digit",
              })
                .format(d)
            )
          ).padStart(2, "0"),
          slots: [],
        });
      }
      daysMap.get(dateKey).slots.push({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        timeLabel: timeFmt.format(d),
      });
    }

    const sortedDays = Array.from(daysMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      service: {
        id: service.id,
        titre: service.titre,
        duree: duration,
        pause,
        prix: service.prix,
      },
      timezone: timeZone,
      timezoneLabel: getTimezoneLabel(timeZone),
      days: sortedDays,
    });
  } catch (error) {
    console.error("Erreur API disponibilité :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
