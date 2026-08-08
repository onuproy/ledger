import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { BalanceCard } from '../../components/charts/BalanceCard'
import { IncomeExpenseChart } from '../../components/charts/IncomeExpenseChart'
import { MiniCategoryDonut } from '../../components/charts/MiniCategoryDonut'
import { BudgetOverviewCard } from '../../components/charts/BudgetOverviewCard'
import { TopCategoriesList } from '../../components/analytics/TopCategoriesList'
import { TransactionItem } from '../../components/transactions/TransactionItem'
import { CustomRangeModal } from '../../components/ui/CustomRangeModal'
import { useTransactionStore } from '../../store/transactionStore'
import { useBudgetStore } from '../../store/budgetStore'
import { useAuthStore } from '../../store/authStore'
import { groupByCategory, toCategorySlices } from '../../lib/categoryAggregation'
import { formatCurrency, formatDate, formatDayMonth, formatMonthYear } from '../../lib/formatters'
import type { DashboardPeriod, DateRange } from '../../types'

const PERIOD_TABS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

function getPeriodLabel(period: DashboardPeriod, customRange: DateRange | null): string {
  switch (period) {
    case 'today':
      return `Today, ${formatDayMonth()}`
    case '7d':
      return 'Last 7 Days'
    case 'month':
      return formatMonthYear()
    case 'year':
      return String(new Date().getFullYear())
    case 'custom':
      return customRange
        ? `${formatDate(customRange.start)} – ${formatDate(customRange.end)}`
        : 'Custom'
  }
}

export function Dashboard() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('month')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const userId = useAuthStore((s) => s.user?.id)

  const {
    transactions,
    income,
    expense,
    weeklyIncomeExpense,
    allTimeBalance,
    fetchDashboardData,
    fetchAllTimeBalance,
  } = useTransactionStore()
  const { overview, fetchBudgetOverview } = useBudgetStore()

  useEffect(() => {
    // Wait for auth to resolve first — on a hard reload landing directly on
    // this route, authStore.initialize() hasn't finished yet, so fetching
    // immediately would read a not-yet-populated user id and silently zero
    // everything out with no retry once auth actually resolves.
    if (isAuthLoading) return
    if (selectedPeriod === 'custom' && !customRange) return

    Promise.all([
      fetchDashboardData(selectedPeriod, customRange ?? undefined),
      fetchBudgetOverview(),
      fetchAllTimeBalance(),
    ]).finally(() => setHasLoadedOnce(true))
  }, [
    isAuthLoading,
    userId,
    selectedPeriod,
    customRange,
    fetchDashboardData,
    fetchBudgetOverview,
    fetchAllTimeBalance,
  ])

  useEffect(() => {
    function handleFocus() {
      if (isAuthLoading) return
      if (selectedPeriod === 'custom' && !customRange) return
      fetchDashboardData(selectedPeriod, customRange ?? undefined)
      fetchBudgetOverview()
      fetchAllTimeBalance()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [
    isAuthLoading,
    selectedPeriod,
    customRange,
    fetchDashboardData,
    fetchBudgetOverview,
    fetchAllTimeBalance,
  ])

  function handleTabClick(period: DashboardPeriod) {
    if (period === 'custom') {
      setShowCustomModal(true)
      return
    }
    setSelectedPeriod(period)
  }

  function handleApplyCustomRange(range: DateRange) {
    setCustomRange(range)
    setSelectedPeriod('custom')
    setShowCustomModal(false)
  }

  function handleAddTransaction(type?: 'income' | 'expense' | 'transfer') {
    navigate('/transactions', { state: { openAdd: true, type } })
  }

  const recentTransactions = transactions.slice(0, 5)

  // Derived purely from the already-fetched period transactions — no extra
  // Supabase calls, matches the same data the "Recent" list below reads.
  const topCategories = useMemo(() => groupByCategory(transactions), [transactions])
  const categorySlices = useMemo(() => toCategorySlices(topCategories, 3), [topCategories])

  if (isAuthLoading || !hasLoadedOnce) {
    return (
      <div className="flex animate-pulse flex-col gap-6 px-4 py-4">
        <div className="h-40 rounded-2xl bg-card" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-full bg-card" />
          <div className="h-9 w-20 rounded-full bg-card" />
          <div className="h-9 w-20 rounded-full bg-card" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 rounded-2xl bg-card" />
          <div className="h-20 rounded-2xl bg-card" />
          <div className="h-20 rounded-2xl bg-card" />
        </div>
        <div className="h-36 rounded-2xl bg-card" />
        <div className="h-48 rounded-2xl bg-card" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <BalanceCard
        balance={allTimeBalance}
        income={income}
        expense={expense}
        periodLabel={getPeriodLabel(selectedPeriod, customRange)}
      />

      <div className="flex gap-2 overflow-x-auto">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`min-h-[36px] shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              selectedPeriod === tab.value
                ? 'bg-accent text-white'
                : 'bg-card text-textsecondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <QuickAction
          label="Expense"
          icon={<TrendingDown size={20} className="text-expense" />}
          onClick={() => handleAddTransaction('expense')}
        />
        <QuickAction
          label="Income"
          icon={<TrendingUp size={20} className="text-income" />}
          onClick={() => handleAddTransaction('income')}
        />
        <QuickAction
          label="Transfer"
          icon={<ArrowLeftRight size={20} className="text-blue-500" />}
          onClick={() => handleAddTransaction('transfer')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-income/10 p-4">
          <ArrowUpRight size={16} className="text-income" />
          <p className="mt-2 text-xs text-income/80">Income</p>
          <p className="truncate text-lg font-bold text-income">{formatCurrency(income)}</p>
        </div>
        <div className="rounded-2xl bg-expense/10 p-4">
          <ArrowDownRight size={16} className="text-expense" />
          <p className="mt-2 text-xs text-expense/80">Expense</p>
          <p className="truncate text-lg font-bold text-expense">{formatCurrency(expense)}</p>
        </div>
      </div>

      <IncomeExpenseChart
        data={weeklyIncomeExpense}
        action={
          <Link to="/analytics" className="text-sm text-accent">
            See all →
          </Link>
        }
      />

      <MiniCategoryDonut slices={categorySlices} />

      <TopCategoriesList items={topCategories.slice(0, 3)} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-textprimary">Recent</h2>
          <Link to="/transactions" className="text-sm text-accent">
            See all →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-4 py-8 text-center">
            <p className="text-sm text-textsecondary">No transactions yet</p>
            <button
              onClick={() => handleAddTransaction()}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover"
              aria-label="Add transaction"
            >
              <Plus size={20} />
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
            {recentTransactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </div>
        )}
      </div>

      <BudgetOverviewCard items={overview} />

      {showCustomModal && (
        <CustomRangeModal
          initial={customRange}
          onApply={handleApplyCustomRange}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  )
}

interface QuickActionProps {
  label: string
  icon: ReactNode
  onClick: () => void
}

function QuickAction({ label, icon, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[48px] flex-col items-center gap-2 rounded-2xl border border-border bg-card py-4 text-textprimary"
    >
      {icon}
      <span className="text-xs font-medium">
        {label === 'Transfer' ? label : `+ ${label}`}
      </span>
    </button>
  )
}
