import { useState } from 'react'
import { useTransactionStore } from '../../store/transactionStore'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Toast } from '../ui/Toast'
import { formatCurrency, formatDate } from '../../lib/formatters'
import type { TransactionWithCategory } from '../../types'

interface TransactionDetailModalProps {
  transaction: TransactionWithCategory
  onClose: () => void
  onEdit: () => void
  onDeleted: () => void
}

export function TransactionDetailModal({
  transaction,
  onClose,
  onEdit,
  onDeleted,
}: TransactionDetailModalProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)

  const { category, account, type, amount, date, note, receipt_url } = transaction
  const isIncome = type === 'income'

  async function handleConfirmDelete() {
    setIsDeleting(true)
    const result = await deleteTransaction(transaction.id)
    setIsDeleting(false)
    setShowConfirm(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onDeleted()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-sm animate-slide-up overflow-y-auto rounded-t-2xl bg-card px-5 pb-6 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />

        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
            style={{ backgroundColor: `${category?.color ?? '#94a3b8'}26` }}
          >
            {category?.icon ?? '💰'}
          </div>
          <span
            className={`text-3xl font-bold ${isIncome ? 'text-income' : 'text-expense'}`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(amount)}
          </span>
        </div>

        <div className="mt-4 divide-y divide-border rounded-2xl border border-border">
          <DetailRow label="Type" value={isIncome ? 'Income' : 'Expense'} />
          <DetailRow label="Category" value={category?.name ?? 'Uncategorized'} />
          <DetailRow label="Account" value={account?.name ?? '—'} />
          <DetailRow label="Date" value={formatDate(date)} />
          <DetailRow label="Note" value={note || '—'} />
        </div>

        {receipt_url && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium text-textsecondary">Receipt</h3>
            <img
              src={receipt_url}
              alt="Receipt"
              className="w-full rounded-xl border border-border object-cover"
            />
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onEdit}
            className="min-h-[48px] flex-1 rounded-lg border border-accent font-medium text-accent"
          >
            Edit
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="min-h-[48px] flex-1 rounded-lg border border-expense font-medium text-expense"
          >
            Delete
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Delete transaction?"
          message="This can't be undone. The linked account balance will be adjusted back."
          confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-textsecondary">{label}</span>
      <span className="max-w-[60%] truncate text-right text-sm font-medium text-textprimary">
        {value}
      </span>
    </div>
  )
}
