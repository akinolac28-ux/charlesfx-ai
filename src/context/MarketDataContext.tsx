import React, { createContext, useContext } from 'react';
import { MarketDataProvider } from '@/types';
import { marketDataProvider as mockProvider } from '@/data/MockMarketDataProvider';
import { createTwelveDataProvider } from '@/data/TwelveDataProvider';

const TWELVE_DATA_API_KEY = 'dffbc9dbfe0a4548b8fb80fdcfb76c0b';

const marketDataProvider: MarketDataProvider =
  TWELVE_DATA_API_KEY.trim().length > 0
    ? createTwelveDataProvider(TWELVE_DATA_API_KEY)
    : mockProvider;

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
