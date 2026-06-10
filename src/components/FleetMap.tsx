'use client';
// Literal grey rectangle with vessel positions as labeled squares. No map
// library, no coastline — spatial distribution only. Fixed Gulf of Mexico
// frame so markers don't jump as vessels move. Position is VISIBLE as a
// marker; lat/lon numerals are HIDDEN at fleet level per the registry.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { gb } from './gb';

const FRAME = { latMin: 25.5, latMax: 31.2, lonMin: -98.2, lonMax: -86.8 };
const W = 640;
const H = 360;

export function FleetMap({ fleet }: { fleet: VesselState[] }) {
  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>fleet map — Gulf of Mexico (greybox frame, no coastline)</div>
      <div style={{ position: 'relative', width: W, height: H, background: '#eee', border: '1px solid #999' }}>
        {fleet.map((v) => {
          const p = v.history.minutes.at(-1)!.position;
          const x = ((p.lon - FRAME.lonMin) / (FRAME.lonMax - FRAME.lonMin)) * W;
          const y = ((FRAME.latMax - p.lat) / (FRAME.latMax - FRAME.latMin)) * H;
          return (
            <Link
              key={v.static.id}
              href={`/vessel/${v.static.id}`}
              style={{ position: 'absolute', left: x - 4, top: y - 4, fontSize: 10, color: '#333' }}
              title={`${v.static.name} — ${v.derived.mode}`}
            >
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#555' }} />
              <span style={{ marginLeft: 2 }}>
                {v.static.name} ({v.derived.mode})
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
