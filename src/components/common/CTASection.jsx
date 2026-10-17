"use client";
import { useState, useEffect, useRef } from "react";
import { Mail, X } from "lucide-react";

export default function CTASection({ title, description }) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const handleSubscribe = async () => {
    if (!email || !consent) {
      setMessage({
        type: "error",
        text: "Veuillez entrer un email valide et accepter le consentement.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, consentement: consent }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Un email de confirmation vous a été envoyé. Cliquez sur le lien pour valider votre inscription.",
        });
        setEmail("");
        setConsent(false);
        setTimeout(() => {
          setShowModal(false);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Cette adresse email est déjà abonnée.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion. Réessayez plus tard." });
    }

    setLoading(false);
  };

  return (
    <>
      <section className="section bg-forest">
        <div className="container-soft">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow !bg-cream/15 !text-cream">
              <Mail size={13} />
              Newsletter
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold text-cream md:text-4xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-cream/80">
              {description}
            </p>
            <button className="btn btn-violet mt-8" onClick={() => setShowModal(true)}>
              S&rsquo;abonner à la newsletter
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-title"
            className="card relative w-full max-w-md p-8"
          >
            <button
              className="absolute right-4 top-4 rounded-full p-1 text-muted transition hover:text-forest"
              onClick={() => setShowModal(false)}
              aria-label="Fermer la fenêtre"
            >
              <X size={20} />
            </button>

            <h3 id="newsletter-title" className="font-display text-2xl font-semibold text-forest">
              Newsletter Terrasigne
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              Entrez votre email pour recevoir les actualités et conseils bien-être.
            </p>

            <div className="mt-5">
              <label htmlFor="newsletter-email" className="label-text mb-1.5">
                Votre email
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                autoComplete="email"
                className="field"
                required
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={consent}
                onChange={() => setConsent(!consent)}
                className="mt-0.5 h-4 w-4 accent-forest"
                required
              />
              <span>
                J&rsquo;accepte de recevoir des emails et la{" "}
                <a href="/confidentialite" className="link-underline">
                  politique de confidentialité
                </a>
                .
              </span>
            </label>

            {message && (
              <p
                className={`mt-4 rounded-2xl p-3 text-center text-sm font-semibold ${
                  message.type === "success"
                    ? "bg-sage-100 text-forest"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                className="btn btn-ghost flex-1"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Envoi…" : "S'inscrire"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
