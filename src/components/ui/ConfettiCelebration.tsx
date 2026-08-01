import { useEffect, useMemo } from 'react'

interface ConfettiCelebrationProps {
  onDone: () => void
}

const PARTICLE_EMOJIS = ['🎉', '🎊', '✨', '⭐', '💛']
const PARTICLE_COUNT = 18

export function ConfettiCelebration({ onDone }: ConfettiCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200)
    return () => clearTimeout(timer)
  }, [onDone])

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.4 + Math.random() * 0.8,
        emoji: PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length],
      })),
    []
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-10%] animate-confetti-fall text-2xl"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-fade-in rounded-2xl bg-card px-6 py-4 text-center shadow-xl">
          <p className="text-2xl">🎉</p>
          <p className="mt-1 font-semibold text-textprimary">Goal Completed!</p>
        </div>
      </div>
    </div>
  )
}
