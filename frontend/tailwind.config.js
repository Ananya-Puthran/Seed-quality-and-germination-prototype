/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c5dcd0',
          300: '#9ec1b0',
          400: '#719e8a',
          500: '#4e806d',
          600: '#386655',
          700: '#2b5144',
          800: '#234137',
          900: '#163323',
          950: '#0b1c13',
        },
        cream: {
          50: '#fcfdfa',
          100: '#faf8f5',
          200: '#f5f2ec',
          300: '#eee9e0',
          400: '#e2ddd5',
          500: '#d0c8bb',
        },
        sage: {
          50: '#f4f6f4',
          100: '#e5e9e5',
          200: '#cfd7cf',
          300: '#b0bfb1',
          400: '#8ca18e',
          500: '#6f8571',
          600: '#566a58',
          700: '#465547',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      }
    },
  },
  plugins: [],
}
