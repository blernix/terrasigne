import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export const metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Terrasigne : données collectées, finalités, sous-traitants, durée de conservation et droits des utilisateurs.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://terrasigne.fr/confidentialite" },
};

export default function Confidentialite() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-cream pb-20 pt-28">
        <div className="container-soft max-w-3xl">
          <span className="eyebrow">Mentions légales</span>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-forest md:text-4xl">
            Politique de <span className="italic text-violet">confidentialité</span>
          </h1>

          <p className="mt-4 text-sm text-muted">
            Dernière mise à jour : {new Date().getFullYear()}.
          </p>

          <div className="card mt-10 space-y-9 p-8 leading-relaxed text-ink-soft md:p-10">
            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                1. Responsable du traitement
              </h2>
              <p className="mt-2">
                Le site terrasigne.fr est édité par Cindy Guillaume, praticienne
                en soins holistiques, située à Terre de Bas, Guadeloupe.
                <br />
                Contact : terrasigne971@gmail.com
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                2. Données collectées
              </h2>
              <p className="mt-2">
                Lors de l&rsquo;utilisation du site, nous pouvons collecter :
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>
                  Formulaire de contact : nom, prénom, adresse email, numéro de
                  téléphone (facultatif) et message.
                </li>
                <li>
                  Formulaire de réservation : nom, prénom, adresse email, numéro
                  de téléphone (facultatif), message (facultatif) ainsi que la
                  date et l&rsquo;heure du rendez-vous choisi.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                3. Finalités du traitement
              </h2>
              <p className="mt-2">Les données sont utilisées uniquement pour :</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>répondre à vos demandes de contact ;</li>
                <li>
                  gérer vos rendez-vous et vous envoyer les confirmations
                  associées.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                4. Base légale
              </h2>
              <p className="mt-2">
                Le traitement repose sur votre consentement (case à cocher sur
                les formulaires) et sur l&rsquo;exécution de votre demande de
                rendez-vous.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                5. Destinataires et sous-traitants
              </h2>
              <p className="mt-2">Vos données sont traitées par :</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>
                  <strong>Brevo</strong> (envoi des emails transactionnels) ;
                </li>
                <li>
                  <strong>Google Calendar</strong> (gestion des rendez-vous) ;
                </li>
                <li>
                  <strong>Directus</strong> (gestion du contenu du site).
                </li>
              </ul>
              <p className="mt-3">
                Ces prestataires peuvent être situés en dehors de l&rsquo;Union
                européenne. Aucune donnée n&rsquo;est vendue ni cédée à des tiers
                à des fins commerciales.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                6. Durée de conservation
              </h2>
              <p className="mt-2">
                Les données sont conservées le temps nécessaire au traitement de
                votre demande, puis supprimées. Les données liées aux
                rendez-vous sont conservées dans la limite nécessaire à leur
                gestion.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                7. Mesures d&rsquo;audience (cookies)
              </h2>
              <p className="mt-2">
                Le site utilise un outil de mesure d&rsquo;audience respectueux de
                la vie privée (Umami), qui ne collecte pas de données
                personnelles identifiantes et ne nécessite pas le dépôt de
                cookies de suivi publicitaire.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                8. Vos droits
              </h2>
              <p className="mt-2">
                Conformément au Règlement Général sur la Protection des Données
                (RGPD), vous disposez d&rsquo;un droit d&rsquo;accès, de
                rectification, de suppression, de limitation et d&rsquo;opposition
                au traitement de vos données.
                <br />
                Pour exercer ces droits, contactez-nous à
                terrasigne971@gmail.com.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-forest">
                9. Réclamation
              </h2>
              <p className="mt-2">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez
                introduire une réclamation auprès de la CNIL (cnil.fr).
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
