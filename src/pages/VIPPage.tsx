import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { Check, Crown } from 'lucide-react';

const freeFeatures = ['5 AI signals per day', 'All 5 market pairs', 'Live candlestick charts', 'Basic signal history'];
const vipFeatures = [
  'Unlimited AI signals',
  'Priority signal scanning',
  'Full reasoning breakdown on every signal',
  'Telegram instant alerts',
  'Daily & weekly performance reports',
  'Priority support',
];

export function VIPPage() {
  const { user, upgradeToVIP } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpgrade = async () => {
    setProcessing(true);
    // ── Payment integration point ──
    // Wire Paystack/Flutterwave here. Example with Paystack inline:
    // const handler = PaystackPop.setup({ key: 'pk_live_xxx', email: user.email,
    //   amount: 1500000, currency: 'NGN', onClose: () => setProcessing(false),
    //   callback: (res) => { upgradeToVIP(); setDone(true); } });
    // handler.openIframe();
    await new Promise(r => setTimeout(r, 1400));
    upgradeToVIP();
    setProcessing(false);
    setDone(true);
  };

  if (user?.plan === 'VIP') {
    return (
      <div style={{ padding: 16 }}>
        <Card style={{ textAlign: 'center', padding: 28 }}>
          <Crown size={32} color="var(--gold-bright)" style={{ margin: '0 auto 10px' }} />
          <div className="display" style={{ fontWeight: 700, fontSize: 18 }}>You're VIP</div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Unlimited signals, all features unlocked.</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Upgrade to VIP</h1>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 18px' }}>Unlock unlimited AI signals and full market analysis.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <Card>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>FREE</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>₦0</div>
          {freeFeatures.map(f => <FeatureRow key={f} text={f} muted />)}
        </Card>
        <Card style={{ border: '1px solid var(--gold)', background: 'rgba(201,161,74,0.06)' }}>
          <div style={{ fontSize: 12, color: 'var(--gold-bright)', marginBottom: 6, fontWeight: 700 }}>VIP</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>₦15,000<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/mo</span></div>
          {vipFeatures.map(f => <FeatureRow key={f} text={f} />)}
        </Card>
      </div>

      {done ? (
        <Card style={{ textAlign: 'center' }}>
          <Crown size={24} color="var(--gold-bright)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 700 }}>Welcome to VIP</div>
        </Card>
      ) : (
        <Button full onClick={handleUpgrade} disabled={processing}>
          {processing ? 'Processing payment…' : 'Upgrade with Paystack — ₦15,000/mo'}
        </Button>
      )}
      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
        Secure payment via Paystack. Cancel anytime from Settings.
      </p>
    </div>
  );
}

function FeatureRow({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 7 }}>
      <Check size={14} color={muted ? 'var(--text-muted)' : 'var(--gold-bright)'} style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 12.5, color: muted ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{text}</span>
    </div>
  );
}
