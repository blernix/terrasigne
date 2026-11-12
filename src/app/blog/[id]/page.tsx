import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { getArticle, getArticleIds } from "@/lib/directus";
import { stripHtml } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const ids = await getArticleIds().catch(() => []);
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id).catch(() => null);
  if (!article) return { title: "Article introuvable" };

  const description =
    stripHtml(article.contenu || "").slice(0, 160) || article.titre;
  const image = article.couverture || "https://terrasigne.fr/images/hero_blog.jpg";

  return {
    title: article.titre,
    description,
    authors: [{ name: "Cindy Guillaume", url: "https://terrasigne.fr/propos" }],
    openGraph: {
      title: article.titre,
      description,
      type: "article",
      url: `https://terrasigne.fr/blog/${id}`,
      publishedTime: article.date_created,
      authors: ["Cindy Guillaume"],
      images: [{ url: image, width: 1200, height: 630, alt: article.titre }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.titre,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `https://terrasigne.fr/blog/${id}` },
  };
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id).catch(() => null);
  if (!article) notFound();

  const articleUrl = `https://terrasigne.fr/blog/${id}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.titre,
    description: stripHtml(article.contenu || "").slice(0, 160),
    image: article.couverture || "https://terrasigne.fr/images/hero_blog.jpg",
    datePublished: article.date_created,
    dateModified: article.date_updated || article.date_created,
    articleSection: article.categorie,
    inLanguage: "fr-FR",
    author: {
      "@type": "Person",
      name: "Cindy Guillaume",
      url: "https://terrasigne.fr/propos",
    },
    publisher: { "@id": "https://terrasigne.fr/#business" },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://terrasigne.fr" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://terrasigne.fr/blog" },
      { "@type": "ListItem", position: 3, name: article.titre, item: articleUrl },
    ],
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-cream pb-20 pt-28">
        <JsonLd data={articleJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <article className="container-soft max-w-3xl">
          <nav className="text-sm text-muted" aria-label="Fil d'Ariane">
            <Link href="/blog" className="transition hover:text-forest">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink-soft">{article.titre}</span>
          </nav>

          <h1 className="mt-6 font-display text-3xl font-semibold leading-tight text-forest md:text-5xl">
            {article.titre}
          </h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Publié le {new Date(article.date_created).toLocaleDateString("fr-FR")}
          </p>

          {article.couverture && (
            <img
              src={article.couverture}
              alt={article.titre}
              className="mt-8 w-full rounded-4xl object-cover shadow-soft"
            />
          )}

          <div
            className="editor-blog mt-10"
            dangerouslySetInnerHTML={{ __html: article.contenu }}
          />

          <div className="mt-14 border-t border-sand-200 pt-8 text-center">
            <Link href="/blog" className="btn btn-ghost">
              ← Tous les articles
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
