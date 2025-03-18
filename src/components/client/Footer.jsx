import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4 text-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Navigation Links */}
          <div className="flex space-x-6">
            <Link href="/" className="hover:text-brandPurple transition">
              Accueil
            </Link>
            <Link href="/services" className="hover:text-brandPurple transition">
              Services
            </Link>
            <Link href="/blog" className="hover:text-brandPurple transition">
              Blog
            </Link>
            <Link href="/contact" className="hover:text-brandPurple transition">
              Contact
            </Link>
            <Link href="/propos" className="hover:text-brandPurple transition">
              A propos
            </Link>
          </div>

          {/* Social Media */}
          <div className="flex space-x-6">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brandPurple transition"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brandPurple transition"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brandPurple transition"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Terrasigne. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}