"use client";
import Link from "next/link";

function stripTagsAndDecode(html: string) {
  const text = html.replace(/<[^>]+>/g, "");
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

interface Article {
  id: number;
  titre: string;
  contenu: string;
  couverture?: string;
}

export default function FeaturedArticles({ articles }: { articles: Article[] }) {
  return (
    <section className="max-w-6xl mx-auto my-28 min-h-screen w-full px-8 py-16" data-aos="fade-up">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800">Articles en Vedette</h2>
        <Link href="/blog" className="text-brandOrange font-medium hover:underline">
          Tous les articles →
        </Link>
      </div>
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <div
              key={article.id}
              className="flex flex-col justify-between h-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <img
                src={article.couverture || "/images/default-cover.jpg"}
                alt={article.titre}
                className="w-full aspect-video object-cover"
                loading="lazy"
              />
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold text-gray-700 mb-4">{article.titre}</h3>
                <p className="text-gray-600 mb-6">
                  {stripTagsAndDecode(article.contenu).slice(0, 120)}...
                </p>
                <div className="mt-auto">
                  <Link href={`/blog/${article.id}`}>
                    <button className="w-full px-6 py-3 bg-[var(--accent)] text-white rounded-full hover:bg-brandOrange/90 transition-all">
                      Lire l'article
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucun article mis en avant pour le moment.</p>
        )}
      </div>
    </section>
  );
}