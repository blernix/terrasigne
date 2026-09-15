import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export const metadata = {
  title: "Politique de confidentialité | Terrasigne",
  description:
    "Politique de confidentialité de Terrasigne : données collectées, finalités, sous-traitants, durée de conservation et droits des utilisateurs.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://terrasigne.fr/confidentialite" },
};

export default function Confidentialite() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen px-8 py-16 max-w-3xl mx-auto mt-12 mb-12">
        <h1 className="text-4xl font-bold text-gray-800 leading-tight mb-8">
          Politique de <span className="text-brandOrange">confidentialité</span>
        </h1>

        <p className="text-gray-600 mb-8">Dernière mise à jour : {new Date().getFullYear()}.</p>

        <section className="space-y-8 text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              1. Responsable du traitement
            </h2>
            <p>
              Le site terrasigne.fr est édité par Cindy Guillaume, praticienne en
              soins holistiques, située à Terre de Bas, Guadeloupe.
              <br />
              Contact : terrasigne971@gmail.com
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              2. Données collectées
            </h2>
            <p className="mb-2">Lors de l'utilisation du site, nous pouvons collecter :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Formulaire de contact : nom, prénom, adresse email, numéro de téléphone (facultatif) et message.</li>
              <li>Formulaire de réservation : nom, prénom, adresse email, numéro de téléphone (facultatif), message (facultatif) ainsi que la date et l'heure du rendez-vous choisi.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              3. Finalités du traitement
            </h2>
            <p>Les données sont utilisées uniquement pour :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>répondre à vos demandes de contact ;</li>
              <li>gérer vos rendez-vous et vous envoyer les confirmations associées.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              4. Base légale
            </h2>
            <p>
              Le traitement repose sur votre consentement (case à cocher sur les
              formulaires) et sur l'exécution de votre demande de rendez-vous.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              5. Destinataires et sous-traitants
            </h2>
            <p className="mb-2">Vos données sont traitées par :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Brevo</strong> (envoi des emails transactionnels) ;</li>
              <li><strong>Google Calendar</strong> (gestion des rendez-vous) ;</li>
              <li><strong>Directus</strong> (gestion du contenu du site).</li>
            </ul>
            <p className="mt-2">
              Ces prestataires peuvent être situés en dehors de l'Union européenne.
              Aucune donnée n'est vendue ni cédée à des tiers à des fins commerciales.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              6. Durée de conservation
            </h2>
            <p>
              Les données sont conservées le temps nécessaire au traitement de votre
              demande, puis supprimées. Les données liées aux rendez-vous sont
              conservées dans la limite nécessaire à leur gestion.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              7. Mesures d'audience (cookies)
            </h2>
            <p>
              Le site utilise un outil de mesure d'audience respectueux de la vie
              privée (Umami), qui ne collecte pas de données personnelles identifiantes
              et ne nécessite pas le dépôt de cookies de suivi publicitaire.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              8. Vos droits
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD),
              vous disposez d'un droit d'accès, de rectification, de suppression, de
              limitation et d'opposition au traitement de vos données.
              <br />
              Pour exercer ces droits, contactez-nous à terrasigne971@gmail.com.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brandPurple mb-2">
              9. Réclamation
            </h2>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez
              introduire une réclamation auprès de la CNIL (cnil.fr).
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
