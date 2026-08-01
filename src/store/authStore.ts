import { create } from 'zustand'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

function toUser(supabaseUser: SupabaseUser | undefined): User | null {
  if (!supabaseUser) return null
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name ?? '',
    avatar_color: supabaseUser.user_metadata?.avatar_color ?? '#6366f1',
    currency: supabaseUser.user_metadata?.currency ?? 'BDT',
    language: supabaseUser.user_metadata?.language ?? 'en',
    is_admin: supabaseUser.user_metadata?.is_admin ?? false,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  initialize: async () => {
    const { data } = await supabase.auth.getSession()
    set({ user: toUser(data.session?.user), isLoading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: toUser(session?.user) })
    })
  },
}))
