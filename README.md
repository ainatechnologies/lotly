# Lotly

Fair giveaway picker for creators on every platform.

Bring entries from YouTube, Instagram, TikTok, Twitch or any list, filter them, and draw winners with a shareable fairness receipt. Free to start. Pro is a one-time unlock.

## Sources

| Platform | How entries get in |
|---|---|
| YouTube | Video link → `/api/comments` (YouTube Data API, demo without a key), or paste an export |
| Instagram | Paste `username: comment` lines or drop a comment-export CSV |
| TikTok | Paste lines or a CSV (`Unique ID` / `Nickname` / `Comment` columns are recognised) |
| Twitch | Paste raw chat (`[20:14:03] name: !enter`) or one username per line |
| Paste / CSV | Any platform: one entry per line, or a CSV with author + text columns |

Parsing lives in `src/lib/import.ts` and runs in the browser. Every platform has a **Load demo** sample (`src/lib/demo.ts`, also served by `/api/demo?platform=`). Link to a source directly with `/app?platform=twitch`.

## Features

- Five sources: YouTube link, plus paste/CSV import with drag-and-drop for everything else
- Filters: keyword, one entry per person, exclude host, min likes/length
- Seeded fair draw + copyable proof certificate
- Freemium: free capped draws, Pro unlocks 5,000 entries, multi-winners, CSV export, no watermark

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

- **Free** — 200 entries, 1 winner, Lotly watermark
- **Pro ($29 lifetime)** — 5,000 entries, up to 50 winners, CSV, no watermark

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — start production server
