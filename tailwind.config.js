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
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'toast-in': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(360deg)', opacity: '0.2' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.7s ease-out forwards',
        'toast-in': 'toast-in 0.25s ease-out forwards',
        'slide-up': 'toast-in 0.25s ease-out forwards',
        'confetti-fall': 'confetti-fall 1.6s linear forwards',
      },
    },
  },
  plugins: [],
}
