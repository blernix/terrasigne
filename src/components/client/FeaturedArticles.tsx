import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { stripHtml } from "@/lib/utils";

interface Article {
  id: number;
  titre: string;
  contenu: string;
  couverture?: string;
}

export default function FeaturedArticles({ articles }: { articles: Article[] }) {
  return (
    <section className="section bg-cream">
      <div className="container-soft">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Le journal</span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest md:text-4xl">
              Articles en vedette
            </h2>
          </div>
          <Link href="/blog" className="link-underline inline-flex items-center gap-1.5">
            Tous les articles
            <ArrowRight size={16} />
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.id}`}
                className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={article.couverture || "/images/default-cover.jpg"}
                    alt={article.titre}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold text-forest">
                    {article.titre}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                    {stripHtml(article.contenu).slice(0, 120)}…
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-violet">
                    Lire l&rsquo;article
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">
            Aucun article mis en avant pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}
