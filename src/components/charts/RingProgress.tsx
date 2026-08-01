import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface RingProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  children?: ReactNode
}

export function RingProgress({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = '#6366f1',
  trackColor = '#1f1f30',
  children,
}: RingProgressProps) {
  const clamped = Math.min(100, Math.max(0, percentage))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setOffset(circumference - (clamped / 100) * circumference)
    })
    return () => cancelAnimationFrame(raf)
  }, [clamped, circumference])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  )
}
