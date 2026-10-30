/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff6600", // Naranja AtomicFox
        darkBg: "#0f172a",  // Fondo oscuro principal
        cardBg: "#1e293b",  // Fondo de tarjetas
      },
    },
  },
  plugins: [],
};