import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import type { Goal, GoalInput } from '../types'

interface AddFundsResult {
  error: string | null
  completed: boolean
}

interface GoalState {
  goals: Goal[]
  isLoading: boolean
  fetchGoals: () => Promise<void>
  addGoal: (input: GoalInput) => Promise<{ error: string | null }>
  updateGoal: (id: string, input: Partial<GoalInput>) => Promise<{ error: string | null }>
  deleteGoal: (id: string) => Promise<{ error: string | null }>
  addFunds: (id: string, amount: number, note: string) => Promise<AddFundsResult>
}

const SAVINGS_CATEGORY_NAME = 'Savings'

async function findOrCreateSavingsCategory(userId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .eq('name', SAVINGS_CATEGORY_NAME)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: SAVINGS_CATEGORY_NAME,
      icon: '🎯',
      color: '#a855f7',
      type: 'expense',
      is_default: false,
      sort_order: 999,
    })
    .select('id')
    .single()

  if (error || !created) return null
  return created.id
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,

  fetchGoals: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) {
      set({ goals: [] })
      return
    }

    set({ isLoading: true })

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('is_completed', { ascending: true })
      .order('deadline', { ascending: true })

    if (error || !data) {
      set({ isLoading: false })
      return
    }

    set({ goals: data, isLoading: false })
  },

  addGoal: async (input) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    const { error } = await supabase.from('goals').insert({
      ...input,
      user_id: userId,
      is_completed: input.current_amount >= input.target_amount,
    })

    if (error) return { error: error.message }
    return { error: null }
  },

  updateGoal: async (id, input) => {
    const { error } = await supabase.from('goals').update(input).eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  },

  deleteGoal: async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) return { error: error.message }

    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
    return { error: null }
  },

  addFunds: async (id, amount, note) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in', completed: false }

    const goal = get().goals.find((g) => g.id === id)
    if (!goal) return { error: 'Goal not found', completed: false }

    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, balance')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .limit(1)

    const account = accounts?.[0] as { id: string; balance: number } | undefined

    if (account) {
      const categoryId = await findOrCreateSavingsCategory(userId)
      if (categoryId) {
        await supabase.from('transactions').insert({
          user_id: userId,
          account_id: account.id,
          category_id: categoryId,
          type: 'expense',
          amount,
          note: note || `Added to ${goal.name}`,
          date: new Date().toISOString().slice(0, 10),
          receipt_url: null,
        })

        await supabase
          .from('accounts')
          .update({ balance: account.balance - amount })
          .eq('id', account.id)
      }
    }

    const newAmount = goal.current_amount + amount
    const completed = newAmount >= goal.target_amount

    const { error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount, is_completed: completed })
      .eq('id', id)

    if (error) return { error: error.message, completed: false }

    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, current_amount: newAmount, is_completed: completed } : g
      ),
    }))

    return { error: null, completed }
  },
}))
