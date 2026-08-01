import { useEffect } from 'react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type: ToastType
  onDismiss: () => void
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="status"
      className={`fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-toast-in rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        type === 'success' ? 'bg-income' : 'bg-expense'
      }`}
    >
      {message}
    </div>
  )
}
