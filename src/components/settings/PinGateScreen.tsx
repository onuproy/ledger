import { useState } from 'react'
import { Delete, Fingerprint } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { hashPin } from '../../lib/pin'
import { verifyBiometric } from '../../lib/webauthn'

interface PinGateScreenProps {
  onUnlock: () => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

export function PinGateScreen({ onUnlock }: PinGateScreenProps) {
  const [digits, setDigits] = useState('')
  const [error, setError] = useState(false)
  const pinHash = useUiStore((s) => s.pinHash)
  const biometricEnabled = useUiStore((s) => s.biometricEnabled)
  const biometricCredentialId = useUiStore((s) => s.biometricCredentialId)

  async function handleKey(key: string) {
    if (key === 'del') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    if (key === '') return

    const next = (digits + key).slice(0, 4)
    setDigits(next)

    if (next.length !== 4) return

    const hash = await hashPin(next)
    if (hash === pinHash) {
      onUnlock()
      return
    }

    setError(true)
    setTimeout(() => {
      setDigits('')
      setError(false)
    }, 500)
  }

  async function handleBiometric() {
    if (!biometricCredentialId) return
    const ok = await verifyBiometric(biometricCredentialId)
    if (ok) onUnlock()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-surface px-6">
      <span className="text-4xl">🔒</span>
      <h1 className="text-xl font-semibold text-textprimary">Enter PIN</h1>

      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full ${
              i < digits.length ? (error ? 'bg-expense' : 'bg-accent') : 'bg-border'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key, i) =>
          key === '' ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => handleKey(key)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-lg font-medium text-textprimary"
            >
              {key === 'del' ? <Delete size={20} /> : key}
            </button>
          )
        )}
      </div>

      {biometricEnabled && biometricCredentialId && (
        <button
          onClick={handleBiometric}
          className="flex items-center gap-2 text-sm text-accent"
        >
          <Fingerprint size={18} />
          Use fingerprint
        </button>
      )}
    </div>
  )
}
