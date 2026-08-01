import { useUiStore } from '../store/uiStore'

const TRANSLATIONS = {
  en: {
    home: 'Home',
    transactions: 'Transactions',
    budget: 'Budget',
    goals: 'Goals',
    settings: 'Settings',
    profile: 'Profile',
    preferences: 'Preferences',
    appearance: 'Appearance',
    security: 'Security',
    data: 'Data',
    support: 'Support',
  },
  bn: {
    home: 'হোম',
    transactions: 'লেনদেন',
    budget: 'বাজেট',
    goals: 'লক্ষ্য',
    settings: 'সেটিংস',
    profile: 'প্রোফাইল',
    preferences: 'পছন্দসমূহ',
    appearance: 'থিম',
    security: 'নিরাপত্তা',
    data: 'ডেটা',
    support: 'সহায়তা',
  },
} as const

export type TranslationKey = keyof (typeof TRANSLATIONS)['en']

export function useTranslation() {
  const language = useUiStore((s) => s.language)
  return (key: TranslationKey) => TRANSLATIONS[language][key] ?? TRANSLATIONS.en[key]
}
