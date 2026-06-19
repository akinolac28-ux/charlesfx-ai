import React, { useState } from 'react';
import { Card, StatPill } from '@/components/ui';
import { useSignalHistory } from '@/context/SignalHistoryContext';
import { TradeSignal } from '@/types';
import { ArrowUpRight, ArrowDownRight, PauseCircle } from 'lucide-react';

type Tab = 'today' | 'wins' | 'losses' | 'all';

function fmtTime(unix: number) {
  return new Date(unix * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const dirIcon = { CALL: ArrowUpRight, PUT: ArrowDownRight, WAIT: PauseCircle };
const dirColor = { CALL: 'var(--green-candle)', PUT: 'var(--red-candle)', WAIT: 'var(--blue-bright)' };

export function HistoryPage() {
  const { signals, todaysSignals, winCount, lossCount, winRate } = useSignalHistory();
  const [tab, setTab] = useState<Tab>('today');

  const filtered: TradeSignal[] =
    tab === 'today' ? todaysSignals :
    tab === 'wins' ? signals.filter(s => s.outcome === 'WIN') :
    tab === 'losses' ? signals.filter(s => s.outcome === 'LOSS') :
    signals;

  const weeklyResolved = signals.filter(s => s.outcome === 'WIN' || s.outcome === 'LOSS');
  const weeklyWinRate = weeklyResolved.length > 0
    ? Math.round((weeklyResolved.filter(s => s.outcome === 'WIN').length / weeklyResolved.length) * 100)
    : 0;

  return (
    <div style={{ padding: 16 }}>
      <h1 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px' }}>Signal Performance</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <Card><StatPill label="Win Rate" value={`${winRate}%`} color="var(--gold-bright)" /></Card>
        <Card><StatPill label="Wins" value={String(winCount)} color="var(--green-candle)" /></Card>
        <Card><StatPill label="Losses" value={String(lossCount)} color="var(--red-candle)" /></Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 6 }}>Weekly performance report</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{weeklyResolved.length} signals resolved this period</span>
          <span className="mono" style={{ fontWeight: 700, color: 'var(--gold-bright)' }}>{weeklyWinRate}% win rate</span>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
        {(['today', 'wins', 'losses', 'all'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            border: tab === t ? '1px solid var(--gold)' : '1px solid var(--hairline)',
            background: tab === t ? 'rgba(201,161,74,0.12)' : 'transparent',
            color: tab === t ? 'var(--gold-bright)' : 'var(--text-secondary)',
            textTransform: 'capitalize', flexShrink: 0,
          }}>
            {t === 'today' ? "Today's Signals" : t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>No signals yet here. Run a scan on the Terminal tab to generate one.</p></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const Icon = dirIcon[s.direction];
            return (
              <Card key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={14} color={dirColor[s.direction]} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{s.assetLabel}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>· {s.timeframe}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{fmtTime(s.entryTime)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: dirColor[s.direction] }}>{s.direction} {s.confidence}%</div>
                  {s.outcome && s.outcome !== 'PENDING' && (
                    <div className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: s.outcome === 'WIN' ? 'var(--green-candle)' : 'var(--red-candle)' }}>
                      {s.outcome}
                    </div>
                  )}
                  {s.outcome === 'PENDING' && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pending</div>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
