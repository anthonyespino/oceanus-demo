'use client';
// LAYOUT PROBE round 2: nautical chart aesthetic, hand-rolled SVG only.
// Dark water field, simplified Gulf of Mexico coastline (single approximate
// path), graticule with frame ticks/labels, compass rose, scale bar. Vessel
// markers are small squares, status-colored per the active treatment.
// Instrument furniture is drawn from SVG primitives — no icon libraries.

import { useRouter } from 'next/navigation';
import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import type { ColorTreatment } from '../state/FleetProvider';
import { STATUS_COLOR, RADIUS } from './probeTokens';
import { gb } from './gb';

const FRAME = { latMin: 25.5, latMax: 31.2, lonMin: -98.2, lonMax: -86.8 };
const W = 880;
const H = 470;
const px = (lon: number) => ((lon - FRAME.lonMin) / (FRAME.lonMax - FRAME.lonMin)) * W;
const py = (lat: number) => ((FRAME.latMax - lat) / (FRAME.latMax - FRAME.latMin)) * H;

// Approximate Gulf coastline, [lon, lat], SW Texas → Mississippi delta →
// Florida panhandle. Land closes along the frame's west/north/east edges.
const COAST: [number, number][] = [
  [-97.55, 25.5], [-97.3, 26.3], [-97.25, 27.0], [-97.3, 27.8], [-96.9, 28.15],
  [-96.2, 28.6], [-95.3, 28.95], [-94.7, 29.35], [-93.8, 29.7], [-92.8, 29.55],
  [-91.8, 29.5], [-91.2, 29.25], [-90.4, 29.05], [-89.9, 29.25], [-89.55, 29.3],
  [-89.2, 29.12], [-88.95, 28.95], [-89.25, 29.35], [-89.45, 29.75], [-89.35, 30.05],
  [-88.95, 30.35], [-88.5, 30.32], [-88.05, 30.55], [-87.55, 30.28], [-86.8, 30.4],
];
const LAND_PATH =
  `M ${px(-98.2)} ${py(25.5)} ` +
  COAST.map(([lon, lat]) => `L ${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`).join(' ') +
  ` L ${px(-86.8)} ${py(31.2)} L ${px(-98.2)} ${py(31.2)} Z`;

const INK = '#b8b8b8'; // chart furniture on dark water
const GRID = '#5a5a5a';

// 1° lon ≈ 52.8 nm at 28.3°N → px per nm for the scale bar.
const PX_PER_NM = W / ((FRAME.lonMax - FRAME.lonMin) * 60 * Math.cos((28.3 * Math.PI) / 180));

export function FleetMap({ fleet, treatment }: { fleet: VesselState[]; treatment: ColorTreatment }) {
  const router = useRouter();
  const lons = [-98, -96, -94, -92, -90, -88];
  const lats = [26, 27, 28, 29, 30, 31];

  return (
    <section style={{ ...gb.box, marginBottom: 8, borderRadius: RADIUS }}>
      <div style={gb.label}>fleet plot — gulf of mexico (approximate chart, probe)</div>
      <svg width={W} height={H} style={{ display: 'block', background: '#3f3f3f', borderRadius: RADIUS }}>
        {/* land */}
        <path d={LAND_PATH} fill="#6e6e6e" stroke="#9a9a9a" strokeWidth={1} />
        {/* graticule */}
        {lons.map((lon) => (
          <g key={lon}>
            <line x1={px(lon)} y1={0} x2={px(lon)} y2={H} stroke={GRID} strokeWidth={0.5} />
            <line x1={px(lon)} y1={0} x2={px(lon)} y2={6} stroke={INK} strokeWidth={1.5} />
            <line x1={px(lon)} y1={H - 6} x2={px(lon)} y2={H} stroke={INK} strokeWidth={1.5} />
            <text x={px(lon) + 3} y={14} fontSize={9} fill={INK}>{Math.abs(lon)}°W</text>
          </g>
        ))}
        {lats.map((lat) => (
          <g key={lat}>
            <line x1={0} y1={py(lat)} x2={W} y2={py(lat)} stroke={GRID} strokeWidth={0.5} />
            <line x1={0} y1={py(lat)} x2={6} y2={py(lat)} stroke={INK} strokeWidth={1.5} />
            <line x1={W - 6} y1={py(lat)} x2={W} y2={py(lat)} stroke={INK} strokeWidth={1.5} />
            <text x={9} y={py(lat) - 3} fontSize={9} fill={INK}>{lat}°N</text>
          </g>
        ))}
        {/* compass rose */}
        <g transform={`translate(${W - 46}, 52)`}>
          <circle r={16} fill="none" stroke={INK} strokeWidth={1} />
          <line x1={0} y1={13} x2={0} y2={-13} stroke={INK} strokeWidth={1} />
          <line x1={-13} y1={0} x2={13} y2={0} stroke={INK} strokeWidth={0.5} />
          <polygon points="-3.5,-7 0,-16 3.5,-7" fill={INK} />
          <text x={0} y={-21} fontSize={10} fill={INK} textAnchor="middle">N</text>
        </g>
        {/* scale bar */}
        <g transform={`translate(20, ${H - 18})`}>
          <line x1={0} y1={0} x2={100 * PX_PER_NM} y2={0} stroke={INK} strokeWidth={1.5} />
          <line x1={0} y1={-4} x2={0} y2={4} stroke={INK} strokeWidth={1.5} />
          <line x1={50 * PX_PER_NM} y1={-3} x2={50 * PX_PER_NM} y2={3} stroke={INK} strokeWidth={1} />
          <line x1={100 * PX_PER_NM} y1={-4} x2={100 * PX_PER_NM} y2={4} stroke={INK} strokeWidth={1.5} />
          <text x={100 * PX_PER_NM + 6} y={3} fontSize={9} fill={INK}>100 nm</text>
        </g>
        {/* vessel markers: status-colored squares per active treatment */}
        {fleet.map((v) => {
          const p = v.history.minutes.at(-1)!.position;
          const status = vesselStatus(v.alerts);
          const colored = treatment === 'automotive' || status !== 'nominal';
          const fill = colored ? STATUS_COLOR[status] : '#d6d6d6';
          const x = px(p.lon);
          const y = py(p.lat);
          return (
            <g
              key={v.static.id}
              onClick={() => router.push(`/vessel/${v.static.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <title>{`${v.static.name} — ${v.derived.mode}`}</title>
              <rect x={x - 3.5} y={y - 3.5} width={7} height={7} fill={fill} stroke="#1c1c1c" strokeWidth={0.75} />
              <text x={x + 7} y={y + 3} fontSize={9} fill="#d6d6d6">{v.static.name}</text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
