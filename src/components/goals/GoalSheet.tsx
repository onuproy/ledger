import { useState } from 'react'
import { X } from 'lucide-react'
import { useGoalStore } from '../../store/goalStore'
import { Toast } from '../ui/Toast'
import { GOAL_GRADIENT_COLORS } from '../../constants/colors'
import { GOAL_ICON_OPTIONS } from '../../constants/icons'
import { toDateOnly } from '../../lib/helpers'

interface GoalSheetProps {
  onClose: () => void
  onSaved: () => void
}

export function GoalSheet({ onClose, onSaved }: GoalSheetProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(GOAL_ICON_OPTIONS[0])
  const [color, setColor] = useState(GOAL_GRADIENT_COLORS[0].hex)
  const [targetStr, setTargetStr] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addGoal = useGoalStore((s) => s.addGoal)

  async function handleSave() {
    if (!name.trim()) {
      setError('Enter a goal name')
      return
    }
    const target = parseFloat(targetStr)
    if (!target || target <= 0) {
      setError('Enter a target amount')
      return
    }
    if (!deadline) {
      setError('Pick a deadline')
      return
    }

    setIsSaving(true)
    const result = await addGoal({
      name: name.trim(),
      icon,
      color,
      target_amount: target,
      current_amount: 0,
      deadline,
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
        <h2 className="mb-4 text-lg font-semibold text-textprimary">New Goal</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Goal name"
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Icon</h3>
        <div className="mb-4 grid grid-cols-5 gap-2">
          {GOAL_ICON_OPTIONS.map((emoji) => (
            <button
              key={emoji}
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
        <div className="mb-4 flex flex-wrap gap-3">
          {GOAL_GRADIENT_COLORS.map((swatch) => (
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

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Target Amount</h3>
        <input
          type="number"
          inputMode="decimal"
          value={targetStr}
          onChange={(e) => setTargetStr(e.target.value)}
          placeholder="0.00"
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Deadline</h3>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={toDateOnly(new Date())}
          className="mb-5 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary [color-scheme:dark]"
        />

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
