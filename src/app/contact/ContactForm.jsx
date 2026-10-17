"use client";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    service: "",
    otherService: "",
    consent: false,
  });

  const [services, setServices] = useState([]);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setFeedback(null);

    const dataToSend = {
      ...formData,
      service:
        formData.service === "Autre" ? formData.otherService : formData.service,
    };
    delete dataToSend.otherService;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setFeedback({
          type: "success",
          text: "Merci pour votre message ! Je vous répondrai dans les plus brefs délais !",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          service: "",
          otherService: "",
          consent: false,
        });
      } else {
        setFeedback({
          type: "error",
          text: "Une erreur est survenue lors de l'envoi.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire :", error);
      setFeedback({ type: "error", text: "Une erreur inattendue est survenue." });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des services :", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-cream pb-20 pt-28">
        <div className="container-soft">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Prenons contact</span>
            <h1 className="mt-4 font-display text-4xl font-semibold text-forest md:text-5xl">
              Contactez <span className="italic text-violet">Cindy</span>,
              praticienne bien-être en Guadeloupe
            </h1>
            <p className="mt-4 text-ink-soft">
              Une question ? Un besoin spécifique ? Laissez-moi un message.
            </p>

            <div className="relative mx-auto mt-8 h-40 w-40 overflow-hidden rounded-full ring-8 ring-white shadow-soft">
              <Image
                src="/images/photo_profil.jpeg"
                alt="Cindy Guillaume, praticienne en soins holistiques Terrasigne"
                fill
                sizes="160px"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <section className="card p-8">
              <h2 className="font-display text-2xl font-semibold text-forest">
                Envoie-moi un message
              </h2>

              {feedback && (
                <div
                  className={`mt-6 rounded-2xl p-4 text-center text-sm font-semibold ${
                    feedback.type === "success"
                      ? "bg-sage-100 text-forest"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="contact-name" className="label-text mb-1.5">
                    Nom et prénom
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Votre nom complet"
                    autoComplete="name"
                    className="field"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="label-text mb-1.5">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    autoComplete="email"
                    className="field"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="label-text mb-1.5">
                    Téléphone (facultatif)
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="Numéro de téléphone"
                    autoComplete="tel"
                    className="field"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="contact-service" className="label-text mb-1.5">
                    Service souhaité
                  </label>
                  <select
                    id="contact-service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="field"
                  >
                    <option value="" disabled>
                      Sélectionne un service
                    </option>
                    {services.map((service) => (
                      <option key={service.id} value={service.titre}>
                        {service.titre}
                      </option>
                    ))}
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                {formData.service === "Autre" && (
                  <div>
                    <label htmlFor="contact-other" className="label-text mb-1.5">
                      Précisez votre demande
                    </label>
                    <input
                      id="contact-other"
                      type="text"
                      name="otherService"
                      placeholder="Décrivez le service souhaité"
                      className="field"
                      value={formData.otherService}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="contact-message" className="label-text mb-1.5">
                    Votre message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    placeholder="Ton message…"
                    className="field min-h-[8rem] resize-y"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-sand-200 bg-cream/50 p-4 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    required
                    className="mt-0.5 h-4 w-4 accent-forest"
                  />
                  <span>
                    J&rsquo;accepte que mes informations soient utilisées pour le
                    traitement de ma demande, conformément à la{" "}
                    <a href="/confidentialite" className="link-underline">
                      politique de confidentialité
                    </a>
                    . *
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-primary w-full"
                >
                  {sending ? "Envoi en cours…" : "Envoyer"}
                </button>
              </form>
            </section>

            <section className="card h-fit p-8">
              <h2 className="font-display text-2xl font-semibold text-forest">
                Informations
              </h2>
              <div className="mt-6 flex flex-col gap-4 text-sm">
                <span className="inline-flex items-center gap-3 text-ink-soft">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-100 text-forest">
                    <MapPin size={16} />
                  </span>
                  Terre de Bas, Guadeloupe
                </span>
                <a
                  href="mailto:terrasigne971@gmail.com"
                  className="inline-flex items-center gap-3 text-ink-soft transition hover:text-forest"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-100 text-forest">
                    <Mail size={16} />
                  </span>
                  terrasigne971@gmail.com
                </a>
                <a
                  href="https://wa.me/590690516851"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-ink-soft transition hover:text-forest"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-100 text-forest">
                    <Phone size={16} />
                  </span>
                  +590 690 51 68 51
                </a>
              </div>

              <a
                href="/rendez-vous"
                className="btn btn-violet mt-8 w-full"
              >
                <MessageCircle size={17} />
                Prendre rendez-vous en ligne
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
