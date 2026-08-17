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
  time: string | null
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

export type DashboardPeriod = 'today' | '7d' | 'month' | 'year' | 'custom'

export interface DateRange {
  start: string
  end: string
}

export interface TransactionWithCategory extends Transaction {
  category: Category | null
  account?: Account | null
}

export interface TransactionInput {
  account_id: string
  category_id: string
  type: TransactionType
  amount: number
  note: string
  date: string
  time: string | null
  receipt_url: string | null
}

export type TransactionTypeFilter = 'all' | TransactionType

export interface TransactionFilters {
  period: DashboardPeriod
  customRange?: DateRange
  type: TransactionTypeFilter
}

export interface DailyTotal {
  day: string
  total: number
}

export interface BudgetOverviewItem {
  category: Category
  spent: number
  amount: number
}

export interface CategoryInput {
  name: string
  icon: string
  color: string
  type: TransactionType
}

export type AccountType = 'cash' | 'bank' | 'card' | 'wallet'

export interface AccountInput {
  name: string
  type: AccountType
  balance: number
  color: string
  icon: string
  is_default: boolean
}

export interface ColorSwatch {
  name: string
  hex: string
}

export interface BudgetInput {
  category_id: string
  amount: number
  period: BudgetPeriod
}

export interface BudgetCategoryItem {
  category: Category
  budget: Budget | null
  spent: number
}

export interface GoalInput {
  name: string
  icon: string
  color: string
  target_amount: number
  current_amount: number
  deadline: string
}

export type AnalyticsPeriod = 'week' | 'month' | '3months' | 'year'

export interface IncomeExpensePoint {
  label: string
  income: number
  expense: number
}

export interface CategorySlice {
  name: string
  color: string
  amount: number
  percentage: number
}

export interface TrendPoint {
  label: string
  total: number
}

export interface TopCategoryItem {
  category: Category
  amount: number
}

export interface ProfileInput {
  name: string
  avatar_color: string
  avatar_emoji?: string | null
  currency: string
  language: string
}

export type ExportPeriod = 'thisMonth' | 'lastMonth' | 'last3Months' | 'allTime' | 'custom'

export interface ExportFilters {
  period: ExportPeriod
  customRange?: DateRange
  type: TransactionTypeFilter
  accountId: string | null
}

export interface TransferInput {
  fromAccountId: string
  toAccountId: string
  amount: number
  date: string
  time: string | null
}
