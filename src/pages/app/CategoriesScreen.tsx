import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Header } from '../../components/layout/Header'
import { useCategoryStore } from '../../store/categoryStore'
import { useAuthStore } from '../../store/authStore'
import { CategorySheet } from '../../components/settings/CategorySheet'
import { ActionSheet } from '../../components/ui/ActionSheet'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Toast, type ToastType } from '../../components/ui/Toast'
import type { Category, TransactionType } from '../../types'

export function CategoriesScreen() {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense')
  const [showSheet, setShowSheet] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [actionCategory, setActionCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const userId = useAuthStore((s) => s.user?.id)

  const categories = useCategoryStore((s) => s.categories)
  const transactionCounts = useCategoryStore((s) => s.transactionCounts)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const deleteCategory = useCategoryStore((s) => s.deleteCategory)

  useEffect(() => {
    // Wait for auth to resolve — on a hard reload, authStore.initialize()
    // hasn't finished yet, so fetching immediately would read a
    // not-yet-populated user id and silently return no categories.
    if (isAuthLoading) return
    setIsLoading(true)
    fetchCategories().finally(() => setIsLoading(false))
  }, [isAuthLoading, userId, fetchCategories])

  const filtered = categories.filter((c) => c.type === activeTab)

  function handleCardClick(category: Category) {
    if (category.is_default) {
      setToast({ message: "Default categories can't be edited", type: 'error' })
      return
    }
    setActionCategory(category)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteCategory(deleteTarget.id)
    setIsDeleting(false)
    setDeleteTarget(null)

    if (result.error) {
      setToast({ message: result.error, type: 'error' })
      return
    }
    setToast({ message: 'Category deleted', type: 'success' })
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <Header title="Categories" backTo="/settings" />

      <div className="flex rounded-full bg-card p-1">
        <button
          onClick={() => setActiveTab('expense')}
          className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
            activeTab === 'expense' ? 'bg-accent text-white' : 'text-textsecondary'
          }`}
        >
          Expense
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
            activeTab === 'income' ? 'bg-accent text-white' : 'text-textsecondary'
          }`}
        >
          Income
        </button>
      </div>

      {isAuthLoading || isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((cat) => {
              const count = transactionCounts[cat.id] ?? 0
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCardClick(cat)}
                  className="relative flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                    style={{ backgroundColor: `${cat.color}26` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="truncate font-medium text-textprimary">{cat.name}</p>
                    <p className="text-xs text-textsecondary">
                      {count} transaction{count === 1 ? '' : 's'} this month
                    </p>
                  </div>
                  {cat.is_default && (
                    <Lock size={14} className="absolute bottom-3 right-3 text-textsecondary" />
                  )}
                </button>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-textsecondary">
              No {activeTab} categories yet
            </p>
          )}
        </>
      )}

      <button
        onClick={() => {
          setEditingCategory(null)
          setShowSheet(true)
        }}
        className="min-h-[48px] w-full rounded-lg border-2 border-dashed border-accent/50 py-3 text-sm font-medium text-accent"
      >
        + Add Category
      </button>

      {showSheet && (
        <CategorySheet
          category={editingCategory}
          defaultType={activeTab}
          onClose={() => {
            setShowSheet(false)
            setEditingCategory(null)
          }}
          onSaved={() => {
            fetchCategories()
            setToast({
              message: editingCategory ? 'Category updated' : 'Category added',
              type: 'success',
            })
          }}
        />
      )}

      {actionCategory && (
        <ActionSheet
          options={[
            {
              label: 'Edit',
              onClick: () => {
                setEditingCategory(actionCategory)
                setShowSheet(true)
              },
            },
            {
              label: 'Delete',
              destructive: true,
              onClick: () => setDeleteTarget(actionCategory),
            },
          ]}
          onClose={() => setActionCategory(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete category?"
          message={`"${deleteTarget.name}" will be permanently removed.`}
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
