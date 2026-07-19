/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // supports class-based dark mode toggling
  theme: {
    extend: {
      colors: {
        blood: {
          light: '#EF5350',
          DEFAULT: '#D32F2F', // Blood Red
          dark: '#B71C1C',    // Dark Red
        },
        darkbg: '#1E1E1E',
        lightgrey: '#F5F5F5',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-hover': '0 10px 40px rgba(0, 0, 0, 0.15)',
        premium: '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
