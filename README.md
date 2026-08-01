## Ledger — Personal Finance Tracker
Mobile-first PWA. Track daily income & expenses.

### Tech Stack
React + Vite + TypeScript + Supabase + Tailwind + Netlify

### Local Setup
```
npm install
cp .env.example .env
# Fill .env with your Supabase credentials
npm run dev
```

### Deploy to Netlify
1. Push to GitHub
2. Connect repo on netlify.com
3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify > Environment Variables
4. Deploy — auto deploys on every git push

### Android Install
Open in Chrome → menu → "Add to Home Screen" → works like native app
