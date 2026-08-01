import { useEffect, useState } from 'react'
import { Header } from '../../components/layout/Header'
import { useAccountStore } from '../../store/accountStore'
import { AccountCard } from '../../components/settings/AccountCard'
import { AccountSheet } from '../../components/settings/AccountSheet'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Toast, type ToastType } from '../../components/ui/Toast'
import type { Account } from '../../types'

export function AccountsScreen() {
  const [showSheet, setShowSheet] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const accounts = useAccountStore((s) => s.accounts)
  const transactionCounts = useAccountStore((s) => s.transactionCounts)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)
  const deleteAccount = useAccountStore((s) => s.deleteAccount)

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteAccount(deleteTarget.id)
    setIsDeleting(false)
    setDeleteTarget(null)

    if (result.error) {
      setToast({ message: result.error, type: 'error' })
      return
    }
    setToast({ message: 'Account deleted', type: 'success' })
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <Header title="Accounts" backTo="/settings" />

      <div className="flex flex-col gap-3">
        {accounts.map((acc) => (
          <AccountCard
            key={acc.id}
            account={acc}
            count={transactionCounts[acc.id] ?? 0}
            onClick={() => {
              setEditingAccount(acc)
              setShowSheet(true)
            }}
            onDelete={() => setDeleteTarget(acc)}
          />
        ))}
      </div>

      {accounts.length === 0 && (
        <p className="py-6 text-center text-sm text-textsecondary">No accounts yet</p>
      )}

      <button
        onClick={() => {
          setEditingAccount(null)
          setShowSheet(true)
        }}
        className="min-h-[48px] w-full rounded-lg border-2 border-dashed border-accent/50 py-3 text-sm font-medium text-accent"
      >
        + Add Account
      </button>

      {showSheet && (
        <AccountSheet
          account={editingAccount}
          onClose={() => {
            setShowSheet(false)
            setEditingAccount(null)
          }}
          onSaved={() => {
            fetchAccounts()
            setToast({
              message: editingAccount ? 'Account updated' : 'Account added',
              type: 'success',
            })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete account?"
          message={`"${deleteTarget.name}" will be permanently removed. This can't be undone.`}
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
