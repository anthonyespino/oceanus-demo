'use client';
// ROUND 26: in-card fuel view switcher — glyph buttons in the fuel card
// header (left of the collapse chevron). Active view's glyph in accent
// (interaction voice). The dev-panel fuel toggles retired in favor of this;
// all views stay shippable pending verdict 11.

import { useFleet, type TankStyle } from '../state/FleetProvider';
import { Glyph, type GlyphName } from './Glyph';
import { ACCENT, NEUTRAL, RADIUS } from './probeTokens';

const VIEWS: { v: TankStyle; g: GlyphName; label: string }[] = [
  { v: 'synoptic', g: 'vessel', label: 'synoptic view' },
  { v: 'bars', g: 'tank', label: 'schematic view' },
  { v: 'dots', g: 'dots', label: 'dot matrix view' },
];

export function FuelViewSwitch() {
  const { tankStyle, setTankStyle } = useFleet();
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {VIEWS.map(({ v, g, label }) => {
        const active = tankStyle === v || (v === 'bars' && tankStyle === 'dots' && false);
        return (
          <button
            key={v}
            aria-label={label}
            onClick={(e) => { e.stopPropagation(); setTankStyle(v); }}
            style={{
              background: active ? ACCENT.wash : 'none',
              border: `1px solid ${active ? ACCENT.bright : 'transparent'}`,
              borderRadius: RADIUS,
              padding: 2,
              cursor: 'pointer',
              lineHeight: 0,
              color: active ? ACCENT.bright : NEUTRAL.inkMuted,
            }}
          >
            <Glyph name={g} size={13} />
          </button>
        );
      })}
    </span>
  );
}
