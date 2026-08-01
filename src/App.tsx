import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { useAuthStore } from './store/authStore'
import { Onboarding } from './pages/auth/Onboarding'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { Dashboard } from './pages/app/Dashboard'
import { Transactions } from './pages/app/Transactions'
import { Budget } from './pages/app/Budget'
import { Goals } from './pages/app/Goals'
import { Settings } from './pages/app/Settings'

function RootRedirect() {
  const session = useAuthStore((state) => state.session)
  return <Navigate to={session ? '/dashboard' : '/login'} replace />
}

function App() {
  const init = useAuthStore((state) => state.init)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    init()
  }, [init])

  if (isLoading) {
    return <div className="min-h-screen bg-surface" />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
