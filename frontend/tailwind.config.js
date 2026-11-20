/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nyay: {
          emerald: '#10b981',
          gold: '#f59e0b',
          crimson: '#ef4444',
          slate: '#020617',
          card: '#0f172a',
          border: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'badge-glow': 'badgeGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        badgeGlow: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.4)' },
          '100%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
