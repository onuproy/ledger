interface ProfileAvatarProps {
  name: string
  avatarColor: string
  avatarEmoji: string | null
  className?: string
}

export function ProfileAvatar({ name, avatarColor, avatarEmoji, className = '' }: ProfileAvatarProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{ backgroundColor: avatarColor }}
    >
      {avatarEmoji || (name.trim() ? name.trim()[0].toUpperCase() : '?')}
    </div>
  )
}
