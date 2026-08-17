import { useState } from 'react'
import { X } from 'lucide-react'
import { useBudgetStore } from '../../store/budgetStore'
import { Toast } from '../ui/Toast'
import { formatMonthYear } from '../../lib/formatters'
import type { BudgetPeriod, Category } from '../../types'

interface SetBudgetSheetProps {
  month: number
  year: number
  categories: Category[]
  initialCategoryId?: string
  initialAmount?: number
  initialPeriod?: BudgetPeriod
  onClose: () => void
  onSaved: () => void
}

export function SetBudgetSheet({
  month,
  year,
  categories,
  initialCategoryId,
  initialAmount,
  initialPeriod,
  onClose,
  onSaved,
}: SetBudgetSheetProps) {
  const isEdit = initialAmount !== undefined
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? categories[0]?.id ?? '')
  const [amountStr, setAmountStr] = useState(initialAmount !== undefined ? String(initialAmount) : '')
  const [period, setPeriod] = useState<BudgetPeriod>(initialPeriod ?? 'monthly')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setBudget = useBudgetStore((s) => s.setBudget)

  async function handleSave() {
    if (!categoryId) {
      setError('Select a category')
      return
    }
    const amount = parseFloat(amountStr)
    if (!amount || amount <= 0) {
      setError('Enter an amount')
      return
    }

    setIsSaving(true)
    const result = await setBudget({ category_id: categoryId, amount, period }, month, year)
    setIsSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm animate-slide-up rounded-t-2xl bg-card px-5 pb-6 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-textsecondary hover:bg-surface"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />

        <h2 className="mb-1 text-lg font-semibold text-textprimary">
          {isEdit ? 'Edit Budget' : 'Set Budget'}
        </h2>
        <p className="mb-4 text-sm text-textsecondary">
          {formatMonthYear(new Date(year, month - 1, 1))}
        </p>

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Category</h3>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isEdit}
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary disabled:opacity-60"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Amount</h3>
        <input
          type="number"
          inputMode="decimal"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="0.00"
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Period</h3>
        <div className="mb-5 flex rounded-full bg-surface p-1">
          <button
            onClick={() => setPeriod('monthly')}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
              period === 'monthly' ? 'bg-accent text-white' : 'text-textsecondary'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
              period === 'weekly' ? 'bg-accent text-white' : 'text-textsecondary'
            }`}
          >
            Weekly
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-[48px] w-full rounded-lg bg-accent py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  )
}
