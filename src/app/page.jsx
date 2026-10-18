import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import CTASection from "@/components/common/CTASection";
import HeroSection from "@/components/client/HeroSection";
import FeaturedServices from "@/components/client/FeaturedServices";
import FeaturedArticles from "@/components/client/FeaturedArticles";
import { getCarrousel, getFeaturedServices, getArticles } from "@/lib/directus";

export const revalidate = 300;

export const metadata = {
  title: { absolute: "Terrasigne | Soins holistiques & bien-être en Guadeloupe" },
  description:
    "Terrasigne, espace bien-être à Terre-de-Bas (Guadeloupe) : soins holistiques, relation d'aide et accompagnement personnalisé pour retrouver votre équilibre.",
  alternates: { canonical: "https://terrasigne.fr" },
  openGraph: {
    title: "Terrasigne | Soins holistiques & bien-être en Guadeloupe",
    description:
      "Explore ton équilibre intérieur avec Terrasigne. Soins holistiques, accompagnement personnalisé et bien-être en Guadeloupe.",
    url: "https://terrasigne.fr",
    type: "website",
  },
};

export default async function Page() {
  const [images, featuredServices, featuredArticles] = await Promise.all([
    getCarrousel().catch(() => []),
    getFeaturedServices().catch(() => []),
    getArticles({ featured: true }).catch(() => []),
  ]);

  return (
    <>
      <Navbar />

      <main id="main-content">
        <HeroSection images={images} />

        <section className="section bg-cream">
          <div className="container-soft mx-auto max-w-3xl text-center">
            <span className="font-display text-4xl text-violet">&ldquo;</span>
            <p className="font-display text-xl italic leading-relaxed text-forest md:text-2xl">
              La satisfaction intérieure est en vérité ce que nous pouvons espérer
              de plus grand.
            </p>
            <p className="mt-4 text-sm text-muted">– Baruch Spinoza, Éthique</p>
          </div>
        </section>

        <FeaturedServices services={featuredServices} />
        <FeaturedArticles articles={featuredArticles} />

        <CTASection
          title="Explorez votre véritable potentiel"
          description={"Reconnecte-toi à toi-même et vis l’équilibre naturel de ton être.\nCommence ta transformation avec Terrasigne."}
        />
      </main>

      <Footer />
    </>
  );
}
