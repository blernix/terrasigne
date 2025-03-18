/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        brandGreenLight: '#E0F7EA',
        brandPurple: '#6B46C1',
        brandOrange: '#ED8936',
        brandSecondary: '#38A169',
        brandLavender: '#B794F4',
        // Ajoutez d'autres couleurs si nécessaire
      },
      borderRadius: {
        'xl': '1rem',
      },
      // Ajoutez d'autres personnalisations si nécessaire
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
