"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/propos", label: "À propos" },
    { href: "/services", label: "Services" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const linkClass = (href) =>
    `text-sm font-semibold transition rounded px-0.5 ${
      pathname === href
        ? "text-terra"
        : "text-ink-soft hover:text-forest"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-sand-200/70 bg-cream/85 backdrop-blur">
      <nav className="container-soft flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/logoterra.png"
            alt="Logo Terrasigne"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-contain"
          />
          <span className="font-display text-xl font-semibold text-forest">
            Terrasigne
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          <Link href="/rendez-vous" className="btn btn-primary !py-2.5">
            Prendre rendez-vous
          </Link>
        </div>

        <button
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="md:hidden rounded p-1 text-forest"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`md:hidden absolute top-full left-0 w-full origin-top border-t border-sand-200/70 bg-cream shadow-xl transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto py-6"
            : "opacity-0 -translate-y-4 pointer-events-none py-0"
        }`}
      >
        <div className="container-soft flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={toggleMenu}
              className={`rounded-xl px-3 py-3 text-base font-bold transition ${
                pathname === link.href
                  ? "bg-sage-100 text-forest"
                  : "text-ink-soft hover:bg-forest-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/rendez-vous"
            onClick={toggleMenu}
            className="btn btn-primary mt-2"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </div>
    </header>
  );
}
