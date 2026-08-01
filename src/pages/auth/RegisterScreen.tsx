import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Toast, type ToastType } from '../../components/ui/Toast'

export function RegisterScreen() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' })
      return
    }

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' })
      return
    }

    setIsSubmitting(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: fullName } },
    })
    setIsSubmitting(false)

    if (error) {
      setToast({ message: error.message, type: 'error' })
      return
    }

    if (data.session) {
      navigate('/dashboard')
      return
    }

    setToast({ message: 'Account created! Check your email to confirm.', type: 'success' })
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-5 bg-surface px-6 py-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl text-accent">💎</span>
        <h1 className="text-2xl font-semibold text-textprimary">Create account</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="min-h-[48px] rounded-lg border border-border bg-card px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="min-h-[48px] rounded-lg border border-border bg-card px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="min-h-[48px] w-full rounded-lg border border-border bg-card px-4 py-3 pr-12 text-textprimary placeholder:text-textsecondary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-textsecondary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <input
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="min-h-[48px] rounded-lg border border-border bg-card px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[48px] rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <p className="text-center text-sm text-textsecondary">
        Already have an account?{' '}
        <Link to="/login" className="text-accent">
          Login
        </Link>
      </p>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}
