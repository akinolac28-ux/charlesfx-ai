// src/indicators/macd.js
// MACD = EMA(12) - EMA(26); Signal = EMA(9) of MACD line; Histogram = MACD - Signal.
// Built on the same EMA math used elsewhere so results stay internally consistent.

const { calculateEMASeries } = require('./ema');
const { InsufficientDataError } = require('../utils/errors');

function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const minRequired = slowPeriod + signalPeriod;
  if (!Array.isArray(closes) || closes.length < minRequired) {
    throw new InsufficientDataError(
      `MACD needs at least ${minRequired} candles, got ${closes?.length || 0}.`
    );
  }

  const fastEMA = calculateEMASeries(closes, fastPeriod);
  const slowEMA = calculateEMASeries(closes, slowPeriod);

  // Align: fastEMA is longer (shorter period = starts earlier in trimmed terms)
  // fastEMA has (closes.length - fastPeriod + 1) entries
  // slowEMA has (closes.length - slowPeriod + 1) entries
  // We align both to the END, trimming fastEMA's head to match slowEMA's length.
  const offset = fastEMA.length - slowEMA.length;
  const alignedFast = fastEMA.slice(offset);

  const macdLine = alignedFast.map((val, i) => val - slowEMA[i]);

  if (macdLine.length < signalPeriod) {
    throw new InsufficientDataError('Not enough data to compute MACD signal line.');
  }

  const signalLine = calculateEMASeries(macdLine, signalPeriod);

  const alignedMacdForHistogram = macdLine.slice(macdLine.length - signalLine.length);
  const histogram = alignedMacdForHistogram.map((val, i) => val - signalLine[i]);

  const round = (n) => Math.round(n * 100000) / 100000;

  return {
    macd: round(macdLine[macdLine.length - 1]),
    signal: round(signalLine[signalLine.length - 1]),
    histogram: round(histogram[histogram.length - 1]),
    // Previous histogram value, useful for detecting crossovers
    previousHistogram:
      histogram.length > 1 ? round(histogram[histogram.length - 2]) : null,
  };
}

module.exports = { calculateMACD };
