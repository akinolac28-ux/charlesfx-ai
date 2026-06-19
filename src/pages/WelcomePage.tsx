import React from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, ShieldCheck, Zap, BarChart3, Bell } from 'lucide-react';

const features = [
  { Icon: Brain, title: 'AI Market Analysis', desc: 'RSI, MACD, EMA 20/50/200, Bollinger Bands, support/resistance, and candlestick patterns scored together into one decision.' },
  { Icon: Activity, title: 'Live Scanner', desc: 'Five major pairs continuously scanned, with confidence-scored CALL, PUT, or WAIT calls refreshed in real time.' },
  { Icon: BarChart3, title: 'Performance Tracking', desc: 'Every signal logged with outcome, win rate, and daily and weekly performance reporting.' },
  { Icon: Bell, title: 'Instant Alerts', desc: 'Telegram alerts, browser push notifications, and sound cues the moment a new signal fires.' },
  { Icon: ShieldCheck, title: 'Built for Pocket Option', desc: 'A dedicated trading companion view designed to sit alongside your Pocket Option terminal.' },
  { Icon: Zap, title: 'Fast, Mobile-First', desc: 'A premium terminal that runs smoothly on a phone — built for traders without a desktop.' },
];

export function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px' }}>
        <Logo size={30} />
        <button onClick={() => navigate('/login')} style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>
          Log in
        </button>
      </header>

      <main style={{ flex: 1, padding: '28px 20px 40px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
          border: '1px solid var(--hairline-blue)', background: 'rgba(31,111,235,0.08)',
          fontSize: 12, color: 'var(--blue-bright)', fontWeight: 600, marginBottom: 18,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-bright)', animation: 'pulse-glow 2s infinite' }} />
          AI scanning EUR/USD, GBP/USD, USD/JPY, GBP/JPY, XAU/USD
        </div>

        <h1 className="display" style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em', margin: 0 }}>
          The AI terminal that reads the market before you trade it.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 14 }}>
          Charles FX AI studies live price action across RSI, MACD, EMA trend stacks, Bollinger Bands, and candlestick structure
          to surface CALL, PUT, or WAIT calls — with a confidence score and the reasoning behind every signal.
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <Button onClick={() => navigate('/register')}>Start Free — 5 Signals Daily</Button>
          <Button variant="ghost" onClick={() => navigate('/login')}>I already have an account</Button>
        </div>

        <div style={{
          marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14,
        }}>
          {features.map(({ Icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--panel)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-md)', padding: 18,
              animation: 'fadeUp 0.5s ease',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(201,161,74,0.12)', marginBottom: 12,
              }}>
                <Icon size={18} color="var(--gold-bright)" />
              </div>
              <div className="display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 32, padding: 16, borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(233,69,96,0.25)', background: 'rgba(233,69,96,0.06)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)', marginBottom: 4 }}>Risk disclaimer</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Charles FX AI provides market analysis and signals only. It does not execute trades and does not guarantee profits.
            Binary options trading carries significant financial risk — only trade with money you can afford to lose.
          </p>
        </div>
      </main>
    </div>
  );
}
