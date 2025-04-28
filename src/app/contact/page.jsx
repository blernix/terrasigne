"use client";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { useState, useEffect } from "react";
import Image from "next/image"; // Pour utiliser la balise Image de Next.js 👔

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    service: "",
  });

  const [services, setServices] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Votre message a bien été envoyé ! (simulation)");
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
      <main className="bg-white/50 backdrop-blur-lg min-h-screen px-8 py-16 max-w-4xl mx-auto rounded-3xl shadow-lg mt-20 mb-12">
        <h1 className="text-5xl font-bold text-gray-800 leading-tight text-center mb-6">
          Contactez-moi
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Une question ? Un besoin spécifique ? Laissez-moi un message !
        </p>

        {/* 🌟 Ajout de la photo de profil */}
        <div className="flex justify-center mb-12">
          <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg">
            <Image
              src="/images/photo_profil.jpeg"
              alt="Photo de profil"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <section className="bg-white p-8 shadow-lg rounded-lg max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-brandPurple mb-6 text-center">Envoyez-moi un message</h2>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Nom et prénom"
              className="border p-3 rounded-lg w-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border p-3 rounded-lg w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
              className="border p-3 rounded-lg w-full"
            >
              <option value="">Sélectionnez un service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.titre}
                </option>
              ))}
            </select>
            <textarea
              name="message"
              placeholder="Votre message..."
              className="border p-3 rounded-lg w-full h-32"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button
              type="submit"
              className="bg-[var(--primary)] text-white py-3 px-6 rounded-lg hover:bg-brandSecondary/90 transition-all"
            >
              Envoyer
            </button>
          </form>
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-3xl font-semibold text-brandPurple mb-4">Informations de contact</h2>
          <p className="text-lg text-gray-700">📍 Terre de Bas, Guadeloupe</p>
          <p className="text-lg text-gray-700">📧 terrasigne971@gmail.com</p>
          <a
            href="https://wa.me/33621659214"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-gray-700 hover:text-green-500 transition-all"
          >
            📞 06 90 51 68 51
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}