import type { TransactionType } from '../types'

export interface DefaultCategory {
  name: string
  icon: string
  color: string
  type: TransactionType
  sort_order: number
}

export const EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: 'Food', icon: '🍔', color: '#f59e0b', type: 'expense', sort_order: 0 },
  { name: 'Transport', icon: '🚗', color: '#6366f1', type: 'expense', sort_order: 1 },
  { name: 'Housing', icon: '🏠', color: '#a855f7', type: 'expense', sort_order: 2 },
  { name: 'Healthcare', icon: '💊', color: '#ef4444', type: 'expense', sort_order: 3 },
  { name: 'Entertainment', icon: '🎮', color: '#22c55e', type: 'expense', sort_order: 4 },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense', sort_order: 5 },
  { name: 'Education', icon: '📚', color: '#0ea5e9', type: 'expense', sort_order: 6 },
  { name: 'Bills', icon: '💡', color: '#f97316', type: 'expense', sort_order: 7 },
  { name: 'Travel', icon: '✈️', color: '#14b8a6', type: 'expense', sort_order: 8 },
  { name: 'Others', icon: '💰', color: '#94a3b8', type: 'expense', sort_order: 9 },
]

export const INCOME_CATEGORIES: DefaultCategory[] = [
  { name: 'Salary', icon: '💼', color: '#22c55e', type: 'income', sort_order: 0 },
  { name: 'Freelance', icon: '💻', color: '#6366f1', type: 'income', sort_order: 1 },
  { name: 'Investment', icon: '📈', color: '#a855f7', type: 'income', sort_order: 2 },
  { name: 'Gift', icon: '🎁', color: '#ec4899', type: 'income', sort_order: 3 },
  { name: 'Business', icon: '🏦', color: '#0ea5e9', type: 'income', sort_order: 4 },
  { name: 'Others', icon: '💰', color: '#94a3b8', type: 'income', sort_order: 5 },
]

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
]
