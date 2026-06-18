// src/services/finnhubClient.js
// Thin wrapper around Finnhub's REST API. Every method here is designed to
// NEVER throw an unhandled exception up to the route handler — failures are
// converted into UpstreamDataError so the API always returns clean JSON,
// never a crash or blank response.

const env = require('../config/env');
const { UpstreamDataError } = require('../utils/errors');

const BASE_URL = env.FINNHUB_BASE_URL;
const API_KEY = env.FINNHUB_API_KEY;

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 600;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Performs a GET request against Finnhub with retry-on-transient-failure
 * logic. Throws UpstreamDataError (never a raw error) on final failure.
 */
async function finnhubGet(path, params = {}) {
  if (!API_KEY) {
    throw new UpstreamDataError(
      'Market data provider is not configured on the server (missing FINNHUB_API_KEY).'
    );
  }

  const query = new URLSearchParams({ ...params, token: API_KEY }).toString();
  const url = `${BASE_URL}${path}?${query}`;

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url);

      if (res.status === 429) {
        // Finnhub's own rate limit — back off and retry
        lastError = new UpstreamDataError(
          'Market data provider rate limit reached. Please try again shortly.',
          { status: 429 }
        );
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      if (res.status === 403) {
        // Common for endpoints not included in the free tier (e.g. gold)
        throw new UpstreamDataError(
          'This data is not available on the current Finnhub plan.',
          { status: 403 }
        );
      }

      if (!res.ok) {
        throw new UpstreamDataError(
          `Market data provider returned an error (status ${res.status}).`,
          { status: res.status }
        );
      }

      const data = await res.json();
      return data;
    } catch (err) {
      if (err instanceof UpstreamDataError && err.details?.status === 403) {
        // Don't retry on 403 — it won't change
        throw err;
      }
      lastError =
        err.name === 'AbortError'
          ? new UpstreamDataError('Market data provider timed out.')
          : err instanceof UpstreamDataError
          ? err
          : new UpstreamDataError('Failed to reach market data provider.', {
              originalMessage: err.message,
            });

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError || new UpstreamDataError('Unknown market data provider failure.');
}

/**
 * Live quote for a symbol. Finnhub's /quote endpoint works for many assets,
 * but for true FX pairs we primarily rely on the candle endpoint's most
 * recent candle as the canonical "live price" (see marketDataService).
 */
async function getQuote(finnhubSymbol) {
  return finnhubGet('/quote', { symbol: finnhubSymbol });
}

/**
 * Historical OHLC candles.
 * resolution: '1','5','15','30','60','240','D' (Finnhub format)
 * from/to: unix timestamps (seconds)
 */
async function getForexCandles(finnhubSymbol, resolution, from, to) {
  const data = await finnhubGet('/forex/candle', {
    symbol: finnhubSymbol,
    resolution,
    from,
    to,
  });

  if (!data || data.s === 'no_data') {
    throw new UpstreamDataError(
      'No candle data returned for this pair/timeframe combination.',
      { providerStatus: data?.s }
    );
  }

  if (data.s !== 'ok') {
    throw new UpstreamDataError('Market data provider reported an error status.', {
      providerStatus: data.s,
    });
  }

  return data; // { c: [], h: [], l: [], o: [], t: [], v: [], s: 'ok' }
}

module.exports = {
  getQuote,
  getForexCandles,
};
