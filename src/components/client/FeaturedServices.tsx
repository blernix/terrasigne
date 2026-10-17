import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { stripHtml, createSlug } from "@/lib/utils";

interface Service {
  id: number;
  titre: string;
  description: string;
  prix: number;
  categorie: {
    titre: string;
  };
}

export default function FeaturedServices({ services }: { services: Service[] }) {
  return (
    <section className="section bg-sand/40">
      <div className="container-soft">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Prestations</span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest md:text-4xl">
              Services mis en avant
            </h2>
          </div>
          <Link href="/services" className="link-underline inline-flex items-center gap-1.5">
            Tous les services
            <ArrowRight size={16} />
          </Link>
        </div>

        {services.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="card flex flex-col p-7 transition hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="eyebrow self-start">
                  {service.categorie?.titre || "Service"}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-forest">
                  {service.titre}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {stripHtml(service.description).length > 160
                    ? stripHtml(service.description).substring(0, 160) + "…"
                    : stripHtml(service.description)}
                </p>
                <p className="mt-5 font-display text-2xl font-semibold text-violet">
                  {service.prix ? `${service.prix} €` : ""}
                </p>
                <Link
                  href={`/services?service=${service.id}#category-${createSlug(
                    service.categorie.titre
                  )}`}
                  className="btn btn-primary mt-5 w-full"
                >
                  Voir le détail
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">Aucun service mis en avant pour le moment.</p>
        )}
      </div>
    </section>
  );
}
