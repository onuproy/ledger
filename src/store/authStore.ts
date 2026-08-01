import { create } from 'zustand'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  setUser: (user: User | null, session: Session | null) => void
  logout: () => Promise<void>
  init: () => Promise<void>
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
  session: null,
  isLoading: true,

  setUser: (user, session) => set({ user, session }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  init: async () => {
    const { data } = await supabase.auth.getSession()
    set({
      session: data.session,
      user: toUser(data.session?.user),
      isLoading: false,
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: toUser(session?.user) })
    })
  },
}))
