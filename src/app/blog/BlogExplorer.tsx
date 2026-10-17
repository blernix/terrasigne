"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { stripHtml } from "@/lib/utils";
import { Search, ArrowRight } from "lucide-react";

interface Article {
  id: number;
  titre: string;
  contenu: string;
  couverture?: string;
  categorie?: string;
  date_created?: string;
}

interface Category {
  id: number;
  titre: string;
}

const FETCH_PER_BATCH = 6;
const BATCHES_PER_PAGE = 2;

export default function BlogExplorer({
  articles,
  categories,
}: {
  articles: Article[];
  categories: Category[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [paginationPage, setPaginationPage] = useState<number>(1);
  const [offsetCycle, setOffsetCycle] = useState<number>(1);

  const articlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPaginationPage(1);
    setOffsetCycle(1);
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    const onScroll = () => {
      if (
        offsetCycle === 1 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200
      ) {
        setOffsetCycle(2);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [offsetCycle]);

  useEffect(() => {
    setOffsetCycle(1);
    articlesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [paginationPage, selectedCategory, searchQuery]);

  const filtered = (Array.isArray(articles) ? articles : []).filter((a) => {
    const matchCategory =
      !selectedCategory || a.categorie === selectedCategory;
    const matchSearch =
      !debouncedSearch ||
      (a.titre || "").toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const startIndex =
    (paginationPage - 1) * (FETCH_PER_BATCH * BATCHES_PER_PAGE);
  const endIndex = startIndex + offsetCycle * FETCH_PER_BATCH;
  const displayed = filtered.slice(startIndex, endIndex);

  const pageCount = Math.ceil(
    filtered.length / (FETCH_PER_BATCH * BATCHES_PER_PAGE)
  );

  return (
    <>
      <section className="section bg-cream">
        <div className="container-soft mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold text-forest md:text-4xl">
            Trouvez ce qui vous inspire
          </h2>
          <p className="mt-3 text-ink-soft">
            Recherchez un mot-clé ou explorez les catégories.
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Rechercher un article…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field pl-11"
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => setSelectedCategory("")}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                selectedCategory === ""
                  ? "bg-forest text-cream"
                  : "border border-sand-200 bg-white text-ink-soft hover:border-sage"
              }`}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.titre)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  selectedCategory === cat.titre
                    ? "bg-forest text-cream"
                    : "border border-sand-200 bg-white text-ink-soft hover:border-sage"
                }`}
              >
                {cat.titre}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div ref={articlesRef} className="scroll-mt-24 bg-sand/20 pb-20">
        <section className="container-soft grid gap-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="wait">
            {displayed.map((article) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-soft"
              >
                {article.couverture && (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={article.couverture}
                      alt={article.titre}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-semibold text-forest">
                    {article.titre}
                  </h2>
                  {article.date_created && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      {new Date(article.date_created).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                    {stripHtml(article.contenu)
                      .split(" ")
                      .slice(0, article.couverture ? 20 : 90)
                      .join(" ")}
                    …
                  </p>
                  <Link
                    href={`/blog/${article.id}`}
                    className="btn btn-primary mt-6 w-full"
                  >
                    Lire l&rsquo;article
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-lg text-ink-soft">
            Aucun article trouvé pour cette recherche.
          </p>
        )}

        {pageCount > 1 && (
          <div className="mt-12 text-center">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPaginationPage(page)}
                className={`mx-1 h-10 w-10 rounded-full text-sm font-bold transition ${
                  paginationPage === page
                    ? "bg-forest text-cream"
                    : "border border-sand-200 bg-white text-ink-soft hover:border-sage"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
