"use client";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export default function Propos() {
  return (
    <>
      <Navbar />

      <main className="bg-gray-50 min-h-screen px-8 py-16 max-w-4xl mx-auto mt-12 mb-12">
        {/* Titre principal */}
        <h1 className="text-5xl font-bold text-gray-800 leading-tight text-center mb-6">
          À la découverte de <span className="text-brandOrange">Cindy Guillaume</span> & Terrasigne
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Se relier à soi pour se relier à tout
        </p>

        {/* Section Présentation */}
        <section className="flex flex-col md:flex-row items-center gap-8 mb-16">
        <img
  src="/images/photo_profil.jpeg"
  alt="Cindy Guillaume"
  className="w-64 h-64 object-cover object-top rounded-full shadow-lg"
/>
          <div>
            <h2 className="text-3xl font-semibold text-brandPurple mb-4">Qui suis-je ?</h2>
            <p className="text-gray-700 leading-relaxed">
              En parallèle de 20 années dans le domaine médical, j’ai choisi de placer l’humain au cœur de ma pratique.
              Depuis plus de 10 ans, je me suis formée à des approches complémentaires — relation d’aide, sophrologie,
              hypnose, soins manuels et énergétiques — pour accompagner chacun dans son chemin vers un mieux-être durable.
              <br /><br />
              Mon engagement : vous aider à retrouver votre équilibre naturel, physique et émotionnel, avec
              <strong> respect, bienveillance, authenticité et présence</strong>.
            </p>
          </div>
        </section>

        {/* Section Terrasigne */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-brandPurple mb-6 text-center">Terrasigne, un espace de transformation</h2>
          <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto mb-8">
            Terrasigne propose un accompagnement personnalisé alliant techniques relationnelles, corporelles et énergétiques,
            pour répondre aux besoins de chacun avec sens, justesse et douceur.
          </p>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-brandPurple mb-2">🌿 Relation d’aide</h3>
              <p className="text-gray-600">
                Un accompagnement pour traverser la douleur, le stress ou les émotions, avancer vers ses désirs et retrouver
                l’équilibre naturel du corps. Méthodes : hypnose, sophro-analgésie, Écoute Ton Corps.
              </p>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-brandPurple mb-2">💆 Techniques manuelles</h3>
              <p className="text-gray-600">
                Redonner au corps sa capacité d’auto-régulation grâce à la libération des tensions et l’amélioration des échanges
                vasculaires, neurologiques et énergétiques. Méthodes : modelage intuitif, technique neuro-cutanée.
              </p>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-brandPurple mb-2">✨ Soins énergétiques</h3>
              <p className="text-gray-600">
                Harmonisation énergétique des personnes ou des lieux, avec la technique la plus adaptée : Reiki, Allégorie,
                Access Bars, Voie Atlante, Lumi-Énergie…
              </p>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-brandPurple mb-2">📚 Conférences & Ateliers</h3>
              <p className="text-gray-600">
                Des événements pour se découvrir, expérimenter, et apprendre à équilibrer son énergie au quotidien.
              </p>
            </div>
          </div>
        </section>

        {/* Citation */}
        <section className="bg-brandOrange text-white p-8 rounded-lg shadow-lg text-center mb-12">
          <p className="text-xl font-semibold mb-4">
            "Terrasigne est né de mon envie d'offrir à chacun une expérience de ressourcement unique et sur-mesure.
            Mon objectif est de vous aider à retrouver votre équilibre physique, émotionnel et énergétique."
          </p>
          <p className="text-lg font-medium">- Cindy Guillaume</p>
        </section>

        {/* Call-to-action */}
        <section className="text-center">
          <h2 className="text-3xl font-semibold text-brandPurple mb-6">Envie d’en savoir plus ?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/services"
              className="px-6 py-3 bg-brandSecondary text-white rounded-full hover:bg-brandSecondary/90 transition-all"
            >
              Découvrir mes services
            </a>
            <a
              href="/contact"
              className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-all"
            >
              Me contacter
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}