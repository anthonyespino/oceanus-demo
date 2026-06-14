'use client';
// ROUND 4: instrument-stat primitive — small letterspaced label ABOVE an
// oversized numeral. Fleet band hero uses the display face (Bebas); tile
// stats use the data face (DM Mono, tabular).

import { FONT, NEUTRAL } from './probeTokens';
import { Glyph, type GlyphName } from './Glyph';

export function Stat({
  label,
  glyph,
  value,
  size = 'var(--type-hero)' as number | string, // round 7: hero scale is a token
  face = 'data',
  onFill = false, // true when sitting on an accent/primary (IKB) fill
}: {
  /** descriptor word — hidden when a `glyph` stands in for it (round 90),
      passed back ONLY in Learn mode so the name surfaces from the IA source */
  label?: string;
  /** round 90: a placeholder library glyph replaces the descriptor word in the
      label slot; greyscale/neutral, never inherits the value's status tint */
  glyph?: GlyphName;
  value: React.ReactNode;
  size?: number | string;
  face?: 'data' | 'display';
  onFill?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: FONT.data,
          fontSize: 'var(--type-micro)',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: onFill ? 'rgba(255,255,255,0.72)' : NEUTRAL.inkMuted,
        }}
      >
        {glyph && (
          <span style={{ lineHeight: 0, color: onFill ? 'rgba(255,255,255,0.72)' : NEUTRAL.inkMuted, flexShrink: 0 }}>
            <Glyph name={glyph} size={14} />
          </span>
        )}
        {label && <span>{label}</span>}
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
