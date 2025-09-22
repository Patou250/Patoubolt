/** @type {import('tailwindcss').Config} */
import konstaConfig from 'konsta/config'

const config = {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#287233",      // CTA global
        protect: "#017ba6",      // Protéger  
        share: "#e2725b",        // Partager
        awaken: "#ffd447",       // Éveiller
        bgPage: "#F8FAF9",       // Fond clair (pages publiques)
        bgApp: "#111315",        // Fond sombre (player/app)
        bgSidebar: "#1A1F1C",    // Sidebar
        textMain: "#0b0f0d",     // Texte principal
        textMuted: "#5b6660"     // Texte secondaire
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
      },
      boxShadow: {
        soft: "0 6px 20px rgba(0,0,0,.08)",
        elev: "0 10px 30px rgba(0,0,0,.14)",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
}

// Merge with Konsta UI config
export default konstaConfig(config)