import { X } from 'lucide-react'

interface PrivacyPolicyModalProps {
  onClose: () => void
}

export function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative max-h-[80vh] w-full max-w-sm animate-slide-up overflow-y-auto rounded-t-2xl bg-card px-5 pb-6 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-textsecondary hover:bg-surface"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <h2 className="mb-4 text-lg font-semibold text-textprimary">Privacy Policy</h2>

        <p className="text-sm leading-relaxed text-textsecondary">
          Ledger does not sell your data. All financial data is stored securely in your
          personal account. We use Supabase for secure authentication and data storage. Your
          data is only accessible by you.
          <br />
          <br />
          Contact: anupme01@gmail.com
        </p>
      </div>
    </div>
  )
}
