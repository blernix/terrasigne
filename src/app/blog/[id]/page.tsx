"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export default function BlogDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      const response = await fetch(`/api/blog/${id}`);
      const data = await response.json();

      if (data.message) {
        setErrorMessage(data.message);
        setArticle(null);
      } else {
        setArticle(data);
        setErrorMessage("");
      }
    }

    fetchArticle();
  }, [id]);

  if (errorMessage) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto py-16 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">🚫 Oups...</h1>
          <p className="text-lg text-gray-600">{errorMessage}</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!article) return <p className="text-center py-16">Chargement...</p>;

  return (
    <>
      <Navbar />
      <main className="bg-white/50 backdrop-blur-lg min-h-screen px-8 py-16 max-w-4xl mx-auto rounded-3xl shadow-lg mt-12 mb-12">
        
        {/* Affichage de l'image de couverture si elle existe */}
        {article.couverture && (
          <img 
            src={`${process.env.NEXT_PUBLIC_DIRECTUS_API}/assets/${article.couverture}`} 
            alt={article.titre} 
            className="w-full h-80 object-cover rounded-t-3xl shadow-lg"
          />
        )}

        <h1 className="text-5xl font-bold mb-6">{article.titre}</h1>
        <p className="text-gray-500 mb-4">
          Publié le {new Date(article.date_created).toLocaleDateString()}
        </p>
        
        <article className="editor-blog" dangerouslySetInnerHTML={{ __html: article.contenu }}></article>
      </main>
      <Footer />
    </>
  );
}