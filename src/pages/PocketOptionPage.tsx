import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useSignalHistory } from '@/context/SignalHistoryContext';
import { ExternalLink, ShieldAlert } from 'lucide-react';

export function PocketOptionPage() {
  const { signals } = useSignalHistory();
  const latest = signals.filter(s => s.direction !== 'WAIT' && s.outcome === 'PENDING').slice(0, 3);

  return (
    <div style={{ padding: 16 }}>
      <h1 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Pocket Option Companion</h1>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
        Keep this view open alongside your Pocket Option terminal to follow active signals while you trade.
      </p>

      <Card style={{ marginBottom: 16, border: '1px solid rgba(233,69,96,0.3)', background: 'rgba(233,69,96,0.06)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <ShieldAlert size={20} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--red)', marginBottom: 4 }}>Important disclaimer</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Charles FX AI provides market analysis and trading signals only. It is not connected to your Pocket Option
              account, does not place trades automatically, and does not guarantee profits. All trading decisions and
              execution remain entirely your responsibility. Binary options carry a high risk of loss.
            </p>
          </div>
        </div>
      </Card>

      <a href="https://pocketoption.com" target="_blank" rel="noopener noreferrer">
        <Button full variant="secondary">
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Open Pocket Option <ExternalLink size={15} />
          </span>
        </Button>
      </a>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Active signals to watch</div>
        {latest.length === 0 ? (
          <Card><p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>No active signals right now — run a scan from the Terminal tab.</p></Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {latest.map(s => (
              <Card key={s.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{s.assetLabel}</span>
                <span className="mono" style={{ fontWeight: 700, color: s.direction === 'CALL' ? 'var(--green-candle)' : 'var(--red-candle)' }}>
                  {s.direction} · {s.confidence}%
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
