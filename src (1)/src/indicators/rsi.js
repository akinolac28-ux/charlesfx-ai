// src/indicators/rsi.js
// Relative Strength Index using Wilder's smoothing (the standard method
// used by TradingView and most platforms), not a naive simple average.

const { InsufficientDataError } = require('../utils/errors');

/**
 * @param {number[]} closes - array of close prices, oldest first
 * @param {number} period - typically 14
 * @returns {number} RSI value 0-100
 */
function calculateRSI(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length < period + 1) {
    throw new InsufficientDataError(
      `RSI needs at least ${period + 1} candles, got ${closes?.length || 0}.`
    );
  }

  const gains = [];
  const losses = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Initial average gain/loss (simple average over first `period`)
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Wilder's smoothing for the rest
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100;
}

module.exports = { calculateRSI };
