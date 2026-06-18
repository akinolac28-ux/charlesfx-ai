// src/indicators/ema.js
// Exponential Moving Average. Returns the full series (so we can detect
// crossovers) plus a convenience helper for "current value only".

const { InsufficientDataError } = require('../utils/errors');

/**
 * @param {number[]} closes - oldest first
 * @param {number} period
 * @returns {number[]} EMA series, same length as input minus warm-up,
 *                      aligned to the END of the closes array.
 */
function calculateEMASeries(closes, period) {
  if (!Array.isArray(closes) || closes.length < period) {
    throw new InsufficientDataError(
      `EMA(${period}) needs at least ${period} candles, got ${closes?.length || 0}.`
    );
  }

  const k = 2 / (period + 1);
  const emaSeries = [];

  // Seed with SMA of the first `period` values
  const sma = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emaSeries.push(sma);

  for (let i = period; i < closes.length; i++) {
    const prevEma = emaSeries[emaSeries.length - 1];
    const ema = closes[i] * k + prevEma * (1 - k);
    emaSeries.push(ema);
  }

  return emaSeries;
}

function calculateEMA(closes, period) {
  const series = calculateEMASeries(closes, period);
  return Math.round(series[series.length - 1] * 100000) / 100000;
}

module.exports = { calculateEMA, calculateEMASeries };
