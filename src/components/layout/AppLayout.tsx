import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useProfileStore } from '../../store/profileStore'
import { formatHeaderDateTime } from '../../lib/formatters'
import { ProfileAvatar } from '../settings/ProfileAvatar'

export function AppLayout() {
  const navigate = useNavigate()
  const name = useProfileStore((s) => s.name)
  const email = useProfileStore((s) => s.email)
  const avatarColor = useProfileStore((s) => s.avatarColor)
  const avatarEmoji = useProfileStore((s) => s.avatarEmoji)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative mx-auto min-h-screen max-w-[430px] bg-surface text-textprimary">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur print:hidden">
        <span className="font-semibold text-textprimary">Ledger</span>
        <div className="flex items-center gap-3">
          <span className="max-w-[9rem] truncate whitespace-nowrap text-right text-xs text-textsecondary">
            {formatHeaderDateTime(now)}
          </span>
          <button
            onClick={() => navigate('/settings')}
            className="shrink-0 rounded-full"
            aria-label="Open settings"
          >
            <ProfileAvatar
              name={name.trim() || email || 'U'}
              avatarColor={avatarColor}
              avatarEmoji={avatarEmoji}
              className="h-8 w-8 text-sm"
            />
          </button>
        </div>
      </header>
      <main className="pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
