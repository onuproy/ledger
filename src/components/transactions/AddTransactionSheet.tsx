import { useEffect, useRef, useState } from 'react'
import { Camera, Delete, X } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore'
import { useCategoryStore } from '../../store/categoryStore'
import { useAccountStore } from '../../store/accountStore'
import { Toast } from '../ui/Toast'
import { formatCurrency } from '../../lib/formatters'
import { toDateOnly } from '../../lib/helpers'
import type { TransactionType, TransactionWithCategory } from '../../types'

export type EntryType = TransactionType | 'transfer'

interface AddTransactionSheetProps {
  transaction?: TransactionWithCategory | null
  defaultType?: EntryType
  onClose: () => void
  onSaved: () => void
}

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace']

export function AddTransactionSheet({
  transaction,
  defaultType,
  onClose,
  onSaved,
}: AddTransactionSheetProps) {
  const isEdit = Boolean(transaction)
  const today = toDateOnly(new Date())

  const [type, setType] = useState<EntryType>(transaction?.type ?? defaultType ?? 'expense')
  const [amountStr, setAmountStr] = useState(
    transaction ? String(transaction.amount) : '0'
  )
  const [categoryId, setCategoryId] = useState<string | null>(transaction?.category_id ?? null)
  const [accountId, setAccountId] = useState<string | null>(transaction?.account_id ?? null)
  const [fromAccountId, setFromAccountId] = useState<string | null>(null)
  const [toAccountId, setToAccountId] = useState<string | null>(null)
  const [date, setDate] = useState(transaction ? transaction.date.slice(0, 10) : today)
  const [time, setTime] = useState(
    transaction?.time ?? new Date().toTimeString().slice(0, 5)
  )
  const [note, setNote] = useState(transaction?.note ?? '')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = useCategoryStore((s) => s.categories)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
  const createTransfer = useTransactionStore((s) => s.createTransfer)
  const uploadReceipt = useTransactionStore((s) => s.uploadReceipt)
  const accounts = useAccountStore((s) => s.accounts)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)

  useEffect(() => {
    fetchCategories()
    fetchAccounts()
  }, [fetchCategories, fetchAccounts])

  useEffect(() => {
    if (!accountId && accounts.length > 0) setAccountId(accounts[0].id)
  }, [accounts, accountId])

  useEffect(() => {
    if (!fromAccountId && accounts.length > 0) setFromAccountId(accounts[0].id)
    if (!toAccountId && accounts.length > 1) setToAccountId(accounts[1].id)
  }, [accounts, fromAccountId, toAccountId])

  useEffect(() => {
    if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
      setToAccountId(null)
    }
  }, [fromAccountId, toAccountId])

  const filteredCategories = categories.filter((c) => c.type === type)
  const amount = parseFloat(amountStr) || 0

  function handleKey(key: string) {
    setAmountStr((prev) => {
      if (key === 'clear') return '0'
      if (key === 'backspace') {
        const next = prev.slice(0, -1)
        return next === '' ? '0' : next
      }
      if (key === '.') {
        return prev.includes('.') ? prev : `${prev}.`
      }
      if (prev === '0') return key
      const decimals = prev.split('.')[1]
      if (decimals && decimals.length >= 2) return prev
      return prev + key
    })
  }

  function handleTypeChange(nextType: EntryType) {
    setType(nextType)
    setCategoryId(null)
  }

  async function handleSave() {
    if (type === 'transfer') {
      if (!fromAccountId || !toAccountId) {
        setError('Select both accounts')
        return
      }
      if (fromAccountId === toAccountId) {
        setError('Choose two different accounts')
        return
      }
      if (amount <= 0) {
        setError('Enter an amount')
        return
      }

      setIsSaving(true)
      const result = await createTransfer({ fromAccountId, toAccountId, amount, date, time })
      setIsSaving(false)

      if (result.error) {
        setError(result.error)
        return
      }

      onSaved()
      onClose()
      return
    }

    if (!categoryId) {
      setError('Please select a category')
      return
    }
    if (!accountId) {
      setError('Please select an account')
      return
    }
    if (amount <= 0) {
      setError('Enter an amount')
      return
    }

    setIsSaving(true)

    let receiptUrl = transaction?.receipt_url ?? null
    if (receiptFile) {
      const uploaded = await uploadReceipt(receiptFile)
      if (uploaded) receiptUrl = uploaded
    }

    const result = isEdit
      ? await updateTransaction(transaction!.id, {
          account_id: accountId,
          category_id: categoryId,
          type,
          amount,
          note,
          date,
          time,
          receipt_url: receiptUrl,
        })
      : await addTransaction({
          account_id: accountId,
          category_id: categoryId,
          type,
          amount,
          note,
          date,
          time,
          receipt_url: receiptUrl,
        })

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

        <div className="mb-4 flex rounded-full bg-surface p-1">
          <button
            onClick={() => handleTypeChange('expense')}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
              type === 'expense' ? 'bg-expense text-white' : 'text-textsecondary'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => handleTypeChange('income')}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
              type === 'income' ? 'bg-income text-white' : 'text-textsecondary'
            }`}
          >
            Income
          </button>
          {!isEdit && (
            <button
              onClick={() => handleTypeChange('transfer')}
              className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
                type === 'transfer' ? 'bg-blue-500 text-white' : 'text-textsecondary'
              }`}
            >
              Transfer
            </button>
          )}
        </div>

        <div className="mb-4 text-center">
          <span
            className={`text-4xl font-bold ${
              type === 'income' ? 'text-income' : type === 'transfer' ? 'text-blue-500' : 'text-expense'
            }`}
          >
            {formatCurrency(amount)}
          </span>
        </div>

        <div className="mb-1 flex justify-end">
          <button onClick={() => handleKey('clear')} className="px-2 text-sm text-textsecondary">
            Clear
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {KEYPAD_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="flex h-12 items-center justify-center rounded-lg bg-surface text-lg font-medium text-textprimary"
            >
              {key === 'backspace' ? <Delete size={20} /> : key}
            </button>
          ))}
        </div>

        {type !== 'transfer' && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium text-textsecondary">Category</h3>
            <div className="grid max-h-48 grid-cols-4 gap-3 overflow-y-auto">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 ${
                    categoryId === cat.id ? 'ring-2 ring-accent' : ''
                  }`}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                    style={{ backgroundColor: `${cat.color}26` }}
                  >
                    {cat.icon}
                  </div>
                  <span className="w-full truncate text-center text-xs text-textsecondary">
                    {cat.name}
                  </span>
                </button>
              ))}
              {filteredCategories.length === 0 && (
                <p className="col-span-4 py-4 text-center text-sm text-textsecondary">
                  No categories yet
                </p>
              )}
            </div>
          </div>
        )}

        {type !== 'transfer' ? (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium text-textsecondary">Account</h3>
            <div className="flex gap-2 overflow-x-auto">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAccountId(acc.id)}
                  className={`min-h-[40px] shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                    accountId === acc.id
                      ? 'bg-accent text-white'
                      : 'border border-border text-textsecondary'
                  }`}
                >
                  {acc.name}
                </button>
              ))}
              {accounts.length === 0 && (
                <p className="text-sm text-textsecondary">No accounts yet</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-medium text-textsecondary">From Account</h3>
              <div className="flex gap-2 overflow-x-auto">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setFromAccountId(acc.id)}
                    className={`min-h-[40px] shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                      fromAccountId === acc.id
                        ? 'bg-accent text-white'
                        : 'border border-border text-textsecondary'
                    }`}
                  >
                    {acc.name}
                  </button>
                ))}
                {accounts.length === 0 && (
                  <p className="text-sm text-textsecondary">No accounts yet</p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-2 text-sm font-medium text-textsecondary">To Account</h3>
              <div className="flex gap-2 overflow-x-auto">
                {accounts.map((acc) => {
                  const isDisabled = acc.id === fromAccountId
                  return (
                    <button
                      key={acc.id}
                      onClick={() => {
                        if (isDisabled) return
                        setToAccountId(acc.id)
                      }}
                      disabled={isDisabled}
                      className={`min-h-[40px] shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                        isDisabled
                          ? 'cursor-not-allowed border border-border text-textsecondary opacity-40'
                          : toAccountId === acc.id
                            ? 'bg-blue-500 text-white'
                            : 'border border-border text-textsecondary'
                      }`}
                    >
                      {acc.name}
                    </button>
                  )
                })}
                {accounts.length === 0 && (
                  <p className="text-sm text-textsecondary">No accounts yet</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="mt-5">
          <h3 className="mb-2 text-sm font-medium text-textsecondary">Date &amp; Time</h3>
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              className="flex-1 rounded-xl border border-border bg-surface p-3 text-sm text-textprimary"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-28 rounded-xl border border-border bg-surface p-3 text-sm text-textprimary"
            />
          </div>
        </div>

        {type !== 'transfer' && (
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's this for?"
            className="mt-5 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
          />
        )}

        {type !== 'transfer' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 flex min-h-[48px] w-full items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm text-textsecondary"
            >
              <Camera size={18} />
              {receiptFile ? receiptFile.name : 'Add receipt'}
            </button>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-5 min-h-[48px] w-full rounded-lg bg-accent py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  )
}
