import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      navigate(data.session ? '/dashboard' : '/onboarding', { replace: true })
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="mx-auto flex max-w-sm animate-fade-in flex-col items-center gap-3">
        <span className="text-5xl text-accent">💎</span>
        <h1 className="text-3xl font-semibold text-white">Ledger</h1>
      </div>
    </div>
  )
}
