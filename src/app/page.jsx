"use client";

import { useEffect, useState } from "react";
import { ParallaxBanner, ParallaxProvider } from "react-scroll-parallax";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import CTASection from "@/components/common/CTASection";
import HeroSection from "@/components/client/HeroSection";
import FeaturedServices from "@/components/client/FeaturedServices";
import FeaturedArticles from "@/components/client/FeaturedArticles";

export default function Page() {
  const [images, setImages] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const carrouselResponse = await fetch("/api/carrousel");
        const carrouselData = await carrouselResponse.json();
        setImages(carrouselData);

        const servicesResponse = await fetch("/api/services?featured=true");
        const servicesData = await servicesResponse.json();
        setFeaturedServices(servicesData);

        const articlesResponse = await fetch("/api/blog?featured=true");
        const articlesData = await articlesResponse.json();
        setFeaturedArticles(articlesData);
      } catch (error) {
        console.error("❌ Erreur chargement des données :", error);
      }
    }

    fetchData();
    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: false,
      anchorPlacement: "top-bottom",
    });
  }, []);

  return (
    <>
      <Navbar />

      {/* 🌟 Hero Section */}
      <HeroSection images={images} />

      {/* 🌟 Parallax Content */}
      <ParallaxProvider>
        <ParallaxBanner
          layers={[
            {
              speed: -30,
              children: (
                // <div className="absolute inset-0 bg-[var(--secondary)]" />
                <div className="absolute inset-0 bg-white" />
              ),
            },
            {
              speed: -20,
              children: (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/images/logot.png"
                    alt="Terrasigne Background Logo"
                    className="w-1/2 md:w-1/3 opacity-50"
                  />
                </div>
              ),
            },
            {
              speed: -10,
              children: (
                <>
                  {/* 🌿 Feuilles réparties avec plus d'élégance */}
                  <img
                    src="/images/feuilles.png"
                    alt="Feuilles"
                    className="absolute top-32 left-20 w-24 opacity-20"
                  />
                  <img
                    src="/images/feuilles.png"
                    alt="Feuilles"
                    className="absolute bottom-32 right-20 w-24 opacity-20"
                  />
                  <img
                    src="/images/feuilles.png"
                    alt="Feuilles"
                    className="absolute top-64 right-32 w-20 opacity-20"
                  />
                  <img
                    src="/images/feuilles.png"
                    alt="Feuilles"
                    className="absolute bottom-64 left-32 w-20 opacity-20"
                  />
                </>
              ),
            },
          ]}
          className="w-full"
        >
          <main className="relative w-full">
            <FeaturedServices services={featuredServices} />
            <FeaturedArticles articles={featuredArticles} />
            <CTASection
              title="Explorez votre véritable potentiel"
              description="Reconnecte-toi à toi-même et vis l’équilibre naturel de ton être. Commence ta transformation avec Terrasigne."
            
            />
          </main>
        </ParallaxBanner>
      </ParallaxProvider>

      <Footer />
    </>
  );
}