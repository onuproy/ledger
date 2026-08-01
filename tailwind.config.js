/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#6366f1',
        'accent-hover': '#818cf8',
        surface: '#0b0b10',
        card: '#13131e',
        border: '#1f1f30',
        income: '#22c55e',
        expense: '#ef4444',
        amber: '#f59e0b',
        purple: '#a855f7',
        textprimary: '#f1f5f9',
        textsecondary: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
