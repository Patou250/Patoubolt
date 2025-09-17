/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Patou palette
        primary: "#287233",  // Patou Main - couleur centrale
        protect: "#017ba6",  // Protéger - sécurité/parents  
        share:   "#e2725b",  // Partager - social/favoris
        awaken:  "#ffd447",  // Éveiller - ludique/enfants
        
        // Extended grays for better contrast
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'header': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      transitionDuration: {
        '400': '400ms',
      }
    },
  },
  plugins: [
    // Uncomment if you want to add these plugins later
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
  safelist: [
    // Prevent purging of dynamic Patou color classes
    { pattern: /(bg|text|border|ring)-(primary|protect|share|awaken)/ },
    { pattern: /from-(primary|protect|share|awaken)/ },
    { pattern: /to-(primary|protect|share|awaken)/ },
    { pattern: /(btn|badge|nav)-(primary|protect|share|awaken)/ },
    'nav-parent-active',
    'nav-child-active', 
    'nav-share-active',
    'text-context-parent',
    'text-context-child',
    'text-context-share',
    'bg-context-parent',
    'bg-context-child',
    'bg-context-share',
  ],
}