'use client';
// ROUND 6 — final probe component. 72h port-calls board: one row per port
// with a scheduled arrival (or a currently-moored vessel), blocks positioned
// on a NOW → +72h axis. Ports and ETAs only — no berths, no delay statuses,
// no congestion invention; the generator doesn't know those things.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { vesselStatus, ENDURANCE_RESERVE } from '../data/alerts';
import { PORTS, distanceNm } from '../data/fleet';
import { HOUR_MS } from '../data/rng';
import type { ColorTreatment } from '../state/FleetProvider';
import { useContentWidth } from './NauticalChart';
import { Field } from './Field';
import { ACCENT, FONT, NEUTRAL, RADIUS, STATUS_COLOR } from './probeTokens';
import { gb } from './gb';

const WINDOW_H = 72;
const LABEL_W = 150;
const LANE_H = 24;

export interface Block {
  vessel: VesselState;
  port: string;
  etaMs: number | null; // null = moored now
  bunker: boolean;
}

export function collectBlocks(fleet: VesselState[], now: number, windowH = WINDOW_H): Block[] {
  const blocks: Block[] = [];
  for (const v of fleet) {
    if (v.derived.mode === 'PORT') {
      // moored vessels pin at NOW under their current port
      const s = v.history.minutes.at(-1)!;
      blocks.push({ vessel: v, port: nearestPortName(s.position), etaMs: null, bunker: false });
      continue;
    }
    for (const call of v.history.nextPortCalls) {
      const hoursOut = (call.eta - now) / HOUR_MS;
      if (hoursOut < 0 || hoursOut > windowH) continue;
      // BUNKER flag: same reserve constant as the ENDURANCE alert.
      const bunker = v.derived.endurance_hours < hoursOut * ENDURANCE_RESERVE;
      blocks.push({ vessel: v, port: call.port, etaMs: call.eta, bunker });
    }
  }
  return blocks;
}

function nearestPortName(pos: { lat: number; lon: number }): string {
  return PORTS.reduce((a, b) => (distanceNm(pos, a) < distanceNm(pos, b) ? a : b)).name;
}

export function PortCallsTimeline({ fleet, treatment }: { fleet: VesselState[]; treatment: ColorTreatment }) {
  const [wrapRef, w] = useContentWidth(1100);
  const now = fleet[0].history.minutes.at(-1)!.t;
  const blocks = collectBlocks(fleet, now);

  // Rows: ports sorted by soonest arrival (moored = now).
  const byPort = new Map<string, Block[]>();
  for (const b of blocks) {
    let arr = byPort.get(b.port);
    if (!arr) byPort.set(b.port, (arr = []));
    arr.push(b);
  }
  const rows = [...byPort.entries()]
    .map(([port, bs]) => ({ port, bs: bs.sort((a, b) => (a.etaMs ?? now) - (b.etaMs ?? now)) }))
    .sort((a, b) => (a.bs[0].etaMs ?? now) - (b.bs[0].etaMs ?? now));

  const plotW = Math.max(100, w - LABEL_W);
  const x = (t: number) => Math.min(0.97, Math.max(0, (t - now) / (WINDOW_H * HOUR_MS))) * plotW;
  const mono: React.CSSProperties = { fontFamily: FONT.data, fontSize: 11 };

  return (
    <section id="port-calls" style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>port calls — next 72 h</div>
      <Field level="fleet" field="port_calls_timeline">
        <div ref={wrapRef} style={{ position: 'relative' }}>
          {/* axis header */}
          <div style={{ display: 'flex', marginLeft: LABEL_W, position: 'relative', height: 16 }}>
            {[12, 24, 36, 48, 60, 72].map((h) => (
              <span key={h} style={{ ...mono, fontSize: 9, color: NEUTRAL.inkMuted, position: 'absolute', left: x(now + h * HOUR_MS) - 10 }}>
                +{h}H
              </span>
            ))}
          </div>
          {rows.length === 0 && (
            <div style={{ ...mono, color: NEUTRAL.inkMuted, padding: '10px 0 6px' }}>
              NO PORT CALLS SCHEDULED — 72H
            </div>
          )}
          {rows.map(({ port, bs }) => (
            <div key={port} style={{ display: 'flex', borderTop: `1px solid var(--color-line-subtle)` }}>
              <div style={{ ...mono, width: LABEL_W, flexShrink: 0, padding: '6px 8px 0 0', color: NEUTRAL.inkSecondary }}>
                {port}
              </div>
              <div style={{ position: 'relative', flex: 1, height: bs.length * LANE_H + 6 }}>
                {/* gridlines every 12h + NOW rule (accent) */}
                {[0, 12, 24, 36, 48, 60, 72].map((h) => (
                  <div key={h} style={{
                    position: 'absolute', top: 0, bottom: 0, left: x(now + h * HOUR_MS),
                    width: 1, background: h === 0 ? ACCENT.bright : 'var(--color-line-subtle)',
                  }} />
                ))}
                {bs.map((b, lane) => {
                  const status = vesselStatus(b.vessel.alerts);
                  const colored = treatment === 'automotive' || status !== 'nominal';
                  const edge = colored ? STATUS_COLOR[status] : 'var(--color-line-strong)';
                  const left = b.etaMs === null ? 2 : x(b.etaMs);
                  return (
                    <Link key={`${b.vessel.static.id}-${lane}`} href={`/vessel/${b.vessel.static.id}`}
                      style={{
                        position: 'absolute', top: lane * LANE_H + 3, left,
                        maxWidth: plotW - left - 4,
                        minWidth: 96, // chips never collapse below a readable block
                        display: 'inline-flex', gap: 6, alignItems: 'baseline',
                        background: NEUTRAL.surface,
                        border: '1px solid var(--color-line-strong)',
                        borderLeft: `3px solid ${edge}`,
                        borderRadius: RADIUS,
                        padding: '1px 7px',
                        textDecoration: 'none', color: NEUTRAL.ink,
                        ...mono, whiteSpace: 'nowrap', overflow: 'hidden',
                      }}>
                      {/* truncation priority: name first; ETA and BUNKER never */}
                      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.vessel.static.name.toUpperCase()}
                      </span>
                      <span style={{ color: NEUTRAL.inkMuted, fontSize: 10, flexShrink: 0 }}>
                        {b.etaMs === null ? 'IN PORT' : new Date(b.etaMs).toISOString().slice(11, 16) + 'Z'}
                      </span>
                      {b.bunker && (
                        <span style={{ fontSize: 9, color: 'var(--color-alert-advisory)', border: '1px solid var(--color-alert-advisory)', borderRadius: RADIUS, padding: '0 4px' }}>
                          BUNKER
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Field>
    </section>
  );
}
