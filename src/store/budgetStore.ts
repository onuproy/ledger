import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import type {
  Budget,
  BudgetCategoryItem,
  BudgetInput,
  BudgetOverviewItem,
  Category,
  Transaction,
} from '../types'

interface BudgetOverviewState {
  overview: BudgetOverviewItem[]
  isLoading: boolean
  fetchBudgetOverview: () => Promise<void>

  // Full Budget screen (month-scoped)
  items: BudgetCategoryItem[]
  totalBudgeted: number
  totalSpent: number
  isScreenLoading: boolean
  fetchBudgets: (month: number, year: number) => Promise<void>
  setBudget: (
    input: BudgetInput,
    month: number,
    year: number
  ) => Promise<{ error: string | null }>
  deleteBudget: (id: string) => Promise<{ error: string | null }>
}

export const useBudgetStore = create<BudgetOverviewState>((set) => ({
  overview: [],
  isLoading: false,

  items: [],
  totalBudgeted: 0,
  totalSpent: 0,
  isScreenLoading: false,

  fetchBudgetOverview: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) {
      set({ overview: [] })
      return
    }

    set({ isLoading: true })

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const monthStart = new Date(year, month - 1, 1).toISOString().slice(0, 10)
    const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10)

    const [budgetsRes, transactionsRes] = await Promise.all([
      supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year),
      supabase
        .from('transactions')
        .select('category_id, amount, type')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', monthStart)
        .lte('date', monthEnd),
    ])

    if (budgetsRes.error || !budgetsRes.data) {
      set({ isLoading: false })
      return
    }

    const spentByCategory = new Map<string, number>()
    const transactions = (transactionsRes.data ?? []) as Pick<Transaction, 'category_id' | 'amount' | 'type'>[]
    for (const t of transactions) {
      spentByCategory.set(t.category_id, (spentByCategory.get(t.category_id) ?? 0) + t.amount)
    }

    const budgets = budgetsRes.data as unknown as (Budget & { category: Category | null })[]
    const overview: BudgetOverviewItem[] = budgets
      .filter((b): b is Budget & { category: Category } => b.category !== null)
      .map((b) => ({
        category: b.category,
        spent: spentByCategory.get(b.category_id) ?? 0,
        amount: b.amount,
      }))

    set({ overview, isLoading: false })
  },

  fetchBudgets: async (month, year) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) {
      set({ items: [], totalBudgeted: 0, totalSpent: 0 })
      return
    }

    set({ isScreenLoading: true })

    const monthStart = new Date(year, month - 1, 1).toISOString().slice(0, 10)
    const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10)

    const [categoriesRes, budgetsRes, transactionsRes] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .order('sort_order', { ascending: true }),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year),
      supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', monthStart)
        .lte('date', monthEnd),
    ])

    if (categoriesRes.error || !categoriesRes.data) {
      set({ isScreenLoading: false })
      return
    }

    const budgetByCategory = new Map<string, Budget>()
    for (const b of (budgetsRes.data ?? []) as Budget[]) {
      budgetByCategory.set(b.category_id, b)
    }

    const spentByCategory = new Map<string, number>()
    for (const t of (transactionsRes.data ?? []) as { category_id: string; amount: number }[]) {
      spentByCategory.set(t.category_id, (spentByCategory.get(t.category_id) ?? 0) + t.amount)
    }

    const items: BudgetCategoryItem[] = (categoriesRes.data as Category[]).map((category) => ({
      category,
      budget: budgetByCategory.get(category.id) ?? null,
      spent: spentByCategory.get(category.id) ?? 0,
    }))

    const totalBudgeted = items.reduce((sum, i) => sum + (i.budget?.amount ?? 0), 0)
    const totalSpent = items.reduce((sum, i) => sum + (i.budget ? i.spent : 0), 0)

    set({ items, totalBudgeted, totalSpent, isScreenLoading: false })
  },

  setBudget: async (input, month, year) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category_id', input.category_id)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('budgets')
        .update({ amount: input.amount, period: input.period })
        .eq('id', existing.id)
      if (error) return { error: error.message }
      return { error: null }
    }

    const { error } = await supabase.from('budgets').insert({
      user_id: userId,
      category_id: input.category_id,
      amount: input.amount,
      period: input.period,
      month,
      year,
    })
    if (error) return { error: error.message }
    return { error: null }
  },

  deleteBudget: async (id) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  },
}))
