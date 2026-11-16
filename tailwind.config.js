/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FFF5F8',
          100: '#FFE4EC',
          200: '#FFC8D6',
          300: '#FFA8C0',
          400: '#FF8FB1',
          500: '#F06A94',
          600: '#E56A8E',
          700: '#C74F72',
        },
        lavender: {
          100: '#EDE6FA',
          200: '#D4C5F9',
          300: '#B8A4EC',
        },
        peach: {
          100: '#FFE9D6',
          200: '#FFC8A2',
          300: '#FFA878',
        },
        mint: {
          100: '#E5F9EF',
          200: '#A8E6CF',
          300: '#7DD3A8',
        },
        ink: {
          900: '#2D2D3A',
          700: '#4A4A5A',
          500: '#6B6B7B',
          300: '#9A9AAB',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(255, 143, 177, 0.08)',
        'card': '0 4px 20px rgba(255, 143, 177, 0.10)',
        'float': '0 8px 28px rgba(240, 106, 148, 0.18)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '1.75rem',
      },
    },
  },
  plugins: [],
}
