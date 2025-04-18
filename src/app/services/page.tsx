"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import ServiceModal from "@/components/client/ServiceModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useMediaQuery } from "react-responsive";


export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [agendaIframe, setAgendaIframe] = useState("");
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/services");
        const services = await response.json();

        const groupedServices = {};
        services.forEach(service => {
          const categoryTitle = service.categorie_id.titre;
          if (!groupedServices[categoryTitle]) {
            groupedServices[categoryTitle] = {
              category: categoryTitle,
              description: service.categorie_id.description || "Pas de description disponible.",
              services: [],
            };
          }

          groupedServices[categoryTitle].services.push({
            title: service.titre,
            description: service.description,
            price: service.prix,
            id: service.id,
            rendez_vous: service.rendez_vous,
          });
        });

        setServiceCategories(Object.values(groupedServices));
      } catch (error) {
        console.error("Erreur lors de la récupération des services:", error);
      }
    }

    fetchServices();
  }, []);

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

  const openModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedService(null);
    setIsModalOpen(false);
  };

  function decodeAndStrip(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    const decoded = txt.value;
    return decoded.replace(/<[^>]*>?/gm, "");
  }

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

        {serviceCategories.map((category, index) => {
          const isCentered = category.services.length < 3;

          return (
            <section key={index} className="mb-28 max-w-7xl mx-auto text-center relative z-0">
              <h2 className="text-3xl font-semibold text-brandPurple mb-4">{category.category}</h2>
              <div
                className="text-gray-600 mb-6"
                dangerouslySetInnerHTML={{ __html: category.description }}
              />

<div
  className={`relative z-10 ${
    !isMobile && category.services.length < 3 ? "custom-swiper-center" : ""
  }`}
>              <Swiper
  modules={[Navigation, Pagination]}
  spaceBetween={24}
  navigation={
    isCentered
      ? false
      : {
          nextEl: `.next-${index}`,
          prevEl: `.prev-${index}`,
        }
  }
  pagination={{
    el: `.pagination-${index}`,
    clickable: true,
    dynamicBullets: true,
  }}
  onSwiper={(swiper) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const shouldCenter = !isMobile && category.services.length < 3;
  
    swiper.wrapperEl.classList.toggle("centered", shouldCenter);
  }}
  breakpoints={{
    320: { slidesPerView: 1 },
    640: { slidesPerView: 1.1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
  }}
  className="!pb-12"
                >
                  {category.services.map((service, serviceIndex) => (
                    <SwiperSlide key={serviceIndex}>
                      <div className="flex flex-col justify-between h-full border border-gray-200 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
                        <div className="p-6 flex flex-col h-full justify-between text-left">
                          <h3 className="text-xl font-semibold text-brandPurple mb-3 leading-snug">{service.title}</h3>
                          <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                            {decodeAndStrip(service.description).length > 200
                              ? decodeAndStrip(service.description).substring(0, 200) + "..."
                              : decodeAndStrip(service.description) || "Aucune description."}
                          </p>

                          <div className="mt-auto">
                            <p className="text-gray-500 text-sm mb-4">
                              <span className="font-medium text-gray-800">Prix :</span> {service.price} €
                            </p>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => openModal(service)}
                                className="w-full px-4 py-2 border border-brandSecondary text-brandSecondary rounded-full text-sm hover:bg-brandSecondary hover:text-white transition"
                              >
                                Voir les détails
                              </button>
                              {service.rendez_vous ? (
                                <a
                                  href="/rendez-vous"
                                  className="w-full px-4 py-2 bg-brandOrange text-white rounded-full text-sm text-center hover:bg-brandOrange/90 transition"
                                >
                                  Prendre rendez-vous
                                </a>
                              ) : (
                                <a
                                  href="/contact"
                                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-full text-sm text-center hover:bg-gray-900 transition"
                                >
                                  Me contacter
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Flèches */}
                {!isCentered && (
                  <div className="hidden md:flex justify-between absolute top-1/2 -translate-y-1/2 w-full px-2 z-20">
                    <button
                      className={`swiper-button-prev prev-${index} bg-white p-2 rounded-full shadow hover:scale-110 transition`}
                      aria-label="Précédent"
                    >
                      <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className={`swiper-button-next next-${index} bg-white p-2 rounded-full shadow hover:scale-110 transition`}
                      aria-label="Suivant"
                    >
                      <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Pagination */}
                <div className={`swiper-pagination pagination-${index} mt-6 flex justify-center w-full md:hidden z-10`} />
              </div>
            </section>
          );
        })}

        <ServiceModal
          isOpen={isModalOpen}
          onClose={closeModal}
          service={selectedService}
        />

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