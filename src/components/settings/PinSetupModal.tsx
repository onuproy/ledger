import { useState } from 'react'
import { Delete, X } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { hashPin } from '../../lib/pin'
import { Toast } from '../ui/Toast'

interface PinSetupModalProps {
  onClose: () => void
  onSaved: () => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

export function PinSetupModal({ onClose, onSaved }: PinSetupModalProps) {
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter')
  const [firstPin, setFirstPin] = useState('')
  const [digits, setDigits] = useState('')
  const [error, setError] = useState<string | null>(null)
  const setPin = useUiStore((s) => s.setPin)

  async function handleKey(key: string) {
    if (key === 'del') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    if (key === '') return

    const next = (digits + key).slice(0, 4)
    setDigits(next)

    if (next.length !== 4) return

    if (stage === 'enter') {
      setFirstPin(next)
      setDigits('')
      setStage('confirm')
      return
    }

    if (next !== firstPin) {
      setError("PINs didn't match — try again")
      setFirstPin('')
      setDigits('')
      setStage('enter')
      return
    }

    const hash = await hashPin(next)
    setPin(hash)
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm animate-slide-up rounded-t-2xl bg-card px-5 pb-6 pt-3"
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

        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <h2 className="text-lg font-semibold text-textprimary">
            {stage === 'enter' ? 'Set a 4-digit PIN' : 'Confirm your PIN'}
          </h2>
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full ${
                  i < digits.length ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((key, i) =>
            key === '' ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                onClick={() => handleKey(key)}
                className="flex h-14 items-center justify-center rounded-full bg-surface text-lg font-medium text-textprimary"
              >
                {key === 'del' ? <Delete size={20} /> : key}
              </button>
            )
          )}
        </div>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  )
}
