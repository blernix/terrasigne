"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY) {
          setShowNavbar(false);
        } else {
          setShowNavbar(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const linkClass = (href) =>
    `transition focus:ring-2 focus:ring-brandPurple focus:ring-offset-2 rounded px-1 ${
      pathname === href ? "text-brandOrange font-semibold" : "text-gray-700 hover:text-brandOrange"
    }`;

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/propos", label: "À propos" },
    { href: "/services", label: "Services" },
    { href: "/rendez-vous", label: "Réservation" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-white/90 border-b border-white/20 shadow-sm transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto p-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2 focus:ring-2 focus:ring-brandPurple rounded">
          <Image
            src="/images/logoterra.png"
            alt="Logo Terrasigne"
            width={50}
            height={50}
            className="object-contain"
          />
          <span className="text-2xl font-bold text-gray-800">Terrasigne</span>
        </Link>

        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="md:hidden text-gray-700 hover:text-brandOrange focus:ring-2 focus:ring-brandPurple rounded p-1"
        >
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`md:hidden absolute top-full left-0 w-full bg-white/95 border-t border-white/20 shadow-2xl flex flex-col items-center space-y-6 transform transition-all duration-500 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto py-8 ease-out"
            : "opacity-0 -translate-y-6 pointer-events-none py-0 ease-in"
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-lg font-bold transition focus:ring-2 focus:ring-brandPurple rounded px-2 ${
              pathname === link.href ? "text-brandOrange" : "text-black hover:text-brandOrange"
            }`}
            onClick={toggleMenu}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
