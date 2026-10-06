/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        noc: {
          bg: '#070A14',
          card: '#0D1427',
          cardHover: '#121A32',
          border: 'rgba(51, 65, 85, 0.4)',
          glowBlue: '#1D4ED8',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          emerald: '#10B981',
          rose: '#EF4444',
          amber: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};
