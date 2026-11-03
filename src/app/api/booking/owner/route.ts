import { NextResponse } from "next/server";
import {
  findBookingByToken,
  cancelBooking,
  rescheduleBooking,
  isSlotFree,
  getSlotAllowance,
  BUSINESS_TIMEZONE,
  MIN_LEAD_HOURS,
  MAX_AHEAD_DAYS,
} from "@/lib/googleCalendar";
import { sendBrevoEmail } from "@/lib/brevo";
import {
  clientCancelledByOwnerEmailHtml,
  clientRescheduledByOwnerEmailHtml,
} from "@/lib/emails";
import { formatDateLabel } from "@/lib/timezones";
import { getRequestOrigin } from "@/lib/newsletter";
import { verifyOwnerToken } from "@/lib/ownerLink";
import { normalizeMotif, motifPhrase } from "@/lib/motifsAnnulation";

/**
 * Page praticienne : lecture et écriture d'un rendez-vous par Cindy, sans
 * passer par l'agenda. Toute action ici envoie l'email correspondant à la
 * cliente — c'est tout l'intérêt : son annulation ou son déplacement ne peut
 * plus se faire en silence.
 *
 * Authentification : le bookingToken + une signature HMAC (voir lib/ownerLink).
 * Le token seul reste la page cliente ; sans signature valide, cette route
 * répond 403 et ne divulgue rien.
 */

function forbidden() {
  return NextResponse.json({ message: "Lien invalide." }, { status: 403 });
}

function guard(token?: string | null, sig?: string | null): boolean {
  return Boolean(token) && verifyOwnerToken(String(token), sig);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const sig = url.searchParams.get("sig");

    if (!guard(token, sig)) return forbidden();

    const booking = await findBookingByToken(String(token));
    if (!booking) {
      return NextResponse.json(
        { message: "Ce rendez-vous n'existe plus." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      booking,
      dateLabel: formatDateLabel(
        new Date(booking.start),
        BUSINESS_TIMEZONE
      ),
      dateLabelClient: formatDateLabel(
        new Date(booking.start),
        booking.clientTimezone || BUSINESS_TIMEZONE
      ),
      siteTimezone: BUSINESS_TIMEZONE,
    });
  } catch (error) {
    console.error("Erreur page praticienne (lecture) :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, sig, action, start, end, motif } = body || {};

    if (!guard(token, sig)) return forbidden();

    // Comme les routes cliente : aucune écriture réelle depuis la préprod.
    if (process.env.PREPROD_MODE === "1") {
      return NextResponse.json(
        { message: "Modification désactivée sur la préprod." },
        { status: 403 }
      );
    }

    if (action !== "cancel" && action !== "reschedule") {
      return NextResponse.json({ message: "Action inconnue" }, { status: 400 });
    }

    const booking = await findBookingByToken(String(token));
    if (!booking) {
      return NextResponse.json(
        { message: "Ce rendez-vous n'existe plus." },
        { status: 404 }
      );
    }

    const origin = getRequestOrigin(req);
    const clientManageUrl = `${origin}/rendez-vous/gerer?token=${encodeURIComponent(
      String(token)
    )}`;
    const reason = motifPhrase(normalizeMotif(motif || {}));
    const clientTz = booking.clientTimezone || BUSINESS_TIMEZONE;

    if (action === "cancel") {
      // Email AVANT la suppression : si Brevo échoue, le rendez-vous reste en
      // place et Cindy voit l'erreur. L'ordre inverse (supprimer puis envoyer)
      // laissait une cliente jamais prévenue, sans moyen de réessayer (404).
      try {
        await sendBrevoEmail({
          to: [{ email: booking.clientEmail, name: booking.clientName }],
          subject: `Rendez-vous annulé - ${booking.serviceName}`,
          htmlContent: clientCancelledByOwnerEmailHtml({
            name: booking.clientName,
            service: booking.serviceName,
            dateLabel: formatDateLabel(new Date(booking.start), clientTz),
            reason: reason || undefined,
            rebookUrl: `${origin}/rendez-vous`,
          }),
        });
      } catch (e) {
        console.error("Erreur email annulation praticienne :", e);
        return NextResponse.json(
          {
            message:
              "L'email à la cliente n'a pas pu être envoyé : le rendez-vous n'a PAS été annulé. Réessayez.",
          },
          { status: 502 }
        );
      }

      const removed = await cancelBooking(String(token));
      if (!removed) {
        return NextResponse.json(
          { message: "Ce rendez-vous n'existe plus." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Rendez-vous annulé, la cliente a été prévenue.",
      });
    }

    // --- Déplacement -------------------------------------------------------
    const newStart = new Date(start);
    const newEnd = new Date(end);
    if (Number.isNaN(newStart.getTime()) || Number.isNaN(newEnd.getTime())) {
      return NextResponse.json({ message: "Dates invalides" }, { status: 400 });
    }

    if (
      booking.durationMin > 0 &&
      newEnd.getTime() - newStart.getTime() !== booking.durationMin * 60000
    ) {
      return NextResponse.json(
        { message: "Durée du créneau invalide" },
        { status: 400 }
      );
    }

    const minStart = Date.now() + MIN_LEAD_HOURS * 3600000;
    const maxStart = Date.now() + MAX_AHEAD_DAYS * 86400000;
    if (newStart.getTime() < minStart) {
      return NextResponse.json(
        {
          message: `Les rendez-vous doivent être fixés au moins ${MIN_LEAD_HOURS} h à l'avance`,
        },
        { status: 400 }
      );
    }
    if (newStart.getTime() > maxStart) {
      return NextResponse.json(
        { message: "Les rendez-vous sont possibles jusqu'à 3 mois à l'avance" },
        { status: 400 }
      );
    }

    // Contrairement à la route cliente, on refuse un créneau hors plage
    // ouverte : un report ne doit pas sortir des horaires de travail.
    const allowance = await getSlotAllowance(newStart, newEnd);
    if (!allowance.allowed) {
      return NextResponse.json(
        { message: "Ce créneau n'est pas proposé à la réservation." },
        { status: 400 }
      );
    }

    const free = await isSlotFree(newStart, newEnd, booking.id);
    if (!free) {
      return NextResponse.json(
        { message: "Ce créneau est déjà occupé." },
        { status: 409 }
      );
    }

    const updated = await rescheduleBooking(
      String(token),
      newStart,
      newEnd
    );
    if (!updated) {
      return NextResponse.json(
        { message: "Ce rendez-vous n'existe plus." },
        { status: 404 }
      );
    }

    const newDateLabel = formatDateLabel(newStart, clientTz);
    let warning: string | undefined;
    try {
      await sendBrevoEmail({
        to: [{ email: booking.clientEmail, name: booking.clientName }],
        subject: `Rendez-vous déplacé - ${booking.serviceName}`,
        htmlContent: clientRescheduledByOwnerEmailHtml({
          name: booking.clientName,
          service: booking.serviceName,
          oldDateLabel: formatDateLabel(new Date(booking.start), clientTz),
          newDateLabel,
          reason: reason || undefined,
          manageUrl: clientManageUrl,
        }),
      });
    } catch (e) {
      // Le déplacement est fait : on ne le défait pas, mais on le dit à Cindy
      // au lieu de renvoyer « c'est fait » alors que la cliente ignore tout.
      console.error("Erreur email déplacement praticienne :", e);
      warning =
        "Le rendez-vous est déplacé, mais l'email à la cliente n'a pas pu être envoyé. Prévenez-la par téléphone.";
    }

    return NextResponse.json({
      message: warning
        ? "Rendez-vous déplacé."
        : "Rendez-vous déplacé, la cliente a été prévenue.",
      warning,
      dateLabel: newDateLabel,
      dateLabelOwner: formatDateLabel(newStart, BUSINESS_TIMEZONE),
    });
  } catch (error) {
    console.error("Erreur page praticienne (écriture) :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
