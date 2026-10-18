import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import {
  ArrowRight,
  Calendar,
  Check,
  FileCheck2,
  Heart,
  Lock,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

export const metadata = {
  title: "Cadre de la pratique et limites des séances",
  description:
    "Le cadre des séances Terrasigne : pratiques de bien-être, ni diagnostic, ni traitement, ni substitut à un suivi médical. Les engagements de Cindy Guillaume et les précautions avant une séance.",
  keywords: [
    "cadre de la pratique",
    "praticienne bien-être",
    "soins holistiques",
    "limites des séances",
    "accompagnement bien-être Guadeloupe",
  ],
  alternates: { canonical: "https://terrasigne.fr/cadre-de-la-pratique" },
  openGraph: {
    title: "Cadre de la pratique | Terrasigne",
    description:
      "Ce que sont les séances, ce qu’elles ne sont pas, et les engagements pris avec chaque personne accompagnée.",
    url: "https://terrasigne.fr/cadre-de-la-pratique",
    type: "website",
    siteName: "Terrasigne",
  },
  robots: { index: true, follow: true },
};

const engagements = [
  {
    icone: ShieldCheck,
    titre: "Aucun diagnostic, aucune prescription",
    texte:
      "Je ne pose aucun diagnostic, je ne prescris rien et je ne conseille aucun médicament. Ce travail ne relève pas de la médecine.",
  },
  {
    icone: Stethoscope,
    titre: "Jamais d’arrêt de traitement",
    texte:
      "Je ne demande jamais d’interrompre, de réduire ou de modifier un traitement en cours, ni de reporter un examen ou une consultation.",
  },
  {
    icone: Heart,
    titre: "Aucune promesse de résultat",
    texte:
      "Aucun résultat n’est garanti, aucune « méthode miracle » n’est proposée. Chaque personne avance à son rythme, et ce qui se passe en séance lui appartient.",
  },
  {
    icone: FileCheck2,
    titre: "Un cadre clair et un tarif fixe",
    texte:
      "Le tarif d’une séance est connu à l’avance, sans engagement de plusieurs séances et sans paiement anticipé d’un forfait.",
  },
  {
    icone: Lock,
    titre: "Confidentialité",
    texte:
      "Ce qui se dit en séance reste en séance. Aucune information personnelle n’est partagée, ni publiée, ni utilisée à des fins commerciales.",
  },
  {
    icone: Check,
    titre: "Le droit de dire non",
    texte:
      "Vous pouvez arrêter une séance à tout moment, refuser un exercice, ou ne pas parler d’un sujet. Rien ne se fait sans votre accord.",
  },
];

export default function CadreDeLaPratique() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-cream pb-20 pt-28">
        <div className="container-soft">
          <header className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">
              <ShieldCheck size={13} />
              Transparence
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-forest md:text-5xl">
              Le cadre de la <span className="italic text-violet">pratique</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-ink-soft">
              Ce que je propose relève du bien-être et de la relation d’aide. Ce n’est
              pas de la médecine, et ce n’est pas présenté comme tel. Cette page dit
              précisément ce que les séances sont, ce qu’elles ne sont pas, et ce à quoi
              vous vous engagez en venant.
            </p>
          </header>

          <section className="section mx-auto max-w-3xl">
            <div className="rounded-4xl border border-forest/20 bg-white p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold text-forest">
                En une phrase
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                Les séances proposées sont des pratiques de bien-être et de relaxation.
                Elles ne constituent ni un acte médical, ni un diagnostic, ni un
                traitement, et ne se substituent en aucun cas à un avis, un suivi ou un
                traitement médical.
              </p>
            </div>
          </section>

          <section className="section mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
              Ce que sont les séances
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Un temps d’écoute et de détente, dans un cadre calme, où l’on pose ce qui
              pèse : le stress, la fatigue, les périodes de transition, les émotions
              qui tournent en boucle. Selon la prestation choisie, ce temps prend la
              forme d’un échange, d’une pratique de relaxation, d’un travail manuel de
              bien-être, ou d’une séance à distance en visioconférence.
            </p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Le corps et les émotions sont abordés dans leur ensemble, sans jamais
              chercher à nommer une cause médicale. Ce que vous venez déposer reste
              votre histoire : mon rôle est de vous accompagner, pas d’interpréter à
              votre place.
            </p>
          </section>

          <section className="section mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
              Ce qu’elles ne sont pas
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Elles ne remplacent pas une consultation, un examen ou un traitement médical.",
                "Elles ne servent pas à établir un diagnostic, ni à identifier une maladie.",
                "Elles ne soignent aucune pathologie et ne prétendent pas le faire.",
                "Elles ne se substituent jamais à un suivi psychologique ou psychiatrique.",
                "Elles ne dispensent pas de prendre un avis médical en cas de symptôme.",
              ].map((item) => (
                <p key={item} className="flex gap-3 leading-relaxed text-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
                Mes engagements
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Six règles que je m’applique à chaque séance, en présentiel comme à
                distance.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              {engagements.map((item) => {
                const Icone = item.icone;
                return (
                  <article key={item.titre} className="card p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-forest">
                      <Icone size={18} />
                    </span>
                    <p className="mt-4 font-display text-base font-semibold text-forest">
                      {item.titre}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {item.texte}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="section mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
              Quand consulter un médecin plutôt
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Certaines situations ne relèvent pas d’une séance de bien-être. Dans ces
              cas, la première étape est une consultation médicale :
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Une douleur nouvelle, intense ou qui s’aggrave.",
                "Une fièvre, une perte de poids inexpliquée, un saignement.",
                "Des idées noires, une angoisse qui ne vous lâche plus, un mal-être profond.",
                "Un traitement en cours que vous souhaitez modifier.",
                "Une grossesse, une intervention récente, une maladie chronique : parlez-en à votre médecin avant de réserver.",
              ].map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-3xl bg-sage-100 p-5 text-sm leading-relaxed text-forest">
              Si vous êtes suivi pour une pathologie ou un traitement en cours, dites-le
              au moment de réserver : nous verrons ensemble si une séance est adaptée,
              ou s’il vaut mieux en parler d’abord à votre médecin.
            </p>
          </section>

          <section className="section mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-forest md:text-3xl">
              Avant votre première séance
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Signalez votre suivi médical", "Un traitement en cours, une pathologie, une grossesse : c’est utile, pas éliminatoire."],
                ["Précisez le mode", "Présentiel à Terre-de-Bas, visioconférence ou téléphone."],
                ["Posez vos questions", "Aucune question n’est gênante, y compris sur ce qui ne se fait pas en séance."],
                ["Gardez la main", "Vous pouvez arrêter à tout moment, sans avoir à vous justifier."],
              ].map(([titre, texte]) => (
                <div key={titre} className="rounded-3xl border border-sand-200/70 bg-white/70 p-5">
                  <p className="text-sm font-bold text-forest">{titre}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{texte}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-3xl">
            <div className="rounded-4xl bg-sage-100 p-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-forest">
                Une question sur ce cadre ?
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-ink-soft">
                Écrivez-moi avant de réserver : je réponds à toutes les questions,
                notamment si vous hésitez sur la pertinence d’une séance dans votre
                situation.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/contact" className="btn btn-primary">
                  Poser une question
                  <ArrowRight size={16} />
                </Link>
                <Link href="/rendez-vous" className="btn btn-violet">
                  <Calendar size={18} />
                  Voir les créneaux
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
