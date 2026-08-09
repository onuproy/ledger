import type { CategoryBreakdown } from '../../store/analyticsStore'

interface CategoryBreakdownListProps {
  items: CategoryBreakdown[]
  emptyMessage: string
  formatAmount: (n: number) => string
}

export function CategoryBreakdownList({ items, emptyMessage, formatAmount }: CategoryBreakdownListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card px-4 py-6 text-center text-sm text-textsecondary">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: item.color }}
          >
            {item.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-textprimary">{item.name}</span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-textsecondary">{Math.round(item.percentage)}%</span>
                <span className="font-medium text-textprimary">{formatAmount(item.amount)}</span>
              </div>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-border">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
