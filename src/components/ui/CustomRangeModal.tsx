import { useState } from 'react'
import { toDateOnly } from '../../lib/helpers'
import type { DateRange } from '../../types'

interface CustomRangeModalProps {
  initial: DateRange | null
  onApply: (range: DateRange) => void
  onClose: () => void
}

export function CustomRangeModal({ initial, onApply, onClose }: CustomRangeModalProps) {
  const [start, setStart] = useState(initial?.start ?? '')
  const [end, setEnd] = useState(initial?.end ?? '')
  const today = toDateOnly(new Date())

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl bg-card p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-textprimary">Custom Range</h2>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-textsecondary">
            Start date
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              max={today}
              className="mt-1 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary [color-scheme:dark]"
            />
          </label>
          <label className="text-sm text-textsecondary">
            End date
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              max={today}
              className="mt-1 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary [color-scheme:dark]"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="min-h-[48px] flex-1 rounded-lg border border-border font-medium text-textprimary"
          >
            Cancel
          </button>
          <button
            disabled={!start || !end}
            onClick={() => start && end && onApply({ start, end })}
            className="min-h-[48px] flex-1 rounded-lg bg-accent font-medium text-white disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
