'use client';
// ROUND 30: CREW & LOG — CrewPanel + EventLog merged into one card (both
// die; renames recorded for barrel + Figma). Roster left column (roles +
// names + shared-date footer), event log right column with the 24h mode
// strip as its header (relocated from the dead voyage card — recent memory,
// same family). Crew-change events in the log tie the halves together.
// Operational facts only: no rest/sleep inference is made from roster data.

import { useState } from 'react';
import type { Mode, VesselState } from '../data/types';
import { vesselEvents, EVENT_WINDOW_24H, EVENT_WINDOW_EARLIER, type EventType } from '../data/events';
import { Field } from './Field';
import { Glyph, Label } from './Glyph';
import { ACCENT, FONT, MODE_COLOR, NEUTRAL, RADIUS } from './probeTokens';
import { gb, fmtDay } from './gb';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

const TYPES: EventType[] = ['MODE', 'CREW', 'BUNKER', 'ALERT', 'DATALINK'];
// round 21 A6: ADVISORY drops to muted ink — earned color is amber/red only
const LEVEL_COLOR: Record<string, string> = {
  WARNING: 'var(--color-alert-warning)',
  CAUTION: 'var(--color-alert-caution)',
  ADVISORY: 'var(--color-ink-muted)',
};

function stamp(t: number, now: number): string {
  return now - t < EVENT_WINDOW_24H
    ? new Date(t).toISOString().slice(11, 16) + 'Z'
    : new Date(t).toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' });
}

export function CrewLogPanel({ vessel }: { vessel: VesselState }) {
  const [earlier, setEarlier] = useState(false);
  const [hidden, setHidden] = useState<Set<EventType>>(new Set());
  const now = vessel.history.minutes.at(-1)!.t;
  const events = vesselEvents(vessel, now - (earlier ? EVENT_WINDOW_EARLIER : EVENT_WINDOW_24H))
    .filter((e) => !hidden.has(e.type));

  // round 19 dedup: whole crews rotate together — when every onboard date
  // matches, the repeated column collapses to one footer line.
  const dates = new Set(vessel.history.crew.map((c) => c.onboard_since));
  const shared = dates.size === 1 ? vessel.history.crew[0].onboard_since : null;

  // 24h mode strip (relocated from the voyage card, round 30)
  const segments: { mode: Mode; minutes: number }[] = [];
  for (const s of vessel.history.minutes) {
    const last = segments[segments.length - 1];
    if (last && last.mode === s.mode) last.minutes++;
    else segments.push({ mode: s.mode, minutes: 1 });
  }

  const chip = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? ACCENT.bright : NEUTRAL.border}`,
    background: active ? ACCENT.wash : 'transparent',
    color: active ? NEUTRAL.ink : NEUTRAL.inkMuted,
    borderRadius: RADIUS,
    padding: '0 6px',
    fontSize: 'var(--type-micro)',
    fontFamily: FONT.data,
    cursor: 'pointer',
  });

  return (
    // round 37: header floats above the fill
    <div style={{ marginBottom: 8 }}>
      <Label g="crew" headerAttrs={layer('CrewLogPanel / header / header.glyph', 'section header · crew glyph · glyph-only in expert mode', 'CREW & LOG')} style={{ marginBottom: 4 }}>crew &amp; log</Label>
      <section style={gb.box}>
      <div style={{ display: 'flex', gap: 'var(--pad-section)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* roster — operational facts only (no rest/sleep inference) */}
        <div style={{ flex: '0 1 auto', minWidth: 240 }}>
          <table style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {vessel.history.crew.map((c) => (
                <tr key={c.crew_member_id}>
                  <Field level="vessel" field="crew.roles">
                    <td {...layer('CrewLogPanel / roster / role.text', 'font/ui 13', '{crew.role}')} style={{ ...gb.boxTight, border: 'none' }}>{c.role}</td>
                  </Field>
                  <Field level="vessel" field="crew.names">
                    <td {...layer('CrewLogPanel / roster / name.text', 'font/ui 13', '{crew.name}')} style={{ ...gb.boxTight, border: 'none' }}>{c.name}</td>
                  </Field>
                  {shared === null && (
                    <Field level="vessel" field="crew.onboard_since">
                      <td style={{ ...gb.boxTight, border: 'none', color: 'var(--color-ink-muted)' }}>
                        onboard since {fmtDay(c.onboard_since)} ({Math.floor((now - c.onboard_since) / 86_400_000)}d)
                      </td>
                    </Field>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {shared !== null && (
            <Field level="vessel" field="crew.onboard_since">
              <div {...layer('CrewLogPanel / roster / since.text', 'font/data 12 · ink/muted — collapses to one footer when whole crew rotated together (round 19)', '{crew.onboard_since shared date + days}')} style={{ marginTop: 6, fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)', color: 'var(--color-ink-muted)' }}>
                all aboard since {fmtDay(shared)} · {Math.floor((now - shared) / 86_400_000)}d
              </div>
            </Field>
          )}
          <Field level="vessel" field="crew_efficiency_comparison" />
        </div>
        {/* event log — mode strip header, then filters + entries */}
        <div style={{ flex: '1 1 380px', minWidth: 0 }}>
          {/* round 32 container purge: outer border demoted — the segment
              dividers carry the structure */}
          <div {...layer('CrewLogPanel / log / modeStrip.chart', 'MODE_COLOR segments · line/subtle dividers — recent memory, same family as the log (round 30)', '{24h minute modes → segments}')} style={{ display: 'flex', width: '100%', height: 20 }}>
            {segments.map((seg, i) => (
              <div key={i} title={`${seg.mode} — ${(seg.minutes / 60).toFixed(1)} h`}
                style={{ width: `${(seg.minutes / vessel.history.minutes.length) * 100}%`, background: MODE_COLOR[seg.mode], borderRight: '1px solid var(--color-line-subtle)', overflow: 'hidden', fontSize: 'var(--type-micro)', textAlign: 'center', lineHeight: '20px', whiteSpace: 'nowrap', fontFamily: FONT.data }}>
                {seg.minutes > 120 ? seg.mode : ''}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
            <span style={{ ...gb.label, marginBottom: 0 }}>
              <Glyph name="clock" size={11} /> {earlier ? 'last 8 days' : 'last 24 h'} ({events.length})
            </span>
            <span style={{ display: 'inline-flex', gap: 4 }}>
              {TYPES.map((t) => (
                <button key={t} {...layer('CrewLogPanel / log / filter.chip', 'chip — accent when active (interaction voice)', '{event type visibility toggle}')} style={chip(!hidden.has(t))}
                  onClick={() => setHidden((h) => { const n = new Set(h); if (n.has(t)) n.delete(t); else n.add(t); return n; })}>
                  {t}
                </button>
              ))}
            </span>
          </div>
          <div style={{ fontFamily: FONT.data, fontSize: 'var(--type-context)', marginTop: 6, lineHeight: 1.7 }}>
            {events.length === 0 && <div style={{ color: NEUTRAL.inkMuted }}>no events in window</div>}
            {events.map((e, i) => (
              <div key={i} {...layer('CrewLogPanel / log / entry.text', 'font/data 12 terminal grammar · alert lines tint by level (advisory muted, A6)', '{stamp · type · text} newest first')} style={{ color: e.level ? LEVEL_COLOR[e.level] : NEUTRAL.inkSecondary, whiteSpace: 'pre' }}>
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
        </div>
      </div>
      </section>
    </div>
  );
}
