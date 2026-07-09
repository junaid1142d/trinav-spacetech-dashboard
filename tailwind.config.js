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
          navy: '#000000',
          dark: '#0A0A0A',
          cyan: '#FFFFFF',
          blue: '#22D3EE',
          accent: '#22D3EE',
          darker: '#000000',
          card: '#111111',
          border: 'rgba(255, 255, 255, 0.1)',
          borderHover: 'rgba(255, 255, 255, 0.25)',
          textSecondary: '#D4D4D4',
          textMuted: '#737373',
          chart: {
            line: '#22D3EE',
            grid: 'rgba(255,255,255,0.06)',
            bar: '#FFFFFF',
            barAlt: '#22D3EE',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(34, 211, 238, 0.15)',
        'cyan-glow-lg': '0 0 40px rgba(34, 211, 238, 0.2)',
        'white-glow': '0 0 20px rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
