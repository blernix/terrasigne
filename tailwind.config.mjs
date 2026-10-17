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
      colors: {
        cream: "#fbf7f0",
        sand: "#f2e8d8",
        "sand-200": "#e9dcc6",
        ink: "#22302a",
        "ink-soft": "#4c5b52",
        muted: "#7c8a80",
        forest: "#1f4a3f",
        "forest-700": "#193d34",
        "forest-50": "#eef4f0",
        sage: "#6e9c86",
        "sage-100": "#e3ede6",
        "sage-200": "#d2e2d7",
        teal: "#2e7d74",
        terra: "#c97b5a",
        "terra-100": "#f6e1d5",
        gold: "#d9a441",
        whatsapp: "#25d366",
        brandGreenLight: "#E0F7EA",
        brandPurple: "#6B46C1",
        brandOrange: "#ED8936",
        brandSecondary: "#38A169",
        brandLavender: "#B794F4",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "1rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(31, 74, 63, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
