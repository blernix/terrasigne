import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-sage-200 text-forest-700">
      <div className="container-soft grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold">Terrasigne</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            Accompagnement bien-être, soins énergétiques et relation d&rsquo;aide
            avec Cindy Guillaume, praticienne en soins holistiques à Terre de Bas,
            Guadeloupe.
          </p>
          <p className="mt-4 text-xs text-forest/70">
            Les pratiques proposées sont complémentaires et ne remplacent pas un
            avis médical.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-forest/70">
            Navigation
          </p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <Link href="/" className="text-forest transition hover:text-forest-700 hover:underline">
              Accueil
            </Link>
            <Link href="/services" className="text-cream/85 transition hover:text-white">
              Services & prestations
            </Link>
            <Link href="/rendez-vous" className="text-cream/85 transition hover:text-white">
              Prendre rendez-vous
            </Link>
            <Link href="/blog" className="text-cream/85 transition hover:text-white">
              Blog
            </Link>
            <Link href="/propos" className="text-cream/85 transition hover:text-white">
              À propos
            </Link>
            <Link href="/confidentialite" className="text-cream/85 transition hover:text-white">
              Confidentialité
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-forest/70">
            Contact
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <span className="inline-flex items-center gap-2.5 text-forest">
              <MapPin size={16} className="text-forest" />
              Terre de Bas, Guadeloupe
            </span>
            <a
              href="mailto:terrasigne971@gmail.com"
              className="inline-flex items-center gap-2.5 text-forest transition hover:text-forest-700 hover:underline"
            >
              <Mail size={16} className="text-forest" />
              terrasigne971@gmail.com
            </a>
            <a
              href="https://wa.me/590690516851"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-cream/85 transition hover:text-white"
            >
              <Phone size={16} className="text-forest" />
              +590 690 51 68 51
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-forest/15">
        <p className="container-soft py-5 text-center text-xs text-forest/70">
          &copy; {year} Terrasigne. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
