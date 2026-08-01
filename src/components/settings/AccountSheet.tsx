import { useState } from 'react'
import { X } from 'lucide-react'
import { useAccountStore } from '../../store/accountStore'
import { Toast } from '../ui/Toast'
import { SWATCH_COLORS } from '../../constants/colors'
import { ACCOUNT_ICON_OPTIONS } from '../../constants/icons'
import type { Account, AccountType } from '../../types'

interface AccountSheetProps {
  account?: Account | null
  onClose: () => void
  onSaved: () => void
}

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'card', label: 'Card' },
  { value: 'wallet', label: 'Wallet' },
]

export function AccountSheet({ account, onClose, onSaved }: AccountSheetProps) {
  const isEdit = Boolean(account)
  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<AccountType>((account?.type as AccountType) ?? 'cash')
  const [balanceStr, setBalanceStr] = useState(account ? String(account.balance) : '')
  const [color, setColor] = useState(account?.color ?? SWATCH_COLORS[0].hex)
  const [icon, setIcon] = useState(account?.icon ?? ACCOUNT_ICON_OPTIONS[0])
  const [isDefault, setIsDefault] = useState(account?.is_default ?? false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addAccount = useAccountStore((s) => s.addAccount)
  const updateAccount = useAccountStore((s) => s.updateAccount)

  async function handleSave() {
    if (!name.trim()) {
      setError('Enter an account name')
      return
    }

    const balance = parseFloat(balanceStr) || 0

    setIsSaving(true)
    const input = { name: name.trim(), type, balance, color, icon, is_default: isDefault }
    const result = isEdit ? await updateAccount(account!.id, input) : await addAccount(input)
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
        className="relative max-h-[92vh] w-full max-w-sm animate-slide-up overflow-y-auto rounded-t-2xl bg-card px-5 pb-6 pt-3"
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

        <h2 className="mb-4 text-lg font-semibold text-textprimary">
          {isEdit ? 'Edit Account' : 'Add Account'}
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Account name"
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Type</h3>
        <div className="mb-4 flex gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
                type === opt.value
                  ? 'bg-accent text-white'
                  : 'border border-border text-textsecondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Initial Balance</h3>
        <input
          type="number"
          inputMode="decimal"
          value={balanceStr}
          onChange={(e) => setBalanceStr(e.target.value)}
          placeholder="0.00"
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Icon</h3>
        <div className="mb-4 flex gap-2">
          {ACCOUNT_ICON_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setIcon(opt)}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-surface text-xl ${
                icon === opt ? 'ring-2 ring-accent' : ''
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Color</h3>
        <div className="mb-4 flex flex-wrap gap-3">
          {SWATCH_COLORS.map((swatch) => (
            <button
              key={swatch.hex}
              onClick={() => setColor(swatch.hex)}
              className={`h-9 w-9 rounded-full ${
                color === swatch.hex ? 'ring-2 ring-accent ring-offset-2 ring-offset-card' : ''
              }`}
              style={{ backgroundColor: swatch.hex }}
              aria-label={swatch.name}
            />
          ))}
        </div>

        <label className="mb-5 flex items-center gap-2 text-sm text-textprimary">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Set as default account
        </label>

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
