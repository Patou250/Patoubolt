/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#287233",  // Patou Main
        protect: "#017ba6",  // Protéger
        share:   "#e2725b",  // Partager
        awaken:  "#ffd447",  // Éveiller
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [
    // Activer si déjà installés (sinon laisse comme ça, Tailwind ignore)
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
  safelist: [
    // Pour éviter le purge sur nos utilitaires dynamiques
    { pattern: /(bg|text|border)-(primary|protect|share|awaken)/ },
    { pattern: /from-(primary|protect|share|awaken)/ },
    { pattern: /to-(primary|protect|share|awaken)/ },
  ],
}