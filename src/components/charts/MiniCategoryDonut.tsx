import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { formatCurrency } from '../../lib/formatters'
import type { CategorySlice } from '../../types'

interface MiniCategoryDonutProps {
  slices: CategorySlice[]
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const slice = payload[0].payload as CategorySlice

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-textprimary">{slice.name}</p>
      <p className="text-textsecondary">{formatCurrency(slice.amount)}</p>
    </div>
  )
}

export function MiniCategoryDonut({ slices }: MiniCategoryDonutProps) {
  const topThree = slices.slice(0, 3)

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-textprimary">Spending by Category</h2>
        <Link to="/analytics" className="text-sm text-accent">
          See all →
        </Link>
      </div>

      {slices.length === 0 ? (
        <p className="py-8 text-center text-sm text-textsecondary">No expenses this period</p>
      ) : (
        <>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {slices.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip content={ChartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {topThree.map((slice) => (
              <div key={slice.name} className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate text-sm text-textprimary">{slice.name}</span>
                </div>
                <span className="shrink-0 text-sm font-medium text-textprimary">
                  {formatCurrency(slice.amount)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
