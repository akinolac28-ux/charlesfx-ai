import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, LineChart, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const items = [
  { to: '/dashboard', label: 'Terminal', Icon: LayoutDashboard },
  { to: '/history', label: 'History', Icon: History },
  { to: '/pocket-option', label: 'Pocket Option', Icon: LineChart },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export function BottomNav() {
  const { user } = useAuth();
  const navItems = user?.isAdmin ? [...items, { to: '/admin', label: 'Admin', Icon: ShieldCheck }] : items;

  return (
    <nav style={{
      position: 'sticky', bottom: 0, zIndex: 30,
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 4px calc(8px + env(safe-area-inset-bottom))',
      background: 'rgba(5,7,13,0.92)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--hairline)',
    }}>
      {navItems.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} style={({ isActive }) => ({
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '4px 10px', borderRadius: 10,
          color: isActive ? 'var(--gold-bright)' : 'var(--text-muted)',
        })}>
          <Icon size={19} />
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
