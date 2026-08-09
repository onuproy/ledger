import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cell, Label, Pie, PieChart, Sector, Tooltip } from 'recharts'
import type { PieSectorShapeProps, TooltipContentProps } from 'recharts'
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
  const [activeIndex, setActiveIndex] = useState(0)
  const topThree = slices.slice(0, 3)
  const activeSlice = slices[activeIndex] ?? slices[0]

  // recharts v3 dropped Pie's `activeIndex` prop, so click-driven expansion
  // is done by hand here: render every sector via `shape` and grow the one
  // matching our own activeIndex state (rather than recharts' hover-based
  // `isActive`, which wouldn't stay expanded after the click ends).
  function renderSector(sectorProps: PieSectorShapeProps) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = sectorProps
    const isActive = index === activeIndex
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={isActive ? innerRadius - 3 : innerRadius}
        outerRadius={isActive ? outerRadius + 8 : outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={isActive ? { filter: 'brightness(1.15)' } : undefined}
      />
    )
  }

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
          <div className="flex justify-center">
            <PieChart width={220} height={220}>
              <Pie
                data={slices}
                dataKey="amount"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="none"
                strokeWidth={0}
                shape={renderSector}
                onClick={(_, index) => setActiveIndex(index)}
              >
                {slices.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
                {activeSlice && (
                  <Label
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox as { cx: number; cy: number }
                      return (
                        <g>
                          <text x={cx} y={cy - 8} textAnchor="middle" fill="#94a3b8" fontSize={11}>
                            {activeSlice.name}
                          </text>
                          <text
                            x={cx}
                            y={cy + 12}
                            textAnchor="middle"
                            fill="#f1f5f9"
                            fontSize={15}
                            fontWeight="bold"
                          >
                            {formatCurrency(activeSlice.amount)}
                          </text>
                        </g>
                      )
                    }}
                  />
                )}
              </Pie>
              <Tooltip content={ChartTooltip} />
            </PieChart>
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
