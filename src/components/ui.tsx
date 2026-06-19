import React from 'react';

export function Card({ children, style, padded = true }: { children: React.ReactNode; style?: React.CSSProperties; padded?: boolean }) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--radius-md)',
      padding: padded ? 16 : 0,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Button({
  children, onClick, variant = 'primary', full = false, disabled = false, type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  full?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))', color: '#0B0A06', border: 'none' },
    secondary: { background: 'rgba(31,111,235,0.12)', color: 'var(--blue-bright)', border: '1px solid var(--hairline-blue)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--hairline)' },
    danger: { background: 'rgba(233,69,96,0.12)', color: 'var(--red)', border: '1px solid rgba(233,69,96,0.35)' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        width: full ? '100%' : 'auto',
        padding: '11px 18px',
        borderRadius: 11,
        fontWeight: 700,
        fontSize: 14,
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.12s ease, opacity 0.12s ease',
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

export function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{label}</span>
      <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
