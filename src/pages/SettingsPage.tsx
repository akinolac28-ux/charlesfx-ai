import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { Bell, Volume2, Send, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 44, height: 26, borderRadius: 999, border: 'none', padding: 3,
      background: checked ? 'var(--gold)' : 'rgba(255,255,255,0.12)',
      display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start',
      transition: 'background 0.2s ease',
    }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#0B0A06', display: 'block' }} />
    </button>
  );
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [browserNotif, setBrowserNotif] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [telegram, setTelegram] = useState(false);
  const [telegramHandle, setTelegramHandle] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ padding: 16 }}>
      <h1 className="display" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Settings</h1>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Account</div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</div>
        <div style={{ marginTop: 6, fontSize: 12.5, color: user?.plan === 'VIP' ? 'var(--gold-bright)' : 'var(--blue-bright)', fontWeight: 700 }}>
          {user?.plan} plan
        </div>
      </Card>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: '4px 0 10px' }}>Notifications</div>
      <Card style={{ marginBottom: 10 }}>
        <Row icon={<Bell size={16} color="var(--blue-bright)" />} label="Browser notifications" sub="Get alerted the moment a new signal fires">
          <Toggle checked={browserNotif} onChange={setBrowserNotif} />
        </Row>
      </Card>
      <Card style={{ marginBottom: 10 }}>
        <Row icon={<Volume2 size={16} color="var(--blue-bright)" />} label="Sound alerts" sub="Play a sound cue on new signals">
          <Toggle checked={soundAlerts} onChange={setSoundAlerts} />
        </Row>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Row icon={<Send size={16} color="var(--blue-bright)" />} label="Telegram alerts" sub="Send signals to your Telegram">
          <Toggle checked={telegram} onChange={setTelegram} />
        </Row>
        {telegram && (
          <input
            placeholder="@yourtelegramhandle"
            value={telegramHandle}
            onChange={e => setTelegramHandle(e.target.value)}
            style={{
              marginTop: 12, width: '100%', padding: '10px 12px', borderRadius: 9,
              border: '1px solid var(--hairline)', background: 'var(--elevated)', color: 'var(--text-primary)', fontSize: 13.5,
            }}
          />
        )}
      </Card>

      <Button full variant="danger" onClick={handleLogout}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <LogOut size={15} /> Log out
        </span>
      </Button>
    </div>
  );
}

function Row({ icon, label, sub, children }: { icon: React.ReactNode; label: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(31,111,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}
