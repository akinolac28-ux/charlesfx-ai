// ── Market data types ─────────────────────────────────────────────
export type AssetSymbol = 'EURUSD' | 'GBPUSD' | 'USDJPY' | 'GBPJPY' | 'XAUUSD';

export interface AssetMeta {
  symbol: AssetSymbol;
  label: string;      // "EUR/USD"
  kind: 'forex' | 'metal';
  pipDigits: number;  // decimals to display
}

export type Timeframe = '30s' | '1m' | '2m' | '5m' | '15m';

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Market data provider interface ────────────────────────────────
// Swap MockDataProvider for a real implementation (e.g. TwelveData,
// Polygon, Alpha Vantage, Binance) without touching any UI code.
export interface MarketDataProvider {
  id: string;
  label: string;
  /** Returns historical candles for charting */
  getCandles(symbol: AssetSymbol, timeframe: Timeframe, limit: number): Promise<Candle[]>;
  /** Returns the latest live price tick */
  getLivePrice(symbol: AssetSymbol): Promise<{ price: number; changePct: number }>;
  /** Subscribe to a stream of live ticks; returns an unsubscribe fn */
  subscribe(symbol: AssetSymbol, onTick: (candle: Candle) => void): () => void;
}

// ── AI signal engine types ────────────────────────────────────────
export type SignalDirection = 'CALL' | 'PUT' | 'WAIT';

export interface IndicatorSnapshot {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  ema20: number;
  ema50: number;
  ema200: number;
  bollinger: { upper: number; mid: number; lower: number };
  support: number;
  resistance: number;
  trendStrength: number; // 0-100
  volatility: number;    // 0-100 (ATR-normalized)
  candlePattern: string | null;
}

export interface TradeSignal {
  id: string;
  asset: AssetSymbol;
  assetLabel: string;
  price: number;
  direction: SignalDirection;
  timeframe: Timeframe;
  entryTime: number;     // unix seconds
  expiryTime: number;    // unix seconds
  confidence: number;    // 0-100
  reasons: string[];
  indicators: IndicatorSnapshot;
  outcome?: 'WIN' | 'LOSS' | 'PENDING';
}

// ── User / subscription types ─────────────────────────────────────
export type PlanTier = 'FREE' | 'VIP';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  plan: PlanTier;
  signalsUsedToday: number;
  signalsDailyLimit: number; // FREE plan cap
  createdAt: number;
  isAdmin?: boolean;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: PlanTier;
  startedAt: number;
  expiresAt: number;
  amountNGN: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  gateway: 'Paystack' | 'Flutterwave' | 'Manual';
}

// ── API key / integration settings (admin) ────────────────────────
export interface ApiKeyConfig {
  id: string;
  providerLabel: string;
  category: 'forex' | 'crypto' | 'charting' | 'telegram' | 'payments';
  keyMasked: string;
  active: boolean;
  updatedAt: number;
}

export interface AssetToggle {
  symbol: AssetSymbol;
  enabled: boolean;
}
