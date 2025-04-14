"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

    async function fetchArticles() {
      try {
        const response = await fetch(`/api/blog?page=1&category=${selectedCategory}&search=${searchQuery}`);
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des articles :", error);
      }
    }

    fetchCategories();
    fetchArticles();
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <Navbar />
      <main className="bg-[var(--secondary)] min-h-screen px-8 py-16">
        {/* Titre de la page */}
        <section className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
            Blog <span className="text-brandOrange">Terrasigne</span>
          </h1>
          <p className="text-lg text-gray-600">
            Retrouvez des articles inspirants et des conseils pratiques pour équilibrer corps et esprit.
          </p>
        </section>

        {/* Barre de recherche */}
        <section className="max-w-3xl mx-auto mb-12">
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-brandOrange transition-all"
          />
        </section>

        {/* Filtres dynamiques */}
        <section className="flex flex-wrap gap-4 justify-center mb-16">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === "" ? "bg-brandOrange text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Toutes les catégories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === cat.id ? "bg-brandOrange text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {cat.titre}
            </button>
          ))}
        </section>

        {/* Articles */}
        <section className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <img
                src={article.couverture} // Assurez-vous que cette URL est correcte
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
  {article.contenu.replace(/<[^>]+>/g, "").split(" ").slice(0, 20).join(" ")}...
</p>              
                  <Link href={`/blog/${article.id}`}>
                  <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-brandSecondary/90 transition-all">
                    Lire l'article
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}