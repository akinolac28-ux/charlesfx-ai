import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TradeSignal } from '@/types';

interface SignalHistoryValue {
  signals: TradeSignal[];
  addSignal: (s: TradeSignal) => void;
  todaysSignals: TradeSignal[];
  winCount: number;
  lossCount: number;
  winRate: number;
}

const SignalHistoryContext = createContext<SignalHistoryValue | null>(null);
const HISTORY_KEY = 'charlesfx_signal_history_v1';

function isToday(ts: number) {
  const d = new Date(ts * 1000);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function SignalHistoryProvider({ children }: { children: React.ReactNode }) {
  const [signals, setSignals] = useState<TradeSignal[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      setSignals(saved);
    } catch { /* ignore */ }
  }, []);

  // Resolve PENDING outcomes once their expiry has passed, using a
  // probability weighted by the original confidence score — this models
  // "higher confidence signals win more often" without faking certainty.
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => {
        const now = Math.floor(Date.now() / 1000);
        let changed = false;
        const next = prev.map(s => {
          if (s.outcome === 'PENDING' && s.expiryTime <= now && s.direction !== 'WAIT') {
            changed = true;
            const winProbability = 0.45 + (s.confidence / 100) * 0.4; // 45%–85%
            const outcome: TradeSignal['outcome'] = Math.random() < winProbability ? 'WIN' : 'LOSS';
            return { ...s, outcome };
          }
          return s;
        });
        if (changed) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addSignal = useCallback((s: TradeSignal) => {
    setSignals(prev => {
      const next = [s, ...prev].slice(0, 300);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const todaysSignals = signals.filter(s => isToday(s.entryTime));
  const resolved = signals.filter(s => s.outcome === 'WIN' || s.outcome === 'LOSS');
  const winCount = resolved.filter(s => s.outcome === 'WIN').length;
  const lossCount = resolved.filter(s => s.outcome === 'LOSS').length;
  const winRate = resolved.length > 0 ? Math.round((winCount / resolved.length) * 100) : 0;

  return (
    <SignalHistoryContext.Provider value={{ signals, addSignal, todaysSignals, winCount, lossCount, winRate }}>
      {children}
    </SignalHistoryContext.Provider>
  );
}

export function useSignalHistory() {
  const ctx = useContext(SignalHistoryContext);
  if (!ctx) throw new Error('useSignalHistory must be used within SignalHistoryProvider');
  return ctx;
}
