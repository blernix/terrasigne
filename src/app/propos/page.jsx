
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
          À la découverte de <span className="text-brandOrange">Cindy</span> & Terrasigne
        </h1>
        
        {/* Section Présentation */}
        {/* Section Présentation */}
{/* Section Présentation */}
<section className="flex flex-col md:flex-row items-start gap-8 mb-10">
  <img
    src="/images/propos.jpeg"
    alt="Cindy Guillaume"
    className="w-64 h-64 object-cover object-top rounded-full shadow-lg"
  />

  <div className="flex-1 space-y-4">
    <h2 className="text-3xl font-semibold text-brandPurple">Qui suis-je ?</h2>

    {/* Sous-section 1 */}
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-1">
        23 ans d’hôpital, une vocation centrée sur l’humain
      </h3>
      <p className="text-gray-700 leading-relaxed">
        Durant 23 ans en milieu hospitalier, j'ai observé l’activité croissante et la course à la performance
        qui est de plus en plus valorisée dans la société, même dans le domaine de la santé.
        Guidée par mon cœur, j'ai choisi de placer L’HUMAIN au cœur de ma pratique.
      </p>
   <div className="relative mx-auto max-w-2xl text-center mt-14 mb-1 px-4">
  <p className="text-xl md:text-2xl italic text-gray-700 font-light leading-relaxed relative before:absolute before:content-['“'] before:text-5xl before:-top-6 before:-left-4 before:text-brandOrange after:absolute after:content-['”'] after:text-5xl after:-bottom-6 after:-right-4 after:text-brandOrange">
    Se relier à soi pour se relier à tout
  </p>
</div>
    </div>
  </div>
</section>

{/* Sous-section 2 centrée */}
<section className="flex flex-col items-center justify-center text-center px-4 py-6 ">
  <div className="max-w-3xl">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Une approche globale, enrichie par l’expérience
    </h3>
    <p className="text-gray-700 leading-relaxed">
      Mon parcours de formation témoigne de cette préoccupation. Depuis plus de 10 ans, je me suis formée à des
      approches complémentaires – relation d'aide, sophro et hypno-analgésie, techniques manuelles et énergétiques
      complémentaires dans diverses écoles – pour accompagner chacun, dans son chemin vers un mieux-être durable.
      <br /><br />
      J'ai commencé auprès des patients angoissés par leurs examens d'imagerie médicale qui ont longtemps été ma
      spécialité. Au scanner, en IRM, en radiologie conventionnelle et au bloc opératoire, je me dédiais volontiers
      à ma priorité : accompagner le bien-être du patient et de l'équipe. À chaque difficulté liée au stress ou à la
      douleur, je constatais comme le soutien apporté aux collègues et patients optimisait la réussite de l'examen.
      En effet, quand le patient est écouté, accueilli, soutenu, le corps entier contribue au bon déroulement,
      tout se passe mieux pour tout le monde. J'ai longtemps déploré le manque de considération de cette dimension
      émotionnelle dans la prise en charge hospitalière, je me réjouis de chaque progrès et d'y avoir contribué à mon niveau.
    </p>
  </div>
</section>

{/* Sous-section 3 centrée */}
<section className="flex flex-col items-center justify-center text-center px-4 py-6">
  <div className="max-w-3xl">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Quand le soin devient engagement personnel
    </h3>
    <p className="text-gray-700 leading-relaxed">
    Suite à mon parcours professionnel, je suis devenue particulièrement sensible à la détresse physique, émotionnelle et mentale, la solitude et les maux chroniques dont souffrent les personnels et les patients.
      Dans mon histoire personnelle, j'ai été transformée par deux épreuves. Le grand défi d'accompagner mon père
      tout au long de sa maladie grave et fulgurante jusqu'à sa fin de vie fut douloureux et formateur.
      De mon côté, j'ai expérimenté les répercussions physiques de plusieurs années de manque d'écoute et de respect
      de mes propres besoins.
      <br /><br />
      L'appel de me consacrer entièrement à l’équiLIBRE de L'ÊTRE est alors devenu très fort.
    </p>
  </div>
</section>

{/* Sous-section 4 centrée */}
<section className="flex flex-col items-center justify-center text-center px-4 py-6">
  <div className="max-w-3xl">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Une invitation à te retrouver
    </h3>
 <p className="text-gray-700 leading-relaxed">
  Si tu veux en savoir plus sur mon parcours, je t'invite à lire l'article que j'ai rédigé à ce sujet : 
  <a 
    href="https://terrasigne.fr/blog/a733eb5b-568f-4729-a157-32bae0086fd0" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-brandPurple font-semibold hover:underline"
  >
    « Mon parcours » sur le blog
  </a>.
  <br /><br />
  À travers mon propre rééquilibrage physique, émotionnel, mental et spirituel, j'ai cheminé, pas à pas,
  vers la reconversion qui me mène aujourd'hui à t’ouvrir cette porte.
  <br /><br />
  Cette opportunité, c'est te remettre au cœur de ta vie, pour véritablement rayonner, inspirer et colorer le monde
  selon ta lumière unique, ta sonorité. C'est te sentir aimé pour qui tu es vraiment.
  <strong> Mon engagement :</strong> <br /><br />T'aider à réguler ton équilibre naturel, physique et émotionnel,
  avec respect, présence, bienveillance et authenticité.
</p>
  </div>
</section>

        {/* Section Terrasigne */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-brandPurple mb-6 text-center">
            Terrasigne, un espace de transformation
          </h2>
          <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto mb-8">
            Terrasigne propose un accompagnement personnalisé alliant techniques relationnelles, corporelles et énergétiques,
            pour répondre aux besoins de chacun avec sens, compassion et douceur.
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

        {/* Citation avec photo */}
        <section className="bg-brandOrange text-white rounded-lg shadow-lg mb-8 flex flex-col md:flex-row items-center md:-mx-8">
        <img
  src="/images/photoCitation.jpeg"
  alt="Cindy Guillaume"
  className="w-full max-h-80 md:w-56 md:h-56 object-cover rounded-lg shadow-md flex-shrink-0 object-[50%_50%] md:object-[50%_30%]"
/>
  <div className="py-4 px-8 text-center md:text-left flex-1">
    <p className="text-xl font-semibold mb-4">
      "Terrasigne est né de mon envie d'offrir à chacun une expérience de ressourcement unique et sur-mesure.
      Mon objectif est de t'aider à retrouver ton équilibre physique, émotionnel et énergétique."
    </p>
    <p className="text-lg font-medium">- Cindy Guillaume</p>
  </div>
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