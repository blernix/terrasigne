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
        const grouped: { [key: string]: any } = {};
  
        services.forEach(s => {
          const cat = s.categorie.titre;
          if (!grouped[cat]) {
            grouped[cat] = {
              category: cat,
              description: s.categorie.description || "Pas de description disponible.",
              couverture: s.categorie.couverture || "/images/default-cover.jpg",
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

  const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 10); // déclenche dès qu’on descend un peu
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const [openDescriptions, setOpenDescriptions] = useState<{ [key: number]: boolean }>({});

  return (
    <>
      <Navbar />
      <main className="bg-[var(--main)] min-h-screen">
{/* HERO « vague » + image gélule */}
<section className="relative overflow-hidden mb-24 min-h-[100vh] flex flex-col lg:flex-row items-center justify-between">

  {/* Forme gauche : dégradé + vague concave */}
  <div className="absolute inset-0 z-1">
  <svg
    viewBox="0 0 1600 800"
    preserveAspectRatio="none"
    className="w-full h-full"
  >
    <defs>
      <pattern id="heroImage" patternUnits="userSpaceOnUse" width="1600" height="800">
        <image
          href="/images/hero_service.jpg"
          x="0"
          y="0"
          width="1600"
          height="800"
          preserveAspectRatio="xMidYMid slice"
        />
      </pattern>
    </defs>

    <path
      d="
        M0 0 
        H1600 
        V500 
        Q1300 750 800 700 
        Q300 600 0 800 
        Z
      "
      fill="url(#heroImage)"
    />
  </svg>
</div>

  {/* ---- CONTENU TEXTE ---- */}
  <div className="max-w-xl px-8 py-20 z-10 mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
      Mes <span className="text-[var(--accent)]">Services</span>
    </h1>
    <p className="text-2xl text-gray-700 leading-relaxed">
      Découvrez un ensemble de prestations alliant techniques relationnelles,
      corporelles et énergétiques, adaptées à vos besoins.<br className="hidden md:block" />
      Laissez‑vous guider, je vous propose un rendez‑vous conseil gratuit,
      pour évaluer la pratique qui vous convient.
    </p>
  </div>

  {/* ---- VISUEL GÉLULE ---- */}
  <div className="relative w-full max-w-sm lg:max-w-md px-8 lg:px-0 py-20 lg:py-0">
  <div className="w-full h-[500px] rounded-[180px] overflow-hidden ring-8 ring-white shadow-xl transform -translate-x-10 translate-y-24">
    <img
      src="/images/hero_service.png"
      alt="Photo de profil"
      className="object-cover w-full h-full"
    />
  </div>
</div>

</section>

        {serviceCategories.map((cat, idx) => {
          const useSwiper = isMobile || cat.services.length > 3;

          return (
         
<section
  key={idx}
  className="mb-28 max-w-full mx-auto px-4 md:px-8 flex flex-col gap-8">

  {/* Alterner gauche/droite */}
  <div className={`relative z-0 flex flex-col md:flex-row ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} bg-transparent border border-gray-20 rounded-3xl shadow-xl overflow-hidden`}>
    {/* Partie texte */}
    <div className="w-full md:w-1/2 relative h-auto overflow-hidden rounded-3xl">
  {/* Image de couverture */}
  <img
  src={cat.couverture}
  alt={`Couverture ${cat.category}`}
  className="w-full h-auto max-h-[300px] object-cover md:h-full md:max-h-none"
/>

  {/* Conteneur info collé en haut */}
  <div className="absolute top-0 left-0 w-full z-10">
    {/* Titre + flèche */}
    <div className="bg-transparent text-white px-6 py-4 flex items-center justify-between">
      <h2 className="text-2xl font-semibold">{cat.category}</h2>
      <button
        onClick={() =>
          setOpenDescriptions((prev) => ({
            ...prev,
            [idx]: !prev[idx],
          }))
        }
        aria-label="Afficher la description"
        className="ml-4 hover:scale-110 transition-transform"
      >
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${
            openDescriptions[idx] ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    {/* Description glissante */}
    <div
  className={`bg-white/20 backdrop-blur-md text-white px-6 py-4 transition-all duration-500 ease-in-out ${
    openDescriptions[idx]
      ? "max-h-[500px] opacity-100"
      : "max-h-0 opacity-0 overflow-hidden"
  } overflow-y-auto`}
  style={{ scrollbarWidth: "none" }}
>
  <div className="text-lg" dangerouslySetInnerHTML={{ __html: cat.description }} />
</div>
  </div>
</div>

    {/* Partie carrousel */}
    <div className="w-full md:w-1/2 p-6 relative overflow-visible flex items-center justify-center">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        navigation={{
          nextEl: `.next-${idx}`,
          prevEl: `.prev-${idx}`,
        }}
        pagination={{
          el: `.pagination-${idx}`,
          clickable: true,
          dynamicBullets: true,
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 1 },
        }}
        className="!pb-12 max-w-md mx-auto"
      >
        {cat.services.map((svc, sidx) => (
          <SwiperSlide key={sidx}>
            <div className="aspect-square w-full flex flex-col justify-between rounded-xl bg-transparent shadow-inner border border-[#e6e6ec] hover:shadow-md hover:scale-[1.02] transition-transform duration-300 ease-out p-6 text-gray-800">
  <h3 className="text-2xl font-semibold text-brandPurple mb-3">
    {svc.title}
  </h3>
  <p className="mb-6 text-xl items-center justify-center leading-relaxed">
    {decodeAndStrip(svc.description).length > 200
      ? decodeAndStrip(svc.description).slice(0, 200) + "..."
      : decodeAndStrip(svc.description) || "Aucune description."}
  </p>
  <div className="mt-auto flex flex-col gap-2">
    <button
      onClick={() => openModal(svc)}
      className="w-full px-4 py-2 border border-gray-300 text-brandSecondary rounded-full text-sm hover:bg-gray-100 transition"
    >
      Voir les détails
    </button>
    {svc.rendez_vous ? (
      <a
        href="/rendez-vous"
        className="w-full px-4 py-2 bg-[var(--buttontest)] text-white rounded-full text-sm hover:bg-brandSecondary/80 transition text-center"
      >
        Prendre rendez-vous
      </a>
    ) : (
      <a
        href="/contact"
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-full text-sm hover:bg-black transition text-center"
      >
        Me contacter
      </a>
    )}
  </div>
</div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Flèches swiper */}
      {!isMobile && (
        <>
          <button
            className={`swiper-button-prev prev-${idx} absolute top-1/2 -left-5 z-20 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:scale-110 transition`}
            aria-label="Précédent"
          >
            <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className={`swiper-button-next next-${idx} absolute top-1/2 -right-5 z-20 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:scale-110 transition`}
            aria-label="Suivant"
          >
            <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination mobile */}
      {isMobile && (
        <div className={`swiper-pagination pagination-${idx} mt-4 flex justify-center w-full md:hidden z-10`} />
      )}
    </div>
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