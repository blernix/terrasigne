"use client";
import Link from "next/link";

function stripTagsAndDecode(html: string) {
  const text = html.replace(/<[^>]+>/g, "");
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

interface Service {
  id: number;
  titre: string;
  description: string;
  prix: number;
}

export default function FeaturedServices({ services }: { services: Service[] }) {
  return (
    <section className="max-w-6xl mx-auto my-28 min-h-screen w-full px-8 py-16" data-aos="fade-up">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800">Services Mis en Avant</h2>
        <Link href="/services" className="text-brandOrange font-medium hover:underline">
          Tous les services →
        </Link>
      </div>
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {services.length > 0 ? (
          services.map((service, index) => (
            <div
              key={service.id}
              className="flex flex-col justify-between h-full bg-white/50 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="p-6 flex flex-col justify-between h-full">
                <h3 className="text-2xl font-bold text-brandPurple mb-3">{service.titre}</h3>
                <p className="text-gray-700 mb-4">
                  {stripTagsAndDecode(service.description).length > 160
                    ? stripTagsAndDecode(service.description).substring(0, 160) + "..."
                    : stripTagsAndDecode(service.description)}
                </p>
                <p className="text-gray-500 mb-6">
                  <span className="font-bold">Prix :</span> {service.prix} €
                </p>
                <div className="mt-auto">
                  <Link href={`/services`}>
                    <button className="w-full px-6 py-3 bg-brandSecondary text-white rounded-full hover:bg-brandSecondary/90 transition-all">
                      Détails
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun service mis en avant pour le moment.</p>
        )}
      </div>
    </section>
  );
}