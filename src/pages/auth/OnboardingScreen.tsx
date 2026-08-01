import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Slide {
  icon: string
  title: string
  subtitle: string
}

const SLIDES: Slide[] = [
  {
    icon: '💸',
    title: 'Track Every Penny',
    subtitle: 'Know where your money goes',
  },
  {
    icon: '🎯',
    title: 'Set Smart Budgets',
    subtitle: 'Stay on top of your spending',
  },
  {
    icon: '⭐',
    title: 'Reach Your Goals',
    subtitle: 'Save for what matters most',
  },
]

const SWIPE_THRESHOLD = 50

export function OnboardingScreen() {
  const [slide, setSlide] = useState(0)
  const navigate = useNavigate()
  const touchStartX = useRef<number | null>(null)

  const isLast = slide === SLIDES.length - 1

  function goNext() {
    if (isLast) {
      navigate('/login')
    } else {
      setSlide((s) => Math.min(s + 1, SLIDES.length - 1))
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta < -SWIPE_THRESHOLD) {
      goNext()
    } else if (delta > SWIPE_THRESHOLD) {
      setSlide((s) => Math.max(s - 1, 0))
    }
    touchStartX.current = null
  }

  const current = SLIDES[slide]

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col bg-surface px-6 py-6">
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/login')}
          className="min-h-[48px] px-2 text-sm text-textsecondary"
        >
          Skip
        </button>
      </div>

      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <span className="text-6xl">{current.icon}</span>
        <h1 className="text-2xl font-semibold text-textprimary">{current.title}</h1>
        <p className="text-textsecondary">{current.subtitle}</p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-2">
        {SLIDES.map((s, i) => (
          <span
            key={s.title}
            className={`h-2 w-2 rounded-full ${
              i === slide ? 'bg-accent' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <button
        onClick={goNext}
        className="min-h-[48px] rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover"
      >
        {isLast ? 'Get Started' : 'Next'}
      </button>
    </div>
  )
}
