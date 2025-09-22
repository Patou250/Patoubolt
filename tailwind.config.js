/** @type {import('tailwindcss').Config} */
import konstaConfig from 'konsta/config'

const config = {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors - Structure WeWeb
        primary: {
          DEFAULT: "#287233",    // À remplacer par la vraie valeur
          base: "#287233",
          light: "#4ade80",
          dark: "#166534"
        },
        protect: {
          DEFAULT: "#017ba6",
          base: "#017ba6",
          light: "#0ea5e9",
          bg: "#f0f9ff"
        },
        share: {
          DEFAULT: "#e2725b",
          base: "#e2725b", 
          light: "#fb7185",
          bg: "#fef2f2"
        },
        awaken: {
          DEFAULT: "#ffd447",
          base: "#ffd447",
          light: "#fbbf24",
          bg: "#fffbeb"
        },
        // Text Colors
        text: {
          primary: "#0b0f0d",
          secondary: "#5b6660",
          light: "#9ca3af"
        },
        // Background Colors
        background: {
          page: "#F8FAF9",
          app: "#111315", 
          sidebar: "#1A1F1C",
          surface: "#ffffff",
          surfaceDark: "#1f2937"
        }
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        // À compléter avec les valeurs WeWeb
      },
      borderRadius: {
        // À compléter avec les valeurs WeWeb radius
        'lg': '16px',
        'md': '12px',
        'sm': '8px',
      },
      boxShadow: {
        // À compléter avec les valeurs WeWeb shadows
        'soft': '0 6px 20px rgba(0,0,0,.08)',
        'elev': '0 10px 30px rgba(0,0,0,.14)',
      },
      animation: {
        // À compléter avec les valeurs WeWeb animations
      },
    },
  },
  plugins: [],
}

// Merge with Konsta UI config
export default konstaConfig(config)