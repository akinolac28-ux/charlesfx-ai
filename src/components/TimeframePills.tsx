import React from 'react';
import { TIMEFRAMES } from '@/data/assets';
import { Timeframe } from '@/types';

export function TimeframePills({ active, onChange }: { active: Timeframe; onChange: (t: Timeframe) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {TIMEFRAMES.map(tf => {
        const isActive = tf.value === active;
        return (
          <button
            key={tf.value}
            onClick={() => onChange(tf.value)}
            className="mono"
            style={{
              padding: '6px 13px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              border: isActive ? '1px solid var(--gold)' : '1px solid var(--hairline)',
              background: isActive ? 'rgba(201,161,74,0.14)' : 'transparent',
              color: isActive ? 'var(--gold-bright)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {tf.label}
          </button>
        );
      })}
    </div>
  );
}
