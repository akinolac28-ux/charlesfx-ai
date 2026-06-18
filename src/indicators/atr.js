// src/indicators/atr.js
// Average True Range — used to size Stop Loss / Take Profit distances based
// on actual recent volatility rather than arbitrary fixed pips.

const { InsufficientDataError } = require('../utils/errors');

/**
 * @param {{high:number[], low:number[], close:number[]}} candles - oldest first
 * @param {number} period
 */
function calculateATR(candles, period = 14) {
  const { high, low, close } = candles;
  if (!high || high.length < period + 1) {
    throw new InsufficientDataError(
      `ATR needs at least ${period + 1} candles, got ${high?.length || 0}.`
    );
  }

  const trueRanges = [];
  for (let i = 1; i < high.length; i++) {
    const highLow = high[i] - low[i];
    const highPrevClose = Math.abs(high[i] - close[i - 1]);
    const lowPrevClose = Math.abs(low[i] - close[i - 1]);
    trueRanges.push(Math.max(highLow, highPrevClose, lowPrevClose));
  }

  // Wilder's smoothing, same approach as RSI
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  return atr;
}

module.exports = { calculateATR };
