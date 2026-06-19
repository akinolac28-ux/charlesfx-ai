import React, { createContext, useContext } from 'react';
import { MarketDataProvider } from '@/types';
import { marketDataProvider } from '@/data/MockMarketDataProvider';

// ── To go live with real data ──
// 1. Create src/data/LiveMarketDataProvider.ts implementing MarketDataProvider
// 2. Import it here instead of marketDataProvider
// 3. Done — no component code changes needed anywhere else in the app.

const MarketDataContext = createContext<MarketDataProvider>(marketDataProvider);

export function MarketDataProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MarketDataContext.Provider value={marketDataProvider}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  return useContext(MarketDataContext);
}
