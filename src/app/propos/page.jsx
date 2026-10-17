import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { Leaf, Hand, Sparkles, BookOpen } from "lucide-react";

export const metadata = {
  title: "À propos de Cindy Guillaume",
  description:
    "Praticienne en soins holistiques, Cindy Guillaume raconte son parcours et l’histoire de Terrasigne, un espace dédié à l’équilibre du corps et de l’esprit.",
  keywords: [
    "Cindy Guillaume",
    "Terrasigne",
    "à propos",
    "parcours praticienne",
    "soins énergétiques",
    "relation d’aide",
    "équilibre émotionnel",
    "santé holistique",
  ],
  openGraph: {
    title: "À propos | Cindy Guillaume & Terrasigne",
    description:
      "Un parcours de soin centré sur l’humain. Apprends-en plus sur Cindy Guillaume et sa vocation profonde à travers Terrasigne.",
    url: "https://terrasigne.fr/propos",
    type: "website",
    images: [
      {
        url: "https://terrasigne.fr/images/propos.jpeg",
        width: 800,
        height: 800,
        alt: "Cindy Guillaume",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "À propos | Cindy Guillaume & Terrasigne",
    description:
      "Découvre l’histoire de Cindy Guillaume et les valeurs fondatrices de Terrasigne.",
    images: ["https://terrasigne.fr/images/propos.jpeg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://terrasigne.fr/propos" },
};

export default function Propos() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-cream pb-20 pt-28">
        <div className="container-soft">
          {/* Hero */}
          <header className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">À propos</span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-forest md:text-5xl">
              À la découverte de{" "}
              <span className="italic text-violet">Cindy</span>, praticienne
              bien-être en Guadeloupe
            </h1>
          </header>

          {/* Présentation */}
          <section className="mt-14 flex flex-col items-start gap-8 md:flex-row">
            <img
              src="/images/propos.jpeg"
              alt="Cindy Guillaume"
              className="h-64 w-64 flex-shrink-0 rounded-full object-cover object-top shadow-soft ring-4 ring-white"
            />

            <div className="flex-1 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-forest">
                Qui suis-je ?
              </h2>

              <div>
                <h3 className="font-display text-lg font-semibold text-forest">
                  23 ans d’hôpital, une vocation centrée sur l’humain
                </h3>
                <p className="mt-2 leading-relaxed text-ink-soft">
                  Durant 23 ans en milieu hospitalier, j’ai observé l’activité
                  croissante et la course à la performance qui est de plus en
                  plus valorisée dans la société, même dans le domaine de la
                  santé. Guidée par mon cœur, j’ai choisi de placer L’HUMAIN au
                  cœur de ma pratique.
                </p>

                <div className="mx-auto mt-10 max-w-2xl text-center">
                  <p className="font-display text-xl italic leading-relaxed text-forest md:text-2xl">
                    Se relier à soi pour se relier à tout
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Approche globale */}
          <section className="mx-auto mt-16 max-w-3xl text-center">
            <h3 className="font-display text-lg font-semibold text-forest">
              Une approche globale, enrichie par l’expérience
            </h3>
            <p className="mt-2 leading-relaxed text-ink-soft">
              Mon parcours de formation témoigne de cette préoccupation. Depuis
              plus de 10 ans, je me suis formée à des approches complémentaires –
              relation d’aide, sophro et hypno-analgésie, techniques manuelles et
              énergétiques complémentaires dans diverses écoles – pour
              accompagner chacun, dans son chemin vers un mieux-être durable.
              <br />
              <br />
              J’ai commencé auprès des patients angoissés par leurs examens
              d’imagerie médicale qui ont longtemps été ma spécialité. Au
              scanner, en IRM, en radiologie conventionnelle et au bloc
              opératoire, je me dédiais volontiers à ma priorité : accompagner le
              bien-être du patient et de l’équipe. À chaque difficulté liée au
              stress ou à la douleur, je constatais comme le soutien apporté aux
              collègues et patients optimisait la réussite de l’examen. En effet,
              quand le patient est écouté, accueilli, soutenu, le corps entier
              contribue au bon déroulement, tout se passe mieux pour tout le
              monde. J’ai longtemps déploré le manque de considération de cette
              dimension émotionnelle dans la prise en charge hospitalière, je me
              réjouis de chaque progrès et d’y avoir contribué à mon niveau.
            </p>
          </section>

          {/* Engagement */}
          <section className="mx-auto mt-16 max-w-3xl text-center">
            <h3 className="font-display text-lg font-semibold text-forest">
              Quand le soin devient engagement personnel
            </h3>
            <p className="mt-2 leading-relaxed text-ink-soft">
              Suite à mon parcours professionnel, je suis devenue
              particulièrement sensible à la détresse physique, émotionnelle et
              mentale, la solitude et les maux chroniques dont souffrent les
              personnels et les patients. Dans mon histoire personnelle, j’ai été
              transformée par deux épreuves. Le grand défi d’accompagner mon père
              tout au long de sa maladie grave et fulgurante jusqu’à sa fin de
              vie fut douloureux et formateur. De mon côté, j’ai expérimenté les
              répercussions physiques de plusieurs années de manque d’écoute et
              de respect de mes propres besoins.
              <br />
              <br />
              L’appel de me consacrer entièrement à l’équiLIBRE de L’ÊTRE est
              alors devenu très fort.
            </p>
          </section>

          {/* Invitation */}
          <section className="mx-auto mt-16 max-w-3xl text-center">
            <h3 className="font-display text-lg font-semibold text-forest">
              Une invitation à te retrouver
            </h3>
            <p className="mt-2 leading-relaxed text-ink-soft">
              Si tu veux en savoir plus sur mon parcours, je t’invite à lire
              l’article que j’ai rédigé à ce sujet :{" "}
              <a
                href="https://terrasigne.fr/blog/a733eb5b-568f-4729-a157-32bae0086fd0"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                « Mon parcours » sur le blog
              </a>
              .
              <br />
              <br />
              À travers mon propre rééquilibrage physique, émotionnel, mental et
              spirituel, j’ai cheminé, pas à pas, vers la reconversion qui me
              mène aujourd’hui à t’ouvrir cette porte.
              <br />
              <br />
              Cette opportunité, c’est te remettre au cœur de ta vie, pour
              véritablement rayonner, inspirer et colorer le monde selon ta
              lumière unique, ta sonorité. C’est te sentir aimé pour qui tu es
              vraiment.
              <strong> Mon engagement :</strong>
              <br />
              <br />
              T’aider à réguler ton équilibre naturel, physique et émotionnel,
              avec respect, présence, bienveillance et authenticité.
            </p>
          </section>

          {/* Terrasigne */}
          <section className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-semibold text-forest">
                Terrasigne, un espace de transformation
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Terrasigne propose un accompagnement personnalisé alliant
                techniques relationnelles, corporelles et énergétiques, pour
                répondre aux besoins de chacun avec sens, compassion et douceur.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="card p-7">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-100 text-forest">
                  <Leaf size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-forest">
                  Relation d’aide
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Un accompagnement pour traverser la douleur, le stress ou les
                  émotions, avancer vers ses désirs et retrouver l’équilibre
                  naturel du corps. Méthodes : hypnose, sophro-analgésie, Écoute
                  Ton Corps.
                </p>
              </div>
              <div className="card p-7">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-100 text-forest">
                  <Hand size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-forest">
                  Techniques manuelles
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Redonner au corps sa capacité d’auto-régulation grâce à la
                  libération des tensions et l’amélioration des échanges
                  vasculaires, neurologiques et énergétiques. Méthodes : modelage
                  intuitif, technique neuro-cutanée.
                </p>
              </div>
              <div className="card p-7">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-100 text-forest">
                  <Sparkles size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-forest">
                  Soins énergétiques
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Harmonisation énergétique des personnes ou des lieux, avec la
                  technique la plus adaptée : Reiki, Allégorie, Access Bars, Voie
                  Atlante, Lumi-Énergie…
                </p>
              </div>
              <div className="card p-7">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-100 text-forest">
                  <BookOpen size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-forest">
                  Conférences &amp; Ateliers
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Des événements pour se découvrir, expérimenter, et apprendre à
                  équilibrer son énergie au quotidien.
                </p>
              </div>
            </div>
          </section>

          {/* Citation avec photo */}
          <section className="mt-20 overflow-hidden rounded-4xl bg-violet text-white shadow-soft">
            <div className="flex flex-col items-center md:flex-row">
              <img
                src="/images/photoCitation.jpeg"
                alt="Cindy Guillaume"
                className="h-64 w-full object-cover md:h-64 md:w-64 md:flex-shrink-0"
              />
              <div className="p-8 text-center md:text-left">
                <p className="font-display text-xl font-semibold leading-relaxed md:text-2xl">
                  « Terrasigne est né de mon envie d’offrir à chacun une
                  expérience de ressourcement unique et sur-mesure. Mon objectif
                  est de t’aider à retrouver ton équilibre physique, émotionnel
                  et énergétique. »
                </p>
                <p className="mt-4 font-semibold text-white/90">
                  – Cindy, Terrasigne
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center">
            <h2 className="font-display text-3xl font-semibold text-forest">
              Envie d’en savoir plus ?
            </h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/services" className="btn btn-primary">
                Découvrir mes services
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Me contacter
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
