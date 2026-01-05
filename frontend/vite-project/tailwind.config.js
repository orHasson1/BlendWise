/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Teal main palette (shadcn / tailwind teal inspired) replacing previous green
          DEFAULT: '#0d9488', // teal 600 (accessible primary)
          light: '#14b8a6',   // teal 500
          dark: '#0f766e',    // teal 700
          accent: '#c8a2d6',  // soft romantic lavender accent
          mist: '#ecfdfd'     // very light teal wash (teal 50 variant)
        },
        essence: {
          bg: '#f8faf9', // keep neutral background
          card: '#ffffff',
          sand: '#f5eee9', // softened sand
            leaf: '#e6f7f4', // minty leaf aligning with teal
          petal: '#f6ecf9' // soft blush-lavender hybrid
        },
        tone: {
          calm: '#7aa6c8',  // keep for secondary cool accent
          uplift: '#f2ae49',
          focus: '#5d6fb3',
          relax: '#5fa89f', // adjusted toward teal
          soothe: '#d3aacb', // softened mauve
          warm: '#d9a089'   // softer warm accent
        }
      },
      boxShadow: {
        'card': '0 4px 18px -2px rgba(15,23,42,0.06), 0 2px 4px -1px rgba(15,23,42,0.04)'
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp')
  ],
};
