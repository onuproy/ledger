import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { formatCurrency } from '../../lib/formatters'
import type { DailyTotal } from '../../types'

interface SpendChartProps {
  data: DailyTotal[]
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const value = payload[0].value ?? 0

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <span className="text-textprimary">{formatCurrency(Number(value))}</span>
    </div>
  )
}

export function SpendChart({ data }: SpendChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-sm font-medium text-textprimary">Last 7 Days</h2>
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="24%">
            <CartesianGrid
              vertical={false}
              stroke="rgb(var(--color-border))"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 11 }}
            />
            <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} content={ChartTooltip} />
            <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
