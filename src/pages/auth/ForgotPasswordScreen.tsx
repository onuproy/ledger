import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Toast } from '../../components/ui/Toast'

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)

    setIsSubmitting(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSubmitted(true)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-5 bg-surface px-6 py-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl text-accent">💎</span>
        <h1 className="text-2xl font-semibold text-textprimary">Reset password</h1>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-income/30 bg-income/10 px-4 py-4 text-center">
          <p className="font-medium text-income">Check your email</p>
          <p className="mt-1 text-sm text-textsecondary">
            We sent a password reset link to {email}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="min-h-[48px] rounded-lg border border-border bg-card px-4 py-3 text-textprimary placeholder:text-textsecondary"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[48px] rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {isSubmitting ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-textsecondary">
        <Link to="/login" className="text-accent">
          Back to login
        </Link>
      </p>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  )
}
