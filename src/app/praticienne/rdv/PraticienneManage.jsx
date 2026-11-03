"use client";

import { useEffect, useState } from "react";
import {
  WEEKDAYS,
  capitalize,
  monthLabel,
  groupSlots,
  buildMonthGrid,
} from "@/lib/calendar";
import { MOTIFS_ANNULATION } from "@/lib/motifsAnnulation";

const CARD = "bg-white rounded-2xl border border-sand-200 shadow-soft";
const BTN_PRIMARY =
  "inline-flex items-center justify-center bg-mint text-forest border border-forest/25 py-3.5 px-6 rounded-full font-bold hover:bg-sage-300 transition";
const BTN_ACCENT =
  "inline-flex items-center justify-center bg-violet text-white py-3.5 px-6 rounded-full font-bold hover:bg-violet/90 transition";
const BTN_DANGER =
  "border border-[#eed3ce] text-[#8c3b34] py-3.5 rounded-full font-bold hover:bg-[#fbeeec] transition";

function Row({ label, value, strong }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span
        className={`text-right ${
          strong ? "text-ink font-semibold capitalize" : "text-ink font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function PraticienneManage({ token, sig }) {
  const [status, setStatus] = useState("loading");
  const [booking, setBooking] = useState(null);
  const [dateLabel, setDateLabel] = useState("");
  const [dateLabelClient, setDateLabelClient] = useState("");
  const [siteTimezone, setSiteTimezone] = useState("America/Guadeloupe");
  const [mode, setMode] = useState("view");
  const [feedback, setFeedback] = useState(null);
  const [motifCode, setMotifCode] = useState("");
  const [motifTexte, setMotifTexte] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const [availability, setAvailability] = useState(null);
  const [viewMonth, setViewMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  function loadBooking() {
    setStatus("loading");
    setMode("view");
    setBooking(null);
    setFeedback(null);
    setDone(null);
    setMotifCode("");
    setMotifTexte("");
    setAvailability(null);
    setSelectedDay(null);
    setSelectedSlot(null);

    if (!token || !sig) {
      setStatus("invalid");
      return;
    }

    fetch(
      `/api/booking/owner?token=${encodeURIComponent(token)}&sig=${encodeURIComponent(sig)}`
    )
      .then((r) => {
        if (r.status === 403) {
          setStatus("invalid");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (!d.booking) {
          setStatus("gone");
          return;
        }
        setBooking(d.booking);
        setDateLabel(d.dateLabel);
        setDateLabelClient(d.dateLabelClient);
        setSiteTimezone(d.siteTimezone || "America/Guadeloupe");
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sig]);

  async function startReschedule() {
    setMode("reschedule");
    setFeedback(null);
    setSelectedDay(null);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `/api/booking/availability?serviceId=${booking.serviceId}&duree=${booking.durationMin}&timezone=${siteTimezone}`
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

  function motifPayload() {
    const code = motifCode || undefined;
    const texte = motifTexte.trim();
    if (!code && !texte) return null;
    return { code, texte };
  }

  async function post(action, extra = {}) {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/booking/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          sig,
          action,
          motif: motifPayload(),
          ...extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.message || "Une erreur est survenue." });
        return null;
      }
      return data;
    } catch {
      setFeedback({ type: "error", text: "Une erreur inattendue est survenue." });
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function doCancel() {
    const data = await post("cancel");
    if (!data) return;
    setStatus("done");
    setDone({ text: data.message });
  }

  async function doReschedule() {
    if (!selectedSlot) return;
    const data = await post("reschedule", {
      start: selectedSlot.start,
      end: selectedSlot.end,
    });
    if (!data) return;
    setStatus("done");
    setDone({
      text: data.message,
      warning: data.warning,
      dateLabel: data.dateLabelOwner || data.dateLabel,
    });
  }

  const days = availability?.days || [];
  const daysByKey = Object.fromEntries(days.map((d) => [d.date, d]));
  const availableDates = new Set(days.map((d) => d.date));
  const availMonths = [...new Set(days.map((d) => d.date.slice(0, 7)))].sort();
  const monthIndex = Math.max(0, availMonths.indexOf(viewMonth));
  const activeMonth = availMonths[monthIndex] || "";

  const feedbackBox = feedback ? (
    <div
      className={`rounded-2xl px-4 py-3 mb-4 text-sm ${
        feedback.type === "error"
          ? "bg-[#fbeeec] text-[#8c3b34] border border-[#eed3ce]"
          : "bg-sage-100 text-forest border border-sage-200"
      }`}
    >
      {feedback.text}
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-forest text-white">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-display text-lg font-semibold">Terrasigne</span>
          <span className="text-xs uppercase tracking-widest text-white/70">
            Espace praticienne
          </span>
        </div>
      </div>

      <section className="max-w-xl mx-auto px-4 py-10">
        {status === "loading" && (
          <p className="text-center text-muted">Chargement…</p>
        )}

        {status === "invalid" && (
          <div className={`${CARD} p-10 text-center`}>
            <h1 className="font-display text-2xl text-forest-700 mb-3">
              Lien non valide
            </h1>
            <p className="text-muted mb-6">
              Ouvrez le lien reçu par email ou celui présent dans l&apos;événement
              de votre agenda. La page cliente, elle, ne permet pas d&apos;écrire un
              motif.
            </p>
            <a href="https://calendar.google.com" className={BTN_PRIMARY}>
              Ouvrir mon agenda
            </a>
          </div>
        )}

        {status === "gone" && (
          <div className={`${CARD} p-10 text-center`}>
            <h1 className="font-display text-2xl text-forest-700 mb-3">
              Rendez-vous introuvable
            </h1>
            <p className="text-muted mb-6">
              Ce rendez-vous a été annulé ou n&apos;existe plus dans l&apos;agenda.
            </p>
            <a href="https://calendar.google.com" className={BTN_PRIMARY}>
              Ouvrir mon agenda
            </a>
          </div>
        )}

        {status === "done" && done && (
          <div className={`${CARD} p-10 text-center`}>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="font-display text-2xl text-forest-700 mb-3">
              C&apos;est fait
            </h1>
            {done.dateLabel && (
              <p className="text-ink font-semibold text-lg capitalize mb-2">
                {done.dateLabel}
              </p>
            )}
            <p className="text-muted mb-6">{done.text}</p>
            {done.warning && (
              <div className="rounded-2xl bg-[#fff6e5] border border-[#f0d9a8] px-4 py-3 mb-6 text-sm text-[#8a5a12] text-left">
                ⚠️ {done.warning}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://calendar.google.com" className={BTN_PRIMARY}>
                Ouvrir mon agenda
              </a>
            </div>
          </div>
        )}

        {status === "ready" && mode === "view" && booking && (
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-1 text-center">
              Rendez-vous de{" "}
              <span className="text-violet">{booking.clientName}</span>
            </h1>
            <p className="text-center text-muted text-sm mb-6">
              Toute action ici prévient la cliente par email.
            </p>

            <div className={`${CARD} overflow-hidden mb-6`}>
              <div className="bg-sage-100 px-6 py-4 border-b border-sand-200">
                <h2 className="font-display text-lg text-forest-700">
                  {booking.serviceName}
                </h2>
              </div>
              <div className="px-6 py-5 space-y-3">
                <Row label="Date & heure" value={dateLabel} strong />
                {dateLabelClient && dateLabelClient !== dateLabel && (
                  <p className="text-xs text-muted -mt-2">
                    Soit {dateLabelClient} dans le fuseau de la cliente.
                  </p>
                )}
                <Row label="Durée" value={`${booking.durationMin} min`} />
                <Row label="Cliente" value={booking.clientName} />
                <Row label="Email" value={booking.clientEmail} />
                <Row label="Téléphone" value={booking.phone} />
                <Row label="Mode" value={booking.meetingType} />
              </div>
            </div>

            {feedbackBox}

            <div className="grid gap-3">
              <button onClick={startReschedule} className={BTN_ACCENT}>
                Déplacer ce rendez-vous
              </button>
              <button
                onClick={() => {
                  setMode("cancel");
                  setFeedback(null);
                }}
                className={BTN_DANGER}
              >
                Annuler ce rendez-vous
              </button>
            </div>
          </div>
        )}

        {status === "ready" && mode === "cancel" && booking && (
          <div>
            <button
              onClick={() => setMode("view")}
              className="text-violet hover:text-forest transition text-sm font-semibold mb-6"
            >
              ← Retour
            </button>

            <h2 className="font-display text-xl md:text-2xl text-forest-700 mb-4 text-center">
              Annuler le rendez-vous
            </h2>

            <div className="rounded-2xl bg-[#fbeeec] border border-[#eed3ce] px-4 py-3 mb-6 text-sm text-[#8c3b34]">
              <strong>La cliente sera prévenue par email</strong> — l&apos;annulation
              est définitive et libérera le créneau.
            </div>

            {feedbackBox}

            <div className={`${CARD} p-5 mb-6`}>
              <p className="text-sm font-semibold text-ink mb-3">
                Motif (facultatif)
              </p>
              <div className="space-y-2">
                {MOTIFS_ANNULATION.map((m) => (
                  <label
                    key={m.code}
                    className="flex items-start gap-3 text-sm text-ink-soft cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="motif"
                      value={m.code}
                      checked={motifCode === m.code}
                      onChange={() => setMotifCode(m.code)}
                      className="mt-1"
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
                <label className="flex items-start gap-3 text-sm text-ink-soft cursor-pointer">
                  <input
                    type="radio"
                    name="motif"
                    value=""
                    checked={motifCode === ""}
                    onChange={() => setMotifCode("")}
                    className="mt-1"
                  />
                  <span>Pas de motif</span>
                </label>
              </div>

              <textarea
                value={motifTexte}
                onChange={(e) => setMotifTexte(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder={
                  motifCode === "autre"
                    ? "Précisez le motif (obligatoire pour « Autre »)"
                    : "Précision facultative (ex. « empêchement familial »)"
                }
                className="mt-4 w-full rounded-xl border border-sand-200 bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-forest/40"
              />
              <p className="text-xs text-muted mt-1">
                {motifTexte.length}/300 caractères
              </p>
            </div>

            <button
              onClick={doCancel}
              disabled={submitting}
              className="w-full bg-[#8c3b34] text-white py-3.5 rounded-full font-bold hover:bg-[#74302b] transition disabled:opacity-60"
            >
              {submitting ? "Annulation…" : "Confirmer l'annulation"}
            </button>
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
            <h2 className="font-display text-xl md:text-2xl text-forest-700 mb-2 text-center">
              Choisir une nouvelle date
            </h2>
            <p className="text-center text-xs text-muted mb-6">
              Heures affichées en Guadeloupe. La cliente recevra le nouvel horaire
              dans son propre fuseau.
            </p>

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
                      {activeMonth ? monthLabel(activeMonth) : ""}
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
                    {activeMonth &&
                      buildMonthGrid(activeMonth, availableDates).map((cell, i) =>
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
                            className="aspect-square rounded-xl bg-sage-100 text-forest-700 font-semibold hover:bg-sage-300 transition"
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
                {groupSlots(
                  selectedDay.slots.filter((slot) => !slot.early)
                ).map((group) => (
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
                  onClick={doReschedule}
                  disabled={!selectedSlot || submitting}
                  className="w-full mt-6 bg-mint text-forest border border-forest/25 py-3.5 rounded-full font-bold hover:bg-sage-300 transition disabled:opacity-50"
                >
                  {submitting
                    ? "Déplacement en cours…"
                    : "Confirmer la nouvelle date"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
