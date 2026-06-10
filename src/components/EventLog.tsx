'use client';
// ROUND 5: vessel event log — terminal aesthetic, DM Mono, newest first.
// Last 24h by default, "earlier" extends to 8 days. Filter chips by type.
// Alert lines tint with their status color; everything else ink/secondary.

import { useState } from 'react';
import type { VesselState } from '../data/types';
import { vesselEvents, EVENT_WINDOW_24H, EVENT_WINDOW_EARLIER, type EventType } from '../data/events';
import { ACCENT, FONT, NEUTRAL, RADIUS } from './probeTokens';
import { gb } from './gb';

const TYPES: EventType[] = ['MODE', 'CREW', 'BUNKER', 'ALERT', 'DATALINK'];
const LEVEL_COLOR: Record<string, string> = {
  WARNING: 'var(--color-alert-warning)',
  CAUTION: 'var(--color-alert-caution)',
  ADVISORY: 'var(--color-alert-advisory)',
};

function stamp(t: number, now: number): string {
  return now - t < EVENT_WINDOW_24H
    ? new Date(t).toISOString().slice(11, 16) + 'Z'
    : new Date(t).toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' });
}

export function EventLog({ vessel }: { vessel: VesselState }) {
  const [open, setOpen] = useState(true);
  const [earlier, setEarlier] = useState(false);
  const [hidden, setHidden] = useState<Set<EventType>>(new Set());
  const now = vessel.history.minutes.at(-1)!.t;
  const events = vesselEvents(vessel, now - (earlier ? EVENT_WINDOW_EARLIER : EVENT_WINDOW_24H))
    .filter((e) => !hidden.has(e.type));

  const chip = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? ACCENT.bright : NEUTRAL.border}`,
    background: active ? ACCENT.wash : 'transparent',
    color: active ? NEUTRAL.ink : NEUTRAL.inkMuted,
    borderRadius: RADIUS,
    padding: '0 6px',
    fontSize: 10,
    fontFamily: FONT.data,
    cursor: 'pointer',
  });

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ ...gb.label, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {open ? '▾' : '▸'} event log — {earlier ? 'last 8 days' : 'last 24 h'} ({events.length})
        </button>
        {open && (
          <span style={{ display: 'inline-flex', gap: 4 }}>
            {TYPES.map((t) => (
              <button key={t} style={chip(!hidden.has(t))}
                onClick={() => setHidden((h) => { const n = new Set(h); if (n.has(t)) n.delete(t); else n.add(t); return n; })}>
                {t}
              </button>
            ))}
          </span>
        )}
      </div>
      {open && (
        <div style={{ fontFamily: FONT.data, fontSize: 12, marginTop: 6, lineHeight: 1.7 }}>
          {events.length === 0 && <div style={{ color: NEUTRAL.inkMuted }}>no events in window</div>}
          {events.map((e, i) => (
            <div key={i} style={{ color: e.level ? LEVEL_COLOR[e.level] : NEUTRAL.inkSecondary, whiteSpace: 'pre' }}>
              {stamp(e.t, now).padEnd(8)}{e.type.padEnd(10)}{e.text}
            </div>
          ))}
          {!earlier && (
            <button onClick={() => setEarlier(true)}
              style={{ ...chip(false), marginTop: 6, color: ACCENT.bright, borderColor: NEUTRAL.border }}>
              load earlier ↓
            </button>
          )}
        </div>
      )}
    </section>
  );
}
