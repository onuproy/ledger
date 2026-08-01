import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Percent, PiggyBank } from 'lucide-react'
import { Header } from '../../components/layout/Header'
import { IncomeExpenseChart } from '../../components/charts/IncomeExpenseChart'
import { CategoryDonutChart } from '../../components/charts/CategoryDonutChart'
import { SpendingTrendChart } from '../../components/charts/SpendingTrendChart'
import { TopCategoriesList } from '../../components/analytics/TopCategoriesList'
import { MonthlyComparisonCard } from '../../components/analytics/MonthlyComparisonCard'
import { TransactionItem } from '../../components/transactions/TransactionItem'
import { useAnalyticsStore } from '../../store/analyticsStore'
import { formatCurrency } from '../../lib/formatters'
import type { AnalyticsPeriod } from '../../types'

const PERIOD_TABS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: '3months', label: '3 Months' },
  { value: 'year', label: 'Year' },
]

export function Analytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month')

  const totalIncome = useAnalyticsStore((s) => s.totalIncome)
  const totalExpense = useAnalyticsStore((s) => s.totalExpense)
  const incomeVsExpense = useAnalyticsStore((s) => s.incomeVsExpense)
  const spendingByCategory = useAnalyticsStore((s) => s.spendingByCategory)
  const dailyTotals = useAnalyticsStore((s) => s.dailyTotals)
  const topCategories = useAnalyticsStore((s) => s.topCategories)
  const biggestTransactions = useAnalyticsStore((s) => s.biggestTransactions)
  const thisMonthExpense = useAnalyticsStore((s) => s.thisMonthExpense)
  const lastMonthExpense = useAnalyticsStore((s) => s.lastMonthExpense)
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAnalytics)
  const fetchMonthlyComparison = useAnalyticsStore((s) => s.fetchMonthlyComparison)

  useEffect(() => {
    fetchAnalytics(period)
  }, [period, fetchAnalytics])

  useEffect(() => {
    fetchMonthlyComparison()
  }, [fetchMonthlyComparison])

  const netSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0
  const topFiveCategories = topCategories.slice(0, 5)
  const topFiveTransactions = biggestTransactions.slice(0, 5)

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <Header title="Analytics" backTo="/settings" />

      <div className="flex gap-2 overflow-x-auto">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPeriod(tab.value)}
            className={`min-h-[36px] shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              period === tab.value ? 'bg-accent text-white' : 'bg-card text-textsecondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <ArrowUpRight size={16} className="text-income" />
          <p className="mt-2 text-xs text-textsecondary">Total Income</p>
          <p className="truncate text-lg font-bold text-income">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <ArrowDownRight size={16} className="text-expense" />
          <p className="mt-2 text-xs text-textsecondary">Total Expense</p>
          <p className="truncate text-lg font-bold text-expense">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <PiggyBank size={16} className="text-accent" />
          <p className="mt-2 text-xs text-textsecondary">Net Savings</p>
          <p className="truncate text-lg font-bold text-accent">
            {netSavings < 0 ? '-' : ''}
            {formatCurrency(netSavings)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <Percent size={16} className="text-purple" />
          <p className="mt-2 text-xs text-textsecondary">Savings Rate</p>
          <p className="truncate text-lg font-bold text-purple">
            {Math.round(savingsRate)}%
          </p>
        </div>
      </div>

      <IncomeExpenseChart data={incomeVsExpense} />

      <CategoryDonutChart data={spendingByCategory} />

      <SpendingTrendChart data={dailyTotals} />

      <TopCategoriesList items={topFiveCategories} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-textprimary">Biggest Transactions</h2>
        {topFiveTransactions.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-4 py-6 text-center text-sm text-textsecondary">
            No transactions this period
          </p>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
            {topFiveTransactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </div>
        )}
      </div>

      <MonthlyComparisonCard thisMonth={thisMonthExpense} lastMonth={lastMonthExpense} />
    </div>
  )
}
