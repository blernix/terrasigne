"use client";
import { useState } from "react";

export default function ServiceModal({ isOpen, onClose, service }) {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl text-center font-bold mb-4">{service.title}</h2>
        <div className="editor-content prose text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: service.description }}></div>
       
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
