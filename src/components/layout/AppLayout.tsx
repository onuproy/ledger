import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useProfileStore } from '../../store/profileStore'

export function AppLayout() {
  const navigate = useNavigate()
  const name = useProfileStore((s) => s.name)
  const email = useProfileStore((s) => s.email)
  const avatarColor = useProfileStore((s) => s.avatarColor)

  const initial = (name.trim() || email || 'U').charAt(0).toUpperCase()

  return (
    <div className="relative mx-auto min-h-screen max-w-[430px] bg-surface text-textprimary">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur print:hidden">
        <span className="font-semibold text-textprimary">Ledger</span>
        <button
          onClick={() => navigate('/settings')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor }}
          aria-label="Open settings"
        >
          {initial}
        </button>
      </header>
      <main className="pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
