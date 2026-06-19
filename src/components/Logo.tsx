import React from 'react';

export function Logo({ size = 32, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="22" fill="#0B1020" />
        <rect width="100" height="100" rx="22" stroke="#C9A14A" strokeOpacity="0.35" strokeWidth="1.5" />
        <path
          d="M22 66 L40 40 L56 54 L78 24"
          stroke="#C9A14A"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="78" cy="24" r="5.5" fill="#1F6FEB" />
        <path d="M22 66 L40 40 L56 54 L78 24" stroke="#1F6FEB" strokeOpacity="0.25" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {withWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.42, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Charles<span style={{ color: 'var(--gold)' }}>FX</span>
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: size * 0.19, color: 'var(--blue-bright)', letterSpacing: '0.18em' }}>
            AI TERMINAL
          </span>
        </div>
      )}
    </div>
  );
}
