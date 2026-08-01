import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Search,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'
import { TransactionItem } from '../../components/transactions/TransactionItem'
import { AddTransactionSheet } from '../../components/transactions/AddTransactionSheet'
import { TransactionDetailModal } from '../../components/transactions/TransactionDetailModal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { CustomRangeModal } from '../../components/ui/CustomRangeModal'
import { Toast, type ToastType } from '../../components/ui/Toast'
import { useTransactionStore } from '../../store/transactionStore'
import { formatCurrency, formatGroupDate } from '../../lib/formatters'
import type {
  DashboardPeriod,
  DateRange,
  TransactionType,
  TransactionTypeFilter,
  TransactionWithCategory,
} from '../../types'

const PERIOD_TABS: { value: DashboardPeriod; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

const TYPE_TABS: { value: TransactionTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

function pillClass(active: boolean): string {
  return `min-h-[36px] shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
    active ? 'bg-accent text-white' : 'bg-card text-textsecondary'
  }`
}

interface TransactionGroup {
  date: string
  label: string
  total: number
  items: TransactionWithCategory[]
}

function groupTransactionsByDate(transactions: TransactionWithCategory[]): TransactionGroup[] {
  const map = new Map<string, TransactionWithCategory[]>()
  for (const t of transactions) {
    const key = t.date.slice(0, 10)
    const arr = map.get(key) ?? []
    arr.push(t)
    map.set(key, arr)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => ({
      date,
      label: formatGroupDate(date),
      total: items.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
      items,
    }))
}

export function Transactions() {
  const location = useLocation()
  const navigate = useNavigate()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('month')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [selectedType, setSelectedType] = useState<TransactionTypeFilter>('all')

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithCategory | null>(
    null
  )
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [pendingType, setPendingType] = useState<TransactionType | undefined>(undefined)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<TransactionWithCategory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const income = useTransactionStore((s) => s.income)
  const expense = useTransactionStore((s) => s.expense)
  const fetchDashboardData = useTransactionStore((s) => s.fetchDashboardData)
  const list = useTransactionStore((s) => s.list)
  const listHasMore = useTransactionStore((s) => s.listHasMore)
  const isListLoading = useTransactionStore((s) => s.isListLoading)
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)
  const loadMoreTransactions = useTransactionStore((s) => s.loadMoreTransactions)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)

  useEffect(() => {
    const state = location.state as { openAdd?: boolean; type?: string } | null
    if (!state?.openAdd) return

    setEditingTransaction(null)
    setPendingType(state.type === 'income' || state.type === 'expense' ? state.type : undefined)
    setShowAddSheet(true)

    // Clear the one-shot navigation state so this doesn't reopen on remount/back-nav.
    navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  useEffect(() => {
    if (selectedPeriod === 'custom' && !customRange) return
    fetchDashboardData(selectedPeriod, customRange ?? undefined)
  }, [selectedPeriod, customRange, fetchDashboardData])

  useEffect(() => {
    if (selectedPeriod === 'custom' && !customRange) return
    fetchTransactions(
      { period: selectedPeriod, customRange: customRange ?? undefined, type: selectedType },
      true
    )
  }, [selectedPeriod, customRange, selectedType, fetchTransactions])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreTransactions()
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMoreTransactions])

  function handlePeriodClick(period: DashboardPeriod) {
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

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (t) =>
        t.note.toLowerCase().includes(q) || (t.category?.name.toLowerCase().includes(q) ?? false)
    )
  }, [list, searchQuery])

  const groups = useMemo(() => groupTransactionsByDate(filteredList), [filteredList])
  const net = income - expense

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteTransaction(deleteTarget.id)
    setIsDeleting(false)
    setDeleteTarget(null)

    if (result.error) {
      setToast({ message: result.error, type: 'error' })
      return
    }
    setToast({ message: 'Transaction deleted', type: 'success' })
  }

  function refreshAfterMutation() {
    fetchDashboardData(selectedPeriod, customRange ?? undefined)
    fetchTransactions(
      { period: selectedPeriod, customRange: customRange ?? undefined, type: selectedType },
      true
    )
  }

  return (
    <div className="relative flex flex-col gap-4 px-4 py-4">
      {!searchOpen ? (
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-textprimary">Transactions</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-textsecondary"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                showFilters ? 'text-accent' : 'text-textsecondary'
              }`}
              aria-label="Filter"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-textsecondary"
            />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions"
              className="min-h-[44px] w-full rounded-lg border border-border bg-card pl-9 pr-3 text-textprimary placeholder:text-textsecondary"
            />
          </div>
          <button
            onClick={() => {
              setSearchOpen(false)
              setSearchQuery('')
            }}
            className="text-sm text-accent"
          >
            Cancel
          </button>
        </div>
      )}

      {showFilters && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handlePeriodClick(tab.value)}
                className={pillClass(selectedPeriod === tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedType(tab.value)}
                className={pillClass(selectedType === tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-income/10 p-3">
          <ArrowUpRight size={16} className="text-income" />
          <p className="mt-2 text-xs text-income/80">Income</p>
          <p className="truncate text-sm font-semibold text-income">{formatCurrency(income)}</p>
        </div>
        <div className="rounded-2xl bg-expense/10 p-3">
          <ArrowDownRight size={16} className="text-expense" />
          <p className="mt-2 text-xs text-expense/80">Expense</p>
          <p className="truncate text-sm font-semibold text-expense">{formatCurrency(expense)}</p>
        </div>
        <div className="rounded-2xl bg-accent/10 p-3">
          <Wallet size={16} className="text-accent" />
          <p className="mt-2 text-xs text-accent/80">Net</p>
          <p className="truncate text-sm font-semibold text-accent">
            {net < 0 ? '-' : ''}
            {formatCurrency(net)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-4">
        {groups.map((group) => (
          <div key={group.date}>
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-sm font-medium text-textsecondary">{group.label}</span>
              <span
                className={`text-sm font-medium ${
                  group.total >= 0 ? 'text-income' : 'text-expense'
                }`}
              >
                {group.total >= 0 ? '+' : '-'}
                {formatCurrency(group.total)}
              </span>
            </div>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
              {group.items.map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  onClick={() => setSelectedTransaction(t)}
                  onDelete={() => setDeleteTarget(t)}
                />
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && !isListLoading && (
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center">
            <p className="text-sm text-textsecondary">No transactions found</p>
          </div>
        )}

        {isListLoading && (
          <p className="py-2 text-center text-sm text-textsecondary">Loading…</p>
        )}

        {!listHasMore && !isListLoading && groups.length > 0 && (
          <p className="py-2 text-center text-xs text-textsecondary/70">
            You've reached the end
          </p>
        )}

        <div ref={sentinelRef} className="h-1" />
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 mx-auto flex max-w-[430px] justify-end px-4">
        <button
          onClick={() => {
            setEditingTransaction(null)
            setPendingType(undefined)
            setShowAddSheet(true)
          }}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover"
          aria-label="Add transaction"
        >
          <Plus size={24} />
        </button>
      </div>

      {showCustomModal && (
        <CustomRangeModal
          initial={customRange}
          onApply={handleApplyCustomRange}
          onClose={() => setShowCustomModal(false)}
        />
      )}

      {(showAddSheet || editingTransaction) && (
        <AddTransactionSheet
          transaction={editingTransaction}
          defaultType={editingTransaction ? undefined : pendingType}
          onClose={() => {
            setShowAddSheet(false)
            setEditingTransaction(null)
            setPendingType(undefined)
          }}
          onSaved={() => {
            refreshAfterMutation()
            setToast({
              message: editingTransaction ? 'Transaction updated' : 'Transaction added',
              type: 'success',
            })
          }}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onEdit={() => {
            setEditingTransaction(selectedTransaction)
            setSelectedTransaction(null)
          }}
          onDeleted={() => {
            setSelectedTransaction(null)
            refreshAfterMutation()
            setToast({ message: 'Transaction deleted', type: 'success' })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete transaction?"
          message="This can't be undone. The linked account balance will be adjusted back."
          confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}
