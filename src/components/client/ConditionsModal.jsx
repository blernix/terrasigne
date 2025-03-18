"use client";

export default function ConditionsModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Conditions Générales</h2>
        <p className="text-gray-700 mb-4">
          En réservant un rendez-vous, vous acceptez nos conditions générales. Vous vous engagez à respecter les
          horaires et à nous prévenir en cas d'annulation au moins 24 heures à l'avance.
        </p>
        <p className="text-gray-700 mb-4">
          Toute réservation non annulée à l'avance pourra faire l'objet d'une facturation.
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all"
            onClick={onClose}
          >
            Fermer
          </button>
          <button
            className="bg-brandSecondary text-white py-2 px-4 rounded-lg hover:bg-brandSecondary/90 transition-all"
            onClick={onAccept}
          >
            J'ai lu 
          </button>
        </div>
      </div>
    </div>
  );
}