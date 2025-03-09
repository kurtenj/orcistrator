/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2c3e50',
          foreground: '#ecf0f1',
        },
        secondary: {
          DEFAULT: '#ecf0f1',
          foreground: '#2c3e50',
        },
        monster: {
          DEFAULT: '#e74c3c',
          hover: '#c0392b',
          defeated: '#7f8c8d',
        },
        player: {
          DEFAULT: '#3498db',
          hover: '#2980b9',
        },
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        '3': 'repeat(3, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-1': 'span 1 / span 1',
        'span-2': 'span 2 / span 2',
      },
    },
  },
  plugins: [],
} 