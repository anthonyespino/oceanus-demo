'use client';
// ROUND 21 A5: VOYAGE — Environment + Route + ModeTimeline merged into one
// card, three tight rows: route strip · wind/wave stats (reveal holds
// current/vis/precip) · 24h mode strip. The three separate cards die.

import type { Mode, VesselState, VesselSample } from '../data/types';
import { PORTS, SITES, distanceNm, place } from '../data/fleet';
import { Field } from './Field';
import { RevealZone } from './Contextual';
import { Stat } from './Stat';
import { Glyph, Label } from './Glyph';
import { StateMark } from './StateMark';
import { ACCENT, FONT, MODE_COLOR, NEUTRAL, RADIUS } from './probeTokens';
import { gb, fmtTime } from './gb';

const mono: React.CSSProperties = { fontFamily: FONT.data, fontSize: 11 };
const node: React.CSSProperties = { width: 7, height: 7, background: NEUTRAL.inkSecondary, flexShrink: 0 };

function nearestName(s: VesselSample, places: { name: string; lat: number; lon: number }[]): string {
  const p = places.reduce((a, b) => (distanceNm(s.position, a) < distanceNm(s.position, b) ? a : b));
  return p.name;
}
function lastPort(vessel: VesselState): string | null {
  for (let i = vessel.history.minutes.length - 1; i >= 0; i--) {
    const s = vessel.history.minutes[i];
    if (s.mode === 'PORT') return nearestName(s, PORTS);
  }
  return null;
}

export function VoyagePanel({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!;
  const mode = vessel.derived.mode;
  const calls = vessel.history.nextPortCalls;
  const next = calls[0];
  const wx = now.weather;
  const stale = vessel.derived.staleness.weather === 'STALE';
  const nameStyle: React.CSSProperties = { ...mono, minWidth: 0, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  // route row
  let routeRow: React.ReactNode;
  if (mode === 'PORT') {
    routeRow = (
      <div style={mono}>
        MOORED — {nearestName(now, PORTS)} <StateMark port={nearestName(now, PORTS)} />
        {next && <span style={{ color: NEUTRAL.inkMuted }}> · next call {next.port} ETA {fmtTime(next.eta)}</span>}
      </div>
    );
  } else if (mode === 'STATION' || mode === 'STANDBY') {
    routeRow = (
      <div style={mono}>
        {mode === 'STATION' ? 'ON STATION' : 'STANDBY'} — {nearestName(now, SITES)}
        {next && <span style={{ color: NEUTRAL.inkMuted }}> · next call {next.port} ETA {fmtTime(next.eta)}</span>}
      </div>
    );
  } else {
    const from = lastPort(vessel);
    const toGoNm = next ? distanceNm(now.position, place(next.port)) : null;
    const frac =
      from && next
        ? Math.min(1, Math.max(0, distanceNm(place(from), now.position) / Math.max(1, distanceNm(place(from), place(next.port)))))
        : null;
    routeRow = (
      <div>
        {toGoNm !== null && (
          <div style={{ ...mono, fontSize: 10, color: NEUTRAL.inkMuted, textAlign: 'right', marginBottom: 4 }}>
            {toGoNm.toFixed(0)} NM TO GO{calls[1] ? ` · then ${calls[1].port}` : ''}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(56px, auto) 1fr minmax(56px, auto)', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={node} />
            <span style={{ ...nameStyle, color: NEUTRAL.inkSecondary }}>{from ?? 'UNDERWAY >24H'}</span>
            {from && <StateMark port={from} />}
          </div>
          <div style={{ height: 6, background: NEUTRAL.surfaceDim, borderRadius: RADIUS, position: 'relative', minWidth: 60 }}>
            {frac !== null && (
              <div style={{ position: 'absolute', inset: 0, width: `${(frac * 100).toFixed(1)}%`, background: ACCENT.primary, borderRadius: RADIUS }} />
            )}
            {frac !== null && (
              <div style={{ position: 'absolute', top: -2, left: `calc(${(frac * 100).toFixed(1)}% - 5px)`, width: 10, height: 10, background: NEUTRAL.ink }} />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, justifyContent: 'flex-end' }}>
            <span style={node} />
            <span style={nameStyle}>{next?.port ?? '—'}</span>
            {next && <StateMark port={next.port} />}
            {next && (
              <span style={{ ...mono, color: NEUTRAL.inkMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>ETA {fmtTime(next.eta)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // mode strip (24h)
  const segments: { mode: Mode; minutes: number }[] = [];
  for (const s of vessel.history.minutes) {
    const last = segments[segments.length - 1];
    if (last && last.mode === s.mode) last.minutes++;
    else segments.push({ mode: s.mode, minutes: 1 });
  }

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <RevealZone
        reveal={
          <Field level="vessel" field="weather.current" revealed>
            <span>current {wx.current_kn} kn · visibility {wx.visibility_nm} nm · {wx.precip}</span>
          </Field>
        }
      >
        <Label g="route">voyage</Label>
        <Field level="vessel" field="next_port_calls">{routeRow}</Field>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginTop: 'var(--pad-section)', ...(stale ? gb.stale : {}) }}>
          <Field level="vessel" field="weather.wind">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Glyph name="wind" size={16} />
              <Stat label="wind" value={`${wx.wind_speed_kn} kn`} size={22} />
            </span>
          </Field>
          <Field level="vessel" field="weather.waves">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Glyph name="wave" size={16} />
              <Stat label="waves" value={`${wx.wave_height_ft} ft`} size={22} />
            </span>
          </Field>
          {stale && <span style={{ ...mono, color: 'var(--color-data-stale)' }}>[STALE] last received {fmtTime(vessel.history.timestamps.weather)}</span>}
        </div>
        <div style={{ display: 'flex', width: '100%', border: '1px solid var(--color-line-subtle)', height: 20, marginTop: 'var(--pad-section)' }}>
          {segments.map((seg, i) => (
            <div key={i} title={`${seg.mode} — ${(seg.minutes / 60).toFixed(1)} h`}
              style={{ width: `${(seg.minutes / vessel.history.minutes.length) * 100}%`, background: MODE_COLOR[seg.mode], borderRight: '1px solid var(--color-line-subtle)', overflow: 'hidden', fontSize: 9, textAlign: 'center', lineHeight: '20px', whiteSpace: 'nowrap', fontFamily: FONT.data }}>
              {seg.minutes > 120 ? seg.mode : ''}
            </div>
          ))}
        </div>
      </RevealZone>
    </section>
  );
}
