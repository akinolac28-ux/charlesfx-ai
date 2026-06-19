import { AssetMeta, AssetSymbol } from '@/types';

export const ASSETS: AssetMeta[] = [
  { symbol: 'EURUSD', label: 'EUR/USD', kind: 'forex', pipDigits: 5 },
  { symbol: 'GBPUSD', label: 'GBP/USD', kind: 'forex', pipDigits: 5 },
  { symbol: 'USDJPY', label: 'USD/JPY', kind: 'forex', pipDigits: 3 },
  { symbol: 'GBPJPY', label: 'GBP/JPY', kind: 'forex', pipDigits: 3 },
  { symbol: 'XAUUSD', label: 'XAU/USD', kind: 'metal', pipDigits: 2 },
];

export const ASSET_BASE_PRICE: Record<AssetSymbol, number> = {
  EURUSD: 1.0842,
  GBPUSD: 1.2671,
  USDJPY: 156.32,
  GBPJPY: 198.14,
  XAUUSD: 2342.5,
};

export const TIMEFRAMES: { value: import('@/types').Timeframe; label: string; seconds: number }[] = [
  { value: '30s', label: '30s', seconds: 30 },
  { value: '1m', label: '1m', seconds: 60 },
  { value: '2m', label: '2m', seconds: 120 },
  { value: '5m', label: '5m', seconds: 300 },
  { value: '15m', label: '15m', seconds: 900 },
];

export function getAssetMeta(symbol: AssetSymbol): AssetMeta {
  return ASSETS.find(a => a.symbol === symbol)!;
}
