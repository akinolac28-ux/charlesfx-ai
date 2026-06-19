import React from 'react';
import { SignalDirection } from '@/types';

const directionColor: Record<SignalDirection, string> = {
  CALL: 'var(--green-candle)',
  PUT: 'var(--red-candle)',
  WAIT: 'var(--blue-bright)',
};

export function ConfidenceGauge({ confidence, direction, size = 132 }: { confidence: number; direction: SignalDirection; size?: number }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;
  const color = directionColor[direction];

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={9} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={9}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease', filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="mono" style={{ fontSize: size * 0.26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {confidence}%
        </span>
        <span style={{ fontSize: size * 0.085, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 4, fontFamily: 'var(--font-body)' }}>
          CONFIDENCE
        </span>
      </div>
    </div>
  );
}
