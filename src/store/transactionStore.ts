import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { getRangeForPeriod, getLast7DaysRange, getRangeForExportPeriod } from '../lib/helpers'
import { formatDayAbbrev } from '../lib/formatters'
import type { ParsedCsvRow } from '../lib/csv'
import { useAuthStore } from './authStore'
import type {
  DailyTotal,
  DashboardPeriod,
  DateRange,
  ExportFilters,
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionWithCategory,
  TransferInput,
} from '../types'

const PAGE_SIZE = 20

interface TransactionState {
  // Dashboard summary data
  transactions: TransactionWithCategory[]
  income: number
  expense: number
  dailyTotals: DailyTotal[]
  period: DashboardPeriod
  isLoading: boolean
  fetchDashboardData: (period: DashboardPeriod, customRange?: DateRange) => Promise<void>

  // Transactions list screen: paginated, filtered
  list: TransactionWithCategory[]
  listHasMore: boolean
  listOffset: number
  isListLoading: boolean
  listFilters: TransactionFilters | null
  fetchTransactions: (filters: TransactionFilters, reset?: boolean) => Promise<void>
  loadMoreTransactions: () => Promise<void>

  // Mutations
  uploadReceipt: (file: File) => Promise<string | null>
  addTransaction: (input: TransactionInput) => Promise<{ error: string | null }>
  updateTransaction: (
    id: string,
    input: Partial<TransactionInput>
  ) => Promise<{ error: string | null }>
  deleteTransaction: (id: string) => Promise<{ error: string | null }>
  createTransfer: (input: TransferInput) => Promise<{ error: string | null }>

  // Export / Import / Bulk
  fetchExportTransactions: (filters: ExportFilters) => Promise<TransactionWithCategory[]>
  importTransactions: (rows: ParsedCsvRow[]) => Promise<{ imported: number; skipped: number }>
  deleteAllTransactions: () => Promise<{ error: string | null }>
}

export function calculateIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function calculateExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function groupByDay(transactions: Transaction[]): DailyTotal[] {
  const { start } = getLast7DaysRange()
  const days: DailyTotal[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(start)
    date.setDate(date.getDate() + (6 - i))
    days.push({ day: formatDayAbbrev(date), total: 0 })
  }

  const startDate = new Date(start)

  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const txDate = new Date(t.date)
    const dayIndex = Math.round(
      (new Date(t.date.slice(0, 10)).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (dayIndex >= 0 && dayIndex < 7 && !Number.isNaN(txDate.getTime())) {
      days[dayIndex].total += t.amount
    }
  }

  return days
}

async function adjustAccountBalance(accountId: string, delta: number): Promise<void> {
  const { data } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .single()

  if (!data) return

  await supabase
    .from('accounts')
    .update({ balance: data.balance + delta })
    .eq('id', accountId)
}

function balanceDelta(type: Transaction['type'], amount: number): number {
  return type === 'income' ? amount : -amount
}

async function findOrCreateCategory(
  userId: string,
  name: string,
  type: Transaction['type']
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('name', name)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name,
      icon: '🔁',
      color: '#6366f1',
      type,
      is_default: false,
      sort_order: 999,
    })
    .select('id')
    .single()

  if (error || !created) return null
  return created.id
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  income: 0,
  expense: 0,
  dailyTotals: groupByDay([]),
  period: 'month',
  isLoading: false,

  list: [],
  listHasMore: true,
  listOffset: 0,
  isListLoading: false,
  listFilters: null,

  fetchDashboardData: async (period, customRange) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) {
      set({ transactions: [], income: 0, expense: 0, dailyTotals: groupByDay([]), period })
      return
    }

    set({ isLoading: true, period })

    const periodRange =
      period === 'custom' && customRange
        ? customRange
        : getRangeForPeriod(period === 'custom' ? 'month' : period)
    const last7 = getLast7DaysRange()
    const start = periodRange.start < last7.start ? periodRange.start : last7.start
    const end = periodRange.end > last7.end ? periodRange.end : last7.end

    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })

    if (error || !data) {
      set({ isLoading: false })
      return
    }

    const fetched = data as unknown as TransactionWithCategory[]
    const periodTransactions = fetched.filter(
      (t) => t.date >= periodRange.start && t.date <= periodRange.end
    )

    set({
      transactions: periodTransactions,
      income: calculateIncome(periodTransactions),
      expense: calculateExpense(periodTransactions),
      dailyTotals: groupByDay(fetched),
      isLoading: false,
    })
  },

  fetchTransactions: async (filters, reset = true) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) {
      set({ list: [], listHasMore: false, listOffset: 0, listFilters: filters })
      return
    }

    set({ isListLoading: true, listFilters: filters })
    if (reset) set({ list: [], listOffset: 0, listHasMore: true })

    const offset = reset ? 0 : get().listOffset
    const range =
      filters.period === 'custom' && filters.customRange
        ? filters.customRange
        : getRangeForPeriod(filters.period === 'custom' ? 'month' : filters.period)

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), account:accounts(*)')
      .eq('user_id', userId)
      .gte('date', range.start)
      .lte('date', range.end)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (filters.type !== 'all') {
      query = query.eq('type', filters.type)
    }

    const { data, error } = await query

    if (error || !data) {
      set({ isListLoading: false })
      return
    }

    const fetched = data as unknown as TransactionWithCategory[]

    set((state) => ({
      list: reset ? fetched : [...state.list, ...fetched],
      listOffset: offset + fetched.length,
      listHasMore: fetched.length === PAGE_SIZE,
      isListLoading: false,
    }))
  },

  loadMoreTransactions: async () => {
    const { listFilters, listHasMore, isListLoading } = get()
    if (!listFilters || !listHasMore || isListLoading) return
    await get().fetchTransactions(listFilters, false)
  },

  uploadReceipt: async (file) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return null

    const path = `${userId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('receipts').upload(path, file)
    if (error) return null

    const { data } = supabase.storage.from('receipts').getPublicUrl(path)
    return data.publicUrl
  },

  addTransaction: async (input) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase
      .from('transactions')
      .insert({ ...input, user_id: userId })

    if (error) return { error: error.message }

    await adjustAccountBalance(input.account_id, balanceDelta(input.type, input.amount))

    return { error: null }
  },

  updateTransaction: async (id, input) => {
    const { data: existing, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return { error: fetchError?.message ?? 'Transaction not found' }
    }

    const merged: Transaction = { ...(existing as Transaction), ...input }

    const { error } = await supabase.from('transactions').update(input).eq('id', id)
    if (error) return { error: error.message }

    await adjustAccountBalance(
      (existing as Transaction).account_id,
      -balanceDelta((existing as Transaction).type, (existing as Transaction).amount)
    )
    await adjustAccountBalance(merged.account_id, balanceDelta(merged.type, merged.amount))

    return { error: null }
  },

  deleteTransaction: async (id) => {
    const { data: existing, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return { error: fetchError?.message ?? 'Transaction not found' }
    }

    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) return { error: error.message }

    const tx = existing as Transaction
    await adjustAccountBalance(tx.account_id, -balanceDelta(tx.type, tx.amount))

    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      list: state.list.filter((t) => t.id !== id),
    }))

    return { error: null }
  },

  createTransfer: async ({ fromAccountId, toAccountId, amount, date }) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    if (fromAccountId === toAccountId) {
      return { error: 'Choose two different accounts' }
    }

    const [expenseCategoryId, incomeCategoryId] = await Promise.all([
      findOrCreateCategory(userId, 'Transfer', 'expense'),
      findOrCreateCategory(userId, 'Transfer', 'income'),
    ])

    if (!expenseCategoryId || !incomeCategoryId) {
      return { error: 'Could not set up the Transfer category' }
    }

    const outResult = await get().addTransaction({
      account_id: fromAccountId,
      category_id: expenseCategoryId,
      type: 'expense',
      amount,
      note: 'Transfer',
      date,
      receipt_url: null,
    })
    if (outResult.error) return { error: outResult.error }

    const inResult = await get().addTransaction({
      account_id: toAccountId,
      category_id: incomeCategoryId,
      type: 'income',
      amount,
      note: 'Transfer',
      date,
      receipt_url: null,
    })
    if (inResult.error) return { error: inResult.error }

    return { error: null }
  },

  fetchExportTransactions: async (filters) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return []

    const range = getRangeForExportPeriod(filters.period, filters.customRange)

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), account:accounts(*)')
      .eq('user_id', userId)
      .gte('date', range.start)
      .lte('date', range.end)
      .order('date', { ascending: false })

    if (filters.type !== 'all') query = query.eq('type', filters.type)
    if (filters.accountId) query = query.eq('account_id', filters.accountId)

    const { data, error } = await query
    if (error || !data) return []

    return data as unknown as TransactionWithCategory[]
  },

  importTransactions: async (rows) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { imported: 0, skipped: rows.length }

    const [{ data: categories }, { data: accounts }] = await Promise.all([
      supabase.from('categories').select('id, name, type').eq('user_id', userId),
      supabase.from('accounts').select('id, name').eq('user_id', userId),
    ])

    const categoryMap = new Map<string, string>()
    for (const c of (categories ?? []) as { id: string; name: string; type: string }[]) {
      categoryMap.set(`${c.name.toLowerCase()}|${c.type}`, c.id)
    }
    const accountMap = new Map<string, string>()
    for (const a of (accounts ?? []) as { id: string; name: string }[]) {
      accountMap.set(a.name.toLowerCase(), a.id)
    }

    let imported = 0
    let skipped = 0

    for (const row of rows) {
      if (row.type !== 'income' && row.type !== 'expense') {
        skipped++
        continue
      }

      const categoryId = categoryMap.get(`${row.categoryName.toLowerCase()}|${row.type}`)
      const accountId = accountMap.get(row.accountName.toLowerCase())

      if (!categoryId || !accountId) {
        skipped++
        continue
      }

      const result = await get().addTransaction({
        account_id: accountId,
        category_id: categoryId,
        type: row.type,
        amount: row.amount,
        note: row.note,
        date: row.date,
        receipt_url: null,
      })

      if (result.error) skipped++
      else imported++
    }

    return { imported, skipped }
  },

  deleteAllTransactions: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase.from('transactions').delete().eq('user_id', userId)
    if (error) return { error: error.message }

    set({
      transactions: [],
      list: [],
      income: 0,
      expense: 0,
      dailyTotals: groupByDay([]),
      listOffset: 0,
      listHasMore: true,
    })

    return { error: null }
  },
}))
