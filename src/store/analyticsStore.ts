import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { getRangeForAnalyticsPeriod } from '../lib/helpers'
import { formatDate, formatDayAbbrev } from '../lib/formatters'
import { useAuthStore } from './authStore'
import { calculateIncome, calculateExpense } from './transactionStore'
import type {
  AnalyticsPeriod,
  Category,
  CategorySlice,
  IncomeExpensePoint,
  TopCategoryItem,
  TransactionType,
  TransactionWithCategory,
  TrendPoint,
} from '../types'

const OTHERS_COLOR = '#6b7280'
const MAX_DONUT_SLICES = 6
const COMPUTE_LIMIT = 10

interface AnalyticsState {
  period: AnalyticsPeriod
  totalIncome: number
  totalExpense: number
  incomeVsExpense: IncomeExpensePoint[]
  spendingByCategory: CategorySlice[]
  dailyTotals: TrendPoint[]
  topCategories: TopCategoryItem[]
  biggestTransactions: TransactionWithCategory[]
  thisMonthExpense: number
  lastMonthExpense: number
  isLoading: boolean

  fetchAnalytics: (period: AnalyticsPeriod) => Promise<void>
  fetchMonthlyComparison: () => Promise<void>
  getIncomeVsExpense: (period: AnalyticsPeriod) => Promise<void>
  getSpendingByCategory: (period: AnalyticsPeriod) => Promise<void>
  getDailyTotals: (startDate: string, endDate: string) => Promise<void>
  getTopCategories: (period: AnalyticsPeriod, limit: number) => Promise<void>
  getBiggestTransactions: (period: AnalyticsPeriod, limit: number) => Promise<void>
}

function bucketIncomeExpense(
  transactions: { date: string; type: TransactionType; amount: number }[],
  period: AnalyticsPeriod
): IncomeExpensePoint[] {
  if (period === 'week') {
    const { start } = getRangeForAnalyticsPeriod('week')
    const startDate = new Date(start)
    const buckets: IncomeExpensePoint[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      return { label: formatDayAbbrev(d), income: 0, expense: 0 }
    })

    for (const t of transactions) {
      const idx = Math.round(
        (new Date(t.date.slice(0, 10)).getTime() - startDate.getTime()) / 86400000
      )
      if (idx < 0 || idx >= 7) continue
      if (t.type === 'income') buckets[idx].income += t.amount
      else buckets[idx].expense += t.amount
    }
    return buckets
  }

  if (period === 'month') {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const numWeeks = Math.ceil(daysInMonth / 7)
    const buckets: IncomeExpensePoint[] = Array.from({ length: numWeeks }, (_, i) => ({
      label: `Week ${i + 1}`,
      income: 0,
      expense: 0,
    }))

    for (const t of transactions) {
      const day = new Date(t.date.slice(0, 10)).getDate()
      const idx = Math.min(Math.floor((day - 1) / 7), numWeeks - 1)
      if (t.type === 'income') buckets[idx].income += t.amount
      else buckets[idx].expense += t.amount
    }
    return buckets
  }

  // '3months' and 'year' -> monthly buckets
  const monthsBack = period === '3months' ? 3 : 12
  const now = new Date()
  const buckets: IncomeExpensePoint[] = []
  const keyToIndex = new Map<string, number>()

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    keyToIndex.set(key, buckets.length)
    buckets.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), income: 0, expense: 0 })
  }

  for (const t of transactions) {
    const d = new Date(t.date.slice(0, 10))
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const idx = keyToIndex.get(key)
    if (idx === undefined) continue
    if (t.type === 'income') buckets[idx].income += t.amount
    else buckets[idx].expense += t.amount
  }
  return buckets
}

function bucketSpendingByCategory(transactions: TransactionWithCategory[]): CategorySlice[] {
  const totals = new Map<string, { name: string; color: string; amount: number }>()
  let grandTotal = 0

  for (const t of transactions) {
    if (t.type !== 'expense') continue
    grandTotal += t.amount
    const existing = totals.get(t.category_id)
    if (existing) {
      existing.amount += t.amount
    } else {
      totals.set(t.category_id, {
        name: t.category?.name ?? 'Uncategorized',
        color: t.category?.color ?? OTHERS_COLOR,
        amount: t.amount,
      })
    }
  }

  const sorted = Array.from(totals.values()).sort((a, b) => b.amount - a.amount)
  const top = sorted.slice(0, MAX_DONUT_SLICES)
  const othersAmount = sorted.slice(MAX_DONUT_SLICES).reduce((sum, c) => sum + c.amount, 0)

  const slices: CategorySlice[] = top.map((c) => ({
    name: c.name,
    color: c.color,
    amount: c.amount,
    percentage: grandTotal > 0 ? (c.amount / grandTotal) * 100 : 0,
  }))

  if (othersAmount > 0) {
    slices.push({
      name: 'Others',
      color: OTHERS_COLOR,
      amount: othersAmount,
      percentage: grandTotal > 0 ? (othersAmount / grandTotal) * 100 : 0,
    })
  }

  return slices
}

function computeTopCategories(
  transactions: TransactionWithCategory[],
  limit: number
): TopCategoryItem[] {
  const totals = new Map<string, { category: Category; amount: number }>()
  for (const t of transactions) {
    if (t.type !== 'expense' || !t.category) continue
    const existing = totals.get(t.category_id)
    if (existing) existing.amount += t.amount
    else totals.set(t.category_id, { category: t.category, amount: t.amount })
  }
  return Array.from(totals.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

function computeDailyTotals(
  transactions: { date: string; type: TransactionType; amount: number }[],
  start: string,
  end: string
): TrendPoint[] {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1

  const buckets: TrendPoint[] = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return { label: formatDate(d), total: 0 }
  })

  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const idx = Math.round(
      (new Date(t.date.slice(0, 10)).getTime() - startDate.getTime()) / 86400000
    )
    if (idx >= 0 && idx < dayCount) buckets[idx].total += t.amount
  }

  return buckets
}

function computeBiggestTransactions(
  transactions: TransactionWithCategory[],
  limit: number
): TransactionWithCategory[] {
  return [...transactions].sort((a, b) => b.amount - a.amount).slice(0, limit)
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  period: 'month',
  totalIncome: 0,
  totalExpense: 0,
  incomeVsExpense: [],
  spendingByCategory: [],
  dailyTotals: [],
  topCategories: [],
  biggestTransactions: [],
  thisMonthExpense: 0,
  lastMonthExpense: 0,
  isLoading: false,

  fetchAnalytics: async (period) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) {
      set({
        period,
        totalIncome: 0,
        totalExpense: 0,
        incomeVsExpense: [],
        spendingByCategory: [],
        dailyTotals: [],
        topCategories: [],
        biggestTransactions: [],
        isLoading: false,
      })
      return
    }

    set({ isLoading: true, period })

    const range = getRangeForAnalyticsPeriod(period)

    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .gte('date', range.start)
      .lte('date', range.end)
      .order('date', { ascending: true })

    if (error || !data) {
      set({ isLoading: false })
      return
    }

    const transactions = data as unknown as TransactionWithCategory[]

    set({
      totalIncome: calculateIncome(transactions),
      totalExpense: calculateExpense(transactions),
      incomeVsExpense: bucketIncomeExpense(transactions, period),
      spendingByCategory: bucketSpendingByCategory(transactions),
      dailyTotals: computeDailyTotals(transactions, range.start, range.end),
      topCategories: computeTopCategories(transactions, COMPUTE_LIMIT),
      biggestTransactions: computeBiggestTransactions(transactions, COMPUTE_LIMIT),
      isLoading: false,
    })
  },

  fetchMonthlyComparison: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10)
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthStart = lastMonthDate.toISOString().slice(0, 10)
    const lastMonthEnd = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10)

    const { data } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', lastMonthStart)
      .lte('date', thisMonthEnd)

    let thisMonthExpense = 0
    let lastMonthExpense = 0
    for (const t of (data ?? []) as { amount: number; date: string }[]) {
      if (t.date >= thisMonthStart && t.date <= thisMonthEnd) thisMonthExpense += t.amount
      else if (t.date >= lastMonthStart && t.date <= lastMonthEnd) lastMonthExpense += t.amount
    }

    set({ thisMonthExpense, lastMonthExpense })
  },

  getIncomeVsExpense: async (period) => {
    await get().fetchAnalytics(period)
  },

  getSpendingByCategory: async (period) => {
    await get().fetchAnalytics(period)
  },

  getDailyTotals: async (startDate, endDate) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return

    const { data, error } = await supabase
      .from('transactions')
      .select('date, type, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error || !data) return

    set({
      dailyTotals: computeDailyTotals(
        data as { date: string; type: TransactionType; amount: number }[],
        startDate,
        endDate
      ),
    })
  },

  getTopCategories: async (period, limit) => {
    await get().fetchAnalytics(period)
    set((state) => ({ topCategories: state.topCategories.slice(0, limit) }))
  },

  getBiggestTransactions: async (period, limit) => {
    await get().fetchAnalytics(period)
    set((state) => ({ biggestTransactions: state.biggestTransactions.slice(0, limit) }))
  },
}))
