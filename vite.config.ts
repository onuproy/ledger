import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Polyfill for Node < 19 where globalThis.crypto (WebCrypto) isn't defined yet,
// needed by workbox-build's dependency chain during `vite build`.
if (typeof (globalThis as { crypto?: Crypto }).crypto === 'undefined') {
  const { webcrypto } = await import('node:crypto')
  ;(globalThis as unknown as { crypto: Crypto }).crypto = webcrypto as unknown as Crypto
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Ledger',
        short_name: 'Ledger',
        theme_color: '#6366f1',
        background_color: '#0b0b10',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
