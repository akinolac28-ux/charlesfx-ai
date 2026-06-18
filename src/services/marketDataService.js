// src/services/marketDataService.js
// Fetches and normalizes candle data. This is the only place that talks to
// finnhubClient directly for market data — routes and the signal engine
// both go through here so caching/lookback logic stays in one place.

const finnhubClient = require('./finnhubClient');
const { getPair, getTimeframe } = require('../config/pairs');
const { InvalidRequestError, UpstreamDataError } = require('../utils/errors');

// How many historical candles we want for reliable indicator math.
// EMA200 needs at least 200 candles to be meaningful, so we pull extra
// padding (300) to ensure the smoothing has "warmed up" properly rather
// than reporting an EMA200 that's really only based on 200 raw points.
const LOOKBACK_CANDLES = 300;

const RESOLUTION_SECONDS = {
  '1': 60,
  '5': 300,
  '15': 900,
  '30': 1800,
  '60': 3600,
  '240': 14400,
  D: 86400,
};

function buildTimeRange(resolution, candleCount = LOOKBACK_CANDLES) {
  const now = Math.floor(Date.now() / 1000);
  const secondsPerCandle = RESOLUTION_SECONDS[resolution] || 60;
  const from = now - secondsPerCandle * candleCount;
  return { from, to: now };
}

function normalizeCandles(raw) {
  // raw = { c, h, l, o, t, v, s }
  const candles = raw.t.map((time, i) => ({
    time,
    open: raw.o[i],
    high: raw.h[i],
    low: raw.l[i],
    close: raw.c[i],
    volume: raw.v ? raw.v[i] : null,
  }));
  return candles;
}

/**
 * Fetches normalized candles for a given pair/timeframe.
 * Throws InvalidRequestError for bad input, UpstreamDataError for provider
 * failures — both are caught cleanly by the error middleware.
 */
async function fetchCandles(pairKey, timeframeKey) {
  const pair = getPair(pairKey);
  const timeframe = getTimeframe(timeframeKey);

  if (!pair) {
    throw new InvalidRequestError(`Unsupported pair: ${pairKey}`);
  }
  if (!timeframe) {
    throw new InvalidRequestError(`Unsupported timeframe: ${timeframeKey}`);
  }

  const { from, to } = buildTimeRange(timeframe.finnhubResolution);

  try {
    const raw = await finnhubClient.getForexCandles(
      pair.finnhubSymbol,
      timeframe.finnhubResolution,
      from,
      to
    );
    const candles = normalizeCandles(raw);
    return {
      pair: pairKey.toUpperCase(),
      pairLabel: pair.label,
      timeframe: timeframeKey,
      candles,
      limitedOnFreeTier: pair.limitedOnFreeTier,
    };
  } catch (err) {
    if (pair.limitedOnFreeTier) {
      // Re-throw with a clearer, pair-specific message for gold/metals
      throw new UpstreamDataError(
        `${pair.label} data is restricted on the current Finnhub plan. This pair often requires a paid tier.`,
        { originalCode: err.code, pair: pairKey }
      );
    }
    throw err;
  }
}

/**
 * Live price = close of the most recent candle. We deliberately avoid the
 * generic /quote endpoint for FX pairs since it's not reliably populated
 * for all forex symbols on Finnhub's free tier — the latest candle close
 * is the more dependable "real" live price source for this use case.
 */
async function fetchLivePrice(pairKey) {
  const pair = getPair(pairKey);
  if (!pair) {
    throw new InvalidRequestError(`Unsupported pair: ${pairKey}`);
  }

  const { from, to } = buildTimeRange('1', 5); // last 5 minutes of 1m candles

  const raw = await finnhubClient.getForexCandles(pair.finnhubSymbol, '1', from, to);
  const candles = normalizeCandles(raw);
  const latest = candles[candles.length - 1];

  return {
    pair: pairKey.toUpperCase(),
    pairLabel: pair.label,
    price: latest.close,
    high: latest.high,
    low: latest.low,
    open: latest.open,
    timestamp: latest.time,
    asOf: new Date(latest.time * 1000).toISOString(),
  };
}

module.exports = { fetchCandles, fetchLivePrice };
