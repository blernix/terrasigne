import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import { Check, X } from "lucide-react";

export default async function NewsletterConfirmation({ searchParams }) {
  const params = await searchParams;
  const ok = params?.status === "ok";

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="flex min-h-screen items-center justify-center bg-cream px-4 pt-24 pb-16"
      >
        <div className="card w-full max-w-md p-10 text-center">
          <span
            className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
              ok ? "bg-sage-100 text-forest" : "bg-violet-100 text-violet"
            }`}
          >
            {ok ? <Check size={30} /> : <X size={30} />}
          </span>

          {ok ? (
            <>
              <h1 className="mt-6 font-display text-2xl font-semibold text-forest">
                Inscription confirmée&nbsp;!
              </h1>
              <p className="mt-3 text-ink-soft">
                Merci, vous êtes maintenant abonné(e) à la newsletter Terrasigne.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-2xl font-semibold text-forest">
                Lien invalide
              </h1>
              <p className="mt-3 text-ink-soft">
                Ce lien de confirmation est invalide ou a expiré. Veuillez
                réessayer.
              </p>
            </>
          )}

          <Link href="/" className="btn btn-primary mt-8 w-full">
            Retour à l&rsquo;accueil
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
