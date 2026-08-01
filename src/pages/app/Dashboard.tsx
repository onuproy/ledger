import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Plus, TrendingDown, TrendingUp, ArrowLeftRight } from 'lucide-react'
import { BalanceCard } from '../../components/charts/BalanceCard'
import { SpendChart } from '../../components/charts/SpendChart'
import { BudgetOverviewCard } from '../../components/charts/BudgetOverviewCard'
import { TransactionItem } from '../../components/transactions/TransactionItem'
import { Toast, type ToastType } from '../../components/ui/Toast'
import { CustomRangeModal } from '../../components/ui/CustomRangeModal'
import { useTransactionStore } from '../../store/transactionStore'
import { useBudgetStore } from '../../store/budgetStore'
import type { DashboardPeriod, DateRange } from '../../types'

const PERIOD_TABS: { value: DashboardPeriod; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('month')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const { transactions, income, expense, dailyTotals, fetchDashboardData } = useTransactionStore()
  const { overview, fetchBudgetOverview } = useBudgetStore()

  useEffect(() => {
    if (selectedPeriod === 'custom' && !customRange) return
    fetchDashboardData(selectedPeriod, customRange ?? undefined)
  }, [selectedPeriod, customRange, fetchDashboardData])

  useEffect(() => {
    fetchBudgetOverview()
  }, [fetchBudgetOverview])

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

  function handleQuickAction(label: string) {
    setToast({ message: `${label} — coming soon`, type: 'success' })
  }

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <BalanceCard balance={income - expense} income={income} expense={expense} />

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
          onClick={() => handleQuickAction('Add Expense')}
        />
        <QuickAction
          label="Income"
          icon={<TrendingUp size={20} className="text-income" />}
          onClick={() => handleQuickAction('Add Income')}
        />
        <QuickAction
          label="Transfer"
          icon={<ArrowLeftRight size={20} className="text-blue-500" />}
          onClick={() => handleQuickAction('Transfer')}
        />
      </div>

      <SpendChart data={dailyTotals} />

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
              onClick={() => handleQuickAction('Add Transaction')}
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

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
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
