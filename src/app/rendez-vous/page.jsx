"use client";
import { useEffect, useRef, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

const STEPS = ["Service", "Date", "Horaire", "Vos infos"];
const STORAGE_KEY = "terrasigne-booking";
const PROFILE_KEY = "terrasigne-client-profile";
const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

function detectTimezone() {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "America/Guadeloupe"
    );
  } catch {
    return "America/Guadeloupe";
  }
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function loadPersisted() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadProfile() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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

function BookingContent() {
  const searchParams = useSearchParams();
  const targetServiceId = searchParams.get("service");

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1);
  const [timezone] = useState(detectTimezone);
  const [viewMonth, setViewMonth] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    meetingType: "",
    countryCode: "+590",
    phone: "",
    profession: "",
    suivi: "",
    typeSeance: "",
    message: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const availabilityRequestId = useRef(0);
  const selectedServiceRef = useRef(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = loadPersisted();
    const profile = loadProfile();

    setFormData((prev) => ({
      ...prev,
      ...(profile || {}),
      ...(persisted?.formData || {}),
    }));

    if (persisted) {
      if (persisted.step) setStep(persisted.step);
      if (persisted.selectedService) {
        setSelectedService(persisted.selectedService);
        selectedServiceRef.current = persisted.selectedService;
        if (persisted.step >= 2) {
          loadAvailability(persisted.selectedService, timezone);
        }
      }
      if (persisted.selectedDay) setSelectedDay(persisted.selectedDay);
      if (persisted.selectedSlot) setSelectedSlot(persisted.selectedSlot);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          timezone,
          step,
          selectedService,
          selectedDay,
          selectedSlot,
          formData,
        })
      );
    } catch {
      /* ignore */
    }
  }, [hydrated, timezone, step, selectedService, selectedDay, selectedSlot, formData]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const bookable = list.filter(
          (s) => s.rendez_vous && Number(s.duree) > 0
        );
        setServices(bookable);

        if (targetServiceId && !selectedServiceRef.current) {
          const target = bookable.find((s) => String(s.id) === targetServiceId);
          if (target) selectService(target);
        }

        const persistedService = selectedServiceRef.current;
        if (!targetServiceId && persistedService) {
          const stillBookable = bookable.some(
            (s) => String(s.id) === String(persistedService.id)
          );
          if (!stillBookable) {
            setSelectedService(null);
            setSelectedDay(null);
            setSelectedSlot(null);
            setStep(1);
            setFeedback(null);
            selectedServiceRef.current = null;
          }
        }
      } catch (e) {
        console.error("Erreur récupération services :", e);
      }
    }
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetServiceId]);

  useEffect(() => {
    if (availability?.days?.length) {
      const months = [
        ...new Set(availability.days.map((d) => d.date.slice(0, 7))),
      ].sort();
      setViewMonth(months[0]);
    }
  }, [availability]);

  async function loadAvailability(service, tz) {
    const requestId = ++availabilityRequestId.current;
    try {
      const res = await fetch(
        `/api/booking/availability?serviceId=${service.id}&timezone=${tz}`
      );
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();
      if (requestId !== availabilityRequestId.current) return;
      setAvailability(data);
    } catch (e) {
      if (
        requestId !== availabilityRequestId.current ||
        selectedServiceRef.current?.id !== service.id
      )
        return;
      console.error("Erreur récupération disponibilités :", e);
      setFeedback({
        type: "error",
        text: "Impossible de charger les disponibilités.",
      });
    }
  }

  async function selectService(service) {
    selectedServiceRef.current = service;
    setSelectedService(service);
    setSelectedDay(null);
    setSelectedSlot(null);
    setAvailability(null);
    setStep(2);
    loadAvailability(service, timezone);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const fullPhone = formData.phone
        ? `${formData.countryCode} ${formData.phone}`.trim()
        : "";

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          start: selectedSlot.start,
          end: selectedSlot.end,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: fullPhone,
          meetingType: formData.meetingType,
          profession: formData.profession,
          suivi: formData.suivi,
          typeSeance: formData.typeSeance,
          message: formData.message,
          consent: formData.consent,
          timezone,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setConfirmed(data);
        setStep(5);
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              meetingType: formData.meetingType,
              countryCode: formData.countryCode,
              phone: formData.phone,
              profession: formData.profession,
              suivi: formData.suivi,
              typeSeance: formData.typeSeance,
            })
          );
        } catch {
          /* ignore */
        }
      } else {
        setFeedback({
          type: "error",
          text:
            data.message === "Ce créneau vient d'être réservé"
              ? "Désolé, ce créneau vient d'être réservé. Choisissez-en un autre."
              : "Une erreur est survenue lors de la réservation.",
        });
        if (data.message === "Ce créneau vient d'être réservé") {
          selectService(selectedService);
        }
      }
    } catch (error) {
      console.error("Erreur réservation :", error);
      setFeedback({
        type: "error",
        text: "Une erreur inattendue est survenue.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const daysByKey = availability?.days
    ? Object.fromEntries(availability.days.map((d) => [d.date, d]))
    : {};
  const availableDates = new Set(
    availability?.days ? availability.days.map((d) => d.date) : []
  );
  const availMonths = availability?.days
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
        {step < 5 && (
          <section className="text-center max-w-3xl mx-auto px-4 pt-12 pb-6">
            <span className="inline-block text-brandOrange text-sm font-semibold uppercase tracking-widest mb-3">
              Réservation en ligne
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight mb-4">
              Prendre <span className="text-brandOrange">rendez-vous</span>
            </h1>

            <p className="mt-4 text-sm text-gray-500">
              Les horaires sont affichés dans votre fuseau horaire
              {availability?.timezoneLabel
                ? ` (${availability.timezoneLabel})`
                : ""}.
            </p>
          </section>
        )}

        {step < 5 && (
          <div className="max-w-2xl mx-auto mb-8 px-4">
            {/* Stepper desktop / tablette */}
            <div className="hidden sm:flex bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 items-center justify-center gap-2">
              {STEPS.map((label, i) => {
                const n = i + 1;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                        n === step
                          ? "bg-brandOrange text-white"
                          : n < step
                          ? "bg-brandSecondary text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {n < step ? "✓" : n}
                    </div>
                    <span
                      className={`text-sm ${
                        n === step
                          ? "text-brandPurple font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                    {n < STEPS.length && (
                      <span className="w-8 h-px bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stepper mobile */}
            <div className="sm:hidden flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3">
              <span className="text-sm font-semibold text-brandPurple">
                Étape {step} sur {STEPS.length} · {STEPS[step - 1]}
              </span>
              <span className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i + 1 <= step ? "bg-brandOrange" : "bg-gray-200"
                    }`}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        {feedback && (
          <div className="max-w-3xl mx-auto px-4 mb-6">
            <div
              className={`p-4 text-center font-medium rounded-xl ${
                feedback.type === "success"
                  ? "text-green-800 bg-green-100"
                  : "text-red-800 bg-red-100"
              }`}
            >
              {feedback.text}
            </div>
          </div>
        )}

        {step === 1 && (
          <section className="max-w-4xl mx-auto px-4 pb-24">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">
              Choisissez un service
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((s) => {
                const desc = stripHtml(s.description);
                return (
                  <button
                    key={s.id}
                    onClick={() => selectService(s)}
                    className="group text-left p-5 md:p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base md:text-lg font-bold text-gray-800 leading-snug">
                        {s.titre}
                      </h3>
                      <span className="ml-3 shrink-0 w-8 h-8 rounded-full bg-brandOrange/10 text-brandOrange flex items-center justify-center group-hover:bg-brandOrange group-hover:text-white transition">
                        →
                      </span>
                    </div>
                    {desc && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {desc}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-brandSecondary/10 text-brandSecondary font-semibold">
                        {s.duree} min
                      </span>
                      {s.prix ? (
                        <span className="text-gray-700 font-semibold">
                          {s.prix} €
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
            {services.length === 0 && (
              <p className="text-center text-gray-500">
                Aucun service réservable pour le moment.
              </p>
            )}
          </section>
        )}

        {step === 2 && (
          <section className="max-w-xl mx-auto px-4 pb-24">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-brandPurple hover:underline text-sm font-medium"
              >
                ← Changer de service
              </button>
              {selectedService && (
                <span className="text-gray-600 font-medium text-sm">
                  {selectedService.titre}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">
              Choisissez une date
            </h2>

            {availability ? (
              availMonths.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setViewMonth(availMonths[monthIndex - 1])
                      }
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
                      onClick={() =>
                        setViewMonth(availMonths[monthIndex + 1])
                      }
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
                    {buildMonthGrid(activeMonth, availableDates).map((cell, i) =>
                      cell === null ? (
                        <div key={i} />
                      ) : cell.available ? (
                        <button
                          key={cell.dateKey}
                          type="button"
                          onClick={() => {
                            setSelectedDay(daysByKey[cell.dateKey]);
                            setSelectedSlot(null);
                            setStep(3);
                          }}
                          className="aspect-square rounded-lg bg-brandPurple/5 text-brandPurple font-semibold hover:bg-brandPurple hover:text-white transition flex flex-col items-center justify-center"
                        >
                          <span>{cell.day}</span>
                          <span className="text-[9px] text-brandSecondary mt-0.5">
                            {daysByKey[cell.dateKey]?.slots.length}
                          </span>
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
                  Aucune disponibilité pour ce service. Réessayez plus tard.
                </p>
              )
            ) : (
              <p className="text-center text-gray-500">Chargement...</p>
            )}
          </section>
        )}

        {step === 3 && selectedDay && (
          <section className="max-w-xl mx-auto px-4 pb-24">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setStep(2)}
                className="text-brandPurple hover:underline text-sm font-medium"
              >
                ← Changer de date
              </button>
              <span className="text-gray-600 font-medium text-sm">
                {capitalize(selectedDay.weekday)} {selectedDay.dayNum}{" "}
                {capitalize(selectedDay.month)}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">
              Choisissez un horaire
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              {groupSlots(selectedDay.slots).map((group) => (
                <div key={group.label} className="mb-6 last:mb-0">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {group.slots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setStep(4);
                        }}
                        className="py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-700 hover:bg-brandSecondary hover:text-white hover:border-brandSecondary transition"
                      >
                        {slot.timeLabel}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 4 && selectedSlot && selectedService && (
          <section className="max-w-xl mx-auto px-4 pb-24">
            <button
              onClick={() => setStep(3)}
              className="text-brandPurple hover:underline text-sm font-medium mb-6"
            >
              ← Changer d'horaire
            </button>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">
              Vos informations
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="bg-brandPurple/5 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-brandPurple">
                  Récapitulatif
                </h3>
              </div>
              <div className="px-6 py-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service</span>
                  <span className="text-gray-800 font-semibold text-right">
                    {selectedService.titre}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-800 font-semibold">
                    {capitalize(selectedDay.weekday)} {selectedDay.dayNum}{" "}
                    {capitalize(selectedDay.month)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Horaire</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedSlot.timeLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Durée</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedService.duree} min
                  </span>
                </div>
                {selectedService.prix ? (
                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span className="text-gray-500">Tarif</span>
                    <span className="text-brandOrange font-bold">
                      {selectedService.prix} €
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                    placeholder="Prénom"
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                    placeholder="Nom"
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="votre@email.com"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment vous rencontrer *
                </label>
                <select
                  name="meetingType"
                  value={formData.meetingType}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                >
                  <option value="" disabled>
                    Choisir...
                  </option>
                  <option value="Visioconférence (Zoom)">
                    Visioconférence (Zoom)
                  </option>
                  <option value="Appel téléphonique">Appel téléphonique</option>
                  <option value="Présentiel">Présentiel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <input
                    type="text"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    placeholder="+590"
                    className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="Numéro de téléphone"
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession *
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  placeholder="Votre profession"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suivi psychologique ou psychiatrique en cours *
                </label>
                <input
                  type="text"
                  name="suivi"
                  value={formData.suivi}
                  onChange={handleChange}
                  required
                  placeholder="Oui / Non / Précisez"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de séance désirée
                </label>
                <input
                  type="text"
                  name="typeSeance"
                  value={formData.typeSeance}
                  onChange={handleChange}
                  placeholder="Ecoute ton corps, mémoires Akashiques, massage, technique neuro-cutanée..."
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informations utiles pour préparer notre rencontre
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Veuillez partager toute information qui pourrait aider à préparer notre rencontre..."
                  className="w-full border border-gray-200 p-3 rounded-xl h-24 focus:ring-2 focus:ring-brandOrange focus:border-brandOrange outline-none transition"
                />
              </div>

              <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                  className="mt-0.5 w-4 h-4 accent-brandPurple"
                />
                <span className="text-sm text-gray-600">
                  J'accepte que mes informations soient utilisées pour le
                  traitement de ma demande de rendez-vous, conformément à la{" "}
                  <a
                    href="/confidentialite"
                    className="text-brandPurple font-semibold underline hover:text-brandOrange transition"
                  >
                    politique de confidentialité
                  </a>
                  . *
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="bg-brandOrange text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-brandOrange/90 focus:ring-2 focus:ring-brandOrange focus:ring-offset-2 transition-all disabled:opacity-60"
              >
                {submitting
                  ? "Réservation en cours..."
                  : "Confirmer la réservation"}
              </button>
            </form>
          </section>
        )}

        {step === 5 && confirmed && (
          <section className="max-w-xl mx-auto px-4 pb-24 text-center">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 rounded-full bg-brandSecondary/10 text-brandSecondary flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Rendez-vous confirmé !
              </h2>
              <p className="text-gray-700 text-lg font-medium capitalize">
                {confirmed.dateLabel}
              </p>
              <p className="text-gray-500 mt-3">
                Un email de confirmation vient de vous être envoyé.
              </p>
              <a
                href="/"
                className="inline-block mt-8 bg-brandSecondary text-white py-3 px-8 rounded-full font-semibold hover:bg-brandSecondary/90 transition"
              >
                Retour à l'accueil
              </a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function RendezVousPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
