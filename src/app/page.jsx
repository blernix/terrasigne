"use client";

import { useEffect, useState } from "react";
import { ParallaxBanner } from "react-scroll-parallax";
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
  const [loading, setLoading] = useState(true);
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
        setFeaturedArticles(Array.isArray(articlesData.articles) ? articlesData.articles : []);
      } catch (error) {
        console.error("Erreur chargement des données :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      AOS.init({
        duration: 1200,
        easing: "ease-in-out",
        once: true,
        anchorPlacement: "top-bottom",
      });
    }
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <HeroSection images={images} />

        <ParallaxBanner
          layers={[
            {
              speed: -30,
              children: (
                <div className="absolute inset-0 bg-white" />
              ),
            },
            {
              speed: -20,
              children: (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/images/logoterra.png"
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
                  <img
                    src="/images/feuilles.png"
                    alt="Feuilles décoratives"
                    className="absolute top-32 left-20 w-24 opacity-20"
                  />
                  <img
                    src="/images/feuilles.png"
                    alt="Feuilles décoratives"
                    className="absolute bottom-32 right-20 w-24 opacity-20"
                  />
                  <img
                    src="/images/feuilles.png"
                    alt="Feuilles décoratives"
                    className="absolute top-64 right-32 w-20 opacity-20"
                  />
                  <img
                    src="/images/feuilles.png"
                    alt="Feuilles décoratives"
                    className="absolute bottom-64 left-32 w-20 opacity-20"
                  />
                </>
              ),
            },
          ]}
          className="w-full"
        >
          <main id="main-content" className="relative w-full">
            <div className="relative mx-auto max-w-2xl text-center mt-20 px-4">
              <p className="text-lg italic text-gray-600 font-light leading-relaxed relative before:absolute before:content-['“'] before:text-5xl before:-top-6 before:-left-4 before:text-brandOrange after:absolute after:content-['”'] after:text-5xl after:-bottom-6 after:-right-4 after:text-brandOrange">
                La satisfaction intérieure est en vérité ce que nous pouvons espérer de plus grand.
              </p>
              <p className="text-sm text-gray-500 mt-2">– Baruch Spinoza / Ethique</p>
            </div>
            <FeaturedServices services={featuredServices} />
            <FeaturedArticles articles={featuredArticles} />
            <CTASection
              title="Explorez votre véritable potentiel"
              description="Reconnecte-toi à toi-même et vis l&rsquo;équilibre naturel de ton être. Commence ta transformation avec Terrasigne."
            />
          </main>
        </ParallaxBanner>

      <Footer />
    </>
  );
}
