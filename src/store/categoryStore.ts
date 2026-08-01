import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import type { Category, CategoryInput, TransactionType } from '../types'

interface CategoryState {
  categories: Category[]
  transactionCounts: Record<string, number>
  isLoading: boolean
  fetchCategories: (type?: TransactionType) => Promise<void>
  addCategory: (input: CategoryInput) => Promise<{ error: string | null }>
  updateCategory: (id: string, input: Partial<CategoryInput>) => Promise<{ error: string | null }>
  deleteCategory: (id: string) => Promise<{ error: string | null }>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  transactionCounts: {},
  isLoading: false,

  fetchCategories: async (type) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) {
      set({ categories: [], transactionCounts: {} })
      return
    }

    set({ isLoading: true })

    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })

    if (type) query = query.eq('type', type)

    const { data, error } = await query
    if (error || !data) {
      set({ isLoading: false })
      return
    }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

    const { data: txData } = await supabase
      .from('transactions')
      .select('category_id')
      .eq('user_id', userId)
      .gte('date', monthStart)
      .lte('date', monthEnd)

    const counts: Record<string, number> = {}
    for (const t of (txData ?? []) as { category_id: string }[]) {
      counts[t.category_id] = (counts[t.category_id] ?? 0) + 1
    }

    set({ categories: data, transactionCounts: counts, isLoading: false })
  },

  addCategory: async (input) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase.from('categories').insert({
      ...input,
      user_id: userId,
      is_default: false,
      sort_order: get().categories.length,
    })

    if (error) return { error: error.message }
    return { error: null }
  },

  updateCategory: async (id, input) => {
    const { error } = await supabase.from('categories').update(input).eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  },

  deleteCategory: async (id) => {
    const category = get().categories.find((c) => c.id === id)
    if (category?.is_default) return { error: "Default categories can't be deleted" }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: error.message }

    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }))
    return { error: null }
  },
}))
