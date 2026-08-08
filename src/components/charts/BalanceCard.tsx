import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, formatFullDate, formatMonthYear } from '../../lib/formatters'

interface BalanceCardProps {
  balance: number
  income: number
  expense: number
}

const ANIMATION_DURATION_MS = 1200

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafId = useRef<number | null>(null)
  const isNegative = balance < 0

  useEffect(() => {
    const startTime = performance.now()
    const startValue = 0

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startValue + (balance - startValue) * eased)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick)
      }
    }

    rafId.current = requestAnimationFrame(tick)
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [balance])

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm text-white/70">Total Balance</span>
          <p className="text-xs text-white/60">{formatFullDate()}</p>
        </div>
        <span className="text-xs text-white/70">{formatMonthYear()}</span>
      </div>

      <div className={`mt-2 text-4xl font-bold ${isNegative ? 'text-red-400' : 'text-white'}`}>
        {isNegative ? '-' : ''}
        {formatCurrency(Math.abs(displayValue))}
      </div>

      <div className="mt-5 flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <ArrowUpRight size={16} className="text-income" />
          <span className="text-sm text-white/90">{formatCurrency(income)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowDownRight size={16} className="text-expense" />
          <span className="text-sm text-white/90">{formatCurrency(expense)}</span>
        </div>
      </div>
    </div>
  )
}
