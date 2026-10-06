interface RecurringDeleteDialogProps {
  categoryName: string
  isDeleting: boolean
  onDeleteThisMonth: () => void
  onStopRepeating: () => void
  onCancel: () => void
}

export function RecurringDeleteDialog({
  categoryName,
  isDeleting,
  onDeleteThisMonth,
  onStopRepeating,
  onCancel,
}: RecurringDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6"
      onClick={(e) => {
        e.stopPropagation()
        onCancel()
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-textprimary">🔁 Recurring budget</h2>
        <p className="mt-2 text-sm text-textsecondary">
          The budget for "{categoryName}" repeats every month. What would you like to do?
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <button
            onClick={onDeleteThisMonth}
            disabled={isDeleting}
            className="min-h-[48px] w-full rounded-lg border border-border font-medium text-textprimary disabled:opacity-60"
          >
            Delete this month only
          </button>
          <button
            onClick={onStopRepeating}
            disabled={isDeleting}
            className="min-h-[48px] w-full rounded-lg bg-expense font-medium text-white disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Stop repeating & delete'}
          </button>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="min-h-[48px] w-full rounded-lg text-sm font-medium text-textsecondary disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
