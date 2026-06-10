'use client';
// ROUND 4: instrument-stat primitive — small letterspaced label ABOVE an
// oversized numeral. Fleet band hero uses the display face (Bebas); tile
// stats use the data face (DM Mono, tabular).

import { FONT, NEUTRAL } from './probeTokens';

export function Stat({
  label,
  value,
  size = 26,
  face = 'data',
}: {
  label: string;
  value: React.ReactNode;
  size?: number;
  face?: 'data' | 'display';
}) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: NEUTRAL.inkMuted }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: face === 'display' ? FONT.display : FONT.data,
          fontSize: size,
          fontWeight: face === 'display' ? 400 : 500,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.05,
          color: NEUTRAL.ink,
        }}
      >
        {value}
      </div>
    </div>
  );
}
