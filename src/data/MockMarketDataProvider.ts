import { AssetSymbol, Candle, MarketDataProvider, Timeframe } from '@/types';
import { ASSET_BASE_PRICE } from '@/data/assets';
import { TIMEFRAMES } from '@/data/assets';

function tfSeconds(tf: Timeframe): number {
  return TIMEFRAMES.find(t => t.value === tf)!.seconds;
}

function volatilityFor(symbol: AssetSymbol): number {
  // Rough relative volatility per pip-scale, used to keep candle bodies realistic
  switch (symbol) {
    case 'EURUSD': return 0.00018;
    case 'GBPUSD': return 0.00022;
    case 'USDJPY': return 0.022;
    case 'GBPJPY': return 0.028;
    case 'XAUUSD': return 0.85;
    default: return 0.0002;
  }
}

// Simple deterministic pseudo-random so charts don't jump wildly on re-render
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * MockMarketDataProvider
 * Generates realistic-looking OHLC candles using a random walk with mild
 * mean reversion and occasional trend impulses, so RSI/MACD/EMA/Bollinger
 * computations behave the way they would on real data.
 *
 * ── TO GO LIVE ──
 * Implement MarketDataProvider with a real provider (TwelveData, Polygon.io,
 * Alpha Vantage, Binance, Finnhub, etc.) and swap it in at
 * src/context/MarketDataContext.tsx. No other file needs to change because
 * every component consumes the MarketDataProvider interface, not this class.
 */
export class MockMarketDataProvider implements MarketDataProvider {
  id = 'mock-simulator';
  label = 'Simulated Engine (no API key required)';

  private candleCache: Map<string, Candle[]> = new Map();
  private subscribers: Map<string, Set<(c: Candle) => void>> = new Map();
  private tickers: Map<string, number> = new Map();

  private cacheKey(symbol: AssetSymbol, tf: Timeframe) {
    return `${symbol}_${tf}`;
  }

  async getCandles(symbol: AssetSymbol, timeframe: Timeframe, limit: number): Promise<Candle[]> {
    const key = this.cacheKey(symbol, timeframe);
    if (this.candleCache.has(key)) {
      return this.candleCache.get(key)!.slice(-limit);
    }
    const candles = this.generateSeries(symbol, timeframe, limit);
    this.candleCache.set(key, candles);
    return candles;
  }

  async getLivePrice(symbol: AssetSymbol): Promise<{ price: number; changePct: number }> {
    const key = this.cacheKey(symbol, '1m');
    const series = this.candleCache.get(key) ?? (await this.getCandles(symbol, '1m', 200));
    const last = series[series.length - 1];
    const first = series[Math.max(0, series.length - 60)];
    const changePct = ((last.close - first.close) / first.close) * 100;
    return { price: last.close, changePct };
  }

  subscribe(symbol: AssetSymbol, onTick: (candle: Candle) => void): () => void {
    const key = symbol;
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key)!.add(onTick);

    if (!this.tickers.has(key)) {
      const interval = window.setInterval(() => {
        this.advanceAllTimeframes(symbol);
      }, 2000);
      this.tickers.set(key, interval);
    }

    return () => {
      this.subscribers.get(key)?.delete(onTick);
    };
  }

  private advanceAllTimeframes(symbol: AssetSymbol) {
    for (const tf of TIMEFRAMES.map(t => t.value)) {
      const key = this.cacheKey(symbol, tf);
      const series = this.candleCache.get(key);
      if (!series || series.length === 0) continue;
      const updated = this.advanceSeries(symbol, tf, series);
      this.candleCache.set(key, updated);
      if (tf === '1m') {
        const last = updated[updated.length - 1];
        this.subscribers.get(symbol)?.forEach(fn => fn(last));
      }
    }
  }

  private advanceSeries(symbol: AssetSymbol, tf: Timeframe, series: Candle[]): Candle[] {
    const vol = volatilityFor(symbol);
    const last = series[series.length - 1];
    const now = Math.floor(Date.now() / 1000);
    const step = tfSeconds(tf);
    const rand = Math.random() * 2 - 1;
    const drift = (Math.random() - 0.5) * 0.15;
    const delta = vol * (rand + drift) * 0.5;

    if (now - last.time < step) {
      // Update current forming candle
      const close = Math.max(0.0001, last.close + delta);
      const updatedLast: Candle = {
        ...last,
        close,
        high: Math.max(last.high, close),
        low: Math.min(last.low, close),
        volume: last.volume + Math.random() * 50,
      };
      return [...series.slice(0, -1), updatedLast];
    } else {
      // Open a new candle
      const open = last.close;
      const close = Math.max(0.0001, open + delta);
      const high = Math.max(open, close) + Math.random() * vol * 0.3;
      const low = Math.min(open, close) - Math.random() * vol * 0.3;
      const newCandle: Candle = {
        time: last.time + step,
        open, high, low, close,
        volume: 100 + Math.random() * 200,
      };
      const next = [...series, newCandle];
      return next.length > 500 ? next.slice(-500) : next;
    }
  }

  private generateSeries(symbol: AssetSymbol, timeframe: Timeframe, limit: number): Candle[] {
    const base = ASSET_BASE_PRICE[symbol];
    const vol = volatilityFor(symbol);
    const step = tfSeconds(timeframe);
    const rand = seededRandom(symbol.length * 97 + step);
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - limit * step;

    let price = base;
    let trendBias = 0;
    const candles: Candle[] = [];

    for (let i = 0; i < limit; i++) {
      // occasionally shift trend bias to create swings, support/resistance zones
      if (i % 18 === 0) trendBias = (rand() - 0.5) * 0.6;
      const noise = (rand() - 0.5) * 2;
      const move = vol * (noise + trendBias) * 0.5;

      const open = price;
      const close = Math.max(0.0001, open + move);
      const high = Math.max(open, close) + rand() * vol * 0.35;
      const low = Math.min(open, close) - rand() * vol * 0.35;
      const volume = 80 + rand() * 220;

      candles.push({ time: startTime + i * step, open, high, low, close, volume });
      price = close;
    }
    return candles;
  }
}

export const marketDataProvider: MarketDataProvider = new MockMarketDataProvider();
