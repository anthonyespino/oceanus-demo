'use client';
// LAYOUT PROBE round 3: the fleet chart, promoted — larger, the spatial
// anchor of the page. Composes the NauticalChart core; vessel markers are
// status-colored squares per the active treatment.

import { useRouter } from 'next/navigation';
import type { VesselState } from '../data/types';
import { vesselStatus, worstLevel } from '../data/alerts';
import { useFleet, type ColorTreatment } from '../state/FleetProvider';
import { NauticalChart, type ChartFrame } from './NauticalChart';
import { STATUS_COLOR, RADIUS } from './probeTokens';
import { gb } from './gb';

// Addendum item 5: viewport = fit-to-fleet bounds + padding (graticule and
// scale bar recompute from the frame inside NauticalChart). Frame floors keep
// a tight cluster from zooming into featureless water.
function fitFleetFrame(fleet: VesselState[]): ChartFrame {
  const pts = fleet.map((v) => v.history.minutes.at(-1)!.position);
  let latMin = Math.min(...pts.map((p) => p.lat)) - 0.45;
  let latMax = Math.max(...pts.map((p) => p.lat)) + 0.45;
  let lonMin = Math.min(...pts.map((p) => p.lon)) - 0.7;
  let lonMax = Math.max(...pts.map((p) => p.lon)) + 1.2; // room for name labels
  if (latMax - latMin < 2) { const c = (latMax + latMin) / 2; latMin = c - 1; latMax = c + 1; }
  if (lonMax - lonMin < 4) { const c = (lonMax + lonMin) / 2; lonMin = c - 2; lonMax = c + 2; }
  return { latMin, latMax, lonMin, lonMax };
}

export function FleetMap({
  fleet,
  treatment,
  width = 880,
  height = 470,
}: {
  fleet: VesselState[];
  treatment: ColorTreatment;
  width?: number;
  height?: number;
}) {
  const router = useRouter();
  const { motion } = useFleet();
  const frame = fitFleetFrame(fleet);
  return (
    <section style={{ ...gb.box, marginBottom: 8, borderRadius: RADIUS }}>
      <div style={gb.label}>fleet plot — gulf of mexico (fit-to-fleet viewport, probe)</div>
      <NauticalChart frame={frame} width={width} height={height}>
        {(px, py) =>
          fleet.map((v) => {
            const p = v.history.minutes.at(-1)!.position;
            const status = vesselStatus(v.alerts);
            const colored = treatment === 'automotive' || status !== 'nominal';
            const fill = colored ? STATUS_COLOR[status] : '#d6d6d6';
            const x = px(p.lon);
            const y = py(p.lat);
            // motion variant (b): slow opacity breathe on WARNING-only
            // markers, paused on hover/focus. Dormant in the scripted fleet
            // (no WARNINGs exist) — mechanism present for Anthony to test.
            const breathe = motion === 'breathe' && worstLevel(v.alerts) === 'WARNING';
            return (
              <g
                key={v.static.id}
                onClick={() => router.push(`/vessel/${v.static.id}`)}
                style={{ cursor: 'pointer' }}
                className={breathe ? 'probe-breathe' : undefined}
                tabIndex={breathe ? 0 : undefined}
              >
                <title>{`${v.static.name} — ${v.derived.mode}`}</title>
                <rect x={x - 3.5} y={y - 3.5} width={7} height={7} fill={fill} stroke="#1c1c1c" strokeWidth={0.75} />
                <text x={x + 7} y={y + 3} fontSize={9} fill="#d6d6d6">{v.static.name}</text>
              </g>
            );
          })
        }
      </NauticalChart>
    </section>
  );
}
