'use client';
// Operations bucket (§6) — ROUND 5: voyage progress strip. In TRANSIT, a
// linear last-port ──●── next-port strip filled by great-circle fraction
// (accent fill — progress is identity, not health). In PORT it collapses to
// MOORED; on STATION/STANDBY it names the anchor point — no fake progress
// toward a port the vessel isn't sailing to.

import type { VesselState, VesselSample } from '../data/types';
import { PORTS, SITES, distanceNm, place } from '../data/fleet';
import { Field } from './Field';
import { ACCENT, FONT, NEUTRAL, RADIUS } from './probeTokens';
import { gb, fmtTime } from './gb';

function nearestName(s: VesselSample, places: { name: string; lat: number; lon: number }[]): string {
  const p = places.reduce((a, b) => (distanceNm(s.position, a) < distanceNm(s.position, b) ? a : b));
  return p.name;
}

/** Departure port: last PORT-mode sample in the 24h window, else unknown. */
function lastPort(vessel: VesselState): string | null {
  for (let i = vessel.history.minutes.length - 1; i >= 0; i--) {
    const s = vessel.history.minutes[i];
    if (s.mode === 'PORT') return nearestName(s, PORTS);
  }
  return null;
}

const mono: React.CSSProperties = { fontFamily: FONT.data, fontSize: 11 };
const node: React.CSSProperties = { width: 7, height: 7, background: NEUTRAL.inkSecondary, flexShrink: 0 };

export function RoutePanel({ vessel }: { vessel: VesselState }) {
  const now = vessel.history.minutes.at(-1)!;
  const mode = vessel.derived.mode;
  const calls = vessel.history.nextPortCalls;
  const next = calls[0];

  let body: React.ReactNode;
  if (mode === 'PORT') {
    body = (
      <div style={mono}>
        MOORED — {nearestName(now, PORTS)}
        {next && <span style={{ color: NEUTRAL.inkMuted }}> · next call {next.port} ETA {fmtTime(next.eta)}</span>}
      </div>
    );
  } else if (mode === 'STATION' || mode === 'STANDBY') {
    body = (
      <div style={mono}>
        {mode === 'STATION' ? 'ON STATION' : 'STANDBY'} — {nearestName(now, SITES)}
        {next && <span style={{ color: NEUTRAL.inkMuted }}> · next call {next.port} ETA {fmtTime(next.eta)}</span>}
      </div>
    );
  } else {
    const from = lastPort(vessel);
    const frac =
      from && next
        ? Math.min(1, Math.max(0, distanceNm(place(from), now.position) /
            Math.max(1, distanceNm(place(from), place(next.port)))))
        : null;
    body = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={node} />
        <span style={{ ...mono, color: NEUTRAL.inkSecondary, whiteSpace: 'nowrap' }}>{from ?? 'UNDERWAY >24H'}</span>
        <div style={{ flex: 1, height: 6, background: NEUTRAL.surfaceDim, borderRadius: RADIUS, position: 'relative' }}>
          {frac !== null && (
            <div style={{ position: 'absolute', inset: 0, width: `${(frac * 100).toFixed(1)}%`, background: ACCENT.primary, borderRadius: RADIUS }} />
          )}
          {frac !== null && (
            <div style={{ position: 'absolute', top: -2, left: `calc(${(frac * 100).toFixed(1)}% - 5px)`, width: 10, height: 10, background: NEUTRAL.ink }} />
          )}
          {frac === null && next && (
            <div style={{ ...mono, position: 'absolute', inset: 0, textAlign: 'center', color: NEUTRAL.inkMuted, lineHeight: '6px' }}>
              {distanceNm(now.position, place(next.port)).toFixed(0)} NM TO GO
            </div>
          )}
        </div>
        {next && (
          <>
            <span style={node} />
            <span style={{ ...mono, whiteSpace: 'nowrap' }}>
              {next.port} <span style={{ color: NEUTRAL.inkMuted }}>ETA {fmtTime(next.eta)}</span>
            </span>
          </>
        )}
        {calls[1] && (
          <span style={{ ...mono, color: NEUTRAL.inkMuted, whiteSpace: 'nowrap' }}>→ {calls[1].port}</span>
        )}
      </div>
    );
  }

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>route & ports — voyage progress</div>
      <Field level="vessel" field="next_port_calls">{body}</Field>
      <div style={{ marginTop: 6 }}>
        <Field level="vessel" field="heading_deg" />
      </div>
    </section>
  );
}
