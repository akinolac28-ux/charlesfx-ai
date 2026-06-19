import React, { useEffect, useState, useCallback } from 'react';
import { ScannerStrip } from '@/components/ScannerStrip';
import { CandlestickChart } from '@/components/CandlestickChart';
import { TimeframePills } from '@/components/TimeframePills';
import { SignalCard } from '@/components/SignalCard';
import { Card, Button } from '@/components/ui';
import { useMarketData } from '@/context/MarketDataContext';
import { useAuth } from '@/context/AuthContext';
import { useSignalHistory } from '@/context/SignalHistoryContext';
import { AssetSymbol, Candle, Timeframe, TradeSignal } from '@/types';
import { generateSignal } from '@/engine/signalEngine';
import { getAssetMeta } from '@/data/assets';
import { ScanLine, Loader2 } from 'lucide-react';

export function DashboardPage() {
  const provider = useMarketData();
  const { user, consumeSignal } = useAuth();
  const { addSignal } = useSignalHistory();

  const [asset, setAsset] = useState<AssetSymbol>('EURUSD');
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [signal, setSignal] = useState<TradeSignal | null>(null);
  const [scanning, setScanning] = useState(false);
  const [locked, setLocked] = useState(false);

  const loadCandles = useCallback(async () => {
    const data = await provider.getCandles(asset, timeframe, 150);
    setCandles(data);
    return data;
  }, [provider, asset, timeframe]);

  useEffect(() => {
    loadCandles();
    const unsubscribe = provider.subscribe(asset, () => { loadCandles(); });
    const interval = setInterval(loadCandles, 4000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [loadCandles, provider, asset]);

  const runScan = async () => {
    setScanning(true);
    setLocked(false);
    try {
      const fresh = await loadCandles();
      await new Promise(r => setTimeout(r, 900)); // perceptible "AI thinking" moment
      const result = generateSignal(asset, fresh, timeframe);

      const allowed = consumeSignal();
      if (!allowed) {
        setLocked(true);
      } else {
        addSignal(result);
      }
      setSignal(result);
    } catch (err) {
      console.error('Signal scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  const meta = getAssetMeta(asset);

  return (
    <div style={{ padding: '0 0 24px' }}>
      <ScannerStrip active={asset} onSelect={s => { setAsset(s); setSignal(null); }} />

      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div className="display" style={{ fontSize: 19, fontWeight: 700 }}>{meta.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live candlestick chart · {timeframe} timeframe</div>
          </div>
        </div>

        <TimeframePills active={timeframe} onChange={setTimeframe} />

        <Card style={{ marginTop: 14, padding: 8 }}>
          <CandlestickChart candles={candles} height={300} />
        </Card>

        <div style={{ marginTop: 16 }}>
          <Button full onClick={runScan} disabled={scanning}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {scanning ? <Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <ScanLine size={16} />}
              {scanning ? 'AI analyzing market structure…' : 'Run AI Signal Scan'}
            </span>
          </Button>
          {user?.plan === 'FREE' && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {Math.max(0, (user.signalsDailyLimit - user.signalsUsedToday))} free signals left today
            </p>
          )}
        </div>

        {signal && (
          <div style={{ marginTop: 16, animation: 'fadeUp 0.4s ease' }}>
            <SignalCard signal={signal} locked={locked} />
            {locked && (
              <div style={{ marginTop: 10 }}>
                <Button full variant="primary" onClick={() => window.location.assign('/vip')}>Upgrade to VIP</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
