"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import CarrouselSection from "./CarrouselSection";

interface CarrouselImage {
  id: number;
  images?: {
    filename_disk?: string;
    title?: string;
  };
}

export default function HeroSection({ images }: { images: CarrouselImage[] }) {
  return (
<section className="relative w-full h-[calc(100vh)] flex items-center justify-center text-center overflow-hidden">      <div className="absolute inset-0 z-0 opacity-100">
        <CarrouselSection images={images} />
      </div>

      {/* 🌟 Texte au-dessus */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 px-6"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
          Bienvenue sur <span className="text-brandOrange font-extrabold">Terrasigne</span>
        </h1>
        <p className="text-lg text-white font-bold mt-6 max-w-2xl mx-auto">
          Se relier à SOI pour vivre l'équiLIBRE et la joie D'ETRE
        </p>
        <Link href="/services" className="inline-block mt-8">
          <button className="px-8 py-4 bg-[var(--primary)] text-white text-lg font-medium rounded-full shadow-md hover:shadow-lg hover:bg-brandSecondary/90 transition-all">
            Découvrir mes services
          </button>
        </Link>
      </motion.div>
    </section>
  );
}