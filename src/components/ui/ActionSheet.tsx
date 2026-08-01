interface ActionSheetOption {
  label: string
  onClick: () => void
  destructive?: boolean
}

interface ActionSheetProps {
  options: ActionSheetOption[]
  onClose: () => void
}

export function ActionSheet({ options, onClose }: ActionSheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        className="w-full max-w-[430px] animate-slide-up rounded-t-2xl bg-card p-2 pb-[calc(env(safe-area-inset-bottom)+8px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((option) => (
          <button
            key={option.label}
            onClick={() => {
              option.onClick()
              onClose()
            }}
            className={`flex min-h-[52px] w-full items-center justify-center rounded-xl text-base font-medium ${
              option.destructive ? 'text-expense' : 'text-textprimary'
            }`}
          >
            {option.label}
          </button>
        ))}

        <button
          onClick={onClose}
          className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-surface text-base font-medium text-textprimary"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
