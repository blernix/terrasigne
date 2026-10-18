"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import CarrouselSection from "./CarrouselSection";
import { Calendar, Sparkles } from "lucide-react";

interface CarrouselImage {
  id: number;
  images?: {
    filename_disk?: string;
    title?: string;
  };
}

export default function HeroSection({ images }: { images: CarrouselImage[] }) {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CarrouselSection images={images} />
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-black/10 to-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container-soft relative z-10 mx-auto max-w-3xl text-center"
      >
        <span className="eyebrow !bg-cream/15 !text-cream backdrop-blur-sm">
          <Sparkles size={14} />
          Bienvenue sur Terrasigne
        </span>

        <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-cream [text-shadow:0_2px_18px_rgba(0,0,0,0.6)] md:text-6xl">
          Soins holistiques en Guadeloupe, en présentiel et{" "}
          <span className="italic">à distance</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cream/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.55)]">
          Se relier à SOI pour vivre l&rsquo;équiLIBRE et la joie D&rsquo;ETRE
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/rendez-vous" className="btn btn-violet">
            <Calendar size={18} />
            Prendre rendez-vous
          </Link>
          <Link
            href="/services"
            className="btn border border-cream/30 bg-white/10 text-cream backdrop-blur-sm hover:bg-white/20"
          >
            Découvrir mes services
          </Link>
        </div>

        <p className="mt-6 text-sm text-cream/85">
          <Link
            href="/seances-a-distance"
            className="underline decoration-cream/40 underline-offset-4 transition hover:text-cream hover:decoration-cream"
          >
            Ou découvrez les séances à distance, en visio
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
