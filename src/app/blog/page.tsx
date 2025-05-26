"use client";

import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogPage() {
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // pagination « classique » par blocs de 10
  const [paginationPage, setPaginationPage] = useState<number>(1);
  // cycle interne : 1 = initial (5), 2 = scroll (5)
  const [offsetCycle, setOffsetCycle] = useState<number>(1);

  const FETCH_PER_BATCH = 6;      // 5 articles par batch
  const BATCHES_PER_PAGE = 2;     // 2 batches = 10 articles par page

  const articlesRef = useRef<HTMLDivElement>(null);

  // récupérer TOUTES les catégories
  useEffect(() => {
    fetch("/api/blog/categories")
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // récupérer TOUTES les articles à chaque filtre/recherche
  useEffect(() => {
    fetch(
      `/api/blog?category=${selectedCategory}&search=${encodeURIComponent(searchQuery)}`
    )
      .then(r => r.json())
      .then(data => setAllArticles(Array.isArray(data.articles) ? data.articles : []))
      .catch(console.error)
      .finally(() => setOffsetCycle(1));
  }, [selectedCategory, searchQuery]);

  // scroll pour charger le 2ᵉ batch
  useEffect(() => {
    const onScroll = () => {
      if (
        offsetCycle === 1 &&
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200
      ) {
        setOffsetCycle(2);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [offsetCycle]);

  // on change page/catégorie/recherche : reset cycle ET scroll vers les articles
  useEffect(() => {
    setOffsetCycle(1);
    articlesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [paginationPage, selectedCategory, searchQuery]);

  // slice pour l’affichage
  const startIndex = (paginationPage - 1) * (FETCH_PER_BATCH * BATCHES_PER_PAGE);
  const endIndex = startIndex + offsetCycle * FETCH_PER_BATCH;
  const displayed = allArticles.slice(startIndex, endIndex);

  // nombre de pages
  const pageCount = Math.ceil(allArticles.length / (FETCH_PER_BATCH * BATCHES_PER_PAGE));

  const stripTagsAndDecode = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "");
    const ta = document.createElement("textarea");
    ta.innerHTML = text;
    return ta.value;
  };

   const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen mt-11">

        {/* Hero */}
    <section
          className={`relative min-h-screen flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-center gap-12 bg-cover bg-center transition-all duration-1000 ${
            scrolled ? "mx-5 rounded-3xl shadow-xl" : "mx-0"
          }`}
          style={{ backgroundImage: "url('/images/hero_blog.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-0" />

          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-8 lg:px-0 py-10 z-10">
            <div className="w-full max-h-[450px] lg:max-h-[400px] aspect-[3/5] rounded-[180px] overflow-hidden ring-8 ring-white shadow-xl mx-auto">
              <img
                src="/images/hero_blog.png"
                alt="Illustration lecture"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="max-w-xl px-6 md:px-8 py-10 text-center z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Blog <span className="text-brandOrange">Terrasigne</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              Retrouvez des articles, témoignages pour partager, découvrir, mieux se connaître SOI
              et évoluer ensemble vers plus d’<strong>équiLIBRE</strong>.
            </p>
          </div>
        </section>

        {/* Recherche & filtres */}
        <section className="py-16 px-6 mx-auto max-w-4xl">
          <div className="h-px bg-gray-200 mb-12 w-3/4 mx-auto" />
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Trouvez ce qui vous inspire</h2>
            <p className="text-gray-600">Recherchez un mot-clé ou explorez les catégories.</p>
          </div>
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPaginationPage(1); }}
            className="w-full px-6 py-3 mb-8 border rounded-full focus:ring-2 focus:ring-brandOrange"
          />
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => { setSelectedCategory(""); setPaginationPage(1); }}
              className={`px-4 py-2 rounded-full ${selectedCategory === "" ? "bg-brandOrange text-white" : "bg-gray-200"}`}
            >
              Toutes
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setPaginationPage(1); }}
                className={`px-4 py-2 rounded-full ${selectedCategory === cat.id ? "bg-brandOrange text-white" : "bg-gray-200"}`}
              >
                {cat.titre}
              </button>
            ))}
          </div>
          <div className="h-px bg-gray-200 my-12 w-3/4 mx-auto" />
        </section>

        {/* Section articles (cible du scroll) */}
        <div ref={articlesRef}>
          <section className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl px-7 py-8 mx-auto">
            <AnimatePresence mode="wait">
              {displayed.map(article => (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={article.couverture}
                    alt={article.titre}
                    className="w-full h-56 object-cover"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-brandPurple mb-2">{article.titre}</h2>
                    <p className="text-sm text-gray-500 mb-4">{new Date(article.date_created).toLocaleDateString()}</p>
                    <p className="text-gray-700 mb-6">
                      {stripTagsAndDecode(article.contenu).split(" ").slice(0,20).join(" ")}...
                    </p>
                    <Link href={`/blog/${article.id}`}>
                      <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-full">Lire l'article</button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>

          {/* Pagination numérotée */}
          {pageCount > 1 && (
            <div className="text-center mt-12">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setPaginationPage(page)}
                  className={`mx-1 px-4 py-2 rounded-full ${paginationPage === page ? "bg-brandOrange text-white" : "bg-gray-200"}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}