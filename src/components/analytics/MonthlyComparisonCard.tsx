import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatCurrency } from '../../lib/formatters'

interface MonthlyComparisonCardProps {
  thisMonth: number
  lastMonth: number
}

export function MonthlyComparisonCard({ thisMonth, lastMonth }: MonthlyComparisonCardProps) {
  const diff =
    lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : thisMonth > 0 ? 100 : 0
  const isMore = diff >= 0

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-medium text-textprimary">Monthly Comparison</h2>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-textsecondary">This month</p>
          <p className="font-semibold text-textprimary">{formatCurrency(thisMonth)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-textsecondary">Last month</p>
          <p className="font-semibold text-textprimary">{formatCurrency(lastMonth)}</p>
        </div>
      </div>

      <div
        className={`mt-3 flex items-center gap-1 text-sm font-medium ${
          isMore ? 'text-expense' : 'text-income'
        }`}
      >
        {isMore ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        {Math.abs(Math.round(diff))}% {isMore ? 'more' : 'less'} than last month
      </div>
    </div>
  )
}
