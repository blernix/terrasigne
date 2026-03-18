
"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import ServiceModal from "@/components/client/ServiceModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useMediaQuery } from "react-responsive";
import { Parallax } from 'react-scroll-parallax';
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useRef, Suspense } from "react";


function ServicesPageContent() {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [agendaIframe, setAgendaIframe] = useState("");
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const searchParams = useSearchParams();
  const router = useRouter();
  const swiperRefs = useRef<{ [key: number]: any }>({});
  const [serviceMap, setServiceMap] = useState<{ [key: string]: { catIndex: number; serviceIndex: number; catSlug: string } }>({});
  const [hasNavigated, setHasNavigated] = useState(false);
  const targetServiceId = searchParams.get('service');

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
           grouped[cat].services.push(s);
         });

         const map: { [key: string]: { catIndex: number; serviceIndex: number; catSlug: string } } = {};
         const categoriesArray = Object.keys(grouped).map((catTitle, catIndex) => {
           const catSlug = createSlug(catTitle);
           const catData = grouped[catTitle];
           catData.slug = catSlug;
           catData.services.forEach((svc: any, serviceIndex: number) => {
             map[String(svc.id)] = { catIndex, serviceIndex, catSlug };
           });
           return catData;
         });

         setServiceMap(map);
         setServiceCategories(categoriesArray);
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

   useEffect(() => {
     if (targetServiceId) {
       setHasNavigated(false);
     }
   }, [targetServiceId]);

   useEffect(() => {
     if (!targetServiceId || !serviceCategories.length || Object.keys(serviceMap).length === 0 || hasNavigated) return;

     const mapping = serviceMap[targetServiceId];
     if (!mapping) return;

     const { catIndex, serviceIndex, catSlug } = mapping;
     
      // Fonction pour tenter de contrôler le Swiper
     const trySlide = (attempt = 0) => {
       const swiper = swiperRefs.current[catIndex];
       if (swiper) {
         swiper.slideTo(serviceIndex);
         setHasNavigated(true);
         // Nettoyer l'URL : retirer le paramètre service, garder le hash
         router.replace('/services#category-' + catSlug, { scroll: false });
         
          // Scroll vers le service après un délai pour laisser le Swiper s'animer
          setTimeout(() => {
            const serviceElement = document.getElementById('service-' + targetServiceId);
            if (serviceElement) {
              // Scroll vers le service avec offset pour la navbar
              const yOffset = -80;
              const y = serviceElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            } else {
              // Fallback vers la catégorie
              const categoryElement = document.getElementById('category-' + catSlug);
              if (categoryElement) {
                const yOffset = -80;
                const y = categoryElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }
          }, 500);
       } else if (attempt < 10) {
         // Réessayer après un délai (attente que Swiper soit monté)
         setTimeout(() => trySlide(attempt + 1), 200 * (attempt + 1));
       }
     };

     trySlide();
   }, [targetServiceId, serviceCategories, serviceMap, router, hasNavigated]);

   const openModal = (svc: any) => {
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

   function createSlug(text: string): string {
     return text
       .normalize('NFKD')
       .toLowerCase()
       .replace(/\s+/g, '-')
       .replace(/[^\w\-]+/g, '')
       .replace(/\-\-+/g, '-')
       .replace(/^-+/, '')
       .replace(/-+$/, '');
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
      <main className="bg-[var(--secondary)]  min-h-screen">
<section
  className={`relative min-h-screen  flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-center gap-12 bg-cover bg-center transition-all duration-1000 ${
    scrolled ? "mx-5 rounded-3xl shadow-xl" : "mx-0"
  }`}
  style={{ backgroundImage: "url('/images/hero_service.jpg')" }}
>
  {/* Overlay léger pour lisibilité */}
  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-0" />

  {/* ---- VISUEL GÉLULE ---- */}
  <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-8 lg:px-0 py-10 z-10">
  <div className="w-full max-h-[450px] lg:max-h-[400px] aspect-[3/5] rounded-[180px] overflow-hidden ring-8 ring-white shadow-xl mx-auto">
    <img
      src="/images/hero_service.png"
      alt="Photo de profil"
      className="object-cover w-full h-full"
    />
  </div>
</div>

  {/* ---- CONTENU TEXTE ---- */}
  <div className="max-w-xl px-6 md:px-8 py-10 text-center z-10">
    <h1 className="text-4xl md:text-7xl font-bold text-gray-800 mt-14 mb-6 leading-tight">
      Mes <span className="text-brandOrange">Services</span>
    </h1>
 <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
  Découvrez un ensemble de prestations alliant techniques relationnelles,
  corporelles et énergétiques, adaptées à vos besoins.
  <br className="hidden md:block" />
  <br /><br />
  Laisse toi guider, je te propose d’évaluer la pratique qui te convient.
  
  <Link href="/contact" className="w-full block max-w-xs mx-auto">
    <button
      className="w-full px-4 py-2 border border-brandSecondary text-brandSecondary rounded-full text-sm hover:bg-[var(--buttontest)] hover:text-white transition"
    >
      Rendez-vous conseil gratuit
    </button>
  </Link>
</p>
{/* Citation stylisée */}
<div className="relative mx-auto max-w-2xl text-center mt-10 px-4">
  <p className="text-lg italic text-gray-600 font-light leading-relaxed relative before:absolute before:content-['“'] before:text-5xl before:-top-6 before:-left-4 before:text-brandOrange after:absolute after:content-['”'] after:text-5xl after:-bottom-6 after:-right-4 after:text-brandOrange">
    Chacun a la responsabilité de faire croître la paix en lui afin que la paix devienne générale.
  </p>
  <p className="text-sm text-gray-500 mt-2">– Le Dalaï Lama</p>
</div>
  </div>
</section>
        {serviceCategories.map((cat, idx) => {
          const useSwiper = isMobile || cat.services.length > 3;

          return (
         
 <motion.section
  key={idx}
  id={`category-${cat.slug}`}
   className="min-h-screen w-full px-4 md:px-12 py-20 flex flex-col gap-12 scroll-mt-20"
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: 'easeOut' }}
  viewport={{ once: false, amount: 0.2 }}
>
  {/* Titre & description de la catégorie */}
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
      {cat.category}
    </h2>
    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
      {cat.description && (
        <span dangerouslySetInnerHTML={{ __html: cat.description }} />
      )}
    </p>
  </div>

  {/* Contenu principal : image + carrousel */}
  <div
    className={`flex flex-col md:flex-row items-center justify-center gap-12 ${
      idx % 2 === 1 ? 'md:flex-row-reverse' : ''
    }`}
  >
     {/* Image de couverture */}
     <div className="w-full md:w-1/2 order-2 md:order-none">
      <Parallax translateY={["-20px", "20px"]} speed={10} easing="easeOut">
        <img
          src={cat.couverture}
          alt={`Couverture ${cat.category}`}
          className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg"
        />
      </Parallax>
    </div>

     {/* Swiper des services */}
  <div className="w-full md:w-1/2 order-1 md:order-none">
  <div className="relative w-full px-4 ">
    <Swiper
      modules={[Navigation, Pagination, EffectFade]}
      // effect="fade"
      // fadeEffect={{ crossFade: true }}
      spaceBetween={0}
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
       className="!pb-12 w-full max-w-xl mx-auto"
       onSwiper={(swiper) => { swiperRefs.current[idx] = swiper }}
    >
      {cat.services.map((svc, sidx) => (
 <SwiperSlide
  key={sidx}
  id={`service-${svc.id}`}
  className="fade-slide transition-opacity duration-3000 ease-in-out"
>
         <div
  key={svc.id || `${svc.titre}-${sidx}`}
  className="aspect-square max-w-lg flex flex-col justify-between rounded-2xl bg-[#f9f9fb] shadow-inner border border-[#e6e6ec] hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 ease-out p-8 text-gray-800"
>
  {/* Titre */}
  <h3 className="text-2xl font-bold text-brandPurple mb-2 text-center">
    {svc.titre}
  </h3>

  {/* Prix (mis en valeur) */}
  <p className="text-center text-lg text-gray-600 font-semibold mb-4">
    {svc.prix ? `${svc.prix} €` : ""}
  </p>

  {/* Description (centrée avec hauteur max) */}
  <p className="text-xl  text-gray-700 leading-relaxed text-center flex-1 overflow-hidden">
    {decodeAndStrip(svc.description).length > 200
      ? decodeAndStrip(svc.description).slice(0, 200) + "..."
      : decodeAndStrip(svc.description) || "Aucune description."}
  </p>

  {/* Boutons */}
  <div className="mt-6 flex flex-col gap-2">
    <button
      onClick={() => openModal(svc)}
      className="w-full px-4 py-2 border border-brandSecondary text-brandSecondary rounded-full text-sm hover:bg-[var(--buttontest)] hover:text-white transition"
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

        {/* Flèches Swiper Desktop */}
        {!isMobile && (
          <>
            <button
              className={` prev-${idx} absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full bg-white p-2 rounded-full shadow hover:scale-110 transition`}
              aria-label="Précédent"
            >
              <svg className="w-7 h-7 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className={` next-${idx} absolute top-1/2 right-0 -translate-y-1/2 translate-x-full bg-white p-2 rounded-full shadow hover:scale-110 transition`}
              aria-label="Suivant"
            >
              <svg className="w-7 h-7 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        
        <div
  className={`swiper-pagination pagination-${idx} mt-4 flex justify-center w-full z-10`}
  style={{ minHeight: "24px" }}
/>
        
      </div>
    </div>
  </div>
</motion.section>



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

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ServicesPageContent />
    </Suspense>
  );
}