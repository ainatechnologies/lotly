# Lotly

Fair YouTube giveaway picker for creators.

Paste a video URL, filter entries, and draw winners with a shareable fairness proof. Free to start. Pro is a one-time unlock.

## Features

- Load public YouTube comments (or try built-in **demo** mode)
- Filters: keyword, unique authors, exclude owner, min likes/length
- Seeded fair draw + copyable proof certificate
- Freemium: free capped draws, Pro unlocks unlimited comments, multi-winners, CSV export, no watermark

## Stack

- Next.js App Router + TypeScript + Tailwind
- Stripe Checkout (one-time Lotly Pro)
- YouTube Data API v3 (optional — demo works without it)

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Purpose |
|---|---|
| `YOUTUBE_API_KEY` | Live comment pulls |
| `STRIPE_SECRET_KEY` | Checkout for Pro |
| `STRIPE_PRICE_ID` | Pro price id (defaults to Softset sandbox price) |
| `LICENSE_SECRET` | Signs Pro license cookie |
| `NEXT_PUBLIC_APP_URL` | Absolute URL for Stripe redirects |
| `ALLOW_DEMO_UNLOCK` | Force local Pro unlock without Stripe |

Without Stripe keys, the Upgrade button uses a local demo unlock so you can still verify Pro UX.

## Monetization

- **Free** — 200 comments, 1 winner, Lotly watermark
- **Pro ($29 lifetime)** — unlimited comments, multi-winners, CSV, no watermark

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — start production server
