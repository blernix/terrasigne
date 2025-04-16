"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import ServiceModal from "@/components/client/ServiceModal";

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [agendaIframe, setAgendaIframe] = useState(""); // 🗓️ Pour l'agenda

  // 🔁 Récupération des services
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/services");
        const services = await response.json();

        const groupedServices: { [key: string]: any } = {};
        services.forEach(service => {
          if (!groupedServices[service.categorie_id.titre]) {
            groupedServices[service.categorie_id.titre] = {
              category: service.categorie_id.titre,
              description: service.categorie_id.description || "Pas de description disponible.",
              services: [],
            };
          }
          groupedServices[service.categorie_id.titre].services.push({
            title: service.titre,
            description: service.description,
            price: service.prix,
            id: service.id,
          });
        });

        setServiceCategories(Object.values(groupedServices));
      } catch (error) {
        console.error("Erreur lors de la récupération des services:", error);
      }
    }

    fetchServices();
  }, []);

  // 🔁 Récupération de l'agenda depuis Directus
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch("/api/agenda");
        const data = await res.json();
        setAgendaIframe(data?.code_integration || "");
          } catch (error) {
        console.error("Erreur lors de la récupération de l'agenda :", error);
      }
    }

    fetchAgenda();
  }, []);

  const openModal = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedService(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <Navbar />
      <main className="bg-[var(--secondary)] min-h-screen px-8 py-16">
        <section className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
            Mes <span className="text-brandOrange">Services</span>
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez un ensemble de prestations alliant techniques relationnelles, corporelles et énergétiques, adaptées à vos besoins.
          </p>
        </section>

        {serviceCategories.map((category, index) => (
          <section key={index} className="mb-16 max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-brandPurple mb-4">{category.category}</h2>
            <div
  className="text-gray-600 mb-6"
  dangerouslySetInnerHTML={{ __html: category.description }}
/>            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 mx-auto">
              {category.services.map((service, serviceIndex) => (
                <div
                  key={serviceIndex}
                  className="bg-white/50 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-brandPurple mb-3">{service.title}</h3>
                    <div
                      className="text-gray-700 mb-4"
                      dangerouslySetInnerHTML={{
                        __html:
                          service.description && service.description.length > 200
                            ? service.description.substring(0, 200) + "..."
                            : service.description || "<em>Aucune description.</em>",
                      }}
                    ></div>
                    <div className="text-gray-500 mb-6">
                      <p>
                        <span className="font-bold">Prix :</span> {service.price} €
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(service)}
                      className="px-6 py-3 bg-brandSecondary text-white rounded-full hover:bg-brandSecondary/90 transition-all"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <ServiceModal
          isOpen={isModalOpen}
          onClose={closeModal}
          service={selectedService}
        />

        {/* 🌟 Affichage dynamique de l'agenda */}
        {agendaIframe && (
          <section className="max-w-5xl mx-auto mt-20 shadow-xl rounded-xl overflow-hidden">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: agendaIframe }}
            />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}