"use client";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Votre message a bien été envoyé ! (simulation)");
  };
  
  return (
    <>
      <Navbar />
      <main className="bg-white/50 backdrop-blur-lg min-h-screen px-8 py-16 max-w-4xl mx-auto rounded-3xl shadow-lg mt-12 mb-12">               
        <h1 className="text-5xl font-bold text-gray-800 leading-tight text-center mb-6">
          Contactez-nous
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Une question ? Un besoin spécifique ? Laissez-nous un message et nous vous répondrons rapidement.
        </p>

        <section className="bg-white p-8 shadow-lg rounded-lg max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-brandPurple mb-6 text-center">Envoyez-nous un message</h2>
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
          <p className="text-lg text-gray-700">📧 cindy97136@gmail.com</p>
          <a 
  href="https://wa.me/33621659214" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-lg text-gray-700 hover:text-green-500 transition-all"
>
  📞 06 21 65 92 14
</a>        </section>
      </main>
      <Footer />
    </>
  );
}
