import { AssetSymbol, Candle, IndicatorSnapshot, SignalDirection, TradeSignal, Timeframe } from '@/types';
import { computeIndicators } from '@/engine/indicators';
import { getAssetMeta, TIMEFRAMES } from '@/data/assets';

interface ScoredFactor {
  label: string;
  vote: number; // positive = bullish (CALL), negative = bearish (PUT)
  weight: number;
}

function scoreIndicators(ind: IndicatorSnapshot, price: number): { score: number; reasons: string[]; factors: ScoredFactor[] } {
  const factors: ScoredFactor[] = [];

  // RSI: oversold favors CALL, overbought favors PUT
  if (ind.rsi <= 30) {
    factors.push({ label: `RSI oversold at ${ind.rsi.toFixed(1)}, reversal pressure building`, vote: 1, weight: 18 });
  } else if (ind.rsi >= 70) {
    factors.push({ label: `RSI overbought at ${ind.rsi.toFixed(1)}, reversal pressure building`, vote: -1, weight: 18 });
  } else if (ind.rsi > 50 && ind.rsi < 70) {
    factors.push({ label: `RSI at ${ind.rsi.toFixed(1)} shows bullish momentum without exhaustion`, vote: 1, weight: 8 });
  } else if (ind.rsi < 50 && ind.rsi > 30) {
    factors.push({ label: `RSI at ${ind.rsi.toFixed(1)} shows bearish momentum without exhaustion`, vote: -1, weight: 8 });
  }

  // MACD histogram direction and crossover
  if (ind.macd.histogram > 0 && ind.macd.macd > ind.macd.signal) {
    factors.push({ label: 'MACD line above signal line, bullish crossover holding', vote: 1, weight: 16 });
  } else if (ind.macd.histogram < 0 && ind.macd.macd < ind.macd.signal) {
    factors.push({ label: 'MACD line below signal line, bearish crossover holding', vote: -1, weight: 16 });
  }

  // EMA stack: 20/50/200 alignment
  if (ind.ema20 > ind.ema50 && ind.ema50 > ind.ema200) {
    factors.push({ label: 'EMA20 > EMA50 > EMA200, clean bullish trend stack', vote: 1, weight: 20 });
  } else if (ind.ema20 < ind.ema50 && ind.ema50 < ind.ema200) {
    factors.push({ label: 'EMA20 < EMA50 < EMA200, clean bearish trend stack', vote: -1, weight: 20 });
  } else if (ind.ema20 > ind.ema50) {
    factors.push({ label: 'EMA20 crossing above EMA50, early bullish shift', vote: 1, weight: 10 });
  } else if (ind.ema20 < ind.ema50) {
    factors.push({ label: 'EMA20 crossing below EMA50, early bearish shift', vote: -1, weight: 10 });
  }

  // Bollinger Bands: price near band edges
  const bandWidth = ind.bollinger.upper - ind.bollinger.lower || 1e-9;
  const posInBand = (price - ind.bollinger.lower) / bandWidth;
  if (posInBand <= 0.1) {
    factors.push({ label: 'Price pressing against lower Bollinger Band, stretched to the downside', vote: 1, weight: 14 });
  } else if (posInBand >= 0.9) {
    factors.push({ label: 'Price pressing against upper Bollinger Band, stretched to the upside', vote: -1, weight: 14 });
  }

  // Support / Resistance proximity
  const range = ind.resistance - ind.support || 1e-9;
  const posInRange = (price - ind.support) / range;
  if (posInRange <= 0.08) {
    factors.push({ label: 'Price sitting on a recent support level', vote: 1, weight: 15 });
  } else if (posInRange >= 0.92) {
    factors.push({ label: 'Price sitting on a recent resistance level', vote: -1, weight: 15 });
  }

  // Candlestick pattern
  if (ind.candlePattern) {
    const bullishPatterns = ['Bullish Engulfing', 'Hammer', 'Three Rising Candles'];
    const bearishPatterns = ['Bearish Engulfing', 'Shooting Star', 'Three Falling Candles'];
    if (bullishPatterns.includes(ind.candlePattern)) {
      factors.push({ label: `${ind.candlePattern} pattern detected on recent candles`, vote: 1, weight: 12 });
    } else if (bearishPatterns.includes(ind.candlePattern)) {
      factors.push({ label: `${ind.candlePattern} pattern detected on recent candles`, vote: -1, weight: 12 });
    } else {
      factors.push({ label: `${ind.candlePattern} detected, signals indecision`, vote: 0, weight: 6 });
    }
  }

  // Trend strength amplifies whichever direction is already winning
  const directionalSum = factors.reduce((s, f) => s + f.vote * f.weight, 0);
  if (ind.trendStrength > 60) {
    const amplify = directionalSum >= 0 ? 1 : -1;
    factors.push({ label: `Trend strength reading of ${ind.trendStrength}/100 reinforces the move`, vote: amplify, weight: 10 });
  }

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0) || 1;
  const rawScore = factors.reduce((s, f) => s + f.vote * f.weight, 0);
  const normalizedScore = rawScore / totalWeight; // -1 to 1, agreement direction/strength

  // Evidence strength: a maximum possible weight assumes most indicators
  // fire (roughly 7 factors at typical weights ~14 each ≈ 100). Confidence
  // should reflect both how strongly indicators agree AND how many of them
  // actually had something to say — one lone indicator agreeing with itself
  // should not be treated the same as eight indicators all aligned.
  const MAX_EXPECTED_WEIGHT = 100;
  const evidenceStrength = Math.min(1, totalWeight / MAX_EXPECTED_WEIGHT);
  const dampenedScore = normalizedScore * evidenceStrength;

  return {
    score: dampenedScore,
    reasons: factors.filter(f => f.vote !== 0).sort((a, b) => b.weight - a.weight).map(f => f.label),
    factors,
  };
}

export function generateSignal(
  asset: AssetSymbol,
  candles: Candle[],
  timeframe: Timeframe
): TradeSignal {
  if (candles.length === 0) {
    throw new Error('generateSignal requires at least one candle to analyze');
  }
  const indicators = computeIndicators(candles);
  const price = candles[candles.length - 1].close;
  const { score, reasons, factors } = scoreIndicators(indicators, price);

  const volatilityPenalty = indicators.volatility > 70 ? 14 : indicators.volatility > 50 ? 6 : 0;
  let confidence = Math.round(Math.min(96, Math.abs(score) * 100 + 35) - volatilityPenalty);
  confidence = Math.max(5, Math.min(96, confidence));

  let direction: SignalDirection = 'WAIT';
  const CONFIDENCE_THRESHOLD = 62;
  if (confidence >= CONFIDENCE_THRESHOLD) {
    direction = score > 0 ? 'CALL' : 'PUT';
  }

  const meta = getAssetMeta(asset);
  const tfMeta = TIMEFRAMES.find(t => t.value === timeframe)!;
  const now = Math.floor(Date.now() / 1000);
  // entry begins at the next clean timeframe boundary, expiry one full timeframe later
  const entryTime = now + 5;
  const expiryTime = entryTime + tfMeta.seconds;

  let finalReasons = reasons.slice(0, 4);
  if (direction === 'WAIT') {
    finalReasons = [
      'Conflicting signals between momentum and trend indicators',
      `Confidence of ${confidence}% falls below the ${CONFIDENCE_THRESHOLD}% execution threshold`,
      indicators.volatility > 70 ? 'Volatility is elevated, raising whipsaw risk' : 'Market lacks a clear directional edge right now',
    ];
  }

  return {
    id: `${asset}-${timeframe}-${now}`,
    asset,
    assetLabel: meta.label,
    price,
    direction,
    timeframe,
    entryTime,
    expiryTime,
    confidence,
    reasons: finalReasons,
    indicators,
    outcome: 'PENDING',
  };
}
