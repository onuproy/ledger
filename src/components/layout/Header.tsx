import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  backTo: string
  action?: ReactNode
}

export function Header({ title, backTo, action }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => navigate(backTo)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-textsecondary hover:text-textprimary"
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="flex-1 text-center text-xl font-semibold text-textprimary">{title}</h1>
      <div className="flex h-10 w-10 items-center justify-center">{action}</div>
    </div>
  )
}
