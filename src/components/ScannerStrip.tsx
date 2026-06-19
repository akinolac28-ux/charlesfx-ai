import React, { useEffect, useState } from 'react';
import { ASSETS } from '@/data/assets';
import { AssetSymbol } from '@/types';
import { useMarketData } from '@/context/MarketDataContext';

interface TickerState {
  price: number;
  changePct: number;
  rsiHealthy: boolean;
}

export function ScannerStrip({ active, onSelect }: { active: AssetSymbol; onSelect: (s: AssetSymbol) => void }) {
  const provider = useMarketData();
  const [ticks, setTicks] = useState<Record<string, TickerState>>({});

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const results = await Promise.all(
        ASSETS.map(async a => {
          const live = await provider.getLivePrice(a.symbol);
          return [a.symbol, { price: live.price, changePct: live.changePct, rsiHealthy: Math.random() > 0.4 }] as const;
        })
      );
      if (mounted) {
        setTicks(Object.fromEntries(results));
      }
    };
    refresh();
    const interval = setInterval(refresh, 2500);
    return () => { mounted = false; clearInterval(interval); };
  }, [provider]);

  return (
    <div style={{
      position: 'relative',
      borderTop: '1px solid var(--hairline)',
      borderBottom: '1px solid var(--hairline)',
      background: 'linear-gradient(180deg, rgba(16,26,51,0.6), rgba(11,16,32,0.6))',
      overflow: 'hidden',
    }}>
      {/* radar sweep accent */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, height: '100%', width: '40%',
        background: 'linear-gradient(90deg, transparent, rgba(31,111,235,0.08), transparent)',
        animation: 'sweep 6s linear infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: 2,
        padding: '10px 12px',
        scrollbarWidth: 'none',
      }}>
        {ASSETS.map(a => {
          const tick = ticks[a.symbol];
          const isActive = a.symbol === active;
          const isUp = (tick?.changePct ?? 0) >= 0;
          return (
            <button
              key={a.symbol}
              onClick={() => onSelect(a.symbol)}
              style={{
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 10,
                border: isActive ? '1px solid var(--gold)' : '1px solid transparent',
                background: isActive ? 'rgba(201,161,74,0.10)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: tick?.rsiHealthy ? 'var(--green-candle)' : 'var(--red)',
                boxShadow: `0 0 6px ${tick?.rsiHealthy ? 'var(--green-candle)' : 'var(--red)'}`,
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: isActive ? 'var(--gold-bright)' : 'var(--text-primary)' }}>
                {a.label}
              </span>
              <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                {tick ? tick.price.toFixed(a.pipDigits) : '—'}
              </span>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: isUp ? 'var(--green-candle)' : 'var(--red-candle)' }}>
                {tick ? `${isUp ? '+' : ''}${tick.changePct.toFixed(2)}%` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
