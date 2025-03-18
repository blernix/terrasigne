"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import ConditionsModal from "@/components/client/ConditionsModal";

registerLocale("fr", fr);
const localizer = momentLocalizer(moment);

export default function Rdv({ services }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAcceptedConditions, setHasAcceptedConditions] = useState(false);

  const events = [
    {
      title: "Séance de groupe",
      start: new Date(2025, 1, 20, 10, 0),
      end: new Date(2025, 1, 20, 11, 0),
    },
    {
      title: "Consultation en visio",
      start: new Date(2025, 1, 21, 14, 0),
      end: new Date(2025, 1, 21, 15, 0),
    },
  ];

  const serviceQuestions = {
    "Séance de groupe acceptation de soi": [
      "Quel est votre objectif principal pour cette séance ?",
      "Avez-vous déjà participé à une séance similaire ?",
    ],
    "Consultation en visio": [
      "Quels sont les principaux défis que vous souhaitez aborder ?",
      "Avez-vous déjà suivi un accompagnement similaire auparavant ?",
    ],
    "Massage bien-être & Modelage intuitif": [
      "Y a-t-il une zone du corps que vous souhaitez cibler en particulier ?",
      "Avez-vous des douleurs ou tensions spécifiques ?",
    ],
    "Reiki et soins Atlantes": [
      "Avez-vous déjà expérimenté un soin énergétique ?",
      "Quels bienfaits attendez-vous de cette séance ?",
    ],
  };

  return (
    <section className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-12">
      <h2 className="text-3xl font-bold text-brandPurple mb-6">Réservez un rendez-vous</h2>
      <form className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom"
            className="border p-3 rounded-lg w-full"
          />
          <input
            type="text"
            placeholder="Prénom"
            className="border p-3 rounded-lg w-full"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg w-full"
        />
        <select
          className="border p-3 rounded-lg w-full"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          <option value="">Sélectionnez un service</option>
          {services.map((service, index) => (
            <option key={index} value={service.title}>
              {service.title}
            </option>
          ))}
        </select>
        <div>
          <label className="block text-gray-700 mb-2">Sélectionnez une date et un créneau</label>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 400 }}
            onSelectEvent={(event) => setSelectedSlot(event)}
          />
        </div>
        {selectedService && serviceQuestions[selectedService] && (
          <div className="grid gap-4">
            {serviceQuestions[selectedService].map((question, index) => (
              <div key={index} className="grid gap-2">
                <label className="text-gray-700">{question}</label>
                <input type="text" className="border p-3 rounded-lg w-full" />
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            className="w-5 h-5"
            disabled={!hasAcceptedConditions}
          />
          <span
            className="cursor-pointer text-blue-600 underline"
            onClick={() => setIsModalOpen(true)}
          >
            J'accepte les conditions générales du rendez-vous
          </span>
        </label>
        <ConditionsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAccept={() => {
            setHasAcceptedConditions(true);
            setIsModalOpen(false);
          }}
        />
        <button className="bg-brandSecondary text-white py-3 px-6 rounded-lg hover:bg-brandSecondary/90 transition-all">
          Valider la réservation
        </button>
      </form>
    </section>
  );
}
