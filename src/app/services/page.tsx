// "use client";
// import { useState, useEffect } from "react";
// import Navbar from "@/components/client/Navbar";
// import Footer from "@/components/client/Footer";
// import ServiceModal from "@/components/client/ServiceModal";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import { useMediaQuery } from "react-responsive";

// export default function ServicesPage() {
//   const [selectedService, setSelectedService] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [serviceCategories, setServiceCategories] = useState([]);
//   const [agendaIframe, setAgendaIframe] = useState("");
//   const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

//   useEffect(() => {
//     async function fetchServices() {
//       try {
//         const res = await fetch("/api/services");
//         const services = await res.json();
//         const grouped = {};
//         services.forEach(s => {
//           const cat = s.categorie.titre;
//           if (!grouped[cat]) {
//             grouped[cat] = {
//               category: cat,
//               description: s.categorie.description || "Pas de description disponible.",
//               services: [],
//             };
//           }
//           grouped[cat].services.push({
//             title: s.titre,
//             description: s.description,
//             price: s.prix,
//             rendez_vous: s.rendez_vous,
//           });
//         });
//         setServiceCategories(Object.values(grouped));
//       } catch (e) {
//         console.error("Erreur récupération services :", e);
//       }
//     }
//     fetchServices();
//   }, []);

//   useEffect(() => {
//     async function fetchAgenda() {
//       try {
//         const res = await fetch("/api/agenda");
//         const data = await res.json();
//         setAgendaIframe(data?.code_integration || "");
//       } catch (e) {
//         console.error("Erreur récupération agenda :", e);
//       }
//     }
//     fetchAgenda();
//   }, []);

//   const openModal = svc => {
//     setSelectedService(svc);
//     setIsModalOpen(true);
//   };
//   const closeModal = () => {
//     setSelectedService(null);
//     setIsModalOpen(false);
//   };
//   function decodeAndStrip(html) {
//     const txt = document.createElement("textarea");
//     txt.innerHTML = html;
//     return txt.value.replace(/<[^>]*>?/gm, "");
//   }

//   const [scrolled, setScrolled] = useState(false);

// useEffect(() => {
//   const handleScroll = () => {
//     setScrolled(window.scrollY > 10); // déclenche dès qu’on descend un peu
//   };
//   window.addEventListener("scroll", handleScroll);
//   return () => window.removeEventListener("scroll", handleScroll);
// }, []);

//   return (
//     <>
//       <Navbar />
//       <main className="bg-[var(--main)] min-h-screen  mt-12  ">
//       <section
//   className={`bg-[var(--buttontest)] py-20 px-8 min-h-[100vh] transition-all duration-1000 ${
//     scrolled ? "mx-5" : "mx-0"
//   } flex flex-col lg:flex-row items-center justify-between  mb-24 rounded-3xl`}
// >  <div className="text-left max-w-xl mb-10 lg:mb-0">
//     <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
//       Mes <span className="text-brandOrange">Services</span>
//     </h1>
//     <p className="text-lg text-gray-700 leading-relaxed">
//       Découvrez un ensemble de prestations alliant techniques relationnelles, corporelles et énergétiques, adaptées à vos besoins.
//       <br className="hidden md:block" />
//       Laissez-vous guider, je vous propose un rendez-vous conseil gratuit, pour évaluer la pratique qui vous convient.
//     </p>
//   </div>

//   <div className="relative w-full max-w-sm lg:max-w-md">
//     <div className="bg-[var(--secondary-dark)] rounded-[3rem] p-4 shadow-lg">
//       <img
//         src="/images/hero_service.png"
//         alt="Photo de profil"
//         className="rounded-[2rem] object-cover w-full h-auto"
//       />
//     </div>
//     {/* Décoratif : des points ou motifs si tu veux */}
//     <div className="absolute top-0 left-0 w-20 h-20 bg-brandOrange rounded-full blur-2xl opacity-20 -z-10" />
//   </div>
// </section>

//         {serviceCategories.map((cat, idx) => {
//           const useSwiper = isMobile || cat.services.length > 3;

//           return (
//             <section 
//               key={idx}
//               className="mb-28 max-w-7xl mx-auto text-center relative overflow-visible "
//             >
// <div className="relative z-0 mb-12 px-6 md:px-12 pt-20 pb-14 overflow-hidden rounded-3xl">
//   <div className="absolute inset-0 z-[-10]">
//     <svg
//       viewBox="0 0 800 400"
//       xmlns="http://www.w3.org/2000/svg"
//       className="w-full h-full"
//       preserveAspectRatio="none"
//     >
//       <path
//         d="M0,100 C150,200 650,0 800,100 L800,400 L0,400 Z"
//         fill="var(--secondary)"
//       />
//       {/* tu peux ajuster la couleur ici */}
//     </svg>
//   </div>
//   <h2 className="text-3xl font-semibold text-brandPurple mb-4">
//     {cat.category}
//   </h2>
//   <div
//     className="text-gray-700 max-w-4xl mx-auto leading-relaxed"
//     dangerouslySetInnerHTML={{ __html: cat.description }}
//   />
// </div>

//               <div className="relative z-10 overflow-visible px-8 md:px-16">
//                 <div className="overflow-hidden">
//                   {useSwiper ? (
//                     <Swiper
//                       modules={[Navigation, Pagination]}
//                       spaceBetween={24}
//                       navigation={
//                         !isMobile && cat.services.length > 3
//                           ? { nextEl: `.next-${idx}`, prevEl: `.prev-${idx}` }
//                           : false
//                       }
//                       pagination={{
//                         el: `.pagination-${idx}`,
//                         clickable: true,
//                         dynamicBullets: true,
//                       }}
//                       breakpoints={{
//                         320:  { slidesPerView: 1 },
//                         768:  { slidesPerView: 2 },
//                         1024: { slidesPerView: 3 },
//                       }}
//                       className="!pb-12"
//                     >
//                       {cat.services.map((svc, sidx) => (
//                         <SwiperSlide key={sidx}>
//                           <div className="flex flex-col justify-between h-full border border-gray-200 rounded-2xl
//            bg-white/70 backdrop-blur-md
//            shadow-md hover:shadow-lg
//            hover:scale-105 transition-transform duration-300 ease-out">
//                             <div className="p-6 flex flex-col h-full justify-between text-left">
//                               <h3 className="text-xl font-semibold text-brandPurple mb-3">
//                                 {svc.title}
//                               </h3>
//                               <p className="text-gray-700 mb-6 text-sm leading-relaxed">
//                                 {decodeAndStrip(svc.description).length > 200
//                                   ? decodeAndStrip(svc.description).slice(0, 200) + "..."
//                                   : decodeAndStrip(svc.description) || "Aucune description."}
//                               </p>
//                               <div className="mt-auto flex flex-col gap-2">
//                                 <button
//                                   onClick={() => openModal(svc)}
//                                   className="w-full px-4 py-2 border border-brandSecondary text-brandSecondary rounded-full text-sm hover:bg-[var(--buttontest)] hover:text-white transition"
//                                 >
//                                   Voir les détails
//                                 </button>
//                                 {svc.rendez_vous ? (
//                                   <a
//                                     href="/rendez-vous"
//                                     className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-full text-sm hover:bg-brandOrange/90 transition text-center"
//                                   >
//                                     Prendre rendez-vous
//                                   </a>
//                                 ) : (
//                                   <a
//                                     href="/contact"
//                                     className="w-full px-4 py-2 bg-[var(--buttoncontact)] text-white rounded-full text-sm hover:bg-gray-900 transition text-center"
//                                   >
//                                     Me contacter
//                                   </a>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </SwiperSlide>
//                       ))}
//                     </Swiper>
//                   ) : (
//                     <div className="flex justify-center flex-wrap gap-6">
//                       {cat.services.map((svc, sidx) => (
//                         <div
//                           key={sidx}
//                           className="max-w-sm flex flex-col justify-between h-full border border-gray-200 rounded-2xl
//                           bg-white/70 backdrop-blur-md
//                           shadow-md hover:shadow-lg
//                           hover:scale-105 transition-transform duration-300 ease-out p-6"                        >
//                           <h3 className="text-xl font-semibold text-brandPurple mb-3">
//                             {svc.title}
//                           </h3>
//                           <p className="text-gray-700 mb-6 text-sm leading-relaxed">
//                             {decodeAndStrip(svc.description).length > 200
//                               ? decodeAndStrip(svc.description).slice(0, 200) + "..."
//                               : decodeAndStrip(svc.description) || "Aucune description."}
//                           </p>
//                           <div className="mt-auto flex flex-col gap-2">
//                             <button
//                               onClick={() => openModal(svc)}
//                               className="w-full px-4 py-2 border border-brandSecondary text-brandSecondary rounded-full text-sm hover:bg-[var(--buttontest)] hover:text-white transition"
//                             >
//                               Voir les détails
//                             </button>
//                             {svc.rendez_vous ? (
//                               <a
//                                 href="/rendez-vous"
//                                 className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-full text-sm hover:bg-brandOrange/90 transition text-center"
//                               >
//                                 Prendre rendez-vous
//                               </a>
//                             ) : (
//                               <a
//                                 href="/contact"
//                                 className="w-full px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-900 transition text-center"
//                               >
//                                 Me contacter
//                               </a>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Flèches desktop si vraiment plus de 3 cartes */}
//                 {!isMobile && cat.services.length > 3 && (
//                   <div className="hidden md:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 z-20">
//                     <button
//                       className={`swiper-button-prev prev-${idx} absolute -left-8 bg-white p-2 rounded-full shadow hover:scale-110 transition`}
//                       aria-label="Précédent"
//                     >
//                       <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//                       </svg>
//                     </button>
//                     <button
//                       className={`swiper-button-next next-${idx} absolute -right-8 bg-white p-2 rounded-full shadow hover:scale-110 transition`}
//                       aria-label="Suivant"
//                     >
//                       <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                       </svg>
//                     </button>
//                   </div>
//                 )}

//                 {/* Pagination mobile si carousel actif */}
//                 {useSwiper && isMobile && (
//                   <div className={`swiper-pagination pagination-${idx} mt-6 flex justify-center w-full md:hidden z-10`} />
//                 )}
//               </div>
//             </section>
//           );
//         })}

//         <ServiceModal isOpen={isModalOpen} onClose={closeModal} service={selectedService} />

//         {agendaIframe && (
//           <section className="max-w-5xl mx-auto mt-20 shadow-xl rounded-xl overflow-hidden">
//             <div className="w-full" dangerouslySetInnerHTML={{ __html: agendaIframe }} />
//           </section>
//         )}
//       </main>
//       <Footer />
//     </>
//   );
// }







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
          grouped[cat].services.push(s);
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
    <h1 className="text-4xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
      Mes <span className="text-[var(--accent)]">Services</span>
    </h1>
    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
      Découvrez un ensemble de prestations alliant techniques relationnelles,
      corporelles et énergétiques, adaptées à vos besoins.
      <br className="hidden md:block" />
      Laissez‑vous guider, je vous propose un rendez‑vous conseil gratuit,
      pour évaluer la pratique qui vous convient.
    </p>
  </div>
</section>
        {serviceCategories.map((cat, idx) => {
          const useSwiper = isMobile || cat.services.length > 3;

          return (
         
<motion.section
  key={idx}
  className="min-h-screen w-full px-4 md:px-12 py-20 flex flex-col gap-12"
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
    <div className="w-full md:w-1/2">
      <Parallax translateY={["-20px", "20px"]} speed={10} easing="easeOut">
        <img
          src={cat.couverture}
          alt={`Couverture ${cat.category}`}
          className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg"
        />
      </Parallax>
    </div>

    {/* Swiper des services */}
 <div className="w-full md:w-1/2">
  <div className="relative w-full ml-2">
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
    >
      {cat.services.map((svc, sidx) => (
<SwiperSlide
  key={sidx}
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
              className={`swiper-button-prev prev-${idx} absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full bg-white p-2 rounded-full shadow hover:scale-110 transition`}
              aria-label="Précédent"
            >
              <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className={`swiper-button-next next-${idx} absolute top-1/2 right-0 -translate-y-1/2 translate-x-full bg-white p-2 rounded-full shadow hover:scale-110 transition`}
              aria-label="Suivant"
            >
              <svg className="w-5 h-5 text-brandPurple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {isMobile && (
          <div
            className={`swiper-pagination pagination-${idx} mt-4 flex justify-center w-full md:hidden z-10`}
            style={{ minHeight: "24px" }}
          />
        )}
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