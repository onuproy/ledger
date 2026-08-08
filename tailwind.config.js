/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#6366f1',
        'accent-hover': '#818cf8',
        income: '#22c55e',
        expense: '#ef4444',
        amber: '#f59e0b',
        purple: '#a855f7',
        // Theme-aware tokens: values come from CSS variables (see index.css)
        // so every component using these classes flips with data-theme,
        // while still supporting Tailwind's /opacity modifier syntax.
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        textprimary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        textsecondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
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
