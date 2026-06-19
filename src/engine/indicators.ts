import { Candle, IndicatorSnapshot } from '@/types';

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    const v = i === 0 ? values[0] : values[i] * k + prev * (1 - k);
    out.push(v);
    prev = v;
  }
  return out;
}

export function rsi(closes: number[], period = 14): number[] {
  const out: number[] = new Array(closes.length).fill(50);
  if (closes.length < period + 1) return out;

  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  // backfill early values with first computed value
  for (let i = 0; i < period; i++) out[i] = out[period];
  return out;
}

export function macd(closes: number[], fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const macdLine = closes.map((_, i) => emaFast[i] - emaSlow[i]);
  const signalLine = ema(macdLine, signalPeriod);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

export function bollingerBands(closes: number[], period = 20, mult = 2) {
  const upper: number[] = [];
  const mid: number[] = [];
  const lower: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = closes.slice(start, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length;
    const sd = Math.sqrt(variance);
    mid.push(mean);
    upper.push(mean + mult * sd);
    lower.push(mean - mult * sd);
  }
  return { upper, mid, lower };
}

export function atr(candles: Candle[], period = 14): number[] {
  const trs: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) { trs.push(candles[i].high - candles[i].low); continue; }
    const prevClose = candles[i - 1].close;
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - prevClose),
      Math.abs(candles[i].low - prevClose)
    );
    trs.push(tr);
  }
  return ema(trs, period);
}

export function findSupportResistance(candles: Candle[], lookback = 60): { support: number; resistance: number } {
  const slice = candles.slice(-lookback);
  const lows = slice.map(c => c.low);
  const highs = slice.map(c => c.high);
  return { support: Math.min(...lows), resistance: Math.max(...highs) };
}

export function trendStrength(closes: number[], emaShort: number[], emaLong: number[]): number {
  const last = closes.length - 1;
  const spread = Math.abs(emaShort[last] - emaLong[last]) / closes[last];
  const direction = emaShort[last] > emaLong[last] ? 1 : -1;
  // normalize spread into 0-100, dampened
  const raw = Math.min(100, spread * 10000);
  return Math.round(raw) * (direction === 1 ? 1 : 1); // strength magnitude, direction handled elsewhere
}

export function detectCandlePattern(candles: Candle[]): string | null {
  if (candles.length < 3) return null;
  const [c2, c1, c0] = candles.slice(-3); // c0 = latest
  const body = (c: Candle) => Math.abs(c.close - c.open);
  const range = (c: Candle) => c.high - c.low || 1e-9;
  const upperWick = (c: Candle) => c.high - Math.max(c.open, c.close);
  const lowerWick = (c: Candle) => Math.min(c.open, c.close) - c.low;
  const isBull = (c: Candle) => c.close > c.open;
  const isBear = (c: Candle) => c.close < c.open;

  // Bullish engulfing
  if (isBear(c1) && isBull(c0) && c0.close > c1.open && c0.open < c1.close) {
    return 'Bullish Engulfing';
  }
  // Bearish engulfing
  if (isBull(c1) && isBear(c0) && c0.open > c1.close && c0.close < c1.open) {
    return 'Bearish Engulfing';
  }
  // Hammer (bullish reversal)
  if (lowerWick(c0) > body(c0) * 2 && upperWick(c0) < body(c0) * 0.6 && body(c0) / range(c0) < 0.4) {
    return 'Hammer';
  }
  // Shooting star (bearish reversal)
  if (upperWick(c0) > body(c0) * 2 && lowerWick(c0) < body(c0) * 0.6 && body(c0) / range(c0) < 0.4) {
    return 'Shooting Star';
  }
  // Doji (indecision)
  if (body(c0) / range(c0) < 0.1) {
    return 'Doji';
  }
  // Three-candle bullish momentum
  if (isBull(c2) && isBull(c1) && isBull(c0)) {
    return 'Three Rising Candles';
  }
  if (isBear(c2) && isBear(c1) && isBear(c0)) {
    return 'Three Falling Candles';
  }
  return null;
}

export function computeIndicators(candles: Candle[]): IndicatorSnapshot {
  if (candles.length === 0) {
    // Defensive fallback — should not happen in normal app flow (the
    // dashboard always requests a populated series first), but guards
    // against a future live-data provider briefly returning no candles.
    return {
      rsi: 50,
      macd: { macd: 0, signal: 0, histogram: 0 },
      ema20: 0, ema50: 0, ema200: 0,
      bollinger: { upper: 0, mid: 0, lower: 0 },
      support: 0, resistance: 0,
      trendStrength: 0, volatility: 0,
      candlePattern: null,
    };
  }
  const closes = candles.map(c => c.close);
  const e20 = ema(closes, 20);
  const e50 = ema(closes, 50);
  const e200 = ema(closes, Math.min(200, closes.length - 1 || 1));
  const r = rsi(closes, 14);
  const { macdLine, signalLine, histogram } = macd(closes);
  const bb = bollingerBands(closes, 20, 2);
  const sr = findSupportResistance(candles, 60);
  const atrSeries = atr(candles, 14);
  const lastIdx = closes.length - 1;

  const avgPrice = closes[lastIdx];
  const normalizedAtr = (atrSeries[lastIdx] / avgPrice) * 100;
  const volatility = Math.min(100, Math.round(normalizedAtr * 800));

  const tStrength = trendStrength(closes, e20, e50);
  const pattern = detectCandlePattern(candles);

  return {
    rsi: Math.round(r[lastIdx] * 10) / 10,
    macd: {
      macd: macdLine[lastIdx],
      signal: signalLine[lastIdx],
      histogram: histogram[lastIdx],
    },
    ema20: e20[lastIdx],
    ema50: e50[lastIdx],
    ema200: e200[lastIdx],
    bollinger: { upper: bb.upper[lastIdx], mid: bb.mid[lastIdx], lower: bb.lower[lastIdx] },
    support: sr.support,
    resistance: sr.resistance,
    trendStrength: Math.min(100, tStrength),
    volatility,
    candlePattern: pattern,
  };
}
