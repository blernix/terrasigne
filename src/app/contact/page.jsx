"use client";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ContactPage() {
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
      service: formData.service === 'Autre' ? formData.otherService : formData.service,
    };
    delete dataToSend.otherService;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setFeedback({ type: "success", text: "Merci pour votre message ! Je vous répondrai dans les plus brefs délais !" });
        setFormData({ name: "", email: "", phone: "", message: "", service: "", otherService: "", consent: false });
      } else {
        setFeedback({ type: "error", text: "Une erreur est survenue lors de l'envoi." });
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
      <main id="main-content" className="bg-white/50 backdrop-blur-lg min-h-screen px-8 py-16 max-w-4xl mx-auto rounded-3xl shadow-lg mt-20 mb-12">
        <h1 className="text-5xl font-bold text-gray-800 leading-tight text-center mb-6">
          Contactez-moi
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Une question ? Un besoin spécifique ? Laisse moi un message !
        </p>

        <div className="flex justify-center mb-12">
          <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg">
            <Image
              src="/images/photo_profil.jpeg"
              alt="Photo de profil"
              fill
              sizes="160px"
              className="object-cover object-top"
            />
          </div>
        </div>

        {feedback && (
          <div className={`max-w-3xl mx-auto mb-6 p-4 text-center font-medium rounded-lg ${
            feedback.type === "success" ? "text-green-800 bg-green-100" : "text-red-800 bg-red-100"
          }`}>
            {feedback.text}
          </div>
        )}

        <section className="bg-white p-8 shadow-lg rounded-lg max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-brandPurple mb-6 text-center">
            Envoie-moi un message
          </h2>
          <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">Nom et prénom</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Votre nom complet"
                autoComplete="name"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-brandPurple focus:border-brandPurple"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="votre@email.com"
                autoComplete="email"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-brandPurple focus:border-brandPurple"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone (facultatif)</label>
              <input
                id="contact-phone"
                type="tel"
                name="phone"
                placeholder="Numéro de téléphone"
                autoComplete="tel"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-brandPurple focus:border-brandPurple"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="contact-service" className="block text-sm font-medium text-gray-700 mb-1">Service souhaité</label>
              <select
                id="contact-service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-brandPurple focus:border-brandPurple"
              >
                <option value="" disabled>Sélectionne un service</option>
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
                <label htmlFor="contact-other" className="block text-sm font-medium text-gray-700 mb-1">Précisez votre demande</label>
                <input
                  id="contact-other"
                  type="text"
                  name="otherService"
                  placeholder="Décrivez le service souhaité"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-brandPurple focus:border-brandPurple"
                  value={formData.otherService}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Votre message</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Ton message..."
                className="border p-3 rounded-lg w-full h-32 focus:ring-2 focus:ring-brandPurple focus:border-brandPurple"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
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
                traitement de ma demande, conformément à la{" "}
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
              disabled={sending}
              className="bg-brandPurple text-white py-3 px-6 rounded-lg hover:bg-brandPurple/90 focus:ring-2 focus:ring-brandPurple focus:ring-offset-2 transition-all"
            >
              {sending ? "Envoi en cours..." : "Envoyer"}
            </button>
          </form>
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-3xl font-semibold text-brandPurple mb-4">
            Informations de contact
          </h2>
          <p className="text-lg text-gray-700">📍 Terre de Bas, Guadeloupe</p>
          <p className="text-lg text-gray-700">📧 terrasigne971@gmail.com</p>
          <a
            href="https://wa.me/590690516851"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-gray-700 hover:text-green-500 transition-all"
          >
            📞 +590 690 51 68 51
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
