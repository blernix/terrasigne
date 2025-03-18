// "use client";
// import { useState } from "react";
// import Navbar from "@/components/client/Navbar";
// import Footer from "@/components/client/Footer";
// import Rdv from "@/components/client/Rdv";
// import ServiceModal from "@/components/client/ServiceModal";

// export default function ServicesPage() {
//   const [selectedService, setSelectedService] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const serviceCategories = [
//     {
//       category: "🌿 Accompagnement et bien-être",
//       description: "Un accompagnement personnalisé pour retrouver sérénité et équilibre au quotidien.",
//       services: [
//         {
//           title: "Séance de groupe acceptation de soi",
//           description: "Rejoignez nos séances de groupe pour découvrir la sophrologie dans une ambiance conviviale et bienveillante.",
//           price: 30,
//           slots: 10,
//         },
//         {
//           title: "Consultation en visio",
//           description: "Profitez d’une consultation personnalisée en visio pour un accompagnement adapté à vos besoins.",
//           price: 50,
//           slots: 5,
//         },
//       ],
//     },
//     {
//       category: "💆 Soins et techniques corporelles",
//       description: "Des soins manuels et énergétiques pour détendre le corps et libérer les tensions.",
//       services: [
//         {
//           title: "Massage bien-être & Modelage intuitif",
//           description: "Une expérience de relaxation profonde pour apaiser le corps et l'esprit.",
//           price: 60,
//           slots: 8,
//         },
//         {
//           title: "Technique Neuro-Cutanée (TNC)",
//           description: "Un soin unique pour libérer les tensions ostéo-musculaires et améliorer la mobilité.",
//           price: 80,
//           slots: 5,
//         },
//       ],
//     },
//     {
//       category: "✨ Soins énergétiques et harmonisation",
//       description: "Des techniques énergétiques pour rééquilibrer votre corps et votre esprit.",
//       services: [
//         {
//           title: "Reiki et soins Atlantes",
//           description: "Harmonisez votre énergie et trouvez un apaisement intérieur grâce à ces pratiques ancestrales.",
//           price: 50,
//           slots: 6,
//         },
//         {
//           title: "Harmonisation énergétique des lieux",
//           description: "Purifiez et harmonisez votre espace de vie pour favoriser une atmosphère sereine.",
//           price: 100,
//           slots: 3,
//         },
//       ],
//     },
//   ];

//   const openModal = (service) => {
//     setSelectedService(service);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setSelectedService(null);
//     setIsModalOpen(false);
//   };

//   return (
//     <>
//       <Navbar />
//       <main className="bg-[var(--secondary)] min-h-screen px-8 py-16">
//         {/* Introduction */}
//         <section className="text-center max-w-4xl mx-auto mb-24">
//           <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
//             Mes <span className="text-brandOrange">Services</span>
//           </h1>
//           <p className="text-lg text-gray-600">
//             Découvrez un ensemble de prestations alliant techniques relationnelles, corporelles et énergétiques, adaptées à vos besoins.
//           </p>
//         </section>

//         {/* Services par catégorie */}
//         {serviceCategories.map((category, index) => (
//           <section key={index} className="mb-16  max-w-7xl mx-auto justify-center text-center">
//             <h2 className="text-3xl font-semibold text-brandPurple mb-4 ">{category.category}</h2>
//             <p className="text-gray-600 mb-6 justify-center">{category.description}</p>
//             <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 justify-center mx-auto text-center">              {category.services.map((service, serviceIndex) => (
//                 <div
//                   key={serviceIndex}
//                   className="bg-white/50 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"               >
//                   <div className="p-6">
//                     <h3 className="text-2xl font-bold text-brandPurple mb-3">
//                       {service.title}
//                     </h3>
//                     <p className="text-gray-700 mb-4">{service.description}</p>
//                     <div className="text-gray-500 mb-6">
//                       <p>
//                         <span className="font-bold">Prix :</span> {service.price} €
//                       </p>
//                       {service.slots > 0 ? (
//                         <p>
//                           <span className="font-bold">Places restantes :</span> {service.slots}
//                         </p>
//                       ) : (
//                         <p className="text-red-500 font-bold">Complet</p>
//                       )}
//                     </div>
//                     <button
//                       onClick={() => openModal(service)}
//                       className="px-6 py-3 bg-brandSecondary text-white rounded-full hover:bg-brandSecondary/90 transition-all"
//                     >
//                       Détails
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         ))}

//         {/* Modal */}
//         <ServiceModal isOpen={isModalOpen} onClose={closeModal} service={selectedService} />
        
//         {/* Formulaire de RDV */}
//         <Rdv services={serviceCategories.flatMap(category => category.services)} />
//       </main>
//       <Footer />
//     </>
//   );
// }



"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import Rdv from "@/components/client/Rdv";
import ServiceModal from "@/components/client/ServiceModal";

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/services");
        const services = await response.json();

        // Regrouper les services par catégorie
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
            <p className="text-gray-600 mb-6">{category.description}</p>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 mx-auto">
              {category.services.map((service, serviceIndex) => (
                <div key={serviceIndex} className="bg-white/50 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-brandPurple mb-3">{service.title}</h3>
                    <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{
  __html: service.description.length > 200
    ? service.description.substring(0, 200) + "..."
    : service.description
}}></div>                      <div className="text-gray-500 mb-6">
                      <p><span className="font-bold">Prix :</span> {service.price} €</p>
                    </div>
                    <button onClick={() => openModal(service)} className="px-6 py-3 bg-brandSecondary text-white rounded-full hover:bg-brandSecondary/90 transition-all">
                      Détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <ServiceModal isOpen={isModalOpen} onClose={closeModal} service={selectedService} />
        <Rdv services={serviceCategories.flatMap(category => category.services)} />
      </main>
      <Footer />
    </>
  );
}