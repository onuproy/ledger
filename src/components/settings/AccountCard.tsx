import { useRef, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../lib/formatters'
import type { Account } from '../../types'

interface AccountCardProps {
  account: Account
  count: number
  onClick: () => void
  onDelete: () => void
}

const REVEAL_WIDTH = 72
const SWIPE_OPEN_THRESHOLD = REVEAL_WIDTH / 2

const TYPE_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank: 'Bank',
  card: 'Card',
  wallet: 'Wallet',
}

export function AccountCard({ account, count, onClick, onDelete }: AccountCardProps) {
  const [offset, setOffset] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    const base = isOpen ? -REVEAL_WIDTH : 0
    setOffset(Math.min(0, Math.max(-REVEAL_WIDTH, base + delta)))
  }

  function handleTouchEnd() {
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
    onClick()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <button
        onClick={onDelete}
        className="absolute inset-y-0 right-0 flex items-center justify-center rounded-2xl bg-expense text-white"
        style={{ width: REVEAL_WIDTH }}
        aria-label="Delete account"
      >
        <Trash2 size={18} />
      </button>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleRowClick}
        style={{ transform: `translateX(${offset}px)` }}
        className="relative flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-transform duration-200 ease-out"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: `${account.color}26` }}
        >
          {account.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-medium text-textprimary">{account.name}</p>
            {account.is_default && (
              <Star size={14} className="shrink-0 fill-amber text-amber" />
            )}
          </div>
          <span className="inline-block rounded-full bg-surface px-2 py-0.5 text-xs text-textsecondary">
            {TYPE_LABELS[account.type] ?? account.type}
          </span>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-textprimary">{formatCurrency(account.balance)}</p>
          <p className="text-xs text-textsecondary">
            {count} transaction{count === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </div>
  )
}
