import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import {
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Video,
  Wifi,
} from "lucide-react";

export const metadata = {
  title: "Séances à distance : comment se déroule une rencontre en ligne",
  description:
    "Séance de reiki et de soins énergétiques à distance, en visioconférence ou par téléphone, depuis la Guadeloupe. Déroulement, préparation, durée et réservation avec Cindy Guillaume.",
  keywords: [
    "reiki à distance",
    "soins énergétiques à distance",
    "séance reiki visio",
    "énergéticien à distance",
    "reiki en visio",
    "séance à distance Guadeloupe",
    "consultation holistique à distance",
  ],
  alternates: { canonical: "https://terrasigne.fr/seances-a-distance" },
  openGraph: {
    title: "Séances à distance : comment se déroule une rencontre en ligne | Terrasigne",
    description:
      "Une séance de reiki à distance, en visioconférence ou par téléphone, où que vous soyez. Le déroulé, pas à pas, avec Cindy Guillaume.",
    url: "https://terrasigne.fr/seances-a-distance",
    type: "website",
    siteName: "Terrasigne",
    images: [
      {
        url: "https://terrasigne.fr/images/logoterra.png",
        width: 500,
        height: 500,
        alt: "Terrasigne",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Séances à distance : comment se déroule une rencontre en ligne | Terrasigne",
    description:
      "Séance à distance en visio ou par téléphone : le déroulé, la préparation et la réservation.",
    images: ["https://terrasigne.fr/images/logoterra.png"],
  },
  robots: { index: true, follow: true },
};

const etapes = [
  {
    titre: "Avant la séance",
    icone: Video,
    texte:
      "Vous prenez rendez-vous, en sélectionnant téléphone ou visioconférence. Par téléphone, je vous appelle à l’heure prévue. En visioconférence, vous recevez un lien par email, vous vous installez dans un endroit calme. Dans les 2 cas, la séance commence par un temps d’échange sur ce que vous traversez en ce moment et vos attentes.",
  },
  {
    titre: "Pendant la séance",
    icone: Heart,
    texte:
      "Vous vous installez confortablement dans un endroit calme et isolé pour assurer votre confort et votre disponibilité. Je vous accompagne à la voix : accueil, écoute, guidance, tout en m’adaptant à l’aide de la vidéo, selon les techniques.\n\nUne rencontre dure entre 30 min et 1 h 30 selon la prestation choisie. En fin de rencontre, un temps d’échange permet de revenir sur ce que vous avez ressenti. Certaines personnes ressentent une légère fatigue, un apaisement, de la clarté et de l’enthousiasme pour avancer.",
  },
  {
    titre: "Après la séance",
    icone: Sparkles,
    texte:
      "Vous repartez avec des repères simples et pratiques à mettre en place dans votre quotidien. Je conseille de garder un moment de calme après la rencontre pour intégrer la séance.\n\nUn résumé écrit vous aide à retenir l’essentiel et vous soutient pour la suite.",
  },
];

const faq = [
  {
    q: "Une séance à distance, c’est différent d’une séance en présentiel ?",
    a: "La séance se fait dans le lieu de votre choix, en visioconférence ou par téléphone, sans déplacement. Les client(e)s suivi(e)s à distance obtiennent les mêmes résultats et sont très satisfait(e)s et surpris(es) d’obtenir les mêmes résultats. Certain(e)s commencent en présentiel et préfèrent poursuivre à distance pour profiter de résultats similaires, sans avoir à se déplacer.",
  },
  {
    q: "Où habitez-vous, et à quelle heure se passe la séance ?",
    a: "Je suis installée à Terre-de-Bas, en Guadeloupe, et j’accompagne des personnes en France hexagonale, dans les Dom Tom, en Europe et dans tout autre pays. Le créneau que vous choisissez est affiché dans votre propre fuseau horaire : entre la Guadeloupe et la France métropolitaine, comptez 6 heures de décalage en été et 5 heures en hiver.",
  },
  {
    q: "Faut-il être seul et au calme ?",
    a: "Un endroit calme où vous ne serez pas interrompu est préférable. Pour plus de confort et de stabilité de l’image et de la connexion, il est préférable de se connecter à partir d’un ordinateur plutôt que d’utiliser un téléphone portable (que je conseille de mettre en silencieux).",
  },
  {
    q: "Est-ce que je dois arrêter mon traitement ?",
    a: "Non, jamais. Ces séances sont des pratiques de bien-être, elles ne constituent ni un acte médical, ni un diagnostic, ni un traitement. Je ne demande jamais d’interrompre ou de modifier un traitement en cours. En cas de symptôme, de doute ou de pathologie, consultez votre médecin.",
  },
  {
    q: "Quelles prestations sont proposées à distance ?",
    a: "Toutes les techniques de relation d’aide et techniques énergétiques sont accessibles à distance. La consultation globale (1 h 30), la consultation de suivi (1 h), la technique de lâcher-prise, le dialogue intérieur, la consultation des mémoires akashiques, ainsi qu’un rendez-vous conseil de 30 minutes par téléphone pour faire le point avant de commencer.",
  },
  {
    q: "Comment se passe la réservation et le paiement ?",
    a: "La réservation se fait en ligne, sur la page rendez-vous : vous choisissez la prestation, le créneau et le mode (visioconférence ou téléphone). Vous recevez ensuite une confirmation par email avec le lien de la séance. Le paiement se fait par virement au moment de la séance.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function SeancesADistance() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      <main id="main-content" className="bg-cream pb-20 pt-28">
        <div className="container-soft">
          {/* Hero */}
          <header className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <Video size={13} />
              Séances à distance
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-forest md:text-5xl">
              Séances à distance : comment se déroule une{" "}
              <span className="italic text-violet">rencontre en ligne</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-ink-soft">
              Vous êtes en France métropolitaine, ailleurs dans le monde, ou simplement
              dans un moment où vous ne pouvez pas vous déplacer : une séance à
              distance se déroule comme une séance classique, avec la même écoute et
              le même accompagnement, mais depuis chez vous.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/rendez-vous" className="btn btn-violet">
                <Calendar size={18} />
                Réserver une séance
              </Link>
              <Link href="/services" className="btn btn-ghost">
                Voir les prestations
                <ArrowRight size={16} />
              </Link>
            </div>
          </header>

          {/* Pourquoi à distance */}
          <section className="section mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
              Une séance chez vous, au même moment
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Une séance à distance n’est pas un enregistrement, ni un contenu envoyé
              par email : c’est un rendez-vous en direct, en visioconférence ou par
              téléphone, pendant lequel nous travaillons ensemble. Le lien se fait par
              la parole et par la présence,
              authentique et bienveillante.
            </p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Cette formule convient particulièrement aux personnes qui vivent loin du
              cabinet, qui ont un emploi du temps difficile à organiser, ou qui se sentent plus en confiance dans leur propre espace.
              Elle permet aussi de garder un fil continu entre deux séances en
              présentiel, lorsque vous êtes en déplacement.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="card p-5">
                <Wifi size={20} className="text-violet" />
                <p className="mt-3 text-sm font-bold text-forest">Visio ou téléphone</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Vous choisissez le mode de communication au moment de réserver, selon votre connexion
                  et votre confort.
                </p>
              </div>
              <div className="card p-5">
                <Clock size={20} className="text-violet" />
                <p className="mt-3 text-sm font-bold text-forest">Le bon fuseau horaire</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Les créneaux sont affichés dans votre heure locale : l’agenda
                  s’affiche pour correspondre au fuseau horaire du lieu d’où vous
                  prenez rendez-vous.
                </p>
              </div>
              <div className="card p-5">
                <MapPin size={20} className="text-violet" />
                <p className="mt-3 text-sm font-bold text-forest">Où que vous soyez</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  France hexagonale, Dom Tom, Europe, tout autre pays : la seule condition est
                  une connexion stable, dans un endroit calme et isolé pour vous sentir
                  disponible.
                </p>
              </div>
            </div>
          </section>

          {/* Déroulé */}
          <section className="section">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
                Le déroulé d’une séance, pas à pas
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Trois temps, toujours dans le même ordre.
                <br />
                Rien n’est imposé : si vous préférez ne pas parler au début, c’est
                possible aussi.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              {etapes.map((etape, index) => {
                const Icone = etape.icone;
                return (
                  <article key={etape.titre} className="card p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-forest">
                        <Icone size={18} />
                      </span>
                      <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
                        {index + 1}. {etape.titre}
                      </p>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                      {etape.texte}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Cadre */}
          <section className="section mx-auto max-w-3xl">
            <div className="rounded-4xl border border-forest/20 bg-white p-6 md:p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} className="text-forest" />
                <h2 className="font-display text-xl font-semibold text-forest">
                  Ce qu’une séance à distance n’est pas
                </h2>
              </div>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Les séances proposées sont des pratiques de bien-être et de relaxation.
                Elles ne constituent ni un acte médical, ni un diagnostic, ni un
                traitement, et ne se substituent en aucun cas à un avis, un suivi ou un
                traitement médical. Je ne demande jamais d’interrompre ou de modifier un
                traitement en cours. En cas de symptôme, de doute ou de pathologie,
                consultez votre médecin.
              </p>
              <Link href="/cadre-de-la-pratique" className="link-underline mt-4 inline-flex items-center gap-1.5 text-sm">
                Lire le cadre complet de la pratique
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          {/* Pour qui */}
          <section className="section mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
              Quand prendre une séance à distance ?
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Mes services s’adressent à des personnes stables et autonomes d’un point de
              vue de leur santé mentale et de leur capacité à mettre en place des actions
              pour atteindre leurs objectifs.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Un besoin de souffler, de poser ce qui pèse en ce moment.",
                "Une période de transition de vie avec recherche d’alignement, de soutien, d’équilibre : déménagement, changement professionnel, séparation.",
                "Une fatigue qui s’installe, un sommeil qui se dégrade, sans cause identifiée.",
                "Un accompagnement après un deuil ou une épreuve.",
                "L’envie de comprendre ce qui se répète dans votre vie, et de lâcher prise.",
                "Une période de flou, de doute, pour clarifier vos besoins, vos désirs, vos blocages, vos objectifs.",
                "Une problématique physique à cerner, accepter et transformer, en complément de l’approche médicale.",
                "Un schéma relationnel de rapport de force, de loyauté et/ou de culpabilité à transformer.",
                "Un lieu qui provoque un inconfort et nécessite une harmonisation.",
                "Le souhait de garder un suivi régulier quand vous êtes loin de la Guadeloupe.",
              ].map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Préparation */}
          <section className="section mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
              Préparer sa séance
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Un endroit calme", "Une pièce où vous ne serez pas dérangé pendant toute la durée de la rencontre."],
                ["De l’eau à portée de main", "On a souvent soif au cours d’une séance, et l’eau permet de faire circuler les émotions et l’énergie."],
                ["Un casque si possible", "Le son est plus net, l’immersion meilleure."],
                ["Quinze minutes après", "Gardez un temps calme après la séance pour laisser les prises de conscience et les informations se poser."],
              ].map(([titre, texte]) => (
                <div key={titre} className="rounded-3xl border border-sand-200/70 bg-white/70 p-5">
                  <p className="text-sm font-bold text-forest">{titre}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{texte}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="section mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
              Questions fréquentes
            </h2>
            <div className="mt-6 divide-y divide-sand-200/70">
              {faq.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-bold text-forest marker:content-none">
                    {item.q}
                    <span className="text-lg text-violet transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mx-auto max-w-3xl">
            <div className="rounded-4xl bg-sage-100 p-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-forest">
                Prêt à prendre ce temps pour vous ?
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-ink-soft">
                Choisissez la prestation et le créneau qui vous conviennent : les
                séances à distance se réservent comme les autres.
              </p>
              <Link href="/rendez-vous" className="btn btn-violet mt-6">
                <Calendar size={18} />
                Voir les créneaux disponibles
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
