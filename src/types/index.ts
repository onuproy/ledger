export type TransactionType = 'income' | 'expense'

export type RecurPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly'

export interface User {
  id: string
  name: string
  avatar_color: string
  currency: string
  language: string
  is_admin: boolean
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: string
  balance: number
  color: string
  icon: string
  is_default: boolean
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  type: TransactionType
  is_default: boolean
  sort_order: number
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  type: TransactionType
  amount: number
  note: string
  date: string
  is_recurring: boolean
  recur_period: RecurPeriod | null
  receipt_url: string | null
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: BudgetPeriod
  month: number
  year: number
}

export interface Goal {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  target_amount: number
  current_amount: number
  deadline: string
  is_completed: boolean
}

export interface DateFilter {
  startDate: string
  endDate: string
  label: string
}
