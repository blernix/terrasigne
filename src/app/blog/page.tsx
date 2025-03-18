// "use client";
// import Link from "next/link";
// import Navbar from "@/components/client/Navbar";
// import Footer from "@/components/client/Footer";

// export default function BlogPage() {
//   const articles = [
//     {
//       title: "Les bienfaits de la méditation au quotidien",
//       image: "/images/paysage1.jpg",
//       excerpt: "Découvrez comment la sophrologie peut vous aider à retrouver votre équilibre intérieur.",
//       category: "Sophrologie",
//       date: "01 Janvier 2024",
//     },
//     {
//       title: "10 astuces pour gérer le stress",
//       image: "/images/paysage2.jpg",
//       excerpt: "Apprenez à maîtriser votre stress grâce à ces techniques simples et efficaces.",
//       category: "Bien-être",
//       date: "01 Janvier 2025",
//     },
//     {
//       title: "L’importance de la respiration consciente",
//       image: "/images/paysage5.jpg",
//       excerpt: "Explorez comment la respiration consciente peut transformer votre quotidien.",
//       category: "Santé",
//       date: "01 Janvier 2025",
//     },
//     {
//       title: "Comment développer une paix intérieure durable",
//       image: "/images/paysage6.jpg",
//       excerpt: "Découvrez des outils pratiques pour cultiver une paix intérieure.",
//       category: "Spiritualité",
//       date: "01 Janvier 2025",
//     },
//     {
//       title: "La connexion corps-esprit : clés pour l’harmonie",
//       image: "/images/paysage3.jpg",
//       excerpt: "Comprenez l'importance d’une relation harmonieuse entre le corps et l'esprit.",
//       category: "Santé",
//       date: "01 Janvier 2025",
//     },
//     {
//       title: "Retraites spirituelles : un moment pour soi",
//       image: "/images/paysage4.jpg",
//       excerpt: "Découvrez nos retraites pour un recentrage et un ressourcement optimal.",
//       category: "Spiritualité",
//       date: "01 Janvier 2025",
//     },
//   ];

//   return (
//     <>
//     <Navbar />
//     <main className="bg-[var(--secondary)] min-h-screen px-8 py-16">
//       {/* Titre de la page */}
//       <section className="text-center max-w-4xl mx-auto mb-24">
//         <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
//           Blog <span className="text-brandOrange">Terrasigne</span>
//         </h1>
//         <p className="text-lg text-gray-600">
//           Retrouvez des articles inspirants et des conseils pratiques pour équilibrer corps et esprit.
//         </p>
//       </section>

//       {/* Barre de recherche */}
//       <section className="max-w-3xl mx-auto mb-12">
//         <input
//           type="text"
//           placeholder="Rechercher un article..."
//           className="w-full px-6 py-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-brandOrange transition-all"
//         />
//       </section>

//       {/* Filtres */}
//       <section className="flex flex-wrap gap-4 justify-center mb-16">
//         <button className="px-4 py-2 bg-brandOrange text-white rounded-full hover:bg-brandOrange/90 transition-colors">
//           Toutes les catégories
//         </button>
//         <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors">
//           Sophrologie
//         </button>
//         <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors">
//           Bien-être
//         </button>
//         <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors">
//           Santé
//         </button>
//         <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors">
//           Spiritualité
//         </button>
//         <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors">
//           Popularité
//         </button>
//         <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors">
//           Nouveaux articles
//         </button>
//       </section>

//       {/* Articles */}
//       <section className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
//         {articles.map((article, index) => (
//           <div
//             key={index}
//             className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"
//           >
//             <img
//               src={article.image}
//               alt={article.title}
//               className="w-full h-56 object-cover"
//               loading="lazy"
//             />
//             <div className="p-6">
//               <h2 className="text-2xl font-semibold text-brandPurple mb-2">
//                 {article.title}
//               </h2>
//               <p className="text-sm text-gray-500 mb-4">{article.date}</p>
//               <p className="text-gray-700 mb-6">{article.excerpt}</p>
//               <Link href={`/blogdetail`}>
//                 <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-brandSecondary/90 transition-all">
//                   Lire l'article
//                 </button>
//               </Link>
//             </div>
//           </div>
//         ))}
//       </section>

//       {/* Pagination */}
//       <section className="flex justify-center mt-16">
//         <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-l-full hover:bg-gray-300 transition-colors">
//           Précédent
//         </button>
//         <button className="px-6 py-3 bg-brandOrange text-white hover:bg-brandOrange/90 transition-colors">
//           1
//         </button>
//         <button className="px-6 py-3 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
//           2
//         </button>
//         <button className="px-6 py-3 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
//           3
//         </button>
//         <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-r-full hover:bg-gray-300 transition-colors">
//           Suivant
//         </button>
//       </section>
//     </main>
//     <Footer />
//     </>
//   );
// }

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
              {cat.nom}
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