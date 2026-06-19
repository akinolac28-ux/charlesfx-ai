import React from 'react';
import { TradeSignal } from '@/types';
import { ConfidenceGauge } from '@/components/ConfidenceGauge';
import { ArrowUpRight, ArrowDownRight, PauseCircle, Clock } from 'lucide-react';

function fmtTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const directionStyles = {
  CALL: { bg: 'rgba(22,199,132,0.10)', border: 'rgba(22,199,132,0.4)', text: 'var(--green-candle)', Icon: ArrowUpRight, label: 'CALL · BUY' },
  PUT: { bg: 'rgba(240,80,110,0.10)', border: 'rgba(240,80,110,0.4)', text: 'var(--red-candle)', Icon: ArrowDownRight, label: 'PUT · SELL' },
  WAIT: { bg: 'rgba(76,143,255,0.08)', border: 'rgba(76,143,255,0.35)', text: 'var(--blue-bright)', Icon: PauseCircle, label: 'WAIT' },
};

export function SignalCard({ signal, locked }: { signal: TradeSignal; locked?: boolean }) {
  const style = directionStyles[signal.direction];
  const Icon = style.Icon;

  return (
    <div style={{
      background: 'linear-gradient(160deg, var(--elevated), var(--panel))',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%',
        background: `radial-gradient(circle, ${style.text}22, transparent 70%)`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4 }}>AI SIGNAL</div>
          <div className="display" style={{ fontSize: 20, fontWeight: 700 }}>{signal.assetLabel}</div>
          <div className="mono" style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
            {signal.price.toFixed(signal.asset === 'USDJPY' || signal.asset === 'GBPJPY' ? 3 : signal.asset === 'XAUUSD' ? 2 : 5)}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999,
          background: style.bg, border: `1px solid ${style.border}`, color: style.text, fontWeight: 700, fontSize: 13,
        }}>
          <Icon size={15} />
          {style.label}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16, filter: locked ? 'blur(5px)' : 'none' }}>
        <ConfidenceGauge confidence={signal.confidence} direction={signal.direction} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="Timeframe" value={signal.timeframe} />
          <Row label="Entry" value={fmtTime(signal.entryTime)} icon={<Clock size={12} />} />
          <Row label="Expiry" value={fmtTime(signal.expiryTime)} icon={<Clock size={12} />} />
          {signal.outcome && signal.outcome !== 'PENDING' && (
            <Row label="Outcome" value={signal.outcome} valueColor={signal.outcome === 'WIN' ? 'var(--green-candle)' : 'var(--red-candle)'} />
          )}
        </div>
      </div>

      <div style={{ filter: locked ? 'blur(5px)' : 'none', position: 'relative' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 8 }}>AI REASONING</div>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {signal.reasons.map((r, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{r}</li>
          ))}
        </ul>
      </div>

      {locked && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'rgba(5,7,13,0.55)',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--gold-bright)' }}>Daily free signal limit reached</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upgrade to VIP for unlimited signals</div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, icon, valueColor }: { label: string; value: string; icon?: React.ReactNode; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{label}</span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: valueColor || 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}{value}
      </span>
    </div>
  );
}
