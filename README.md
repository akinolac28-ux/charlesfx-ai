# Charles FX AI — AI Trading Signal Terminal

A premium dark-mode AI trading signal terminal for binary options on Pocket Option.
Gold / blue / black instrument-panel design, live candlestick charts, an AI signal
engine (RSI, MACD, EMA 20/50/200, Bollinger Bands, support/resistance, candlestick
patterns), signal history with win-rate tracking, Free/VIP plans, Pocket Option
companion view, notification settings, and an admin panel.

## Deploying from your phone (Netlify, no laptop needed)

**Option A — GitHub import (recommended for this project, since it has a build step):**
1. Create a new GitHub repo from your phone (GitHub mobile app or github.com in browser)
   and upload this whole folder (or push via a mobile git client like Working Copy / GitJournal).
2. In Netlify (mobile browser): **Add new site → Import an existing project → GitHub**
   → select the repo.
3. Build settings are already set in `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. Netlify installs dependencies and builds automatically — you don't need
   `npm install` or a local build step on your phone.

**Option B — drag-and-drop (only works after a build, so Option A is easier on mobile):**
Drag-and-drop deploy expects an already-built `dist` folder. Since this project needs
a build step (`npm run build`) and you're on mobile, GitHub import (Option A) is the
practical path — Netlify does the building for you in the cloud.

## Current status: simulated data, real engine

The market data right now comes from `MockMarketDataProvider`, a realistic random-walk
simulator — not a live broker feed. Everything downstream of it (RSI, MACD, EMA stack,
Bollinger Bands, support/resistance, candlestick pattern detection, and the AI
CALL/PUT/WAIT scoring engine) is real, working logic, computed live from whatever
candle data it's given.

## Going live with real market data

Swap one file, touch nothing else:

1. Create `src/data/LiveMarketDataProvider.ts` implementing the `MarketDataProvider`
   interface from `src/types/index.ts` (`getCandles`, `getLivePrice`, `subscribe`).
2. Point it at your forex/crypto API of choice (TwelveData, Polygon.io, Alpha Vantage,
   Binance, Finnhub, etc.) — for forex+gold specifically, TwelveData or Polygon.io
   cover EUR/USD, GBP/USD, USD/JPY, GBP/JPY, and XAU/USD.
3. In `src/context/MarketDataContext.tsx`, import your new provider instead of
   `marketDataProvider` from the mock file.

No component, page, or engine file needs to change — they all consume the
`MarketDataProvider` interface, not the mock implementation directly.

## Wiring real payments (Paystack)

`src/pages/VIPPage.tsx` has a clearly marked integration point in `handleUpgrade()`
showing exactly where to drop in the Paystack inline JS SDK call. Same pattern you
used for WebClass NG and BoostWave NG.

## Wiring Telegram alerts

`src/pages/SettingsPage.tsx` has the Telegram toggle and handle input already built;
it needs a backend endpoint (Netlify Function) that calls the Telegram Bot API
`sendMessage` whenever a new signal is generated — a good first Netlify Function to add.

## Auth note

Auth currently runs on `localStorage` for demo/MVP purposes (registration, login,
plan tracking) — good enough to test the full user flow, but swap for a real
backend (Supabase, Firebase, or your own Netlify Functions + database) before
accepting real users or real payments.

## Tech stack

React 18 + TypeScript, React Router, lightweight-charts, lucide-react icons, Vite.
