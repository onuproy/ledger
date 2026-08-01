interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6"
      onClick={(e) => {
        e.stopPropagation()
        onCancel()
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-textprimary">{title}</h2>
        <p className="mt-2 text-sm text-textsecondary">{message}</p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="min-h-[48px] flex-1 rounded-lg border border-border font-medium text-textprimary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`min-h-[48px] flex-1 rounded-lg font-medium text-white ${
              isDestructive ? 'bg-expense' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
