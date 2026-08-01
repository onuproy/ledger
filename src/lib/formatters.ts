import { useProfileStore } from '../store/profileStore'
import { useUiStore } from '../store/uiStore'

const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
}

export function formatCurrency(amount: number, currency?: string): string {
  const resolvedCurrency = currency ?? useProfileStore.getState().currency ?? 'BDT'
  const symbol = CURRENCY_SYMBOLS[resolvedCurrency] ?? ''
  const numberFormat = useUiStore.getState().numberFormat
  const locale = numberFormat === 'bd' ? 'en-IN' : 'en-US'
  const fractionDigits = resolvedCurrency === 'JPY' ? 0 : 2
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Math.abs(amount))
  return `${symbol}${formatted}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
}

export function formatMonthYear(date: string | Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d)
}

export function formatDayAbbrev(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d)
}

function toDateKey(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 10)
}

export function formatGroupDate(date: string | Date): string {
  const key = toDateKey(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (key === toDateKey(today)) return 'Today'
  if (key === toDateKey(yesterday)) return 'Yesterday'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date)
}
