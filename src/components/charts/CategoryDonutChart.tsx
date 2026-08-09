import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { CategoryBreakdown } from '../../store/analyticsStore'

interface CategoryDonutChartProps {
  data: CategoryBreakdown[]
  title: string
  emptyMessage: string
  formatAmount: (n: number) => string
}

export function CategoryDonutChart({ data, title, emptyMessage, formatAmount }: CategoryDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0)

  function renderTooltip({ active, payload }: TooltipContentProps) {
    if (!active || !payload?.length) return null
    const slice = payload[0].payload as CategoryBreakdown

    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
        <p className="font-medium text-textprimary">
          {slice.icon} {slice.name}
        </p>
        <p className="text-textsecondary">
          {formatAmount(slice.amount)} ({Math.round(slice.percentage)}%)
        </p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-medium text-textprimary">{title}</h2>
        <p className="py-8 text-center text-sm text-textsecondary">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-sm font-medium text-textprimary">{title}</h2>
      <div className="relative" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-textsecondary">Total</span>
          <span className="text-xl font-semibold text-textprimary">{formatAmount(total)}</span>
        </div>
      </div>
    </div>
  )
}
