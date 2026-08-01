import { useState } from 'react'
import { X } from 'lucide-react'
import { useCategoryStore } from '../../store/categoryStore'
import { Toast } from '../ui/Toast'
import { SWATCH_COLORS } from '../../constants/colors'
import { CATEGORY_ICON_OPTIONS } from '../../constants/icons'
import type { Category, TransactionType } from '../../types'

interface CategorySheetProps {
  category?: Category | null
  defaultType?: TransactionType
  onClose: () => void
  onSaved: () => void
}

export function CategorySheet({
  category,
  defaultType,
  onClose,
  onSaved,
}: CategorySheetProps) {
  const isEdit = Boolean(category)
  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType ?? 'expense')
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICON_OPTIONS[0])
  const [color, setColor] = useState(category?.color ?? SWATCH_COLORS[0].hex)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addCategory = useCategoryStore((s) => s.addCategory)
  const updateCategory = useCategoryStore((s) => s.updateCategory)

  async function handleSave() {
    if (!name.trim()) {
      setError('Enter a category name')
      return
    }

    setIsSaving(true)
    const input = { name: name.trim(), type, icon, color }
    const result = isEdit
      ? await updateCategory(category!.id, input)
      : await addCategory(input)
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
          {isEdit ? 'Edit Category' : 'Add Category'}
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <div className="mb-4 flex rounded-full bg-surface p-1">
          <button
            onClick={() => setType('expense')}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
              type === 'expense' ? 'bg-expense text-white' : 'text-textsecondary'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setType('income')}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
              type === 'income' ? 'bg-income text-white' : 'text-textsecondary'
            }`}
          >
            Income
          </button>
        </div>

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Icon</h3>
        <div className="mb-4 grid max-h-48 grid-cols-5 gap-2 overflow-y-auto">
          {CATEGORY_ICON_OPTIONS.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => setIcon(emoji)}
              className={`flex h-11 w-11 items-center justify-center rounded-full bg-surface text-lg ${
                icon === emoji ? 'ring-2 ring-accent' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Color</h3>
        <div className="mb-5 flex flex-wrap gap-3">
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
