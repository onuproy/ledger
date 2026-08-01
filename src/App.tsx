import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { PinGateScreen } from './components/settings/PinGateScreen'
import { useAuthStore } from './store/authStore'
import { useProfileStore } from './store/profileStore'
import { useUiStore } from './store/uiStore'
import { SplashScreen } from './pages/auth/SplashScreen'
import { OnboardingScreen } from './pages/auth/OnboardingScreen'
import { LoginScreen } from './pages/auth/LoginScreen'
import { RegisterScreen } from './pages/auth/RegisterScreen'
import { ForgotPasswordScreen } from './pages/auth/ForgotPasswordScreen'
import { Dashboard } from './pages/app/Dashboard'
import { Transactions } from './pages/app/Transactions'
import { Budget } from './pages/app/Budget'
import { Goals } from './pages/app/Goals'
import { Settings } from './pages/app/Settings'
import { CategoriesScreen } from './pages/app/CategoriesScreen'
import { AccountsScreen } from './pages/app/AccountsScreen'
import { Analytics } from './pages/app/Analytics'
import { ExportScreen } from './pages/app/ExportScreen'

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)
  const pinEnabled = useUiStore((s) => s.pinEnabled)
  const isUnlocked = useUiStore((s) => s.isUnlocked)
  const autoLock = useUiStore((s) => s.autoLock)
  const unlock = useUiStore((s) => s.unlock)
  const lock = useUiStore((s) => s.lock)

  useEffect(() => {
    initialize()
    fetchProfile()
  }, [initialize, fetchProfile])

  useEffect(() => {
    if (!pinEnabled || autoLock === 'never') return

    const minutes = Number(autoLock)
    let timer: number

    function resetTimer() {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => lock(), minutes * 60 * 1000)
    }

    const events = ['mousedown', 'touchstart', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [pinEnabled, autoLock, lock])

  if (pinEnabled && !isUnlocked) {
    return <PinGateScreen onUnlock={unlock} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />

        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/categories" element={<CategoriesScreen />} />
          <Route path="/settings/accounts" element={<AccountsScreen />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings/export" element={<ExportScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
