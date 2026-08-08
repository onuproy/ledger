import { useId } from 'react'
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { formatCurrency } from '../../lib/formatters'
import type { TrendPoint } from '../../types'

interface SpendingTrendChartProps {
  data: TrendPoint[]
}

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const value = payload[0].value ?? 0

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 text-textsecondary">{label}</p>
      <p className="font-medium text-textprimary">{formatCurrency(Number(value))}</p>
    </div>
  )
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const gradientId = useId()
  const average =
    data.length > 0 ? data.reduce((sum, p) => sum + p.total, 0) / data.length : 0

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-sm font-medium text-textprimary">Spending Trend</h2>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <Tooltip content={ChartTooltip} />
            <ReferenceLine y={average} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1.5} />
            <Area type="monotone" dataKey="total" stroke="none" fill={`url(#${gradientId})`} />
            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-textsecondary">
        <span className="inline-block h-0 w-4 border-t-2 border-dashed border-amber" />
        Average: {formatCurrency(average)}
      </div>
    </div>
  )
}
