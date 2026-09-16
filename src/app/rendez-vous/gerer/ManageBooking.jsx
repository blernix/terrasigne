"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function monthLabel(yearMonth) {
  const [y, m] = (yearMonth || "").split("-").map(Number);
  if (!y || !m) return "";
  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, 1))
  );
}

function groupSlots(slots) {
  const groups = [
    { label: "Matin", slots: [] },
    { label: "Après-midi", slots: [] },
    { label: "Soir", slots: [] },
  ];
  for (const s of slots) {
    const h = parseInt(s.timeLabel.split(":")[0], 10);
    if (h < 12) groups[0].slots.push(s);
    else if (h < 18) groups[1].slots.push(s);
    else groups[2].slots.push(s);
  }
  return groups.filter((g) => g.slots.length > 0);
}

function buildMonthGrid(yearMonth, availableDates) {
  const [y, m] = yearMonth.split("-").map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${y}-${pad2(m)}-${pad2(d)}`;
    cells.push({ day: d, dateKey, available: availableDates.has(dateKey) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

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

  useEffect(() => {
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
  }, [token]);

  async function startReschedule() {
    setMode("reschedule");
    setFeedback(null);
    setSelectedDay(null);
    setSelectedSlot(null);
    try {
      const tz = booking.clientTimezone || "America/Guadeloupe";
      const res = await fetch(
        `/api/booking/availability?serviceId=${booking.serviceId}&timezone=${tz}`
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
              : "Une erreur est survenue.",
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-16 bg-[var(--secondary)]">
        <section className="max-w-xl mx-auto px-4 py-12">
          {status === "loading" && (
            <p className="text-center text-gray-500">Chargement...</p>
          )}

          {status === "notfound" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Rendez-vous introuvable
              </h1>
              <p className="text-gray-500 mb-6">
                Ce lien est invalide ou ce rendez-vous n'existe plus.
              </p>
              <a
                href="/rendez-vous"
                className="inline-block bg-brandPurple text-white py-3 px-6 rounded-full font-semibold hover:bg-brandPurple/90 transition"
              >
                Prendre rendez-vous
              </a>
            </div>
          )}

          {status === "cancelled" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Rendez-vous annulé
              </h1>
              <p className="text-gray-500 mb-6">
                Votre rendez-vous a bien été annulé. Un email de confirmation
                vient de vous être envoyé.
              </p>
              <a
                href="/rendez-vous"
                className="inline-block bg-brandOrange text-white py-3 px-6 rounded-full font-semibold hover:bg-brandOrange/90 transition"
              >
                Prendre un nouveau rendez-vous
              </a>
            </div>
          )}

          {status === "rescheduled" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Rendez-vous modifié
              </h1>
              <p className="text-gray-700 text-lg font-medium capitalize">
                {newDateLabel}
              </p>
              <p className="text-gray-500 mt-2 mb-6">
                Un email de confirmation vient de vous être envoyé.
              </p>
              <a
                href="/"
                className="inline-block bg-brandSecondary text-white py-3 px-6 rounded-full font-semibold hover:bg-brandSecondary/90 transition"
              >
                Retour à l'accueil
              </a>
            </div>
          )}

          {status === "ready" && mode === "view" && booking && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                Gérer mon <span className="text-brandOrange">rendez-vous</span>
              </h1>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="bg-brandPurple/5 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-brandPurple">
                    {booking.serviceName}
                  </h2>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Client</span>
                    <span className="text-gray-800 font-semibold">
                      {booking.clientName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date & heure</span>
                    <span className="text-gray-800 font-semibold capitalize">
                      {dateLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Durée</span>
                    <span className="text-gray-800 font-semibold">
                      {booking.durationMin} min
                    </span>
                  </div>
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-4 text-center font-medium rounded-xl mb-6 ${
                    feedback.type === "success"
                      ? "text-green-800 bg-green-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <div className="grid gap-3">
                <button
                  onClick={startReschedule}
                  className="bg-brandPurple text-white py-3.5 rounded-xl font-semibold hover:bg-brandPurple/90 transition"
                >
                  Modifier la date ou l'heure
                </button>

                {!confirmCancel ? (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="text-red-600 border border-red-200 py-3.5 rounded-xl font-semibold hover:bg-red-50 transition"
                  >
                    Annuler ce rendez-vous
                  </button>
                ) : (
                  <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                    <p className="text-red-700 text-sm mb-3">
                      Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette
                      action est définitive.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={doCancel}
                        disabled={submitting}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60"
                      >
                        {submitting ? "..." : "Oui, annuler"}
                      </button>
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="flex-1 bg-white text-gray-700 py-2.5 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition"
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
                className="text-brandPurple hover:underline text-sm font-medium mb-6"
              >
                ← Retour
              </button>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">
                Choisissez une nouvelle date
              </h2>

              {feedback && (
                <div
                  className={`p-4 text-center font-medium rounded-xl mb-6 ${
                    feedback.type === "success"
                      ? "text-green-800 bg-green-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              {!selectedDay && availability ? (
                availMonths.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setViewMonth(availMonths[monthIndex - 1])}
                        disabled={monthIndex <= 0}
                        className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        ‹
                      </button>
                      <h3 className="font-semibold text-gray-800">
                        {monthLabel(activeMonth)}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setViewMonth(availMonths[monthIndex + 1])}
                        disabled={monthIndex >= availMonths.length - 1}
                        className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        ›
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {WEEKDAYS.map((w) => (
                        <div
                          key={w}
                          className="text-xs font-semibold text-gray-400 uppercase py-1"
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
                              className="aspect-square rounded-lg bg-brandPurple/5 text-brandPurple font-semibold hover:bg-brandPurple hover:text-white transition"
                            >
                              {cell.day}
                            </button>
                          ) : (
                            <div
                              key={cell.dateKey}
                              className="aspect-square rounded-lg text-gray-300 flex items-center justify-center"
                            >
                              {cell.day}
                            </div>
                          )
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    Aucune disponibilité pour le moment.
                  </p>
                )
              ) : availability ? (
                <p className="text-center text-gray-500">Chargement...</p>
              ) : null}

              {selectedDay && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(null)}
                      className="text-brandPurple hover:underline text-sm"
                    >
                      ← Autre date
                    </button>
                    <span className="text-gray-700 font-medium text-sm capitalize">
                      {capitalize(selectedDay.weekday)} {selectedDay.dayNum}{" "}
                      {capitalize(selectedDay.month)}
                    </span>
                  </div>
                  {groupSlots(selectedDay.slots).map((group) => (
                    <div key={group.label} className="mb-5 last:mb-0">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        {group.label}
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {group.slots.map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-3 rounded-xl font-medium transition border ${
                              selectedSlot?.start === slot.start
                                ? "bg-brandSecondary text-white border-brandSecondary"
                                : "bg-gray-50 text-gray-700 border-gray-100 hover:bg-brandSecondary hover:text-white hover:border-brandSecondary"
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
                    className="w-full mt-6 bg-brandOrange text-white py-3.5 rounded-xl font-semibold hover:bg-brandOrange/90 transition disabled:opacity-50"
                  >
                    {submitting
                      ? "Modification en cours..."
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
