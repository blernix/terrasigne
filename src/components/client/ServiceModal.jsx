"use client";
import { useState } from "react";

export default function ServiceModal({ isOpen, onClose, service }) {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
        
        {/* ❌ Bouton de fermeture flottant en haut à droite */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✖
        </button>

        <h2 className="text-2xl text-center font-bold mb-6">{service.title}</h2>

        <div
          className="editor-content prose text-gray-700"
          dangerouslySetInnerHTML={{ __html: service.description }}
        ></div>
        
      </div>
    </div>
  );
}