"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { stripHtml } from "@/lib/utils";
import {
  WEEKDAYS,
  capitalize,
  monthLabel,
  groupSlots,
  buildMonthGrid,
} from "@/lib/calendar";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  MapPin,
  Sparkles,
} from "lucide-react";
import styles from "./rdv.module.css";

const STORAGE_KEY = "terrasigne-booking";
const PROFILE_KEY = "terrasigne-client-profile";
const DEFAULT_MODES = ["Téléphone", "Visioconférence", "Présentiel"];

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

function modesFor(service) {
  return Array.isArray(service?.mode_rdv) && service.mode_rdv.length > 0
    ? service.mode_rdv
    : DEFAULT_MODES;
}

function BookingContent({ targetServiceId }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedFormule, setSelectedFormule] = useState(null);
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
    newsletter: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [servicesError, setServicesError] = useState(null);
  const [servicesReloadKey, setServicesReloadKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const availabilityRequestId = useRef(0);
  const selectedServiceRef = useRef(null);
  const daySectionRef = useRef(null);
  const slotSectionRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const persisted = loadPersisted();
    const profile = loadProfile();

    setFormData((prev) => ({
      ...prev,
      ...(profile || {}),
      ...(persisted?.formData || {}),
    }));

    if (persisted) {
      const restoredStep = Number(persisted.step) || 1;

      if (restoredStep >= 5) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const service = persisted.selectedService || null;
        const day = persisted.selectedDay || null;
        const slot = persisted.selectedSlot || null;
        const formule = persisted.selectedFormule || null;

        if (service) {
          setSelectedService(service);
          selectedServiceRef.current = service;
        }
        if (formule) setSelectedFormule(formule);
        if (service && formule) {
          loadAvailability(service, formule, timezone);
        }
        if (day) setSelectedDay(day);
        if (slot) setSelectedSlot(slot);

        let clamped = 1;
        if (formule) clamped = 2;
        if (formule && day) clamped = 3;
        setStep(clamped);
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (step >= 5) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          timezone,
          step,
          selectedService,
          selectedFormule,
          selectedDay,
          selectedSlot,
          formData,
        })
      );
    } catch {
      /* ignore */
    }
  }, [
    hydrated,
    timezone,
    step,
    selectedService,
    selectedFormule,
    selectedDay,
    selectedSlot,
    formData,
  ]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Réponse API invalide");
        const bookable = data.filter(
          (s) => s.rendez_vous && s.formules?.length > 0
        );
        setServices(bookable);
        setServicesError(null);

        if (targetServiceId && !selectedServiceRef.current) {
          const target = bookable.find((s) => String(s.id) === targetServiceId);
          if (target) selectService(target);
        }

        const persistedService = selectedServiceRef.current;
        if (!targetServiceId && persistedService) {
          const fresh = bookable.find(
            (s) => String(s.id) === String(persistedService.id)
          );
          if (!fresh) {
            setSelectedService(null);
            setSelectedFormule(null);
            setSelectedDay(null);
            setSelectedSlot(null);
            setStep(1);
            setFeedback(null);
            selectedServiceRef.current = null;
          } else {
            selectedServiceRef.current = fresh;
            setSelectedService(fresh);
          }
        }
      } catch (e) {
        console.error("Erreur récupération services :", e);
        setServicesError(
          "Impossible de charger les services pour le moment. Veuillez réessayer plus tard."
        );
      }
    }
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetServiceId, servicesReloadKey]);

  useEffect(() => {
    if (availability?.days?.length) {
      const months = [
        ...new Set(availability.days.map((d) => d.date.slice(0, 7))),
      ].sort();
      setViewMonth(months[0]);
    }
  }, [availability]);

  function scrollToOnMobile(ref) {
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;
    requestAnimationFrame(() =>
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  async function loadAvailability(service, formule, tz) {
    const requestId = ++availabilityRequestId.current;
    try {
      const res = await fetch(
        `/api/booking/availability?serviceId=${service.id}&duree=${formule.duree}&pause=${formule.pause || 0}&timezone=${tz}`
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

  function selectService(service) {
    selectedServiceRef.current = service;
    setSelectedService(service);
    setSelectedFormule(null);
    setSelectedDay(null);
    setSelectedSlot(null);
    setAvailability(null);
    setFeedback(null);

    const modes = modesFor(service);
    if (modes.length === 1) {
      setFormData((prev) => ({ ...prev, meetingType: modes[0] }));
    }

    if (service.formules && service.formules.length === 1) {
      selectFormule(service.formules[0]);
    } else {
      setStep(1);
    }
  }

  function selectFormule(formule) {
    setSelectedFormule(formule);
    setSelectedDay(null);
    setSelectedSlot(null);
    setAvailability(null);
    setFeedback(null);
    setStep(2);
    loadAvailability(selectedServiceRef.current, formule, timezone);
    scrollToOnMobile(daySectionRef);
  }

  function selectDay(day) {
    setSelectedDay(day);
    setSelectedSlot(null);
    setStep(3);
    scrollToOnMobile(slotSectionRef);
  }

  function selectSlot(slot) {
    setSelectedSlot(slot);
    scrollToOnMobile(formRef);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedService || !selectedFormule || !selectedSlot) {
      setFeedback({
        type: "error",
        text: "Merci de choisir un soin, une date et un horaire avant de confirmer.",
      });
      return;
    }
    doSubmit();
  }

  async function doSubmit() {
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
          duree: selectedFormule.duree,
          pause: selectedFormule.pause || 0,
          prix: selectedFormule.prix,
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
          newsletter: formData.newsletter,
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
      } else if (data.message === "Ce créneau vient d'être réservé") {
        setFeedback({
          type: "error",
          text: "Désolé, ce créneau vient d'être réservé. Choisissez-en un autre.",
        });
        setSelectedSlot(null);
        setStep(3);
        loadAvailability(selectedService, selectedFormule, timezone);
      } else {
        setFeedback({
          type: "error",
          text: data.message || "Une erreur est survenue lors de la réservation.",
        });
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

  const meetingModes = modesFor(selectedService);

  const dateLabel = selectedDay
    ? `${capitalize(selectedDay.weekday)} ${selectedDay.dayNum} ${capitalize(
        selectedDay.month
      )}`
    : "";

  const stepClass = (n) =>
    n === step
      ? `${styles.stepNum} ${styles.stepNumActive}`
      : n < step
      ? `${styles.stepNum} ${styles.stepNumDone}`
      : styles.stepNum;

  if (step === 5 && confirmed) {
    return (
      <>
        <Navbar />
        <main id="main-content" className={`mt-16 ${styles.theme}`}>
          <section className={styles.successWrap}>
            <div className={styles.successIcon}>
              <Check size={32} strokeWidth={2.5} />
            </div>
            <h2 className={styles.successTitle}>Rendez-vous confirmé&nbsp;!</h2>
            <p className={styles.successLead}>
              Un email de confirmation vient de vous être envoyé. Vous pourrez le
              gérer ou l&rsquo;annuler directement depuis ce message.
            </p>

            <div className={styles.recapBox}>
              <dl className={styles.rows}>
                <Row
                  icon={<Sparkles size={16} className={styles.iconTerra} />}
                  label="Service"
                  value={selectedService?.titre || "—"}
                />
                <Row
                  icon={<Calendar size={16} className={styles.iconSage} />}
                  label="Date"
                  value={confirmed.dateLabel || dateLabel}
                />
                <Row
                  icon={<Clock size={16} className={styles.iconSage} />}
                  label="Heure"
                  value={selectedSlot?.timeLabel || "—"}
                />
                <Row
                  icon={<Clock size={16} className={styles.iconSage} />}
                  label="Durée"
                  value={
                    selectedFormule ? `${selectedFormule.duree} min` : "—"
                  }
                />
                <Row
                  icon={<MapPin size={16} className={styles.iconSage} />}
                  label="Rencontre"
                  value={formData.meetingType || "—"}
                />
              </dl>
            </div>

            <div className={styles.actions}>
              <a href="/" className={styles.btnPrimary}>
                Retour à l&rsquo;accueil
              </a>
              <a href="/services" className={styles.btnGhost}>
                Voir les autres services
              </a>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className={`mt-16 ${styles.theme}`}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <span className={styles.chip}>
              <Calendar size={14} />
              Réservation en ligne
            </span>
            <h1 className={styles.title}>
              Prendre <span className={styles.titleAccent}>rendez-vous</span> en
              ligne
            </h1>
            <p className={styles.lead}>
              Choisissez votre service, votre date et votre horaire en quelques
              instants. Vous recevrez une confirmation par email.
            </p>
            <p className={styles.note}>
              Les horaires sont affichés dans votre fuseau horaire
              {availability?.timezoneLabel
                ? ` (${availability.timezoneLabel})`
                : ""}
              .
            </p>
            <p className={styles.note}>
              Réservation possible de 48h à 3 mois à l&rsquo;avance.
            </p>
          </div>
        </section>

        {feedback && (
          <div className={`${styles.container} ${styles.alertWrap}`}>
            <div
              className={`${styles.alert} ${
                feedback.type === "success"
                  ? styles.alertInfo
                  : styles.alertError
              }`}
            >
              {feedback.text}
            </div>
          </div>
        )}

        <div className={`${styles.container} ${styles.grid}`}>
          <div className={`${styles.card} ${styles.pad}`}>
            <div className={styles.block}>
              <div className={styles.stepHead}>
                <span className={stepClass(1)}>1</span>
                <h2 className={styles.stepTitle}>Choisissez votre soin</h2>
              </div>

              {servicesError ? (
                <div className={styles.placeholder}>
                  <p>{servicesError}</p>
                  <button
                    type="button"
                    className="btn btn-primary mt-4"
                    onClick={() => setServicesReloadKey((k) => k + 1)}
                  >
                    Réessayer
                  </button>
                </div>
              ) : services.length === 0 ? (
                <p className={styles.placeholder}>
                  Aucun soin réservable pour le moment.
                </p>
              ) : (
                <div className={styles.serviceGrid}>
                  {services.map((s) => {
                    const active =
                      String(selectedService?.id) === String(s.id);
                    const formules = s.formules || [];
                    const prices = formules
                      .filter((f) => f.prix != null)
                      .map((f) => f.prix);
                    const minPrix = prices.length ? Math.min(...prices) : null;
                    const desc = stripHtml(s.description);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectService(s)}
                        className={`${styles.serviceBtn} ${
                          active ? styles.serviceBtnActive : ""
                        }`}
                      >
                        <span>
                          <span className={styles.serviceName}>{s.titre}</span>
                          <span className={styles.serviceDesc}>
                            {formules.length > 1
                              ? `${formules.length} durées disponibles`
                              : formules[0]
                              ? `${formules[0].duree} min`
                              : ""}
                            {desc ? ` · ${desc}` : ""}
                          </span>
                        </span>
                        <span className={styles.servicePrice}>
                          {minPrix != null ? `dès ${minPrix} €` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedService && selectedService.formules?.length > 0 && (
                <>
                  <p className={styles.subLabel}>
                    Durée de la séance
                    {selectedService.formules.length > 1 ? "" : " (unique)"}
                  </p>
                  <div className={styles.durRow}>
                    {selectedService.formules.map((f) => {
                      const active = selectedFormule
                        ? selectedFormule.id != null
                          ? selectedFormule.id === f.id
                          : selectedFormule.duree === f.duree &&
                            selectedFormule.prix === f.prix
                        : false;
                      return (
                        <button
                          key={f.id || `${f.duree}-${f.prix}`}
                          type="button"
                          onClick={() => selectFormule(f)}
                          className={`${styles.durBtn} ${
                            active ? styles.durBtnActive : ""
                          }`}
                        >
                          {f.titre || `${f.duree} min`}
                          {f.prix != null ? ` · ${f.prix} €` : ""}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className={styles.block} ref={daySectionRef}>
              <div className={styles.stepHead}>
                <span className={stepClass(2)}>2</span>
                <h2 className={styles.stepTitle}>Choisissez une date</h2>
              </div>

              {!selectedFormule ? (
                <p className={styles.placeholder}>
                  Sélectionnez d&rsquo;abord un soin et une durée pour afficher
                  le calendrier.
                </p>
              ) : !availability ? (
                <p className={styles.mutedCenter}>Chargement des créneaux…</p>
              ) : availMonths.length === 0 ? (
                <p className={styles.placeholder}>
                  Aucune disponibilité pour ce soin. Réessayez plus tard ou
                  choisissez une autre durée.
                </p>
              ) : (
                <div className={styles.cal}>
                  <div className={styles.calHead}>
                    <button
                      type="button"
                      onClick={() => setViewMonth(availMonths[monthIndex - 1])}
                      disabled={monthIndex <= 0}
                      className={styles.calNav}
                      aria-label="Mois précédent"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <p className={styles.calMonth}>
                      {monthLabel(activeMonth)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewMonth(availMonths[monthIndex + 1])}
                      disabled={monthIndex >= availMonths.length - 1}
                      className={styles.calNav}
                      aria-label="Mois suivant"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className={styles.calGrid}>
                    {WEEKDAYS.map((w) => (
                      <span key={w} className={styles.weekday}>
                        {w}
                      </span>
                    ))}
                    {buildMonthGrid(activeMonth, availableDates).map(
                      (cell, i) =>
                        cell === null ? (
                          <span key={`e${i}`} />
                        ) : cell.available ? (
                          <button
                            key={cell.dateKey}
                            type="button"
                            onClick={() => selectDay(daysByKey[cell.dateKey])}
                            className={`${styles.day} ${styles.dayAvail} ${
                              selectedDay?.date === cell.dateKey
                                ? styles.dayActive
                                : ""
                            }`}
                          >
                            <span>{cell.day}</span>
                            <span className={styles.dayCount}>
                              {daysByKey[cell.dateKey]?.slots.length}
                            </span>
                          </button>
                        ) : (
                          <span key={cell.dateKey} className={`${styles.day} ${styles.dayOff}`}>
                            {cell.day}
                          </span>
                        )
                    )}
                  </div>
                  <p className={styles.calHint}>
                    Les jours en vert disposent de créneaux libres.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.block} ref={slotSectionRef}>
              <div className={styles.stepHead}>
                <span className={stepClass(3)}>3</span>
                <h2 className={styles.stepTitle}>Choisissez un horaire</h2>
              </div>

              {!selectedDay ? (
                <p className={styles.placeholder}>
                  Sélectionnez une date pour voir les horaires disponibles.
                </p>
              ) : (
                <div>
                  {groupSlots(selectedDay.slots).map((group) => (
                    <div key={group.label}>
                      <p className={styles.groupLabel}>{group.label}</p>
                      <div className={styles.slotGrid}>
                        {group.slots.map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => selectSlot(slot)}
                            className={`${styles.slot} ${
                              selectedSlot?.start === slot.start
                                ? styles.slotActive
                                : ""
                            }`}
                          >
                            {slot.timeLabel}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className={styles.aside}>
            <div className={`${styles.card} ${styles.pad}`}>
              <h3 className={styles.recapTitle}>Votre récapitulatif</h3>

              <dl className={styles.rows}>
                <Row
                  icon={<Sparkles size={16} className={styles.iconTerra} />}
                  label="Service"
                  value={selectedService?.titre || "Non choisi"}
                />
                <Row
                  icon={<Clock size={16} className={styles.iconSage} />}
                  label="Durée"
                  value={selectedFormule ? `${selectedFormule.duree} min` : "—"}
                />
                <Row
                  icon={<Calendar size={16} className={styles.iconSage} />}
                  label="Date"
                  value={dateLabel || "Non choisie"}
                />
                <Row
                  icon={<Clock size={16} className={styles.iconSage} />}
                  label="Heure"
                  value={selectedSlot?.timeLabel || "Non choisie"}
                />
                <Row
                  icon={<MapPin size={16} className={styles.iconSage} />}
                  label="Rencontre"
                  value={formData.meetingType || "À préciser"}
                />
              </dl>

              <div className={styles.totalBox}>
                <span className={styles.totalLabel}>Tarif de la séance</span>
                <span className={styles.totalValue}>
                  {selectedFormule?.prix != null
                    ? `${selectedFormule.prix} €`
                    : "—"}
                </span>
              </div>

              <form className={styles.form} onSubmit={handleSubmit} ref={formRef}>
                <div className={styles.two}>
                  <div>
                    <label className={styles.label} htmlFor="firstName">
                      Prénom *
                    </label>
                    <input
                      id="firstName"
                      className={styles.input}
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      autoComplete="given-name"
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="lastName">
                      Nom *
                    </label>
                    <input
                      id="lastName"
                      className={styles.input}
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      autoComplete="family-name"
                      placeholder="Nom"
                    />
                  </div>
                </div>

                <div>
                  <label className={styles.label} htmlFor="email">
                    Adresse email *
                  </label>
                  <input
                    id="email"
                    className={styles.input}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className={styles.label} htmlFor="phone">
                    Téléphone
                  </label>
                  <div className={styles.phoneGrid}>
                    <input
                      className={styles.input}
                      type="text"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      placeholder="+590"
                      aria-label="Indicatif pays"
                    />
                    <input
                      id="phone"
                      className={styles.input}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>

                <div>
                  <label className={styles.label} htmlFor="meetingType">
                    Comment vous rencontrer *
                  </label>
                  <select
                    id="meetingType"
                    className={styles.select}
                    name="meetingType"
                    value={formData.meetingType}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Choisir…
                    </option>
                    {meetingModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={styles.label} htmlFor="profession">
                    Profession *
                  </label>
                  <input
                    id="profession"
                    className={styles.input}
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    required
                    placeholder="Votre profession"
                  />
                </div>

                <div>
                  <label className={styles.label} htmlFor="suivi">
                    Suivi psychologique ou psychiatrique en cours *
                  </label>
                  <input
                    id="suivi"
                    className={styles.input}
                    type="text"
                    name="suivi"
                    value={formData.suivi}
                    onChange={handleChange}
                    required
                    placeholder="Oui / Non / Précisez"
                  />
                </div>

                <div>
                  <label className={styles.label} htmlFor="message">
                    Informations utiles (optionnel)
                  </label>
                  <textarea
                    id="message"
                    className={styles.textarea}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Partagez toute information qui pourrait aider à préparer notre rencontre…"
                  />
                </div>

                <label className={styles.check} htmlFor="consent">
                  <input
                    id="consent"
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    required
                  />
                  <span className={styles.checkText}>
                    <span className={styles.checkIcon}>
                      <Lock size={13} />
                    </span>{" "}
                    J&rsquo;accepte que mes informations soient utilisées pour le
                    traitement de ma demande, conformément à la{" "}
                    <a href="/confidentialite" className={styles.checkLink}>
                      politique de confidentialité
                    </a>
                    . *
                  </span>
                </label>

                <label className={styles.check} htmlFor="newsletter">
                  <input
                    id="newsletter"
                    type="checkbox"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                  />
                  <span className={styles.checkText}>
                    Je souhaite recevoir la newsletter de Terrasigne (actualités,
                    conseils bien-être, offres).
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!selectedSlot || submitting}
                  className={styles.submit}
                >
                  {submitting ? (
                    "Réservation en cours…"
                  ) : (
                    <>
                      Confirmer la réservation
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className={styles.submitHint}>
                  Confirmation immédiate par email · aucune donnée bancaire
                  demandée.
                </p>
              </form>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value, icon }) {
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>
        {icon}
        {label}
      </dt>
      <dd className={styles.rowValue}>{value}</dd>
    </div>
  );
}

export default BookingContent;
