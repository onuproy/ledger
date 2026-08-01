import { Check } from 'lucide-react'
import { formatCurrency } from '../../lib/formatters'
import type { Goal } from '../../types'

interface GoalCardProps {
  goal: Goal
  onClick: () => void
}

function daysLeftLabel(deadline: string): string {
  const today = new Date()
  const target = new Date(deadline)
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due today'
  return `${diffDays} day${diffDays === 1 ? '' : 's'} left`
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const pct =
    goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl p-4 text-left text-white ${
        goal.is_completed ? 'opacity-60' : ''
      }`}
      style={{ backgroundImage: `linear-gradient(135deg, ${goal.color}, ${goal.color}99)` }}
    >
      {goal.is_completed && (
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Check size={18} />
        </div>
      )}

      <span className="text-3xl">{goal.icon}</span>
      <p className="truncate font-semibold">{goal.name}</p>

      <div className="h-2 w-full rounded-full bg-white/30">
        <div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>

      <p className="text-sm text-white/90">
        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
      </p>

      <p className="text-xs text-white/80">
        {goal.is_completed ? '✅ Completed!' : daysLeftLabel(goal.deadline)}
      </p>
    </button>
  )
}
