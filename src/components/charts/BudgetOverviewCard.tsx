import { formatCurrency } from '../../lib/formatters'
import type { BudgetOverviewItem } from '../../types'

interface BudgetOverviewCardProps {
  items: BudgetOverviewItem[]
}

function progressColorClass(pct: number): string {
  if (pct > 90) return 'bg-expense'
  if (pct >= 70) return 'bg-amber'
  return 'bg-income'
}

export function BudgetOverviewCard({ items }: BudgetOverviewCardProps) {
  if (items.length === 0) return null

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-textprimary">Budgets</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => {
          const pct = item.amount > 0 ? Math.min((item.spent / item.amount) * 100, 100) : 0
          return (
            <div
              key={item.category.id}
              className="min-w-[140px] shrink-0 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.category.icon}</span>
                <span className="truncate text-sm font-medium text-textprimary">
                  {item.category.name}
                </span>
              </div>
              <div className="mt-3 text-xs text-textsecondary">
                {formatCurrency(item.spent)} / {formatCurrency(item.amount)}
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-border">
                <div
                  className={`h-1.5 rounded-full ${progressColorClass(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
