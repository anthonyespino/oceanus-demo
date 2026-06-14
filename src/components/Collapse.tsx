'use client';
// ROUND 21 B3: collapsible inspector panels. Minimized = header row + ONE
// summary stat. State persists per vessel for the session (FleetProvider).
// The chevron is the round 17 control glyph pair — same geometry language.

import { useFleet } from '../state/FleetProvider';
import { Glyph, Label, type GlyphName } from './Glyph';
import { NEUTRAL, RADIUS, ALERT_TEXT_COLOR, FONT } from './probeTokens';
import { gb } from './gb';
import type { Alert } from '../data/types';

// ROUND 100: a docked alert reads as THIS panel's alert — it sits at the top of
// the panel (collapsed header or expanded content), [LEVEL] tag in its earned
// color (CAUTION gold), message at the context tier. Compact, one line each, so
// it never bloats the header; severity stays visible even when the panel is
// collapsed.
function DockedAlerts({ alerts }: { alerts?: Alert[] }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{ fontFamily: FONT.data, fontSize: 'var(--type-context)', lineHeight: 1.4, color: NEUTRAL.inkSecondary }}>
          <span style={{ color: ALERT_TEXT_COLOR[a.level] }}>[{a.level}]</span> {a.message}
        </div>
      ))}
    </div>
  );
}

export function Collapse({
  k,
  glyph,
  title,
  summary,
  alerts,
  children,
}: {
  k: string; // `${vesselId}:${panelId}`
  glyph: GlyphName;
  title: string;
  summary: React.ReactNode;
  /** round 100: alerts routed to THIS panel (docked to its header) */
  alerts?: Alert[];
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
      <section data-panel={k} style={{ ...gb.box, marginBottom: 8, paddingTop: 'var(--pad-section)', paddingBottom: 'var(--pad-section)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Label g={glyph} style={{ marginBottom: 0 }}>{title}</Label>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)', color: NEUTRAL.inkSecondary, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {summary}
          </span>
          <button aria-label={`expand ${title}`} style={btn} onClick={() => togglePanel(k)}>
            <Glyph name="expand" size={12} />
          </button>
        </div>
        {/* round 100: alert stays visible even when the panel is collapsed */}
        <DockedAlerts alerts={alerts} />
      </section>
    );
  }
  return (
    <div data-panel={k} style={{ position: 'relative' }}>
      <button aria-label={`minimize ${title}`} style={{ ...btn, position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={() => togglePanel(k)}>
        <Glyph name="collapse" size={12} />
      </button>
      {/* round 100: docked alert sits at the top of the panel, above its header,
          reading as this panel's alert (the panel below is its evidence) */}
      <DockedAlerts alerts={alerts} />
      {children}
    </div>
  );
}
