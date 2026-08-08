import type { Category, CategorySlice, TopCategoryItem, TransactionWithCategory } from '../types'

const OTHERS_COLOR = '#6b7280'
const OTHERS_LABEL = 'Others'

/** Sums expense transactions by category, sorted highest-spend first. */
export function groupByCategory(transactions: TransactionWithCategory[]): TopCategoryItem[] {
  const totals = new Map<string, { category: Category; amount: number }>()

  for (const t of transactions) {
    if (t.type !== 'expense' || !t.category) continue
    const existing = totals.get(t.category_id)
    if (existing) existing.amount += t.amount
    else totals.set(t.category_id, { category: t.category, amount: t.amount })
  }

  return Array.from(totals.values()).sort((a, b) => b.amount - a.amount)
}

/** Converts the top N categories into pie-chart-ready slices, rolling the rest into "Others". */
export function toCategorySlices(items: TopCategoryItem[], maxSlices: number): CategorySlice[] {
  const grandTotal = items.reduce((sum, i) => sum + i.amount, 0)
  const top = items.slice(0, maxSlices)
  const othersAmount = items.slice(maxSlices).reduce((sum, i) => sum + i.amount, 0)

  const slices: CategorySlice[] = top.map((i) => ({
    name: i.category.name,
    color: i.category.color,
    amount: i.amount,
    percentage: grandTotal > 0 ? (i.amount / grandTotal) * 100 : 0,
  }))

  if (othersAmount > 0) {
    slices.push({
      name: OTHERS_LABEL,
      color: OTHERS_COLOR,
      amount: othersAmount,
      percentage: grandTotal > 0 ? (othersAmount / grandTotal) * 100 : 0,
    })
  }

  return slices
}
