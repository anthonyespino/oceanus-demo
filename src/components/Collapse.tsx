'use client';
// ROUND 21 B3: collapsible inspector panels. Minimized = header row + ONE
// summary stat. State persists per vessel for the session (FleetProvider).
// The chevron is the round 17 control glyph pair — same geometry language.

import { useFleet } from '../state/FleetProvider';
import { Glyph, Label, type GlyphName } from './Glyph';
import { NEUTRAL, RADIUS } from './probeTokens';
import { gb } from './gb';

export function Collapse({
  k,
  glyph,
  title,
  summary,
  children,
}: {
  k: string; // `${vesselId}:${panelId}`
  glyph: GlyphName;
  title: string;
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  const { collapsedPanels, togglePanel } = useFleet();
  const min = !!collapsedPanels[k];
  const btn: React.CSSProperties = {
    background: NEUTRAL.surfaceDim, border: '1px solid var(--color-line-strong)',
    borderRadius: RADIUS, padding: 2, cursor: 'pointer', color: NEUTRAL.inkSecondary, lineHeight: 0,
  };
  if (min) {
    return (
      <section style={{ ...gb.box, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 'var(--pad-section)', paddingBottom: 'var(--pad-section)' }}>
        <Label g={glyph} style={{ marginBottom: 0 }}>{title}</Label>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: NEUTRAL.inkSecondary, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {summary}
        </span>
        <button aria-label={`expand ${title}`} style={btn} onClick={() => togglePanel(k)}>
          <Glyph name="expand" size={12} />
        </button>
      </section>
    );
  }
  return (
    <div style={{ position: 'relative' }}>
      <button aria-label={`minimize ${title}`} style={{ ...btn, position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={() => togglePanel(k)}>
        <Glyph name="collapse" size={12} />
      </button>
      {children}
    </div>
  );
}
