"use client";
import { useEffect, useRef } from "react";

export default function ServiceModal({ isOpen, onClose, service }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const { titre, prix, description } = service;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={contentRef} className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:ring-2 focus:ring-brandPurple rounded"
          aria-label="Fermer la modale"
        >
          ✖
        </button>

        <h2 id="modal-title" className="text-2xl text-center font-bold text-brandPurple mb-2">{titre}</h2>

        {prix && (
          <p className="text-center text-lg font-medium text-gray-800 mb-4">
            {prix} €
          </p>
        )}

        <div
          className="editor-content prose text-gray-700"
          dangerouslySetInnerHTML={{ __html: description }}
        ></div>
      </div>
    </div>
  );
}
