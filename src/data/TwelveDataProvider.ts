import { AssetSymbol, Candle, MarketDataProvider, Timeframe } from '@/types';
import { ASSET_BASE_PRICE } from '@/data/assets';

const SYMBOL_MAP: Record<AssetSymbol, string> = {
  EURUSD: 'EUR/USD',
  GBPUSD: 'GBP/USD',
  USDJPY: 'USD/JPY',
  GBPJPY: 'GBP/JPY',
  XAUUSD: 'XAU/USD',
};

const TF_MAP: Record<Timeframe, string> = {
  '30s': '1min',
  '1m': '1min',
  '2m': '2min',
  '5m': '5min',
  '15m': '15min',
};

const TF_SECONDS: Record<Timeframe, number> = {
  '30s': 30,
  '1m': 60,
  '2m': 120,
  '5m': 300,
  '15m': 900,
};

const BASE_URL = 'https://api.twelvedata.com';

export class TwelveDataProvider implements MarketDataProvider {
  id = 'twelvedata';
  label = 'Twelve Data (Live)';
  private apiKey: string;
  private candleCache: Map<string, Candle[]> = new Map();
  private priceCache: Map<string, { price: number; changePct: number; ts: number }> = new Map();
  private subscribers: Map<string, Set<(c: Candle) => void>> = new Map();
  private tickers: Map<string, number> = new Map();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private cacheKey(symbol: AssetSymbol, tf: Timeframe) {
    return `${symbol}_${tf}`;
  }

  async getCandles(symbol: AssetSymbol, timeframe: Timeframe, limit: number): Promise<Candle[]> {
    const key = this.cacheKey(symbol, timeframe);
    const cached = this.candleCache.get(key);
    if (cached && cached.length > 0) {
      const age = Date.now() / 1000 - cached[cached.length - 1].time;
      if (age < 30) return cached.slice(-limit);
    }
    try {
      const url = `${BASE_URL}/time_series?symbol=${encodeURIComponent(SYMBOL_MAP[symbol])}&interval=${TF_MAP[timeframe]}&outputsize=${limit}&apikey=${this.apiKey}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'error' || !json.values) {
        return this.getFallback(symbol, timeframe, limit);
      }
      const candles: Candle[] = json.values.reverse().map((v: any) => ({
        time: Math.floor(new Date(v.datetime).getTime() / 1000),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume || '100'),
      }));
      this.candleCache.set(key, candles);
      return candles.slice(-limit);
    } catch {
      return this.getFallback(symbol, timeframe, limit);
    }
  }

  async getLivePrice(symbol: AssetSymbol): Promise<{ price: number; changePct: number }> {
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() / 1000 - cached.ts < 10) {
      return { price: cached.price, changePct: cached.changePct };
    }
    try {
      const url = `${BASE_URL}/price?symbol=${encodeURIComponent(SYMBOL_MAP[symbol])}&apikey=${this.apiKey}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'error' || !json.price) {
        return this.getFallbackPrice(symbol);
      }
      const price = parseFloat(json.price);
      const candles = this.candleCache.get(this.cacheKey(symbol, '1m'));
      const prevClose = candles && candles.length > 1 ? candles[candles.length - 2].close : price;
      const changePct = ((price - prevClose) / prevClose) * 100;
      const result = { price, changePct };
      this.priceCache.set(symbol, { ...result, ts: Date.now() / 1000 });
      return result;
    } catch {
      return this.getFallbackPrice(symbol);
    }
  }

  subscribe(symbol: AssetSymbol, onTick: (candle: Candle) => void): () => void {
    if (!this.subscribers.has(symbol)) this.subscribers.set(symbol, new Set());
    this.subscribers.get(symbol)!.add(onTick);
    if (!this.tickers.has(symbol)) {
      const interval = window.setInterval(async () => {
        this.candleCache.delete(this.cacheKey(symbol, '1m'));
        this.priceCache.delete(symbol);
        const fresh = await this.getCandles(symbol, '1m', 150);
        if (fresh.length > 0) {
          this.subscribers.get(symbol)?.forEach(fn => fn(fresh[fresh.length - 1]));
        }
      }, 15000);
      this.tickers.set(symbol, interval);
    }
    return () => {
      this.subscribers.get(symbol)?.delete(onTick);
      if (this.subscribers.get(symbol)?.size === 0) {
        const ticker = this.tickers.get(symbol);
        if (ticker) clearInterval(ticker);
        this.tickers.delete(symbol);
      }
    };
  }

  private getFallback(symbol: AssetSymbol, timeframe: Timeframe, limit: number): Candle[] {
    const base = ASSET_BASE_PRICE[symbol];
    const step = TF_SECONDS[timeframe];
    const now = Math.floor(Date.now() / 1000);
    const candles: Candle[] = [];
    let price = base;
    for (let i = 0; i < limit; i++) {
      const move = (Math.random() - 0.5) * base * 0.0004;
      const open = price;
      const close = Math.max(0.0001, open + move);
      candles.push({
        time: now - (limit - i) * step,
        open, close,
        high: Math.max(open, close) + Math.random() * base * 0.0001,
        low: Math.min(open, close) - Math.random() * base * 0.0001,
        volume: 100 + Math.random() * 200,
      });
      price = close;
    }
    return candles;
  }

  private getFallbackPrice(symbol: AssetSymbol): { price: number; changePct: number } {
    return { price: ASSET_BASE_PRICE[symbol], changePct: 0 };
  }
}

export function createTwelveDataProvider(apiKey: string): TwelveDataProvider {
  return new TwelveDataProvider(apiKey);
  }
