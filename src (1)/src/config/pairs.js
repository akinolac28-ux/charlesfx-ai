// src/config/pairs.js
// Maps the pairs Charles FX exposes to the symbols Finnhub expects.
// IMPORTANT: Finnhub's free tier serves true FX candles for major pairs via
// its forex-candle endpoint using OANDA-style symbols (e.g. "OANDA:EUR_USD").
// Gold (XAU/USD) is NOT a forex pair on Finnhub — it lives under a different
// data class and is frequently restricted or unavailable on the free tier.
// We still expose it, but flag it so the frontend can show a clear notice
// instead of pretending it's fully live.

const PAIRS = {
  'EURUSD': {
    label: 'EUR/USD',
    finnhubSymbol: 'OANDA:EUR_USD',
    type: 'forex',
    limitedOnFreeTier: false,
  },
  'GBPUSD': {
    label: 'GBP/USD',
    finnhubSymbol: 'OANDA:GBP_USD',
    type: 'forex',
    limitedOnFreeTier: false,
  },
  'USDJPY': {
    label: 'USD/JPY',
    finnhubSymbol: 'OANDA:USD_JPY',
    type: 'forex',
    limitedOnFreeTier: false,
  },
  'XAUUSD': {
    label: 'XAU/USD (Gold)',
    finnhubSymbol: 'OANDA:XAU_USD',
    type: 'metal',
    // On Finnhub's free tier this endpoint frequently returns 403 or empty
    // data. We attempt the real call and gracefully degrade if it fails.
    limitedOnFreeTier: true,
  },
};

// Resolutions supported by Finnhub's /forex/candle endpoint.
// Finnhub does NOT offer a 30-second resolution on any tier — the smallest
// granularity available is 1 minute. We expose that truthfully instead of
// silently dropping the timeframe or faking sub-minute candles.
const TIMEFRAMES = {
  '1m': { finnhubResolution: '1', label: '1 minute' },
  '5m': { finnhubResolution: '5', label: '5 minutes' },
  '15m': { finnhubResolution: '15', label: '15 minutes' },
  '30m': { finnhubResolution: '30', label: '30 minutes' },
  '1h': { finnhubResolution: '60', label: '1 hour' },
  '4h': { finnhubResolution: '240', label: '4 hours' },
  '1d': { finnhubResolution: 'D', label: '1 day' },
};

const UNSUPPORTED_TIMEFRAMES = {
  '30s': 'Finnhub does not provide sub-1-minute candle data on any pricing tier. 1 minute is the smallest available resolution.',
};

function getPair(symbolKey) {
  return PAIRS[symbolKey?.toUpperCase()] || null;
}

function getTimeframe(tfKey) {
  return TIMEFRAMES[tfKey?.toLowerCase()] || null;
}

module.exports = {
  PAIRS,
  TIMEFRAMES,
  UNSUPPORTED_TIMEFRAMES,
  getPair,
  getTimeframe,
};
