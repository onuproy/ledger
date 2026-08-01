import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { ProfileInput } from '../types'

interface ProfileState {
  name: string
  email: string
  avatarColor: string
  currency: string
  language: string
  isAdmin: boolean
  isLoading: boolean
  fetchProfile: () => Promise<void>
  saveProfile: (partial: Partial<ProfileInput>) => Promise<{ error: string | null }>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  name: '',
  email: '',
  avatarColor: '#6366f1',
  currency: 'BDT',
  language: 'en',
  isAdmin: false,
  isLoading: false,

  fetchProfile: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      set({ name: '', email: '', avatarColor: '#6366f1', currency: 'BDT', language: 'en' })
      return
    }

    set({ isLoading: true })

    const userId = session.user.id
    const email = session.user.email ?? ''

    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

    if (data) {
      set({
        name: data.name ?? '',
        email,
        avatarColor: data.avatar_color ?? '#6366f1',
        currency: data.currency ?? 'BDT',
        language: data.language ?? 'en',
        isAdmin: data.is_admin ?? false,
        isLoading: false,
      })
      return
    }

    // No profiles row exists yet (nothing seeds one on signup) — fall back to
    // whatever was captured in auth metadata at registration time.
    const meta = session.user.user_metadata ?? {}
    set({
      name: meta.name ?? '',
      email,
      avatarColor: meta.avatar_color ?? '#6366f1',
      currency: meta.currency ?? 'BDT',
      language: meta.language ?? 'en',
      isLoading: false,
    })
  },

  saveProfile: async (partial) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return { error: 'Not signed in' }

    const current = get()
    const next = {
      name: partial.name ?? current.name,
      avatar_color: partial.avatar_color ?? current.avatarColor,
      currency: partial.currency ?? current.currency,
      language: partial.language ?? current.language,
    }

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      is_admin: current.isAdmin,
      ...next,
    })

    if (error) return { error: error.message }

    set({
      name: next.name,
      avatarColor: next.avatar_color,
      currency: next.currency,
      language: next.language,
    })

    return { error: null }
  },
}))
