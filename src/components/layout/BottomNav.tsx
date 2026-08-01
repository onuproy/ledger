import { NavLink } from 'react-router-dom'
import { Home, Receipt, Target, Star, Settings } from 'lucide-react'

const TABS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/budget', label: 'Budget', icon: Target },
  { to: '/goals', label: 'Goals', icon: Star },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ to, label, icon: Icon }) => (
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
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
