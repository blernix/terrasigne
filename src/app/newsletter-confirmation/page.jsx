import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";

export default async function NewsletterConfirmation({ searchParams }) {
  const params = await searchParams;
  const ok = params?.status === "ok";

  return (
    <>
      <Navbar />
      <main className="min-h-screen mt-16 bg-[var(--secondary)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          {ok ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Inscription confirmée !
              </h1>
              <p className="text-gray-500">
                Merci, vous êtes maintenant abonné(e) à la newsletter TerraSigne.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">
                Lien invalide
              </h1>
              <p className="text-gray-500">
                Ce lien de confirmation est invalide ou a expiré. Veuillez
                réessayer.
              </p>
            </>
          )}
          <a
            href="/"
            className="inline-block mt-6 bg-brandPurple text-white py-3 px-6 rounded-full font-semibold hover:bg-brandPurple/90 transition"
          >
            Retour à l&rsquo;accueil
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
