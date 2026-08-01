import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { formatCurrency } from '../../lib/formatters'
import type { CategorySlice } from '../../types'

interface CategoryDonutChartProps {
  data: CategorySlice[]
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const slice = payload[0].payload as CategorySlice

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-textprimary">{slice.name}</p>
      <p className="text-textsecondary">
        {formatCurrency(slice.amount)} ({Math.round(slice.percentage)}%)
      </p>
    </div>
  )
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const biggest = data[0]

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-medium text-textprimary">Spending by Category</h2>
        <p className="py-8 text-center text-sm text-textsecondary">No expenses this period</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-sm font-medium text-textprimary">Spending by Category</h2>
      <div className="relative" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={ChartTooltip} />
          </PieChart>
        </ResponsiveContainer>

        {biggest && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="max-w-[80px] truncate text-xs text-textsecondary">
              {biggest.name}
            </span>
            <span className="text-base font-semibold text-textprimary">
              {formatCurrency(biggest.amount)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
        {data.map((slice) => (
          <div key={slice.name} className="flex shrink-0 items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-xs text-textsecondary">{slice.name}</span>
            <span className="text-xs font-medium text-textprimary">
              {formatCurrency(slice.amount)}
            </span>
            <span className="text-xs text-textsecondary">
              ({Math.round(slice.percentage)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
