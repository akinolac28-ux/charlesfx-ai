import React from 'react';
import { Logo } from '@/components/Logo';
import { Bell, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export function Header() {
  const { user } = useAuth();
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: '1px solid var(--hairline)',
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(5,7,13,0.85)',
      backdropFilter: 'blur(10px)',
    }}>
      <Link to="/dashboard"><Logo size={30} /></Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user && (
          <Link to="/vip" style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 999,
            border: user.plan === 'VIP' ? '1px solid var(--gold)' : '1px solid var(--hairline-blue)',
            background: user.plan === 'VIP' ? 'rgba(201,161,74,0.12)' : 'transparent',
            fontSize: 11.5, fontWeight: 700, color: user.plan === 'VIP' ? 'var(--gold-bright)' : 'var(--blue-bright)',
          }}>
            <Crown size={13} />
            {user.plan === 'VIP' ? 'VIP' : 'FREE'}
          </Link>
        )}
        <Link to="/notifications" aria-label="Notifications" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: 10, border: '1px solid var(--hairline)',
        }}>
          <Bell size={16} color="var(--text-secondary)" />
        </Link>
      </div>
    </header>
  );
}
