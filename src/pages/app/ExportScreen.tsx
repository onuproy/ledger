import { useEffect, useState } from 'react'
import { FileText, Printer, Share2 } from 'lucide-react'
import { Header } from '../../components/layout/Header'
import { CustomRangeModal } from '../../components/ui/CustomRangeModal'
import { Toast, type ToastType } from '../../components/ui/Toast'
import { useTransactionStore, calculateIncome, calculateExpense } from '../../store/transactionStore'
import { useAccountStore } from '../../store/accountStore'
import { useProfileStore } from '../../store/profileStore'
import { getRangeForExportPeriod } from '../../lib/helpers'
import { formatCurrency, formatDate } from '../../lib/formatters'
import { buildTransactionsCsv, downloadBlob } from '../../lib/csv'
import type { DateRange, ExportPeriod, TransactionTypeFilter, TransactionWithCategory } from '../../types'

const PERIOD_TABS: { value: ExportPeriod; label: string }[] = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'allTime', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
]

const TYPE_TABS: { value: TransactionTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income only' },
  { value: 'expense', label: 'Expense only' },
]

function pillClass(active: boolean): string {
  return `min-h-[36px] shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
    active ? 'bg-accent text-white' : 'bg-card text-textsecondary'
  }`
}

export function ExportScreen() {
  const [period, setPeriod] = useState<ExportPeriod>('thisMonth')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [type, setType] = useState<TransactionTypeFilter>('all')
  const [accountId, setAccountId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const fetchExportTransactions = useTransactionStore((s) => s.fetchExportTransactions)
  const [previewTransactions, setPreviewTransactions] = useState<TransactionWithCategory[]>([])

  const accounts = useAccountStore((s) => s.accounts)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)
  const currency = useProfileStore((s) => s.currency)

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    if (period === 'custom' && !customRange) return

    let cancelled = false
    setIsLoading(true)

    fetchExportTransactions({
      period,
      customRange: customRange ?? undefined,
      type,
      accountId,
    }).then((data) => {
      if (!cancelled) {
        setPreviewTransactions(data)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [period, customRange, type, accountId, fetchExportTransactions])

  function handlePeriodClick(value: ExportPeriod) {
    if (value === 'custom') {
      setShowCustomModal(true)
      return
    }
    setPeriod(value)
  }

  function handleApplyCustomRange(range: DateRange) {
    setCustomRange(range)
    setPeriod('custom')
    setShowCustomModal(false)
  }

  const range = getRangeForExportPeriod(period, customRange ?? undefined)
  const totalIncome = calculateIncome(previewTransactions)
  const totalExpense = calculateExpense(previewTransactions)

  function buildFilename(extension: string): string {
    return `ledger-export-${range.start}-${range.end}.${extension}`
  }

  function handleExportCsv() {
    if (previewTransactions.length === 0) {
      setToast({ message: 'No transactions to export', type: 'error' })
      return
    }
    const csv = buildTransactionsCsv(previewTransactions, currency)
    downloadBlob(csv, buildFilename('csv'), 'text/csv;charset=utf-8;')
  }

  function handleExportPdf() {
    if (previewTransactions.length === 0) {
      setToast({ message: 'No transactions to export', type: 'error' })
      return
    }
    window.print()
  }

  async function handleShare() {
    if (previewTransactions.length === 0) {
      setToast({ message: 'No transactions to share', type: 'error' })
      return
    }

    const csv = buildTransactionsCsv(previewTransactions, currency)
    const file = new File([csv], buildFilename('csv'), { type: 'text/csv' })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Ledger Export', text: 'My Ledger transactions export' })
      } catch {
        // user cancelled the share sheet — nothing to do
      }
    } else {
      setToast({ message: 'Sharing files is not supported on this device', type: 'error' })
    }
  }

  const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex flex-col gap-4 print:hidden">
        <Header title="Export Data" backTo="/settings" />

        <div>
          <p className="mb-2 text-sm font-medium text-textsecondary">Date range</p>
          <div className="flex gap-2 overflow-x-auto">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handlePeriodClick(tab.value)}
                className={pillClass(period === tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-textsecondary">Type</p>
          <div className="flex gap-2">
            {TYPE_TABS.map((tab) => (
              <button key={tab.value} onClick={() => setType(tab.value)} className={pillClass(type === tab.value)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-textsecondary">Account</p>
          <select
            value={accountId ?? ''}
            onChange={(e) => setAccountId(e.target.value || null)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-card px-3 text-textprimary"
          >
            <option value="">All accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-sm text-textsecondary">
            {isLoading ? 'Loading…' : `${previewTransactions.length} transaction${previewTransactions.length === 1 ? '' : 's'} to export`}
          </p>
          <p className="mt-1 text-xs text-textsecondary">
            {formatDate(range.start)} – {formatDate(range.end)}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-accent font-medium text-white hover:bg-accent-hover"
        >
          <FileText size={18} />
          Export as CSV
        </button>

        <button
          onClick={handleExportPdf}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-border font-medium text-textprimary"
        >
          <Printer size={18} />
          Export as PDF
        </button>

        {canShareFiles && (
          <button
            onClick={handleShare}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-border font-medium text-textprimary"
          >
            <Share2 size={18} />
            Share
          </button>
        )}
      </div>

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-black">Ledger Financial Report</h1>
        <p className="text-sm text-gray-700">
          {formatDate(range.start)} – {formatDate(range.end)}
        </p>

        <div className="mt-4 flex gap-8">
          <div>
            <span className="text-xs text-gray-500">Income</span>
            <p className="font-semibold text-black">{formatCurrency(totalIncome, currency)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Expense</span>
            <p className="font-semibold text-black">{formatCurrency(totalExpense, currency)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Net</span>
            <p className="font-semibold text-black">
              {formatCurrency(totalIncome - totalExpense, currency)}
            </p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm text-black">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-1 pr-2">Date</th>
              <th className="py-1 pr-2">Type</th>
              <th className="py-1 pr-2">Category</th>
              <th className="py-1 pr-2">Account</th>
              <th className="py-1 pr-2">Note</th>
              <th className="py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {previewTransactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-300">
                <td className="py-1 pr-2">{t.date.slice(0, 10)}</td>
                <td className="py-1 pr-2 capitalize">{t.type}</td>
                <td className="py-1 pr-2">{t.category?.name ?? '—'}</td>
                <td className="py-1 pr-2">{t.account?.name ?? '—'}</td>
                <td className="py-1 pr-2">{t.note}</td>
                <td className="py-1 text-right">{formatCurrency(t.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCustomModal && (
        <CustomRangeModal
          initial={customRange}
          onApply={handleApplyCustomRange}
          onClose={() => setShowCustomModal(false)}
        />
      )}

      {toast && (
        <div className="print:hidden">
          <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}
