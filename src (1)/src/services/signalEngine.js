// src/services/signalEngine.js
//
// This is the analysis brain. It is a deterministic, explainable scoring
// system — NOT a black box and NOT random. Every signal can be traced back
// to the indicator values that produced it. That matters for a trading
// product: confidence scores need to mean something repeatable.
//
// Scoring approach: each indicator contributes a vote in range [-2, +2]
// (strong sell .. strong buy). Votes are summed, weighted, and normalized
// to a 0-100 confidence score. The action (BUY/SELL/WAIT) is decided by
// the net direction and a minimum confidence threshold — weak/mixed
// signals correctly resolve to WAIT rather than forcing a trade call.

const { calculateRSI } = require('../indicators/rsi');
const { calculateEMA, calculateEMASeries } = require('../indicators/ema');
const { calculateMACD } = require('../indicators/macd');
const { calculateATR } = require('../indicators/atr');
const { InsufficientDataError } = require('../utils/errors');

const MIN_CANDLES_REQUIRED = 210; // EMA200 needs 200 + buffer

function scoreRSI(rsi) {
  // Classic overbought/oversold logic, with graded strength rather than
  // a hard binary cutoff.
  if (rsi <= 25) return { vote: 2, note: 'Strongly oversold' };
  if (rsi <= 35) return { vote: 1, note: 'Oversold' };
  if (rsi >= 75) return { vote: -2, note: 'Strongly overbought' };
  if (rsi >= 65) return { vote: -1, note: 'Overbought' };
  return { vote: 0, note: 'Neutral range' };
}

function scoreEMATrend(price, ema50, ema200) {
  const goldenAligned = ema50 > ema200; // bullish structure (EMA50 above EMA200)

  if (price > ema50 && ema50 > ema200) {
    return { vote: 2, note: 'Strong uptrend: price > EMA50 > EMA200' };
  }
  if (price < ema50 && ema50 < ema200) {
    return { vote: -2, note: 'Strong downtrend: price < EMA50 < EMA200' };
  }
  if (price > ema200 && ema50 < ema200) {
    return { vote: 1, note: 'Potential bullish reversal forming' };
  }
  if (price < ema200 && ema50 > ema200) {
    return { vote: -1, note: 'Potential bearish reversal forming' };
  }
  return { vote: goldenAligned ? 0.5 : -0.5, note: 'Mixed trend structure' };
}

function scoreMACD(macdResult) {
  const { macd, signal, histogram, previousHistogram } = macdResult;
  const crossedUp =
    previousHistogram !== null && previousHistogram <= 0 && histogram > 0;
  const crossedDown =
    previousHistogram !== null && previousHistogram >= 0 && histogram < 0;

  if (crossedUp) return { vote: 2, note: 'Bullish MACD crossover just occurred' };
  if (crossedDown) return { vote: -2, note: 'Bearish MACD crossover just occurred' };
  if (macd > signal && histogram > 0) return { vote: 1, note: 'MACD bullish momentum' };
  if (macd < signal && histogram < 0) return { vote: -1, note: 'MACD bearish momentum' };
  return { vote: 0, note: 'MACD momentum flat/unclear' };
}

function scoreVolatility(atr, price) {
  // ATR as % of price — used for confidence damping, not direction.
  // Extremely high volatility makes any signal less reliable.
  const atrPct = (atr / price) * 100;
  if (atrPct > 1.2) return { dampen: 0.7, note: 'High volatility — increased risk' };
  if (atrPct < 0.05) return { dampen: 0.85, note: 'Very low volatility — weak moves likely' };
  return { dampen: 1, note: 'Normal volatility' };
}

/**
 * @param {Array} candles - normalized candles, oldest first, from marketDataService
 */
function analyzeMarket(candles, meta = {}) {
  if (!Array.isArray(candles) || candles.length < MIN_CANDLES_REQUIRED) {
    throw new InsufficientDataError(
      `Signal engine needs at least ${MIN_CANDLES_REQUIRED} candles for reliable EMA200, got ${candles?.length || 0}. Try a higher timeframe or wait for more data to accumulate.`
    );
  }

  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const currentPrice = closes[closes.length - 1];

  const rsi = calculateRSI(closes, 14);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const macdResult = calculateMACD(closes, 12, 26, 9);
  const atr = calculateATR({ high: highs, low: lows, close: closes }, 14);

  const rsiScore = scoreRSI(rsi);
  const trendScore = scoreEMATrend(currentPrice, ema50, ema200);
  const macdScore = scoreMACD(macdResult);
  const volatility = scoreVolatility(atr, currentPrice);

  // Weighted sum: trend matters most, then MACD momentum, then RSI.
  const WEIGHTS = { trend: 1.4, macd: 1.2, rsi: 1.0 };
  const rawScore =
    trendScore.vote * WEIGHTS.trend +
    macdScore.vote * WEIGHTS.macd +
    rsiScore.vote * WEIGHTS.rsi;

  const maxPossible = 2 * (WEIGHTS.trend + WEIGHTS.macd + WEIGHTS.rsi); // = 7.2
  const normalizedScore = (rawScore / maxPossible) * 100; // -100..100
  const dampedScore = normalizedScore * volatility.dampen;

  const confidence = Math.round(Math.min(95, Math.abs(dampedScore) + 30)); // floor so WAIT cases still show a number, capped below 100 (never claim certainty)

  let action = 'WAIT';
  if (dampedScore >= 25) action = 'BUY';
  else if (dampedScore <= -25) action = 'SELL';

  // Risk management: SL/TP sized from real ATR, not arbitrary pips.
  const slMultiplier = 1.5;
  const tpMultiplier = 3; // targets a 1:2 R:R baseline, adjusted below
  let stopLoss = null;
  let takeProfit = null;
  let riskRewardRatio = null;

  if (action === 'BUY') {
    stopLoss = currentPrice - atr * slMultiplier;
    takeProfit = currentPrice + atr * tpMultiplier;
    riskRewardRatio = (takeProfit - currentPrice) / (currentPrice - stopLoss);
  } else if (action === 'SELL') {
    stopLoss = currentPrice + atr * slMultiplier;
    takeProfit = currentPrice - atr * tpMultiplier;
    riskRewardRatio = (currentPrice - takeProfit) / (stopLoss - currentPrice);
  }

  const round = (n, dp = 5) => (n === null ? null : Math.round(n * 10 ** dp) / 10 ** dp);

  return {
    pair: meta.pair || null,
    timeframe: meta.timeframe || null,
    timestamp: new Date().toISOString(),
    action,
    confidence,
    entryPrice: round(currentPrice),
    stopLoss: round(stopLoss),
    takeProfit: round(takeProfit),
    riskRewardRatio: riskRewardRatio ? Math.round(riskRewardRatio * 100) / 100 : null,
    indicators: {
      rsi: { value: rsi, ...rsiScore },
      ema50: round(ema50),
      ema200: round(ema200),
      trend: trendScore,
      macd: { ...macdResult, ...macdScore },
      atr: round(atr, 5),
      volatility,
    },
  };
}

module.exports = { analyzeMarket, MIN_CANDLES_REQUIRED };
