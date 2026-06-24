/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1020',
          dark: '#111827',
          cyan: '#22D3EE',
          blue: '#38BDF8',
          darker: '#060A13',
          card: '#151D30',
          border: 'rgba(34, 211, 238, 0.2)',
          borderHover: 'rgba(34, 211, 238, 0.4)',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(34, 211, 238, 0.15)',
        'cyan-glow-lg': '0 0 25px rgba(34, 211, 238, 0.25)',
      },
    },
  },
  plugins: [],
}
