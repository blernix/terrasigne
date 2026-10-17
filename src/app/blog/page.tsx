import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import JsonLd from "@/components/seo/JsonLd";
import BlogExplorer from "./BlogExplorer";
import { getArticles, getArticleCategories } from "@/lib/directus";

export const revalidate = 300;

export const metadata = {
  title: "Blog & témoignages",
  description:
    "Explorez des articles inspirants sur le bien-être, les parcours de transformation et la connaissance de soi.",
  openGraph: {
    title: "Blog | Terrasigne",
    description:
      "Articles, témoignages et réflexions autour de l’équilibre intérieur et du chemin personnel.",
    url: "https://terrasigne.fr/blog",
    type: "website",
    images: [
      {
        url: "https://terrasigne.fr/images/hero_blog.jpg",
        width: 1200,
        height: 630,
        alt: "Blog Terrasigne",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Terrasigne",
    description:
      "Découvrez les publications du blog Terrasigne, tournées vers la quête d’équilibre personnel.",
    images: ["https://terrasigne.fr/images/hero_blog.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://terrasigne.fr/blog" },
};

export default async function BlogPage() {
  const [articles, categories] = await Promise.all([
    getArticles().catch(() => []),
    getArticleCategories().catch(() => []),
  ]);

  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-cream">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://terrasigne.fr" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://terrasigne.fr/blog" },
            ],
          }}
        />

        <section className="relative flex min-h-[70svh] items-center overflow-hidden bg-forest">
          <img
            src="/images/hero_blog.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/80 to-forest/50" />

          <div className="container-soft relative z-10 grid items-center gap-12 py-28 lg:grid-cols-[1fr_0.8fr]">
            <div className="text-center lg:text-left">
              <span className="eyebrow !bg-cream/15 !text-cream">Le journal</span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-cream md:text-6xl">
                Blog <span className="italic text-violet">Terrasigne</span> :
                bien-être &amp; équilibre intérieur
              </h1>
              <p className="mx-auto mt-6 max-w-xl leading-relaxed text-cream/85 lg:mx-0">
                Retrouvez des articles, témoignages pour partager, découvrir,
                mieux se connaître SOI et évoluer ensemble vers plus
                d&rsquo;équiLIBRE.
              </p>
            </div>

            <div className="justify-self-center">
              <div className="aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-t-[140px] rounded-b-4xl ring-8 ring-cream/15 shadow-2xl sm:max-w-xs">
                <img
                  src="/images/hero_blog.png"
                  alt="Illustration du blog Terrasigne"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <BlogExplorer articles={articles} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
