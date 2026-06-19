import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { useSignalHistory } from '@/context/SignalHistoryContext';
import { Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function NotificationsPage() {
  const { signals } = useSignalHistory();
  const recent = signals.filter(s => s.direction !== 'WAIT').slice(0, 12);

  return (
    <div style={{ padding: 16 }}>
      <h1 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Notifications</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Recent signal alerts. Manage delivery channels in Settings.</p>

      {recent.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 10 }}>
            <Bell size={22} color="var(--text-muted)" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>No alerts yet. Run a scan from the Terminal to get your first signal.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent.map(s => {
            const Icon = s.direction === 'CALL' ? ArrowUpRight : ArrowDownRight;
            const color = s.direction === 'CALL' ? 'var(--green-candle)' : 'var(--red-candle)';
            return (
              <Card key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {s.assetLabel} — {s.direction} signal at {s.confidence}% confidence
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.timeframe} timeframe</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
