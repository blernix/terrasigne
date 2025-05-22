"use client";

import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(false);

  const ARTICLES_PER_PAGE = 5;

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/blog/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des catégories :", error);
      }
    }
    fetchCategories();
  }, []);

useEffect(() => {
  async function fetchArticles() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/blog?page=${currentPage}&limit=${ARTICLES_PER_PAGE}&category=${selectedCategory}&search=${searchQuery}`
      );
      const data = await response.json();

      const articlesFromApi = Array.isArray(data.articles) ? data.articles : [];
      const totalFromApi = typeof data.total === "number" ? data.total : articlesFromApi.length;

      setArticles((prev) =>
        currentPage === 1 ? articlesFromApi : [...prev, ...articlesFromApi]
      );
      setTotalArticles(totalFromApi);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des articles :", error);
    } finally {
      setLoading(false);
    }
  }

  fetchArticles();
}, [selectedCategory, searchQuery, currentPage]);

  const stripTagsAndDecode = (html) => {
    const text = html.replace(/<[^>]+>/g, "");
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showLoadMore = totalArticles > 5 && totalArticles <= 10 && articles.length < totalArticles;
  const showPagination = totalArticles > 10;

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen mt-11">
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
<section className="py-16 px-6 mb-16 mx-auto max-w-4xl">
  {/* Séparation visuelle */}
  <div className="h-px bg-gray-200 mb-12 w-3/4 mx-auto" />

  {/* Texte introductif */}
  <div className="text-center mb-10 px-4">
    <h2 className="text-3xl font-bold text-gray-800 mb-2">Trouvez ce qui vous inspire</h2>
    <p className="text-gray-600 text-base sm:text-lg">
      Recherchez un mot-clé ou explorez les différentes catégories d’articles.
    </p>
  </div>

  {/* Barre de recherche */}
  <input
    type="text"
    placeholder="Rechercher un article..."
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    }}
    className="w-full px-6 py-3 mb-8 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-brandOrange transition-all"
  />

  {/* Filtres catégories */}
  <div className="flex flex-wrap gap-4 justify-center">
    <button
      onClick={() => {
        setSelectedCategory("");
        setCurrentPage(1);
      }}
      className={`px-4 py-2 rounded-full transition-colors ${
        selectedCategory === ""
          ? "bg-brandOrange text-white"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
    >
      Toutes les catégories
    </button>
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => {
          setSelectedCategory(cat.id);
          setCurrentPage(1);
        }}
        className={`px-4 py-2 rounded-full transition-colors ${
          selectedCategory === cat.id
            ? "bg-brandOrange text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        {cat.titre}
      </button>
    ))}
  </div>
    <div className="h-px bg-gray-200 my-12 w-3/4 mx-auto" />

</section>

        <section className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl px-7 py-8 mx-2">
          <AnimatePresence mode="wait">
            {articles.map((article) => (
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
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(article.date_created).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 mb-6">
                    {stripTagsAndDecode(article.contenu).split(" ").slice(0, 20).join(" ")}...
                  </p>
                  <Link href={`/blog/${article.id}`}>
                    <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-brandSecondary/90 transition-all">
                      Lire l'article
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {showLoadMore && (
          <div className="text-center mb-12">
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={loading}
              className="px-6 py-3 bg-brandOrange text-white rounded-full hover:bg-brandOrange/90 transition-all"
            >
              {loading ? "Chargement..." : "Afficher plus"}
            </button>
          </div>
        )}

        {showPagination && (
          <div className="text-center mt-12">
            {[...Array(Math.ceil(totalArticles / ARTICLES_PER_PAGE)).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => setCurrentPage(page + 1)}
                className={`mx-1 px-4 py-2 rounded-full ${
                  currentPage === page + 1 ? "bg-brandOrange text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page + 1}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}