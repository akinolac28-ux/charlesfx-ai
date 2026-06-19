import React, { useEffect, useState } from 'react';
import { Card, StatPill, Button } from '@/components/ui';
import { ApiKeyConfig, AssetToggle, UserAccount } from '@/types';
import { ASSETS } from '@/data/assets';
import { Eye, EyeOff, Plus, Users, Activity, KeyRound } from 'lucide-react';

const initialApiKeys: ApiKeyConfig[] = [
  { id: '1', providerLabel: 'TwelveData (Forex)', category: 'forex', keyMasked: '••••••••3F2A', active: true, updatedAt: Date.now() },
  { id: '2', providerLabel: 'Binance (Crypto)', category: 'crypto', keyMasked: '••••••••91CD', active: false, updatedAt: Date.now() },
  { id: '3', providerLabel: 'TradingView Charting', category: 'charting', keyMasked: '••••••••7B11', active: true, updatedAt: Date.now() },
  { id: '4', providerLabel: 'Telegram Bot Token', category: 'telegram', keyMasked: '••••••••AA02', active: false, updatedAt: Date.now() },
  { id: '5', providerLabel: 'Paystack Secret Key', category: 'payments', keyMasked: '••••••••PSK9', active: true, updatedAt: Date.now() },
];

function loadAllUsers(): UserAccount[] {
  try {
    const raw = JSON.parse(localStorage.getItem('charlesfx_users_v1') || '{}');
    return Object.values(raw).map((u: any) => ({ ...u, password: undefined }));
  } catch { return []; }
}

export function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'users' | 'apikeys' | 'assets'>('overview');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(initialApiKeys);
  const [assetToggles, setAssetToggles] = useState<AssetToggle[]>(ASSETS.map(a => ({ symbol: a.symbol, enabled: true })));
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => { setUsers(loadAllUsers()); }, []);

  const vipCount = users.filter(u => u.plan === 'VIP').length;

  return (
    <div style={{ padding: 16 }}>
      <h1 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Admin Dashboard</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Owner controls for Charles FX AI</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
        {(['overview', 'users', 'apikeys', 'assets'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, flexShrink: 0,
            border: tab === t ? '1px solid var(--gold)' : '1px solid var(--hairline)',
            background: tab === t ? 'rgba(201,161,74,0.12)' : 'transparent',
            color: tab === t ? 'var(--gold-bright)' : 'var(--text-secondary)',
            textTransform: 'capitalize',
          }}>
            {t === 'apikeys' ? 'API Keys' : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <Card><StatPill label="Total users" value={String(users.length)} /></Card>
            <Card><StatPill label="VIP subscribers" value={String(vipCount)} color="var(--gold-bright)" /></Card>
            <Card><StatPill label="Active assets" value={`${assetToggles.filter(a => a.enabled).length}/${assetToggles.length}`} /></Card>
            <Card><StatPill label="Active API keys" value={`${apiKeys.filter(k => k.active).length}/${apiKeys.length}`} color="var(--blue-bright)" /></Card>
          </div>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Activity size={15} color="var(--blue-bright)" />
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>Site health</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
              Signal engine running on simulated data. Connect a live market data provider from the API Keys tab when ready.
            </p>
          </Card>
        </div>
      )}

      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.length === 0 ? (
            <Card><p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>No registered users yet.</p></Card>
          ) : users.map(u => (
            <Card key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name} {u.isAdmin && <span style={{ color: 'var(--blue-bright)', fontSize: 11 }}>(admin)</span>}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
              <span style={{
                fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                color: u.plan === 'VIP' ? 'var(--gold-bright)' : 'var(--text-muted)',
                background: u.plan === 'VIP' ? 'rgba(201,161,74,0.12)' : 'rgba(255,255,255,0.05)',
              }}>{u.plan}</span>
            </Card>
          ))}
        </div>
      )}

      {tab === 'apikeys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {apiKeys.map(k => (
            <Card key={k.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <KeyRound size={13} color="var(--text-muted)" />
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{k.providerLabel}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {revealedKey === k.id ? 'sk_live_8x91Hf...m3qP' : k.keyMasked}
                    <button onClick={() => setRevealedKey(revealedKey === k.id ? null : k.id)}>
                      {revealedKey === k.id ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
                <button onClick={() => setApiKeys(prev => prev.map(p => p.id === k.id ? { ...p, active: !p.active } : p))} style={{
                  fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 999,
                  border: `1px solid ${k.active ? 'rgba(22,199,132,0.4)' : 'var(--hairline)'}`,
                  color: k.active ? 'var(--green-candle)' : 'var(--text-muted)',
                  background: k.active ? 'rgba(22,199,132,0.08)' : 'transparent',
                }}>
                  {k.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </Card>
          ))}
          <Button variant="ghost" full>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Plus size={15} /> Add new API key
            </span>
          </Button>
        </div>
      )}

      {tab === 'assets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {assetToggles.map(t => {
            const meta = ASSETS.find(a => a.symbol === t.symbol)!;
            return (
              <Card key={t.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{meta.label}</span>
                <button onClick={() => setAssetToggles(prev => prev.map(p => p.symbol === t.symbol ? { ...p, enabled: !p.enabled } : p))} style={{
                  width: 44, height: 26, borderRadius: 999, padding: 3,
                  background: t.enabled ? 'var(--gold)' : 'rgba(255,255,255,0.12)',
                  display: 'flex', justifyContent: t.enabled ? 'flex-end' : 'flex-start',
                }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#0B0A06', display: 'block' }} />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
