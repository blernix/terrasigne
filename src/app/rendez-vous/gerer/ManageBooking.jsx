"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import {
  WEEKDAYS,
  capitalize,
  monthLabel,
  groupSlots,
  buildMonthGrid,
} from "@/lib/calendar";

const CARD =
  "bg-white rounded-2xl border border-sand-200 shadow-soft";
const BTN_PRIMARY =
  "inline-flex items-center justify-center bg-mint text-forest border border-forest/25 py-3.5 px-6 rounded-full font-bold hover:bg-sage-200 transition";
const BTN_ACCENT =
  "inline-flex items-center justify-center bg-violet text-white py-3.5 px-6 rounded-full font-bold hover:bg-violet/90 transition";

function ManageContent({ token }) {
  const [status, setStatus] = useState("loading");
  const [booking, setBooking] = useState(null);
  const [dateLabel, setDateLabel] = useState("");
  const [newDateLabel, setNewDateLabel] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [mode, setMode] = useState("view");
  const [availability, setAvailability] = useState(null);
  const [viewMonth, setViewMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadBooking() {
    setStatus("loading");
    setMode("view");
    setBooking(null);
    setDateLabel("");
    setNewDateLabel("");
    setFeedback(null);
    setConfirmCancel(false);
    setAvailability(null);
    setSelectedDay(null);
    setSelectedSlot(null);

    if (!token) {
      setStatus("notfound");
      return;
    }
    fetch(`/api/booking/manage?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.booking) {
          setStatus("notfound");
          return;
        }
        setBooking(d.booking);
        setDateLabel(d.dateLabel);
        setStatus("ready");
      })
      .catch(() => setStatus("notfound"));
  }

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function startReschedule() {
    setMode("reschedule");
    setFeedback(null);
    setSelectedDay(null);
    setSelectedSlot(null);
    try {
      const tz = booking.clientTimezone || "America/Guadeloupe";
      const res = await fetch(
        `/api/booking/availability?serviceId=${booking.serviceId}&duree=${booking.durationMin}&timezone=${tz}`
      );
      const data = await res.json();
      setAvailability(data);
      if (data?.days?.length) {
        const months = [
          ...new Set(data.days.map((d) => d.date.slice(0, 7))),
        ].sort();
        setViewMonth(months[0]);
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Impossible de charger les disponibilités.",
      });
    }
  }

  async function confirmReschedule() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/booking/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          start: selectedSlot.start,
          end: selectedSlot.end,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewDateLabel(data.dateLabel);
        setStatus("rescheduled");
      } else {
        setFeedback({
          type: "error",
          text:
            data.message === "Ce créneau vient d'être réservé"
              ? "Désolé, ce créneau vient d'être réservé. Choisissez-en un autre."
              : data.message || "Une erreur est survenue.",
        });
        startReschedule();
      }
    } catch {
      setFeedback({ type: "error", text: "Une erreur inattendue est survenue." });
    } finally {
      setSubmitting(false);
    }
  }

  async function doCancel() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setStatus("cancelled");
      } else {
        setFeedback({ type: "error", text: "Une erreur est survenue." });
      }
    } catch {
      setFeedback({ type: "error", text: "Une erreur inattendue est survenue." });
    } finally {
      setSubmitting(false);
    }
  }

  const daysByKey = availability
    ? Object.fromEntries(availability.days.map((d) => [d.date, d]))
    : {};
  const availableDates = new Set(
    availability ? availability.days.map((d) => d.date) : []
  );
  const availMonths = availability
    ? [...new Set(availability.days.map((d) => d.date.slice(0, 7)))].sort()
    : [];
  const activeMonth = availMonths.includes(viewMonth)
    ? viewMonth
    : availMonths[0];
  const monthIndex = availMonths.indexOf(activeMonth);

  const feedbackBox = feedback && (
    <div
      className={`px-5 py-4 text-center font-semibold rounded-xl mb-6 border ${
        feedback.type === "success"
          ? "text-forest border-sage-200 bg-sage-100"
          : "text-[#8c3b34] border-[#eed3ce] bg-[#fbeeec]"
      }`}
    >
      {feedback.text}
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-16 bg-cream">
        <section className="max-w-xl mx-auto px-4 py-12">
          {status === "loading" && (
            <p className="text-center text-muted">Chargement…</p>
          )}

          {status === "notfound" && (
            <div className={`${CARD} p-10 text-center`}>
              <h1 className="font-display text-2xl text-forest-700 mb-3">
                Rendez-vous introuvable
              </h1>
              <p className="text-muted mb-6">
                Ce lien est invalide ou ce rendez-vous n'existe plus.
              </p>
              <a href="/rendez-vous" className={BTN_ACCENT}>
                Prendre rendez-vous
              </a>
            </div>
          )}

          {status === "cancelled" && (
            <div className={`${CARD} p-10 text-center`}>
              <div className="text-4xl mb-4">🗑️</div>
              <h1 className="font-display text-2xl text-forest-700 mb-3">
                Rendez-vous annulé
              </h1>
              <p className="text-muted mb-6">
                Votre rendez-vous a bien été annulé. Un email de confirmation
                vient de vous être envoyé.
              </p>
              <a href="/rendez-vous" className={BTN_PRIMARY}>
                Prendre un nouveau rendez-vous
              </a>
            </div>
          )}

          {status === "rescheduled" && (
            <div className={`${CARD} p-10 text-center`}>
              <div className="text-4xl mb-4">✅</div>
              <h1 className="font-display text-2xl text-forest-700 mb-3">
                Rendez-vous modifié
              </h1>
              <p className="text-ink font-semibold text-lg capitalize">
                {newDateLabel}
              </p>
              <p className="text-muted mt-2 mb-6">
                Un email de confirmation vient de vous être envoyé.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={loadBooking} className={BTN_ACCENT}>
                  Modifier ou annuler à nouveau
                </button>
                <a
                  href="/"
                  className="inline-flex items-center justify-center border border-forest/25 text-forest py-3.5 px-6 rounded-full font-bold hover:bg-sage-100 transition"
                >
                  Retour à l'accueil
                </a>
              </div>
            </div>
          )}

          {status === "ready" && mode === "view" && booking && (
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-6 text-center">
                Gérer mon <span className="text-violet">rendez-vous</span>
              </h1>

              <div className={`${CARD} overflow-hidden mb-6`}>
                <div className="bg-sage-100 px-6 py-4 border-b border-sand-200">
                  <h2 className="font-display text-lg text-forest-700">
                    {booking.serviceName}
                  </h2>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted">Client</span>
                    <span className="text-ink font-semibold text-right">
                      {booking.clientName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted">Date &amp; heure</span>
                    <span className="text-ink font-semibold capitalize text-right">
                      {dateLabel}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted">Durée</span>
                    <span className="text-ink font-semibold">
                      {booking.durationMin} min
                    </span>
                  </div>
                </div>
              </div>

              {feedbackBox}

              <div className="grid gap-3">
                <button onClick={startReschedule} className={BTN_ACCENT}>
                  Modifier la date ou l'heure
                </button>

                {!confirmCancel ? (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="border border-[#eed3ce] text-[#8c3b34] py-3.5 rounded-full font-bold hover:bg-[#fbeeec] transition"
                  >
                    Annuler ce rendez-vous
                  </button>
                ) : (
                  <div className="border border-[#eed3ce] bg-[#fbeeec] rounded-2xl p-4">
                    <p className="text-[#8c3b34] text-sm mb-3">
                      Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette
                      action est définitive.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={doCancel}
                        disabled={submitting}
                        className="flex-1 bg-[#8c3b34] text-white py-2.5 rounded-full font-semibold hover:bg-[#74302b] transition disabled:opacity-60"
                      >
                        {submitting ? "…" : "Oui, annuler"}
                      </button>
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="flex-1 bg-white text-ink-soft py-2.5 rounded-full font-semibold border border-sand-200 hover:bg-sand transition"
                      >
                        Non, garder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {status === "ready" && mode === "reschedule" && booking && (
            <div>
              <button
                onClick={() => setMode("view")}
                className="text-violet hover:text-forest transition text-sm font-semibold mb-6"
              >
                ← Retour
              </button>
              <h2 className="font-display text-xl md:text-2xl text-forest-700 mb-6 text-center">
                Choisissez une nouvelle date
              </h2>

              {feedbackBox}

              {!selectedDay && availability ? (
                availMonths.length > 0 ? (
                  <div className={`${CARD} p-4 md:p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setViewMonth(availMonths[monthIndex - 1])}
                        disabled={monthIndex <= 0}
                        className="w-9 h-9 rounded-full border border-sand-200 text-ink-soft hover:bg-sand disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        ‹
                      </button>
                      <h3 className="font-semibold text-forest-700 capitalize">
                        {monthLabel(activeMonth)}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setViewMonth(availMonths[monthIndex + 1])}
                        disabled={monthIndex >= availMonths.length - 1}
                        className="w-9 h-9 rounded-full border border-sand-200 text-ink-soft hover:bg-sand disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        ›
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {WEEKDAYS.map((w) => (
                        <div
                          key={w}
                          className="text-xs font-bold text-muted uppercase py-1"
                        >
                          {w}
                        </div>
                      ))}
                      {buildMonthGrid(activeMonth, availableDates).map(
                        (cell, i) =>
                          cell === null ? (
                            <div key={i} />
                          ) : cell.available ? (
                            <button
                              key={cell.dateKey}
                              type="button"
                              onClick={() => {
                                setSelectedDay(daysByKey[cell.dateKey]);
                                setSelectedSlot(null);
                              }}
                              className="aspect-square rounded-xl bg-sage-100 text-forest-700 font-semibold hover:bg-sage-200 transition"
                            >
                              {cell.day}
                            </button>
                          ) : (
                            <div
                              key={cell.dateKey}
                              className="aspect-square rounded-xl text-muted/40 flex items-center justify-center"
                            >
                              {cell.day}
                            </div>
                          )
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted">
                    Aucune disponibilité pour le moment.
                  </p>
                )
              ) : availability ? (
                <p className="text-center text-muted">Chargement…</p>
              ) : null}

              {selectedDay && (
                <div className={`${CARD} p-4 md:p-6`}>
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(null)}
                      className="text-violet hover:text-forest transition text-sm font-semibold"
                    >
                      ← Autre date
                    </button>
                    <span className="text-ink-soft font-semibold text-sm capitalize">
                      {capitalize(selectedDay.weekday)} {selectedDay.dayNum}{" "}
                      {capitalize(selectedDay.month)}
                    </span>
                  </div>
                  {groupSlots(selectedDay.slots.filter((slot) => !slot.early)).map((group) => (
                    <div key={group.label} className="mb-5 last:mb-0">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                        {group.label}
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {group.slots.map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-3 rounded-xl font-semibold transition border ${
                              selectedSlot?.start === slot.start
                                ? "bg-mint text-forest border-sage"
                                : "bg-sand text-ink-soft border-sand-200 hover:border-forest/40"
                            }`}
                          >
                            {slot.timeLabel}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={confirmReschedule}
                    disabled={!selectedSlot || submitting}
                    className="w-full mt-6 bg-mint text-forest border border-forest/25 py-3.5 rounded-full font-bold hover:bg-sage-200 transition disabled:opacity-50"
                  >
                    {submitting
                      ? "Modification en cours…"
                      : "Confirmer la nouvelle date"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default ManageContent;
