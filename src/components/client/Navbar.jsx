"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <nav className="bg-gray-50 shadow-md z-50 relative">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-brandPurple">
          Terrasigne
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden text-gray-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                isOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Desktop Links */}
        <div className="hidden sm:flex sm:items-center sm:space-x-6">
          <Link href="/" className="text-gray-800 hover:text-brandPurple transition">Accueil</Link>
          <Link href="/services" className="text-gray-800 hover:text-brandPurple transition">Services</Link>
          <Link href="/blog" className="text-gray-800 hover:text-brandPurple transition">Blog</Link>
          <Link href="/contact" className="text-gray-800 hover:text-brandPurple transition">Contact</Link>
          <Link href="/propos" className="text-gray-800 hover:text-brandPurple transition">À propos</Link>
          <Link href="/rendez-vous" className="text-gray-800 hover:text-brandPurple transition">Réservation</Link>
        </div>
      </div>

      {/* Mobile Links (animated) */}
      <div
        className={`sm:hidden px-4 pb-4 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4">
          <Link href="/" onClick={handleLinkClick} className="text-gray-800 hover:text-brandPurple transition">Accueil</Link>
          <Link href="/services" onClick={handleLinkClick} className="text-gray-800 hover:text-brandPurple transition">Services</Link>
          <Link href="/blog" onClick={handleLinkClick} className="text-gray-800 hover:text-brandPurple transition">Blog</Link>
          <Link href="/contact" onClick={handleLinkClick} className="text-gray-800 hover:text-brandPurple transition">Contact</Link>
          <Link href="/propos" onClick={handleLinkClick} className="text-gray-800 hover:text-brandPurple transition">À propos</Link>
          <Link href="/rendez-vous" onClick={handleLinkClick} className="text-gray-800 hover:text-brandPurple transition">Réservation</Link>
        </div>
      </div>
    </nav>
  );
}