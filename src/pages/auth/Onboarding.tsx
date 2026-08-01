import { Link } from 'react-router-dom'

export function Onboarding() {
  return (
    <div className="min-h-screen bg-surface text-textprimary flex flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Welcome to Ledger</h1>
      <p className="text-textsecondary text-center">
        Track your daily expenses and income, right from your phone.
      </p>
      <Link
        to="/login"
        className="bg-accent hover:bg-accent-hover text-white rounded-lg px-6 py-3 min-h-[48px] flex items-center justify-center"
      >
        Get Started
      </Link>
    </div>
  )
}
