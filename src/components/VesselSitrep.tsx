'use client';
// ROUND 7: reserved slot at the top of the inspector. The real component gets
// designed in Figma (round 8) and templated in code after — this is a static
// two-line placeholder holding the room, styled like the UNDEFINED grammar.

import { FONT, NEUTRAL, RADIUS } from './probeTokens';

export function VesselSitrep() {
  return (
    <section
      style={{
        border: '1px dashed var(--color-line-strong)',
        background: 'var(--color-surface-raised)',
        borderRadius: RADIUS,
        padding: 'var(--pad-section)',
        marginBottom: 8,
        fontFamily: FONT.data,
        fontSize: 12,
        color: NEUTRAL.inkMuted,
      }}
    >
      <div>VESSELSITREP — reserved slot</div>
      <div>two-line situation report · designed in Figma tomorrow, templated in code after</div>
    </section>
  );
}
