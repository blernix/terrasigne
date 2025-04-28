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
        const res = await fetch("/api/services");
        const services = await res.json();
        const grouped = {};
        services.forEach(s => {
          const cat = s.categorie_id.titre;
          if (!grouped[cat]) {
            grouped[cat] = {
              category: cat,
              description: s.categorie_id.description || "Pas de description disponible.",
              services: [],
            };
          }
          grouped[cat].services.push({
            title: s.titre,
            description: s.description,
            price: s.prix,
            rendez_vous: s.rendez_vous,
          });
        });
        setServiceCategories(Object.values(grouped));
      } catch (e) {
        console.error("Erreur récupération services :", e);
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
      } catch (e) {
        console.error("Erreur récupération agenda :", e);
      }
    }
    fetchAgenda();
  }, []);

  const openModal = svc => {
    setSelectedService(svc);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedService(null);
    setIsModalOpen(false);
  };
  function decodeAndStrip(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.replace(/<[^>]*>?/gm, "");
  }

  return (
    <>
      <Navbar />
      <main className="bg-[var(--secondary)] min-h-screen  mt-12 px-8 py-16">
        <section className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Mes <span className="text-brandOrange">Services</span>
          </h1>
          <p className="text-lg text-gray-600">
          Découvrez un ensemble de prestations alliant techniques relationnelles, corporelles et énergétiques, adaptées à vos besoins.
Laissez-vous guider, je vous propose un rendez-vous conseil gratuit, pour évaluer la pratique qui vous convient.          </p>
        </section>

        {serviceCategories.map((cat, idx) => {
          const useSwiper = isMobile || cat.services.length > 3;

          return (
            <section
              key={idx}
              className="mb-28 max-w-7xl mx-auto text-center relative overflow-visible"
            >
              <h2 className="text-3xl font-semibold text-brandPurple mb-4">
                {cat.category}
              </h2>
              <div
                className="text-gray-600 mb-6"
                dangerouslySetInnerHTML={{ __html: cat.description }}
              />

              <div className="relative z-10 overflow-visible px-8 md:px-16">
                <div className="overflow-hidden">
                  {useSwiper ? (
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={24}
                      navigation={
                        !isMobile && cat.services.length > 3
                          ? { nextEl: `.next-${idx}`, prevEl: `.prev-${idx}` }
                          : false
                      }
                      pagination={{
                        el: `.pagination-${idx}`,
                        clickable: true,
                        dynamicBullets: true,
                      }}
                      breakpoints={{
                        320:  { slidesPerView: 1 },
                        768:  { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                      }}
                      className="!pb-12"
                    >
                      {cat.services.map((svc, sidx) => (
                        <SwiperSlide key={sidx}>
                          <div className="flex flex-col justify-between h-full border border-gray-200 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
                            <div className="p-6 flex flex-col h-full justify-between text-left">
                              <h3 className="text-xl font-semibold text-brandPurple mb-3">
                                {svc.title}
                              </h3>
                              <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                                {decodeAndStrip(svc.description).length > 200
                                  ? decodeAndStrip(svc.description).slice(0, 200) + "..."
                                  : decodeAndStrip(svc.description) || "Aucune description."}
                              </p>
                              <div className="mt-auto flex flex-col gap-2">
                                <button
                                  onClick={() => openModal(svc)}
                                  className="w-full px-4 py-2 border border-brandSecondary text-brandSecondary rounded-full text-sm hover:bg-brandSecondary hover:text-white transition"
                                >
                                  Voir les détails
                                </button>
                                {svc.rendez_vous ? (
                                  <a
                                    href="/rendez-vous"
                                    className="w-full px-4 py-2 bg-brandOrange text-white rounded-full text-sm hover:bg-brandOrange/90 transition text-center"
                                  >
                                    Prendre rendez-vous
                                  </a>
                                ) : (
                                  <a
                                    href="/contact"
                                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-900 transition text-center"
                                  >
                                    Me contacter
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="flex justify-center flex-wrap gap-6">
                      {cat.services.map((svc, sidx) => (
                        <div
                          key={sidx}
                          className="max-w-sm flex flex-col justify-between h-full border border-gray-200 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm p-6 transition-all"
                        >
                          <h3 className="text-xl font-semibold text-brandPurple mb-3">
                            {svc.title}
                          </h3>
                          <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                            {decodeAndStrip(svc.description).length > 200
                              ? decodeAndStrip(svc.description).slice(0, 200) + "..."
                              : decodeAndStrip(svc.description) || "Aucune description."}
                          </p>
                          <div className="mt-auto flex flex-col gap-2">
                            <button
                              onClick={() => openModal(svc)}
                              className="w-full px-4 py-2 border border-brandSecondary text-brandSecondary rounded-full text-sm hover:bg-brandSecondary hover:text-white transition"
                            >
                              Voir les détails
                            </button>
                            {svc.rendez_vous ? (
                              <a
                                href="/rendez-vous"
                                className="w-full px-4 py-2 bg-brandOrange text-white rounded-full text-sm hover:bg-brandOrange/90 transition text-center"
                              >
                                Prendre rendez-vous
                              </a>
                            ) : (
                              <a
                                href="/contact"
                                className="w-full px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-900 transition text-center"
                              >
                                Me contacter
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Flèches desktop si vraiment plus de 3 cartes */}
                {!isMobile && cat.services.length > 3 && (
                  <div className="hidden md:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 z-20">
                    <button
                      className={`swiper-button-prev prev-${idx} absolute -left-8 bg-white p-2 rounded-full shadow hover:scale-110 transition`}
                      aria-label="Précédent"
                    >
                      <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className={`swiper-button-next next-${idx} absolute -right-8 bg-white p-2 rounded-full shadow hover:scale-110 transition`}
                      aria-label="Suivant"
                    >
                      <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Pagination mobile si carousel actif */}
                {useSwiper && isMobile && (
                  <div className={`swiper-pagination pagination-${idx} mt-6 flex justify-center w-full md:hidden z-10`} />
                )}
              </div>
            </section>
          );
        })}

        <ServiceModal isOpen={isModalOpen} onClose={closeModal} service={selectedService} />

        {agendaIframe && (
          <section className="max-w-5xl mx-auto mt-20 shadow-xl rounded-xl overflow-hidden">
            <div className="w-full" dangerouslySetInnerHTML={{ __html: agendaIframe }} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}