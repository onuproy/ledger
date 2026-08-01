import { create } from 'zustand'

export type Theme = 'dark' | 'light'
export type NumberFormatStyle = 'bd' | 'international'
export type Language = 'en' | 'bn'
export type AutoLockOption = '1' | '5' | '15' | 'never'

const LS_KEYS = {
  theme: 'ledger:theme',
  numberFormat: 'ledger:numberFormat',
  language: 'ledger:language',
  pinEnabled: 'ledger:pinEnabled',
  pinHash: 'ledger:pinHash',
  autoLock: 'ledger:autoLock',
  biometricEnabled: 'ledger:biometricEnabled',
  biometricCredentialId: 'ledger:biometricCredentialId',
} as const

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLS(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore write failures (e.g. private browsing storage limits)
  }
}

function applyThemeAttribute(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

const initialTheme = readLS<Theme>(LS_KEYS.theme, 'dark')
applyThemeAttribute(initialTheme)

interface UiState {
  theme: Theme
  numberFormat: NumberFormatStyle
  language: Language
  pinEnabled: boolean
  pinHash: string | null
  autoLock: AutoLockOption
  biometricEnabled: boolean
  biometricCredentialId: string | null
  isUnlocked: boolean

  setTheme: (theme: Theme) => void
  setNumberFormat: (format: NumberFormatStyle) => void
  setLanguage: (language: Language) => void
  setAutoLock: (option: AutoLockOption) => void
  setPin: (hash: string) => void
  clearPin: () => void
  setBiometric: (enabled: boolean, credentialId?: string | null) => void
  unlock: () => void
  lock: () => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: initialTheme,
  numberFormat: readLS(LS_KEYS.numberFormat, 'international'),
  language: readLS(LS_KEYS.language, 'en'),
  pinEnabled: readLS(LS_KEYS.pinEnabled, false),
  pinHash: readLS<string | null>(LS_KEYS.pinHash, null),
  autoLock: readLS(LS_KEYS.autoLock, '5'),
  biometricEnabled: readLS(LS_KEYS.biometricEnabled, false),
  biometricCredentialId: readLS<string | null>(LS_KEYS.biometricCredentialId, null),
  isUnlocked: false,

  setTheme: (theme) => {
    writeLS(LS_KEYS.theme, theme)
    applyThemeAttribute(theme)
    set({ theme })
  },

  setNumberFormat: (numberFormat) => {
    writeLS(LS_KEYS.numberFormat, numberFormat)
    set({ numberFormat })
  },

  setLanguage: (language) => {
    writeLS(LS_KEYS.language, language)
    set({ language })
  },

  setAutoLock: (autoLock) => {
    writeLS(LS_KEYS.autoLock, autoLock)
    set({ autoLock })
  },

  setPin: (pinHash) => {
    writeLS(LS_KEYS.pinHash, pinHash)
    writeLS(LS_KEYS.pinEnabled, true)
    set({ pinHash, pinEnabled: true, isUnlocked: true })
  },

  clearPin: () => {
    writeLS(LS_KEYS.pinHash, null)
    writeLS(LS_KEYS.pinEnabled, false)
    writeLS(LS_KEYS.biometricEnabled, false)
    writeLS(LS_KEYS.biometricCredentialId, null)
    set({ pinHash: null, pinEnabled: false, biometricEnabled: false, biometricCredentialId: null })
  },

  setBiometric: (enabled, credentialId = null) => {
    writeLS(LS_KEYS.biometricEnabled, enabled)
    writeLS(LS_KEYS.biometricCredentialId, credentialId)
    set({ biometricEnabled: enabled, biometricCredentialId: credentialId })
  },

  unlock: () => set({ isUnlocked: true }),
  lock: () => set({ isUnlocked: false }),
}))
