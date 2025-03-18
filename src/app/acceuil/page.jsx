"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import CTASection from "@/components/common/CTASection";

export default function Page() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupération du carrousel
        const carrouselResponse = await fetch("/api/carrousel");
        const carrouselData = await carrouselResponse.json();
        setImages(carrouselData);

        // Récupération des services mis en avant
        const servicesResponse = await fetch("/api/services?featured=true");
        const servicesData = await servicesResponse.json();
        setFeaturedServices(servicesData);

        // Récupération des articles mis en avant
        const articlesResponse = await fetch("/api/blog?featured=true");
        const articlesData = await articlesResponse.json();
        setFeaturedArticles(articlesData);
      } catch (error) {
        console.error("❌ Erreur chargement des données :", error);
      }
    }

    fetchData();

    // Gestion du carrousel
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: false,
      anchorPlacement: "top-bottom",
    });

    return () => clearInterval(interval);
  }, []);

  // Fonction pour supprimer les balises HTML
  const stripTags = (html) => html.replace(/<[^>]+>/g, "");

  return (
    <>
      <Navbar />
      <main className="bg-[var(--secondary)] min-h-screen w-full px-8 py-16">
        {/* Titre & Présentation */}
        <section className="text-center max-w-4xl mx-auto mb-24" data-aos="fade-up">
          <h1 className="text-6xl font-bold text-gray-800 leading-tight">
            Bienvenue sur <span className="text-brandOrange font-extrabold">Terrasigne</span>
          </h1>
          <p className="text-lg text-gray-600 mt-6">
            Sophrologie et épanouissement personnel dans un cadre serein et harmonieux.
          </p>
          <Link href="/services">
            <button className="mt-10 px-8 py-4 bg-[var(--primary)] text-white text-lg font-medium rounded-full shadow-md hover:shadow-lg hover:bg-brandSecondary/90 transition-all">
              Découvrir mes services
            </button>
          </Link>
        </section>

        {/* Carrousel Dynamique */}
        <section className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl shadow-2xl mb-28" data-aos="fade-up">
          <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {images.map((image, index) => {
              const imageUrl = image.images?.filename_disk
                ? `${process.env.NEXT_PUBLIC_DIRECTUS_API}/assets/${image.images.filename_disk}`
                : "/images/default-cover.jpg"; // Image par défaut si aucune trouvée

              return (
                <div key={image.id} className="w-full flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={image.images?.title || `Image ${index + 1}`}
                    className="w-full h-96 object-cover rounded-3xl"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-5 h-5 rounded-full border ${
                  index === currentIndex ? "bg-brandPurple border-brandPurple" : "bg-gray-300 border-gray-300"
                }`}
              ></button>
            ))}
          </div>
        </section>

       {/* Services mis en avant */}
<section className="max-w-6xl mx-auto my-28" data-aos="fade-up">
  <div className="flex justify-between items-center mb-12">
    <h2 className="text-3xl font-bold text-gray-800">Services Mis en Avant</h2>
    <Link href="/services" className="text-brandOrange font-medium hover:underline">
      Tous les services →
    </Link>
  </div>
  <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
    {featuredServices.length > 0 ? (
      featuredServices.map((service, index) => (
        <div
          key={service.id}
          className="bg-white/50 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"
          data-aos="fade-up"
          data-aos-delay={index * 100}
        >
          <div className="p-6">
            <h3 className="text-2xl font-bold text-brandPurple mb-3">{service.titre}</h3>
            <p className="text-gray-700 mb-4">
              {stripTags(service.description).length > 160
                ? stripTags(service.description).substring(0, 160) + "..."
                : stripTags(service.description)}
            </p>
            <p className="text-gray-500 mb-6">
              <span className="font-bold">Prix :</span> {service.prix} €
            </p>
            <Link href={`/services/${service.id}`}>
              <button className="px-6 py-3 bg-brandSecondary text-white rounded-full hover:bg-brandSecondary/90 transition-all">
                Détails
              </button>
            </Link>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500">Aucun service mis en avant pour le moment.</p>
    )}
  </div>
</section>

        {/* Articles mis en avant */}
        <section className="max-w-6xl mx-auto my-28" data-aos="fade-up">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Articles en Vedette</h2>
            <Link href="/blog" className="text-brandOrange font-medium hover:underline">
              Tous les articles →
            </Link>
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.length > 0 ? (
              featuredArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="p-8 bg-white shadow-lg rounded-xl border border-gray-200 hover:shadow-2xl transition-shadow"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <h3 className="text-xl font-bold text-gray-700">{article.titre}</h3>
                  <p className="text-gray-600 mt-4">{stripTags(article.contenu).slice(0, 120)}...</p>
                  <Link href={`/blog/${article.id}`}>
                    <button className="mt-6 px-6 py-3 bg-[var(--accent)] text-white rounded-full hover:bg-brandOrange/90 transition-all">
                      Lire l'article
                    </button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aucun article mis en avant pour le moment.</p>
            )}
          </div>
        </section>

        <CTASection
          title="Prêt à commencer votre voyage ?"
          description="Rejoignez notre communauté et transformez votre vie dès aujourd'hui !"
          buttonText="S'abonner à la newsletter"
          buttonLink="/contact"
        />
      </main>
      <Footer />
    </>
  );
}