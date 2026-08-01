import { useState } from 'react'
import { X } from 'lucide-react'
import { useGoalStore } from '../../store/goalStore'
import { Toast } from '../ui/Toast'
import { formatCurrency } from '../../lib/formatters'
import type { Goal } from '../../types'

interface AddFundsModalProps {
  goal: Goal
  onClose: () => void
  onAdded: (completed: boolean) => void
}

export function AddFundsModal({ goal, onClose, onAdded }: AddFundsModalProps) {
  const [amountStr, setAmountStr] = useState('')
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFunds = useGoalStore((s) => s.addFunds)

  async function handleSave() {
    const amount = parseFloat(amountStr)
    if (!amount || amount <= 0) {
      setError('Enter an amount')
      return
    }

    setIsSaving(true)
    const result = await addFunds(goal.id, amount, note.trim())
    setIsSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onAdded(result.completed)
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

        <div className="mb-4 flex flex-col items-center gap-1 text-center">
          <span className="text-3xl">{goal.icon}</span>
          <h2 className="text-lg font-semibold text-textprimary">{goal.name}</h2>
          <p className="text-sm text-textsecondary">
            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
          </p>
        </div>

        <h3 className="mb-2 text-sm font-medium text-textsecondary">How much to add?</h3>
        <input
          type="number"
          inputMode="decimal"
          autoFocus
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="0.00"
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="mb-5 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-[48px] w-full rounded-lg bg-accent py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isSaving ? 'Adding…' : 'Add Funds'}
        </button>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  )
}
