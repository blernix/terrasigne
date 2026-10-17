import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Phone, MapPin } from "lucide-react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { getServiceBySlug, getServiceSlugs } from "@/lib/directus";
import { stripHtml, stripEmoji } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getServiceSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

function absoluteImage(url?: string) {
  if (!url) return "https://terrasigne.fr/images/hero_service.jpg";
  return url.startsWith("http") ? url : `https://terrasigne.fr${url}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => null);
  if (!service) return { title: "Service introuvable" };

  const titre = stripEmoji(service.titre);
  const description =
    stripHtml(service.description || "").slice(0, 160) ||
    `${titre} : séance de bien-être à Terre-de-Bas, Guadeloupe.`;
  const image = absoluteImage(service.categorie?.couverture);

  return {
    title: titre,
    description,
    openGraph: {
      title: `${titre} | Terrasigne`,
      description,
      url: `https://terrasigne.fr/services/${slug}`,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: titre }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titre} | Terrasigne`,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `https://terrasigne.fr/services/${slug}` },
  };
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => null);
  if (!service) notFound();

  const titre = stripEmoji(service.titre);
  const categorie = stripEmoji(service.categorie?.titre || "");
  const serviceUrl = `https://terrasigne.fr/services/${slug}`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: titre,
    description: stripHtml(service.description || "").slice(0, 300),
    serviceType: categorie,
    url: serviceUrl,
    provider: { "@id": "https://terrasigne.fr/#business" },
    areaServed: { "@type": "Place", name: "Guadeloupe" },
    ...(service.prix
      ? {
          offers: {
            "@type": "Offer",
            price: String(service.prix),
            priceCurrency: "EUR",
            url: serviceUrl,
          },
        }
      : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://terrasigne.fr" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://terrasigne.fr/services" },
      { "@type": "ListItem", position: 3, name: titre, item: serviceUrl },
    ],
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-cream pb-20 pt-28">
        <JsonLd data={serviceJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />

        <div className="container-soft max-w-3xl">
          <nav className="text-sm text-muted" aria-label="Fil d'Ariane">
            <Link href="/services" className="transition hover:text-forest">
              Services
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink-soft">{categorie}</span>
          </nav>

          <header className="mt-6">
            {categorie && <span className="eyebrow">{categorie}</span>}
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-forest md:text-4xl">
              {titre}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2.5 text-sm">
              {service.duree ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1 font-semibold text-forest">
                  <Clock size={15} /> {service.duree} min
                </span>
              ) : null}
              {service.prix ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-terra-100 px-3 py-1 font-semibold text-forest">
                  {service.prix} €
                </span>
              ) : null}
              {service.mode_rdv?.length ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 font-semibold text-ink-soft">
                  <MapPin size={15} /> {service.mode_rdv.join(" · ")}
                </span>
              ) : null}
            </div>
          </header>

          <section className="card mt-10 p-6 md:p-10">
            {service.description ? (
              <div
                className="service-richtext"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
            ) : (
              <p className="text-ink-soft">
                Description à venir. Contactez-moi pour en savoir plus sur cette
                prestation.
              </p>
            )}
          </section>

          <section className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
            {service.rendez_vous ? (
              <Link
                href={`/rendez-vous?service=${service.id}`}
                className="btn btn-primary w-full sm:w-auto"
              >
                <Calendar size={17} />
                Prendre rendez-vous
              </Link>
            ) : (
              <Link href="/contact" className="btn btn-primary w-full sm:w-auto">
                <Phone size={17} />
                Me contacter
              </Link>
            )}
            <Link href="/services" className="btn btn-ghost w-full sm:w-auto">
              ← Tous les services
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
