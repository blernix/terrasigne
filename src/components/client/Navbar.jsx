"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-brandPurple">
          Terrasigne
        </Link>

        {/* Hamburger Menu */}
        <button
          className="block sm:hidden text-gray-600 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                isOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Links */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } sm:flex sm:items-center sm:space-x-6`}
        >
          <Link href="/" className="block mt-2 sm:mt-0 text-gray-800 hover:text-brandPurple transition">
            Accueil
          </Link>
          <Link href="/services" className="block mt-2 sm:mt-0 text-gray-800 hover:text-brandPurple transition">
            Services
          </Link>
          <Link href="/blog" className="block mt-2 sm:mt-0 text-gray-800 hover:text-brandPurple transition">
            Blog
          </Link>
          <Link href="/contact" className="block mt-2 sm:mt-0 text-gray-800 hover:text-brandPurple transition">
            Contact
          </Link>
          <Link href="/propos" className="block mt-2 sm:mt-0 text-gray-800 hover:text-brandPurple transition">
            A propos
          </Link>
        </div>
      </div>
    </nav>
  );
}