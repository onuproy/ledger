import { formatCurrency } from '../../lib/formatters'
import type { TopCategoryItem } from '../../types'

interface TopCategoriesListProps {
  items: TopCategoryItem[]
}

const MEDALS = ['🥇', '🥈', '🥉']

function rankLabel(index: number): string {
  if (index < MEDALS.length) return MEDALS[index]
  return `${index + 1}th`
}

export function TopCategoriesList({ items }: TopCategoriesListProps) {
  const maxAmount = items[0]?.amount ?? 0

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-medium text-textprimary">Top Categories</h2>

      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-textsecondary">No expenses this period</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => {
            const pct = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
            return (
              <div key={item.category.id} className="flex items-center gap-3">
                <span className="w-7 shrink-0 text-center text-sm">{rankLabel(i)}</span>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                  style={{ backgroundColor: `${item.category.color}26` }}
                >
                  {item.category.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-textprimary">{item.category.name}</span>
                    <span className="shrink-0 font-medium text-textprimary">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: item.category.color }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
