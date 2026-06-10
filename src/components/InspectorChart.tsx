'use client';
// LAYOUT PROBE round 3: zoomed chart inside the VesselInspector — focus
// vessel + 24h route trail + next port, with the rest of the fleet as faint
// ghost dots (dimmed, never removed: the fleet stays present even here).

import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { place } from '../data/fleet';
import type { ColorTreatment } from '../state/FleetProvider';
import { NauticalChart, CHART_INK, type ChartFrame } from './NauticalChart';
import { STATUS_COLOR, RADIUS } from './probeTokens';
import { gb } from './gb';

function focusFrame(vessel: VesselState): ChartFrame {
  const pts = vessel.history.minutes
    .filter((_, i) => i % 15 === 0)
    .map((s) => ({ lat: s.position.lat, lon: s.position.lon }));
  const next = vessel.history.nextPortCalls[0];
  if (next) pts.push(place(next.port));
  let latMin = Math.min(...pts.map((p) => p.lat));
  let latMax = Math.max(...pts.map((p) => p.lat));
  let lonMin = Math.min(...pts.map((p) => p.lon));
  let lonMax = Math.max(...pts.map((p) => p.lon));
  // pad, then enforce a minimum window so PORT vessels aren't zoomed absurdly
  const padLat = Math.max(0.25, (latMax - latMin) * 0.2);
  const padLon = Math.max(0.4, (lonMax - lonMin) * 0.2);
  latMin -= padLat; latMax += padLat; lonMin -= padLon; lonMax += padLon;
  const minLat = 1.3; const minLon = 2.6;
  if (latMax - latMin < minLat) { const c = (latMax + latMin) / 2; latMin = c - minLat / 2; latMax = c + minLat / 2; }
  if (lonMax - lonMin < minLon) { const c = (lonMax + lonMin) / 2; lonMin = c - minLon / 2; lonMax = c + minLon / 2; }
  return { latMin, latMax, lonMin, lonMax };
}

export function InspectorChart({
  vessel,
  fleet,
  treatment,
  width = 480,
  height = 300,
}: {
  vessel: VesselState;
  fleet: VesselState[];
  treatment: ColorTreatment;
  width?: number;
  height?: number;
}) {
  const frame = focusFrame(vessel);
  const pos = vessel.history.minutes.at(-1)!.position;
  const trail = vessel.history.minutes.filter((_, i) => i % 15 === 0).map((s) => s.position);
  const next = vessel.history.nextPortCalls[0];
  const nextPlace = next ? place(next.port) : null;
  const status = vesselStatus(vessel.alerts);
  const colored = treatment === 'automotive' || status !== 'nominal';
  const focusFill = colored ? STATUS_COLOR[status] : '#e3e3e3';

  return (
    <section style={{ ...gb.box, marginBottom: 8, borderRadius: RADIUS }}>
      <div style={gb.label}>position — 24 h trail, next port (probe)</div>
      <NauticalChart frame={frame} width={width} height={height}>
        {(px, py) => (
          <>
            {/* ghost fleet: dimmed, not removed */}
            {fleet
              .filter((v) => v.static.id !== vessel.static.id)
              .map((v) => {
                const p = v.history.minutes.at(-1)!.position;
                return (
                  <circle key={v.static.id} cx={px(p.lon)} cy={py(p.lat)} r={3} fill="#909090" opacity={0.55}>
                    <title>{v.static.name}</title>
                  </circle>
                );
              })}
            {/* 24h route trail */}
            <polyline
              points={trail.map((p) => `${px(p.lon).toFixed(1)},${py(p.lat).toFixed(1)}`).join(' ')}
              fill="none"
              stroke="#cfcfcf"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {/* next port + bearing line */}
            {nextPlace && (
              <g>
                <line
                  x1={px(pos.lon)} y1={py(pos.lat)} x2={px(nextPlace.lon)} y2={py(nextPlace.lat)}
                  stroke="#9a9a9a" strokeWidth={0.75} strokeDasharray="6 4"
                />
                <rect x={px(nextPlace.lon) - 4} y={py(nextPlace.lat) - 4} width={8} height={8}
                  fill="none" stroke={CHART_INK} strokeWidth={1.5} />
                <text x={px(nextPlace.lon) + 8} y={py(nextPlace.lat) + 4} fontSize={10} fill={CHART_INK}>
                  {next!.port}
                </text>
              </g>
            )}
            {/* focus vessel */}
            <rect x={px(pos.lon) - 4.5} y={py(pos.lat) - 4.5} width={9} height={9}
              fill={focusFill} stroke="#1c1c1c" strokeWidth={1} />
            <text x={px(pos.lon) + 9} y={py(pos.lat) + 4} fontSize={11} fontWeight={700} fill="#e8e8e8">
              {vessel.static.name}
            </text>
          </>
        )}
      </NauticalChart>
    </section>
  );
}
