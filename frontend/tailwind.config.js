/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neev: {
          dark: '#0B1120',
          card: '#111827',
          surface: '#1E293B',
          border: '#334155',
          primary: '#2563EB',
          accent: '#0D9488',
          gold: '#F59E0B',
          alert: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
