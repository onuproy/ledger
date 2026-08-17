import { useState } from 'react'
import { X } from 'lucide-react'
import { useProfileStore } from '../../store/profileStore'
import { Toast } from '../ui/Toast'
import { ProfileAvatar } from './ProfileAvatar'
import { SWATCH_COLORS } from '../../constants/colors'
import { AVATAR_EMOJI_OPTIONS } from '../../constants/icons'

interface EditProfileModalProps {
  onClose: () => void
  onSaved: () => void
}

type AvatarStyle = 'initial' | 'emoji'

export function EditProfileModal({ onClose, onSaved }: EditProfileModalProps) {
  const currentName = useProfileStore((s) => s.name)
  const currentColor = useProfileStore((s) => s.avatarColor)
  const currentEmoji = useProfileStore((s) => s.avatarEmoji)
  const saveProfile = useProfileStore((s) => s.saveProfile)

  const [name, setName] = useState(currentName)
  const [avatarColor, setAvatarColor] = useState(currentColor)
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(currentEmoji ? 'emoji' : 'initial')
  const [emoji, setEmoji] = useState(currentEmoji ?? AVATAR_EMOJI_OPTIONS[0])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewEmoji = avatarStyle === 'emoji' ? emoji : null

  async function handleSave() {
    if (!name.trim()) {
      setError('Enter your name')
      return
    }

    setIsSaving(true)
    const result = await saveProfile({
      name: name.trim(),
      avatar_color: avatarColor,
      avatar_emoji: avatarStyle === 'emoji' ? emoji : null,
    })
    setIsSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm animate-slide-up rounded-t-2xl bg-card px-5 pb-6 pt-3"
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
        <h2 className="mb-4 text-lg font-semibold text-textprimary">Edit Profile</h2>

        <div className="mb-4 flex justify-center">
          <ProfileAvatar
            name={name}
            avatarColor={avatarColor}
            avatarEmoji={previewEmoji}
            className="h-16 w-16 text-2xl"
          />
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mb-4 min-h-[48px] w-full rounded-lg border border-border bg-surface px-4 py-3 text-textprimary placeholder:text-textsecondary"
        />

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Avatar Color</h3>
        <div className="mb-5 flex flex-wrap gap-3">
          {SWATCH_COLORS.map((swatch) => (
            <button
              key={swatch.hex}
              onClick={() => setAvatarColor(swatch.hex)}
              className={`h-9 w-9 rounded-full ${
                avatarColor === swatch.hex ? 'ring-2 ring-accent ring-offset-2 ring-offset-card' : ''
              }`}
              style={{ backgroundColor: swatch.hex }}
              aria-label={swatch.name}
            />
          ))}
        </div>

        <h3 className="mb-2 text-sm font-medium text-textsecondary">Avatar Style</h3>
        <div className="mb-4 flex rounded-full bg-surface p-1">
          <button
            onClick={() => setAvatarStyle('initial')}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
              avatarStyle === 'initial' ? 'bg-accent text-white' : 'text-textsecondary'
            }`}
          >
            Initial
          </button>
          <button
            onClick={() => setAvatarStyle('emoji')}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-medium ${
              avatarStyle === 'emoji' ? 'bg-accent text-white' : 'text-textsecondary'
            }`}
          >
            Emoji
          </button>
        </div>

        {avatarStyle === 'emoji' && (
          <div className="-m-1.5 mb-5 grid grid-cols-4 gap-2 p-1.5">
            {AVATAR_EMOJI_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setEmoji(option)}
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-surface text-2xl ${
                  emoji === option ? 'ring-2 ring-[#6366f1]' : ''
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-[48px] w-full rounded-lg bg-accent py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  )
}
