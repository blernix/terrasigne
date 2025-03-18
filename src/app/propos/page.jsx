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
          Un chemin vers le bien-être, l’harmonie et la transformation intérieure.
        </p>

        {/* Section Présentation */}
        <section className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <img src="/images/photo_profil.jpeg" alt="Cindy Guillaume" className="w-64 h-64 object-cover rounded-full shadow-lg" />
          <div>
            <h2 className="text-3xl font-semibold text-brandPurple mb-4">Qui suis-je ?</h2>
            <p className="text-gray-700 leading-relaxed">
              Après 20 ans dans le domaine médical, j’ai ressenti l’appel du bien-être global. Mon parcours m’a conduit à
              explorer et maîtriser différentes techniques de relaxation, d’accompagnement émotionnel et énergétique.
              Ma mission est de vous aider à retrouver un équilibre intérieur en mettant à votre service mon expérience et
              mes valeurs : <strong>Présence, authenticité, empathie et bienveillance</strong>.
            </p>
          </div>
        </section>

        {/* Section Services */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-brandPurple mb-6 text-center">Terrasigne, un espace de bien-être</h2>
          <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto mb-8">
            Terrasigne propose un accompagnement holistique, alliant techniques relationnelles, énergétiques et manuelles
            pour répondre aux besoins de chacun. Découvrez nos principales prestations :
          </p>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-brandPurple mb-2">🌿 Relation d’aide</h3>
              <p className="text-gray-600">Un accompagnement personnalisé pour gérer le stress et améliorer votre qualité de vie.</p>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-brandPurple mb-2">💆 Techniques manuelles</h3>
              <p className="text-gray-600">Massage bien-être, modelage intuitif et techniques neuro-cutanées.</p>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-brandPurple mb-2">✨ Soins énergétiques</h3>
              <p className="text-gray-600">Reiki, Allégorie, Access Bars, soins Atlantes et harmonisation énergétique.</p>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
              <h3 className="text-xl font-semibold text-brandPurple mb-2">📚 Conférences & Formations</h3>
              <p className="text-gray-600">Des événements et formations pour apprendre à équilibrer son énergie et son bien-être.</p>
            </div>
          </div>
        </section>

        {/* Message d’accueil */}
        <section className="bg-brandOrange text-white p-8 rounded-lg shadow-lg text-center mb-12">
          <p className="text-xl font-semibold mb-4">
            "Terrasigne est né de mon envie d’offrir à chacun une expérience de bien-être unique et sur-mesure. Mon objectif
            est de vous aider à retrouver un équilibre physique, émotionnel et énergétique."
          </p>
          <p className="text-lg font-medium">- Cindy Guillaume</p>
        </section>

        {/* Call-to-action */}
        <section className="text-center">
          <h2 className="text-3xl font-semibold text-brandPurple mb-6">Envie d’en savoir plus ?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/services" className="px-6 py-3 bg-brandSecondary text-white rounded-full hover:bg-brandSecondary/90 transition-all">
              Découvrir mes services
            </a>
            <a href="/contact" className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-all">
              Me contacter
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}