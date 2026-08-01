import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface text-textprimary">
      <header className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-border h-14 flex items-center px-4">
        <span className="font-semibold text-textprimary">Ledger</span>
      </header>
      <main className="pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
