import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Toast } from '../../components/ui/Toast'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsSubmitting(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate('/dashboard')
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-5 bg-surface px-6 py-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl text-accent">💎</span>
        <h1 className="text-2xl font-semibold text-textprimary">Welcome back</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-accent">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[48px] rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-textsecondary">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-textprimary"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="text-center text-sm text-textsecondary">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent">
          Register
        </Link>
      </p>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5C29.4 34.8 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.5 5.5C39.5 37.1 44 31.2 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}
