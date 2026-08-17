import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronRight,
  Download,
  Fingerprint,
  Landmark,
  LogOut,
  Mail,
  Shield,
  ShieldOff,
  Star,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react'
import { EditProfileModal } from '../../components/settings/EditProfileModal'
import { ProfileAvatar } from '../../components/settings/ProfileAvatar'
import { PinSetupModal } from '../../components/settings/PinSetupModal'
import { PrivacyPolicyModal } from '../../components/settings/PrivacyPolicyModal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Toast, type ToastType } from '../../components/ui/Toast'
import { useProfileStore } from '../../store/profileStore'
import { useUiStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useTransactionStore } from '../../store/transactionStore'
import { useTranslation } from '../../lib/i18n'
import { isWebAuthnSupported, enrollBiometric } from '../../lib/webauthn'
import { parseTransactionsCsv } from '../../lib/csv'

const SUPPORT_EMAIL = 'anupme01@gmail.com'

const MANAGE_ITEMS = [
  { to: '/settings/categories', label: 'Categories', icon: Tag },
  { to: '/settings/accounts', label: 'Accounts', icon: Landmark },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

const CURRENCIES = [
  { code: 'BDT', label: '৳ BDT' },
  { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: '€ EUR' },
  { code: 'GBP', label: '£ GBP' },
  { code: 'JPY', label: '¥ JPY' },
]

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 px-1 text-sm font-medium text-textsecondary">{title}</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  control,
  onClick,
}: {
  icon: typeof Tag
  label: string
  description?: string
  control?: ReactNode
  onClick?: () => void
}) {
  const content = (
    <>
      <Icon size={18} className="shrink-0 text-textsecondary" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-textprimary">{label}</p>
        {description && <p className="text-xs text-textsecondary">{description}</p>}
      </div>
      {control}
    </>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left">
        {content}
      </button>
    )
  }

  return <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">{content}</div>
}

export function Settings() {
  const t = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const profileName = useProfileStore((s) => s.name)
  const profileEmail = useProfileStore((s) => s.email)
  const avatarColor = useProfileStore((s) => s.avatarColor)
  const avatarEmoji = useProfileStore((s) => s.avatarEmoji)
  const currency = useProfileStore((s) => s.currency)
  const language = useProfileStore((s) => s.language)
  const saveProfile = useProfileStore((s) => s.saveProfile)

  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const numberFormat = useUiStore((s) => s.numberFormat)
  const setNumberFormat = useUiStore((s) => s.setNumberFormat)
  const setUiLanguage = useUiStore((s) => s.setLanguage)
  const pinEnabled = useUiStore((s) => s.pinEnabled)
  const clearPin = useUiStore((s) => s.clearPin)
  const autoLock = useUiStore((s) => s.autoLock)
  const setAutoLock = useUiStore((s) => s.setAutoLock)
  const biometricEnabled = useUiStore((s) => s.biometricEnabled)
  const setBiometric = useUiStore((s) => s.setBiometric)

  const deleteAllTransactions = useTransactionStore((s) => s.deleteAllTransactions)
  const importTransactions = useTransactionStore((s) => s.importTransactions)

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isPwaInstalled =
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  async function handleCurrencyChange(nextCurrency: string) {
    const result = await saveProfile({ currency: nextCurrency })
    if (result.error) setToast({ message: result.error, type: 'error' })
  }

  async function handleLanguageChange(nextLanguage: 'en' | 'bn') {
    setUiLanguage(nextLanguage)
    const result = await saveProfile({ language: nextLanguage })
    if (result.error) setToast({ message: result.error, type: 'error' })
  }

  function handlePinToggle(enabled: boolean) {
    if (enabled) {
      setShowPinSetup(true)
    } else {
      clearPin()
      setToast({ message: 'PIN lock disabled', type: 'success' })
    }
  }

  async function handleBiometricToggle(enabled: boolean) {
    if (!enabled) {
      setBiometric(false, null)
      return
    }

    const userId = useAuthStore.getState().user?.id ?? 'ledger-user'
    const credentialId = await enrollBiometric(userId)
    if (!credentialId) {
      setToast({ message: 'Could not set up fingerprint unlock', type: 'error' })
      return
    }
    setBiometric(true, credentialId)
    setToast({ message: 'Fingerprint unlock enabled', type: 'success' })
  }

  async function handleClearAll() {
    setIsClearing(true)
    const result = await deleteAllTransactions()
    setIsClearing(false)
    setShowClearConfirm(false)

    if (result.error) {
      setToast({ message: result.error, type: 'error' })
      return
    }
    setToast({ message: 'All transactions deleted', type: 'success' })
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const text = await file.text()
    const rows = parseTransactionsCsv(text)

    if (rows.length === 0) {
      setToast({ message: 'No valid rows found in that CSV', type: 'error' })
      return
    }

    const result = await importTransactions(rows)
    setToast({
      message: `Imported ${result.imported}, skipped ${result.skipped}`,
      type: result.imported > 0 ? 'success' : 'error',
    })
  }

  function handleRateApp() {
    setToast({ message: 'Thanks for using Ledger! 💙', type: 'success' })
  }

  function handleFeedback() {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Ledger App Feedback`
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <h1 className="text-xl font-semibold text-textprimary">{t('settings')}</h1>

      <SettingsSection title={t('profile')}>
        <div className="flex items-center gap-4 px-4 py-4">
          <ProfileAvatar
            name={profileName}
            avatarColor={avatarColor}
            avatarEmoji={avatarEmoji}
            className="h-14 w-14 shrink-0 text-xl"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-textprimary">{profileName || 'Add your name'}</p>
            <p className="truncate text-sm text-textsecondary">{profileEmail}</p>
          </div>
          <button
            onClick={() => setShowEditProfile(true)}
            className="shrink-0 rounded-full border border-accent/50 px-3 py-1.5 text-xs font-medium text-accent"
          >
            Edit Profile
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Manage">
        {MANAGE_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex min-h-[56px] items-center gap-3 px-4 py-3 text-textprimary">
            <Icon size={18} className="text-textsecondary" />
            <span className="flex-1 font-medium">{label}</span>
            <ChevronRight size={18} className="text-textsecondary" />
          </Link>
        ))}
      </SettingsSection>

      <SettingsSection title={t('preferences')}>
        <div className="px-4 py-3">
          <p className="mb-2 text-sm text-textsecondary">Currency</p>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 text-textprimary"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="px-4 py-3">
          <p className="mb-2 text-sm text-textsecondary">Language</p>
          <div className="flex rounded-full bg-surface p-1">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`min-h-[36px] flex-1 rounded-full text-sm font-medium ${
                language === 'en' ? 'bg-accent text-white' : 'text-textsecondary'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('bn')}
              className={`min-h-[36px] flex-1 rounded-full text-sm font-medium ${
                language === 'bn' ? 'bg-accent text-white' : 'text-textsecondary'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="mb-2 text-sm text-textsecondary">Number format</p>
          <div className="flex rounded-full bg-surface p-1">
            <button
              onClick={() => setNumberFormat('bd')}
              className={`min-h-[36px] flex-1 rounded-full text-sm font-medium ${
                numberFormat === 'bd' ? 'bg-accent text-white' : 'text-textsecondary'
              }`}
            >
              1,00,000
            </button>
            <button
              onClick={() => setNumberFormat('international')}
              className={`min-h-[36px] flex-1 rounded-full text-sm font-medium ${
                numberFormat === 'international' ? 'bg-accent text-white' : 'text-textsecondary'
              }`}
            >
              100,000
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title={t('appearance')}>
        <div className="px-4 py-3">
          <p className="mb-2 text-sm text-textsecondary">Theme</p>
          <div className="flex rounded-full bg-surface p-1">
            <button
              onClick={() => setTheme('dark')}
              className={`min-h-[36px] flex-1 rounded-full text-sm font-medium ${
                theme === 'dark' ? 'bg-accent text-white' : 'text-textsecondary'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`min-h-[36px] flex-1 rounded-full text-sm font-medium ${
                theme === 'light' ? 'bg-accent text-white' : 'text-textsecondary'
              }`}
            >
              Light
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title={t('security')}>
        <SettingsRow
          icon={pinEnabled ? Shield : ShieldOff}
          label="PIN Lock"
          description={pinEnabled ? 'Require a PIN to open Ledger' : 'Off'}
          control={<ToggleSwitch checked={pinEnabled} onChange={handlePinToggle} />}
        />

        {pinEnabled && (
          <div className="px-4 py-3">
            <p className="mb-2 text-sm text-textsecondary">Auto-lock after</p>
            <select
              value={autoLock}
              onChange={(e) => setAutoLock(e.target.value as typeof autoLock)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 text-textprimary"
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="never">Never</option>
            </select>
          </div>
        )}

        {pinEnabled && isWebAuthnSupported() && (
          <SettingsRow
            icon={Fingerprint}
            label="Use fingerprint"
            description="Unlock with your device biometrics"
            control={<ToggleSwitch checked={biometricEnabled} onChange={handleBiometricToggle} />}
          />
        )}
      </SettingsSection>

      <SettingsSection title={t('data')}>
        <Link
          to="/settings/export"
          className="flex min-h-[56px] items-center gap-3 px-4 py-3 text-textprimary"
        >
          <Download size={18} className="text-textsecondary" />
          <span className="flex-1 font-medium">Export Data</span>
          <ChevronRight size={18} className="text-textsecondary" />
        </Link>

        <SettingsRow icon={Upload} label="Import CSV" onClick={handleImportClick} />
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImportFile}
        />

        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left text-expense"
        >
          <Trash2 size={18} className="shrink-0" />
          <span className="flex-1 font-medium">Clear All Data</span>
        </button>
      </SettingsSection>

      <SettingsSection title={t('support')}>
        {isPwaInstalled && <SettingsRow icon={Star} label="Rate the App" onClick={handleRateApp} />}
        <SettingsRow icon={Mail} label="Send Feedback" onClick={handleFeedback} />
        <SettingsRow icon={Shield} label="Privacy Policy" onClick={() => setShowPrivacyPolicy(true)} />
      </SettingsSection>

      <button
        onClick={handleLogout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-400"
      >
        <LogOut size={18} /> Sign Out
      </button>

      <div className="py-6 text-center">
        <p className="text-xs text-textsecondary">Ledger</p>
        <p className="text-xs text-textsecondary">Version 0.3.0</p>
        <p className="mt-1 text-xs text-textsecondary">© 2026 Onup Roy</p>
      </div>

      {showEditProfile && (
        <EditProfileModal
          onClose={() => setShowEditProfile(false)}
          onSaved={() => setToast({ message: 'Profile updated', type: 'success' })}
        />
      )}

      {showPinSetup && (
        <PinSetupModal
          onClose={() => setShowPinSetup(false)}
          onSaved={() => setToast({ message: 'PIN lock enabled', type: 'success' })}
        />
      )}

      {showPrivacyPolicy && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />
      )}

      {showClearConfirm && (
        <ConfirmDialog
          title="Clear all data?"
          message="This permanently deletes every transaction. This can't be undone."
          confirmLabel={isClearing ? 'Deleting…' : 'Delete Everything'}
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}
