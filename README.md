# 💰 Ledger — Personal Finance Tracker

> Mobile-first PWA to track daily income, expenses, budgets & savings goals. Built for real everyday use — installable on Android like a native app.

**🔗 Live Demo:** https://boisterous-naiad-57b1ad.netlify.app

## ✨ Features

- 🔐 **Auth** — Email login, register, forgot password, onboarding flow
- 🏠 **Dashboard** — Animated balance card, income/expense summary, date range filters (Today / 7 Days / Month / Year / Custom)
- 💸 **Transactions** — Quick-add bottom sheet with keypad, categories, accounts, receipts; search, filter, edit, swipe-to-delete
- 🎯 **Budgets** — Monthly budgets per category with progress bars, over-budget alerts, edit & delete
- ⭐ **Goals** — Savings goals with contribution tracking & deadlines
- 📊 **Analytics** — Income/Expense tabs, weekly bar charts, interactive donut chart (click-to-expand segments), compact amounts (৳6.7K)
- 🔁 **Transfers** — Move money between accounts (Cash, Bkash, Card)
- 📤 **Export** — CSV, PDF & Share
- 😎 **Profile** — Avatar colors + emoji avatars
- 📱 **PWA** — Add to Home Screen, works like a native app

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 · Vite · TypeScript |
| Styling | Tailwind CSS (dark theme) |
| State | Zustand |
| Routing | React Router v6 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Charts | Recharts |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |
| Hosting | Netlify (frontend) · Supabase (backend) |

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- A free [Supabase](https://supabase.com) project

### Local Setup

```bash
git clone https://github.com/onuproy/ledger.git
cd ledger
npm install
cp .env.example .env
# Fill .env with your Supabase credentials:
# VITE_SUPABASE_URL=your_project_url
# VITE_SUPABASE_ANON_KEY=your_anon_key
npm run dev
```

### Database
Create these tables in Supabase: `profiles`, `accounts`, `categories`, `transactions`, `budgets`, `goals` — all protected with Row Level Security (`auth.uid() = user_id`).

## 🌐 Deploy

1. Push to GitHub
2. Connect the repo on [Netlify](https://netlify.com)
3. Add `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` in **Site settings → Environment variables**
4. Done — auto-deploys on every push

## 📱 Install on Android

Open the live URL in Chrome → menu (⋮) → **Add to Home Screen** → launches like a native app.

## 🗺️ Roadmap

- [ ] Recurring transactions
- [ ] Monthly summary card
- [ ] Financial health score
- [ ] Bill reminders
- [ ] Admin dashboard

## 📄 License

MIT © [Onup Roy](https://github.com/onuproy)
