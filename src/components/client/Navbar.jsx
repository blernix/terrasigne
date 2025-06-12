"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY) {
          // Vers le bas -> cache la navbar
          setShowNavbar(false);
        } else {
          // Vers le haut -> montre la navbar
          setShowNavbar(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/30 border-b border-white/20 shadow-sm transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto p-4 md:px-8">
        {/* 🌟 Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logot.png"
            alt="Logo Terrasigne"
            width={50}
            height={50}
            className="object-contain"
          />
          <span className="text-2xl font-bold text-gray-800">Terrasigne</span>
        </Link>

        {/* 🌟 Menu Desktop */}
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-brandOrange transition">Accueil</Link>
          <Link href="/propos" className="text-gray-700 hover:text-brandOrange transition">À propos</Link>
          <Link href="/services" className="text-gray-700 hover:text-brandOrange transition">Services</Link>
          <Link href="/rendez-vous" className="text-gray-700 hover:text-brandOrange transition">Réservation</Link>
          <Link href="/blog" className="text-gray-700 hover:text-brandOrange transition">Blog</Link>
          <Link href="/contact" className="text-gray-700 hover:text-brandOrange transition">Contact</Link>
        </div>

        {/* 🌟 Bouton Burger Mobile */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 hover:text-brandOrange focus:outline-none"
        >
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </nav>

      {/* 🌟 Menu Mobile (toujours présent pour permettre l'animation) */}
      <div
        className={`md:hidden absolute top-full left-0 w-full backdrop-blur-3xl bg-white/80 border-t border-white/20 shadow-2xl flex flex-col items-center space-y-6 transform transition-all duration-500 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto py-8 ease-out"
            : "opacity-0 -translate-y-6 pointer-events-none py-0 ease-in"
        }`}
      >
        <Link href="/" className="text-gray-700 hover:text-brandOrange text-lg" onClick={toggleMenu}>
          Accueil
        </Link>
        <Link href="/propos" className="text-gray-700 hover:text-brandOrange text-lg" onClick={toggleMenu}>
          À propos
        </Link>
        <Link href="/services" className="text-gray-700 hover:text-brandOrange text-lg" onClick={toggleMenu}>
          Services
        </Link>
        <Link href="/rendez-vous" className="text-gray-700 hover:text-brandOrange text-lg" onClick={toggleMenu}>
          Réservation
        </Link>
        <Link href="/blog" className="text-gray-700 hover:text-brandOrange text-lg" onClick={toggleMenu}>
          Blog
        </Link>
        <Link href="/contact" className="text-gray-700 hover:text-brandOrange text-lg" onClick={toggleMenu}>
          Contact
        </Link>
      </div>
    </header>
  );
}