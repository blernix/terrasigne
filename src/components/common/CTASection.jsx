"use client";
import { useState } from "react";

export default function CTASection({ title, description }) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !consent) {
      setMessage({ type: "error", text: "Veuillez entrer un email valide et accepter le consentement." });
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
        setMessage({ type: "success", text: "Vous êtes maintenant abonné à la newsletter !" });
        
        // Reset du formulaire après validation
        setEmail("");
        setConsent(false);

        // Fermeture automatique de la modal après 2s
        setTimeout(() => {
          setShowModal(false);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.message || "Cette adresse email est déjà abonnée." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion. Réessayez plus tard." });
    }

    setLoading(false);
  };

  return (
    <>
      {/* Bouton CTA */}
      <section
        className="text-center bg-gradient-to-r from-brandPurple to-brandOrange text-white p-14 rounded-xl shadow-lg max-w-5xl mx-auto mb-16"
        data-aos="zoom-in"
      >
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <p className="text-lg mb-8">{description}</p>
        <button
          className="px-6 py-3 bg-white text-brandPurple font-semibold rounded-full hover:bg-gray-100 transition-all"
          onClick={() => setShowModal(true)}
        >
          S'abonner à la newsletter
        </button>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
            {/* Bouton de fermeture */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>

            <h3 className="text-2xl font-bold mb-4 text-gray-800">S'abonner à la newsletter</h3>
            <p className="text-gray-600 mb-4">Entrez votre email pour recevoir les dernières actualités.</p>

            {/* Input Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple mb-4"
              required
            />

            {/* Consentement */}
            <label className="flex items-center space-x-2 text-gray-700 mb-4">
              <input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} required />
              <span>J'accepte de recevoir des emails et la politique de confidentialité.</span>
            </label>

            {/* Messages */}
            {message && (
              <p className={`p-2 text-center text-sm font-medium rounded-md mb-4 
                ${message.type === "success" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                {message.text}
              </p>
            )}

            {/* Boutons */}
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-all"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Envoi..." : "S'inscrire"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}