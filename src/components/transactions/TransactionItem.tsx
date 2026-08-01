import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/formatters'
import type { TransactionWithCategory } from '../../types'

interface TransactionItemProps {
  transaction: TransactionWithCategory
  onClick?: () => void
  onDelete?: () => void
}

const REVEAL_WIDTH = 72
const SWIPE_OPEN_THRESHOLD = REVEAL_WIDTH / 2

export function TransactionItem({ transaction, onClick, onDelete }: TransactionItemProps) {
  const { category, note, type, amount, date } = transaction
  const primaryLabel = note || category?.name || 'Uncategorized'
  const isIncome = type === 'income'

  const [offset, setOffset] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    if (!onDelete) return
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!onDelete || touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    const base = isOpen ? -REVEAL_WIDTH : 0
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, base + delta))
    setOffset(next)
  }

  function handleTouchEnd() {
    if (!onDelete) return
    if (offset < -SWIPE_OPEN_THRESHOLD) {
      setOffset(-REVEAL_WIDTH)
      setIsOpen(true)
    } else {
      setOffset(0)
      setIsOpen(false)
    }
    touchStartX.current = null
  }

  function handleRowClick() {
    if (isOpen) {
      setOffset(0)
      setIsOpen(false)
      return
    }
    onClick?.()
  }

  return (
    <div className="relative overflow-hidden">
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-expense text-white"
          style={{ width: REVEAL_WIDTH }}
          aria-label="Delete transaction"
        >
          <Trash2 size={18} />
        </button>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleRowClick}
        style={{ transform: `translateX(${offset}px)` }}
        className="relative flex items-center gap-3 bg-card py-3 transition-transform duration-200 ease-out"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: `${category?.color ?? '#94a3b8'}26` }}
        >
          {category?.icon ?? '💰'}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-textprimary">{primaryLabel}</p>
          {note && category?.name && (
            <p className="truncate text-sm text-textsecondary">{category.name}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className={`font-medium ${isIncome ? 'text-income' : 'text-expense'}`}>
            {isIncome ? '+' : '-'}
            {formatCurrency(amount)}
          </p>
          <p className="text-xs text-textsecondary/70">{formatDate(date)}</p>
        </div>
      </div>
    </div>
  )
}
