/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: "2px",
      },
      // Palette unique du site (miroir des variables de src/app/globals.css) :
      // vert clair dominant, violet pour la spiritualité, neutres chauds.
      colors: {
        cream: "#f8fbf5",
        sand: "#eef5e9",
        "sand-200": "#ddebd7",
        ink: "#1f2a24",
        "ink-soft": "#45534b",
        muted: "#66706a",
        forest: "#2e5940",
        "forest-700": "#234530",
        "forest-50": "#f0f6eb",
        sage: "#79a97d",
        "sage-100": "#e5f1df",
        "sage-200": "#cde4c6",
        eau: "#b4d9c8",
        mint: "#def1e4",
        violet: "#6e5498",
        "violet-100": "#efebf7",
        whatsapp: "#25d366",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      // Deux rayons seulement : 12px pour les petits éléments, 16px pour les
      // cartes, 24px pour les grands blocs. Les boutons restent en pastille.
      borderRadius: {
        DEFAULT: "0.75rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1rem",
        "3xl": "1rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(46, 89, 64, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
