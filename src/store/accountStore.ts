import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import type { Account, AccountInput } from '../types'

interface AccountState {
  accounts: Account[]
  transactionCounts: Record<string, number>
  isLoading: boolean
  fetchAccounts: () => Promise<void>
  addAccount: (input: AccountInput) => Promise<{ error: string | null }>
  updateAccount: (id: string, input: Partial<AccountInput>) => Promise<{ error: string | null }>
  deleteAccount: (id: string) => Promise<{ error: string | null }>
}

async function clearOtherDefaults(userId: string, exceptId?: string): Promise<void> {
  let query = supabase
    .from('accounts')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true)

  if (exceptId) query = query.neq('id', exceptId)

  await query
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  transactionCounts: {},
  isLoading: false,

  fetchAccounts: async () => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) {
      set({ accounts: [], transactionCounts: {} })
      return
    }

    set({ isLoading: true })

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true })

    if (error || !data) {
      set({ isLoading: false })
      return
    }

    const { data: txData } = await supabase
      .from('transactions')
      .select('account_id')
      .eq('user_id', userId)

    const counts: Record<string, number> = {}
    for (const t of (txData ?? []) as { account_id: string }[]) {
      counts[t.account_id] = (counts[t.account_id] ?? 0) + 1
    }

    set({ accounts: data, transactionCounts: counts, isLoading: false })
  },

  addAccount: async (input) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    if (input.is_default) {
      await clearOtherDefaults(userId)
    }

    const { error } = await supabase.from('accounts').insert({ ...input, user_id: userId })
    if (error) return { error: error.message }
    return { error: null }
  },

  updateAccount: async (id, input) => {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return { error: 'Not signed in' }

    if (input.is_default) {
      await clearOtherDefaults(userId, id)
    }

    const { error } = await supabase.from('accounts').update(input).eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  },

  deleteAccount: async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) return { error: error.message }

    set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }))
    return { error: null }
  },
}))
