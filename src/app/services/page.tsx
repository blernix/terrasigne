import Link from "next/link";
import { Phone } from "lucide-react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import JsonLd from "@/components/seo/JsonLd";
import ServicesExplorer from "./ServicesExplorer";
import { getServiceCategories } from "@/lib/directus";
import { stripHtml } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Services & soins holistiques",
  description:
    "Explorez les prestations de Terrasigne : soins relationnels, corporels et énergétiques, adaptés à vos besoins. Séances à Terre-de-Bas, Guadeloupe.",
  openGraph: {
    title: "Services | Terrasigne",
    description:
      "Séances de bien-être, accompagnement personnalisé, énergies et écoute. Découvrez les services proposés.",
    url: "https://terrasigne.fr/services",
    type: "website",
    images: [
      {
        url: "https://terrasigne.fr/images/hero_service.jpg",
        width: 1200,
        height: 630,
        alt: "Illustration Services Terrasigne",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | Terrasigne",
    description: "Découvrez les accompagnements personnalisés proposés par Terrasigne.",
    images: ["https://terrasigne.fr/images/hero_service.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://terrasigne.fr/services" },
};

export default async function ServicesPage() {
  const serviceCategories = await getServiceCategories().catch(() => []);

  const serviceListJsonLd = serviceCategories.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: serviceCategories.flatMap((cat: any, catIndex: number) =>
          cat.services.map((svc: any, serviceIndex: number) => ({
            "@type": "ListItem",
            position: catIndex * 100 + serviceIndex + 1,
            item: {
              "@type": "Service",
              name: svc.titre,
              description: stripHtml(svc.description || "").slice(0, 300),
              serviceType: cat.category,
              provider: { "@id": "https://terrasigne.fr/#business" },
              areaServed: { "@type": "Place", name: "Guadeloupe" },
              ...(svc.prix
                ? {
                    offers: {
                      "@type": "Offer",
                      price: String(svc.prix),
                      priceCurrency: "EUR",
                    },
                  }
                : {}),
            },
          }))
        ),
      }
    : null;

  return (
    <>
      <Navbar />
      <main id="main-content" className="overflow-x-hidden bg-cream">
        {serviceListJsonLd && <JsonLd data={serviceListJsonLd} />}

        <section className="relative flex min-h-[90svh] items-center overflow-hidden bg-forest">
          <img
            src="/images/hero_service.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/80 to-forest/50" />

          <div className="container-soft relative z-10 grid items-center gap-12 py-28 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <span className="eyebrow !bg-cream/15 !text-cream">
                Prestations & accompagnements
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-cream md:text-6xl">
                Mes services de{" "}
                <span className="italic text-terra">bien-être</span> en
                Guadeloupe
              </h1>
              <p className="mx-auto mt-6 max-w-xl leading-relaxed text-cream/85 lg:mx-0">
                Découvrez un ensemble de prestations alliant techniques
                relationnelles, corporelles et énergétiques, adaptées à vos
                besoins.
              </p>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-cream/85 lg:mx-0">
                Laisse toi guider, je te propose d&rsquo;évaluer la pratique qui
                te convient.
              </p>
              <Link href="/contact" className="btn btn-terra mt-8">
                <Phone size={17} />
                Rendez-vous conseil gratuit
              </Link>
            </div>

            <div className="justify-self-center">
              <div className="aspect-[3/4] w-full max-w-xs overflow-hidden rounded-t-[180px] rounded-b-4xl ring-8 ring-cream/15 shadow-2xl sm:max-w-sm">
                <img
                  src="/images/hero_service.png"
                  alt="Cindy, praticienne Terrasigne"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-cream">
          <div className="container-soft mx-auto max-w-2xl text-center">
            <p className="font-display text-xl italic leading-relaxed text-forest md:text-2xl">
              Chacun a la responsabilité de faire croître la paix en lui afin que
              la paix devienne générale.
            </p>
            <p className="mt-3 text-sm text-muted">– Le Dalaï Lama</p>
          </div>
        </section>

        <ServicesExplorer initialCategories={serviceCategories} />
      </main>
      <Footer />
    </>
  );
}
