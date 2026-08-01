export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && 'PublicKeyCredential' in window
}

export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const padded = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(base64url.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

/**
 * Registers a local platform authenticator credential purely to gate access on
 * this device — there is no backend to verify signatures against, so this is
 * a client-only convenience lock, not a server-verified biometric auth flow.
 */
export async function enrollBiometric(userId: string): Promise<string | null> {
  if (!isWebAuthnSupported()) return null

  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Ledger' },
        user: {
          id: new TextEncoder().encode(userId),
          name: 'ledger-user',
          displayName: 'Ledger User',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 30000,
      },
    })) as PublicKeyCredential | null

    if (!credential) return null
    return bufferToBase64Url(credential.rawId)
  } catch {
    return null
  }
}

export async function verifyBiometric(credentialId: string): Promise<boolean> {
  if (!isWebAuthnSupported()) return false

  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: base64UrlToBuffer(credentialId), type: 'public-key' }],
        userVerification: 'required',
        timeout: 30000,
      },
    })
    return assertion !== null
  } catch {
    return false
  }
}
