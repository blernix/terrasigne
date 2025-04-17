"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export default function RendezVousPage() {
  const [agendaIframe, setAgendaIframe] = useState("");

  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch("/api/agenda");
        const data = await res.json();
        setAgendaIframe(data?.code_integration || "");
      } catch (error) {
        console.error("❌ Erreur lors de la récupération de l'agenda :", error);
      }
    }

    fetchAgenda();
  }, []);

  return (
    <>
      <Navbar />

      <main className="bg-[var(--secondary)] min-h-screen px-8 py-16">
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-6">
            Prendre <span className="text-brandOrange">Rendez-vous</span>
          </h1>
          <p className="text-lg text-gray-600">
            Choisissez un créneau directement dans le calendrier ci-dessous. Une fois le rendez-vous réservé, vous recevrez une confirmation par email.
          </p>
        </section>

        {agendaIframe ? (
          <section className="max-w-5xl mx-auto shadow-xl rounded-xl overflow-hidden">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: agendaIframe }}
            />
          </section>
        ) : (
          <p className="text-center text-gray-500 mt-12">Chargement du calendrier...</p>
        )}
      </main>

      <Footer />
    </>
  );
}