import type { ReactNode } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { formatCurrency } from '../../lib/formatters'
import type { IncomeExpensePoint } from '../../types'

interface IncomeExpenseChartProps {
  data: IncomeExpensePoint[]
  action?: ReactNode
}

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const income = payload.find((p) => p.dataKey === 'income')?.value ?? 0
  const expense = payload.find((p) => p.dataKey === 'expense')?.value ?? 0

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-textprimary">{label}</p>
      <p className="text-accent">Income: {formatCurrency(Number(income))}</p>
      <p style={{ color: '#f43f5e' }}>Expense: {formatCurrency(Number(expense))}</p>
    </div>
  )
}

export function IncomeExpenseChart({ data, action }: IncomeExpenseChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-textprimary">Income vs Expense</h2>
        {action}
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 11 }}
            />
            <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} content={ChartTooltip} />
            <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex justify-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-xs text-textsecondary">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#f43f5e' }} />
          <span className="text-xs text-textsecondary">Expense</span>
        </div>
      </div>
    </div>
  )
}
