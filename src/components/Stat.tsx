'use client';
// ROUND 4: instrument-stat primitive — small letterspaced label ABOVE an
// oversized numeral. Fleet band hero uses the display face (Bebas); tile
// stats use the data face (DM Mono, tabular).

import { FONT, NEUTRAL } from './probeTokens';

export function Stat({
  label,
  value,
  size = 'var(--type-hero)' as number | string, // round 7: hero scale is a token
  face = 'data',
  onFill = false, // true when sitting on an accent/primary (IKB) fill
}: {
  label: string;
  value: React.ReactNode;
  size?: number | string;
  face?: 'data' | 'display';
  onFill?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT.data,
          fontSize: 'var(--type-micro)',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: onFill ? 'rgba(255,255,255,0.72)' : NEUTRAL.inkMuted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: face === 'display' ? FONT.display : FONT.data,
          fontSize: size,
          fontWeight: face === 'display' ? 400 : 500,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.05,
          color: onFill ? '#ffffff' : 'inherit', // inherits card tint (e.g. status-colored tile hero)
        }}
      >
        {value}
      </div>
    </div>
  );
}
