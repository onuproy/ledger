import { NavLink } from 'react-router-dom'
import { Home, Receipt, Target, Star, Settings } from 'lucide-react'
import { useTranslation } from '../../lib/i18n'
import type { TranslationKey } from '../../lib/i18n'

const TABS: { to: string; labelKey: TranslationKey; icon: typeof Home }[] = [
  { to: '/dashboard', labelKey: 'home', icon: Home },
  { to: '/transactions', labelKey: 'transactions', icon: Receipt },
  { to: '/budget', labelKey: 'budget', icon: Target },
  { to: '/goals', labelKey: 'goals', icon: Star },
  { to: '/settings', labelKey: 'settings', icon: Settings },
]

export function BottomNav() {
  const t = useTranslation()

  return (
    <nav className="fixed bottom-0 left-1/2 h-16 w-full max-w-[430px] -translate-x-1/2 bg-card border-t border-border flex items-center justify-around pb-[env(safe-area-inset-bottom)] print:hidden">
      {TABS.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px]"
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                className={isActive ? 'text-accent' : 'text-textsecondary'}
              />
              <span
                className={`text-xs ${
                  isActive ? 'text-accent font-medium' : 'text-textsecondary'
                }`}
              >
                {t(labelKey)}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
