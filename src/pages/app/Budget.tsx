import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import { useBudgetStore } from '../../store/budgetStore'
import { useAuthStore } from '../../store/authStore'
import { RingProgress } from '../../components/charts/RingProgress'
import { SetBudgetSheet } from '../../components/budget/SetBudgetSheet'
import { RecurringDeleteDialog } from '../../components/budget/RecurringDeleteDialog'
import { ActionSheet } from '../../components/ui/ActionSheet'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Toast, type ToastType } from '../../components/ui/Toast'
import { formatCurrency, formatMonthYear } from '../../lib/formatters'
import type { BudgetCategoryItem, Category } from '../../types'

function shiftMonth(month: number, year: number, delta: number): { month: number; year: number } {
  const d = new Date(year, month - 1 + delta, 1)
  return { month: d.getMonth() + 1, year: d.getFullYear() }
}

function progressColorClass(pct: number): string {
  if (pct >= 100) return 'bg-expense'
  if (pct >= 80) return 'bg-amber'
  return 'bg-accent'
}

function progressHex(pct: number): string {
  if (pct >= 100) return '#ef4444'
  if (pct >= 80) return '#f59e0b'
  return '#6366f1'
}

function daysLeftInMonth(month: number, year: number): number | null {
  const today = new Date()
  if (today.getMonth() + 1 !== month || today.getFullYear() !== year) return null
  const daysInMonth = new Date(year, month, 0).getDate()
  return daysInMonth - today.getDate()
}

export function Budget() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [showSheet, setShowSheet] = useState(false)
  const [presetCategoryId, setPresetCategoryId] = useState<string | undefined>(undefined)
  const [editingItem, setEditingItem] = useState<BudgetCategoryItem | null>(null)
  const [actionItem, setActionItem] = useState<BudgetCategoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BudgetCategoryItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const userId = useAuthStore((s) => s.user?.id)

  const items = useBudgetStore((s) => s.items)
  const totalBudgeted = useBudgetStore((s) => s.totalBudgeted)
  const totalSpent = useBudgetStore((s) => s.totalSpent)
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets)
  const deleteBudget = useBudgetStore((s) => s.deleteBudget)
  const stopRecurringAndDelete = useBudgetStore((s) => s.stopRecurringAndDelete)
  const ensureRecurringBudgets = useBudgetStore((s) => s.ensureRecurringBudgets)

  useEffect(() => {
    if (isAuthLoading) return
    setIsLoading(true)
    async function load() {
      await fetchBudgets(month, year)
      await ensureRecurringBudgets(month, year)
      await fetchBudgets(month, year)
      setIsLoading(false)
    }
    load()
  }, [isAuthLoading, userId, month, year, fetchBudgets, ensureRecurringBudgets])

  function handlePrevMonth() {
    const next = shiftMonth(month, year, -1)
    setMonth(next.month)
    setYear(next.year)
  }

  function handleNextMonth() {
    const next = shiftMonth(month, year, 1)
    setMonth(next.month)
    setYear(next.year)
  }

  function handleAddBudget(category: Category) {
    setEditingItem(null)
    setPresetCategoryId(category.id)
    setShowSheet(true)
  }

  function handleEditBudget(item: BudgetCategoryItem) {
    setEditingItem(item)
    setShowSheet(true)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget?.budget) return
    setIsDeleting(true)
    const result = await deleteBudget(deleteTarget.budget.id)
    setIsDeleting(false)
    setDeleteTarget(null)

    if (result.error) {
      setToast({ message: result.error, type: 'error' })
      return
    }

    fetchBudgets(month, year)
    setToast({ message: 'Budget deleted', type: 'success' })
  }

  async function handleStopRepeatingDelete() {
    if (!deleteTarget?.budget) return
    setIsDeleting(true)
    const result = await stopRecurringAndDelete(deleteTarget.budget)
    setIsDeleting(false)
    setDeleteTarget(null)

    if (result.error) {
      setToast({ message: result.error, type: 'error' })
      return
    }

    fetchBudgets(month, year)
    setToast({ message: 'Recurring budget stopped and deleted', type: 'success' })
  }

  const overallPct = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0
  const remaining = totalBudgeted - totalSpent
  const daysLeft = daysLeftInMonth(month, year)
  const expenseCategories = items.map((i) => i.category)
  const budgetsNeedingAttention = items.filter(
    (i) => i.budget && i.budget.amount > 0 && (i.spent / i.budget.amount) * 100 >= 80
  ).length

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <h1 className="text-xl font-semibold text-textprimary">Budget</h1>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-textsecondary hover:text-textprimary"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="min-w-[140px] text-center font-medium text-textprimary">
          {formatMonthYear(new Date(year, month - 1, 1))}
        </span>
        <button
          onClick={handleNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-textsecondary hover:text-textprimary"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isAuthLoading || isLoading ? (
        <>
          <div className="h-64 animate-pulse rounded-2xl bg-card" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        </>
      ) : (
        <>
          {budgetsNeedingAttention > 0 && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber bg-amber/10 px-4 py-3">
              <span className="text-sm font-medium text-amber">
                ⚠️ {budgetsNeedingAttention} budget{budgetsNeedingAttention === 1 ? '' : 's'} need
                attention
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6">
            <RingProgress percentage={overallPct} size={120} strokeWidth={10} color={progressHex(overallPct)}>
              <span className="text-2xl font-bold text-textprimary">{Math.round(overallPct)}%</span>
            </RingProgress>
            <p className="text-sm text-textsecondary">used</p>

            <div className="text-center">
              <p className="text-sm text-textsecondary">
                {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudgeted)} budgeted
              </p>
              <p className={`mt-1 font-medium ${remaining >= 0 ? 'text-income' : 'text-expense'}`}>
                {remaining < 0 ? '-' : ''}
                {formatCurrency(remaining)} remaining
              </p>
              {daysLeft !== null && (
                <p className="mt-1 text-xs text-textsecondary">
                  {daysLeft} day{daysLeft === 1 ? '' : 's'} left this month
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <BudgetCategoryCard
                key={item.category.id}
                item={item}
                onAddBudget={handleAddBudget}
                onOpenActions={setActionItem}
              />
            ))}
          </div>

          {items.length === 0 && (
            <p className="py-6 text-center text-sm text-textsecondary">No expense categories yet</p>
          )}
        </>
      )}

      <button
        onClick={() => {
          setEditingItem(null)
          setPresetCategoryId(undefined)
          setShowSheet(true)
        }}
        className="min-h-[48px] w-full rounded-lg border-2 border-dashed border-accent/50 py-3 text-sm font-medium text-accent"
      >
        + Set Budget
      </button>

      {showSheet && (
        <SetBudgetSheet
          month={month}
          year={year}
          categories={expenseCategories}
          initialCategoryId={editingItem?.category.id ?? presetCategoryId}
          initialAmount={editingItem?.budget?.amount}
          initialPeriod={editingItem?.budget?.period}
          initialIsRecurring={editingItem?.budget?.is_recurring}
          onClose={() => {
            setShowSheet(false)
            setEditingItem(null)
          }}
          onSaved={() => {
            fetchBudgets(month, year)
            setToast({
              message: editingItem ? 'Budget updated' : 'Budget saved',
              type: 'success',
            })
          }}
        />
      )}

      {actionItem && (
        <ActionSheet
          options={[
            {
              label: 'Edit',
              onClick: () => handleEditBudget(actionItem),
            },
            {
              label: 'Delete',
              destructive: true,
              onClick: () => setDeleteTarget(actionItem),
            },
          ]}
          onClose={() => setActionItem(null)}
        />
      )}

      {deleteTarget && deleteTarget.budget?.is_recurring && (
        <RecurringDeleteDialog
          categoryName={deleteTarget.category.name}
          isDeleting={isDeleting}
          onDeleteThisMonth={handleConfirmDelete}
          onStopRepeating={handleStopRepeatingDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteTarget && !deleteTarget.budget?.is_recurring && (
        <ConfirmDialog
          title="Delete budget?"
          message={`The budget for "${deleteTarget.category.name}" will be removed. Spending history is not affected.`}
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

interface BudgetCategoryCardProps {
  item: BudgetCategoryItem
  onAddBudget: (category: Category) => void
  onOpenActions: (item: BudgetCategoryItem) => void
}

function BudgetCategoryCard({ item, onAddBudget, onOpenActions }: BudgetCategoryCardProps) {
  const { category, budget, spent } = item

  if (!budget) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: `${category.color}26` }}
        >
          {category.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-textprimary">{category.name}</p>
          <p className="text-xs text-textsecondary">No budget set</p>
        </div>
        <button
          onClick={() => onAddBudget(category)}
          className="shrink-0 rounded-full border border-accent/50 px-3 py-1.5 text-xs font-medium text-accent"
        >
          Add Budget
        </button>
      </div>
    )
  }

  const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
  const isOverBudget = pct >= 100
  const isNearLimit = pct >= 80 && pct < 100

  return (
    <div
      className={`rounded-2xl border bg-card p-4 ${
        isOverBudget ? 'border-expense' : 'border-border'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: `${category.color}26` }}
        >
          {category.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-textprimary">
            {category.name}
            {budget.is_recurring && (
              <span className="ml-1.5 align-middle text-xs" title="Repeats every month">
                🔁
              </span>
            )}
          </p>
          <p className="text-xs text-textsecondary">
            {formatCurrency(spent)} / {formatCurrency(budget.amount)}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-border">
            <div
              className={`h-2 rounded-full ${progressColorClass(pct)}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        <RingProgress
          percentage={pct}
          size={40}
          strokeWidth={4}
          color={progressHex(pct)}
        />

        <button
          onClick={() => onOpenActions(item)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-textsecondary hover:bg-surface"
          aria-label={`${category.name} budget options`}
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {isOverBudget && (
        <p className="mt-2 text-xs font-medium text-expense">Over budget 🔴</p>
      )}
      {isNearLimit && (
        <p className="mt-2 text-xs font-medium text-amber">⚠️ {Math.round(pct)}% used</p>
      )}
    </div>
  )
}
