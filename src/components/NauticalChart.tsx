'use client';

import { useEffect, useRef, useState } from 'react';

// LAYOUT PROBE: shared nautical chart core (hand-rolled SVG, no libraries).
// Draws the instrument furniture — dark water, approximate Gulf coastline,
// graticule with frame ticks/labels, compass rose, scale bar — for any
// lat/lon frame. FleetMap (full Gulf) and InspectorChart (zoomed) compose it;
// markers come in via the children render prop with the frame's projectors.

export interface ChartFrame {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

// (tidy, round 8) GULF_FRAME export removed — fit-to-fleet superseded it in round 3 addendum

export const CHART_INK = '#8b949e';
const GRID = '#222a34'; // graticule: faint on near-black water

// Approximate Gulf coastline [lon, lat], SW Texas → Mississippi birdfoot →
// Florida panhandle; closure corners sit far outside any sensible frame so
// the land polygon stays valid when zoomed.
const COAST: [number, number][] = [
  [-97.55, 25.5], [-97.3, 26.3], [-97.25, 27.0], [-97.3, 27.8], [-96.9, 28.15],
  [-96.2, 28.6], [-95.3, 28.95], [-94.7, 29.35], [-93.8, 29.7], [-92.8, 29.55],
  [-91.8, 29.5], [-91.2, 29.25], [-90.4, 29.05], [-89.9, 29.25], [-89.55, 29.3],
  [-89.2, 29.12], [-88.95, 28.95], [-89.25, 29.35], [-89.45, 29.75], [-89.35, 30.05],
  [-88.95, 30.35], [-88.5, 30.32], [-88.05, 30.55], [-87.55, 30.28], [-86.8, 30.4],
];
const LAND: [number, number][] = [[-100, 24.5], ...COAST, [-85.5, 30.45], [-85.5, 33], [-100, 33]];

function gridStep(span: number): number {
  return span >= 8 ? 2 : span >= 3 ? 1 : 0.5;
}
function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

/**
 * Round 3.1 item 1: charts size themselves to the container's CONTENT box
 * (padding respected) so the SVG never paints past the card stroke. The
 * wrapper also clips as belt-and-braces; refits re-derive from this width.
 */
export function useContentWidth(fallback: number): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/**
 * Round 21 B2: follow + pan + zoom. Follow mode (default) re-derives the
 * frame every render from `followFrame` — the subject can never leave view.
 * Click-drag pans (disengages follow); wheel zooms within sane bounds; the
 * caller shows a FOLLOW chip via `following`/`follow()`. A drag >5px
 * suppresses the click that would otherwise fire on a marker underneath.
 */
export function usePanZoom(followFrame: ChartFrame, w: number, h: number) {
  const [view, setView] = useState<ChartFrame | null>(null);
  const drag = useRef<{ x: number; y: number; frame: ChartFrame; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const frame = view ?? followFrame;

  const handlers = {
    onMouseDown: (e: React.MouseEvent) => {
      drag.current = { x: e.clientX, y: e.clientY, frame, moved: false };
    },
    onMouseMove: (e: React.MouseEvent) => {
      const d = drag.current;
      if (!d || e.buttons === 0) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
      if (!d.moved) return;
      const lonSpan = d.frame.lonMax - d.frame.lonMin;
      const latSpan = d.frame.latMax - d.frame.latMin;
      setView({
        lonMin: d.frame.lonMin - (dx / w) * lonSpan,
        lonMax: d.frame.lonMax - (dx / w) * lonSpan,
        latMin: d.frame.latMin + (dy / h) * latSpan,
        latMax: d.frame.latMax + (dy / h) * latSpan,
      });
    },
    onMouseUp: () => {
      if (drag.current?.moved) suppressClick.current = true;
      drag.current = null;
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (suppressClick.current) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick.current = false;
      }
    },
  };

  // wheel zoom needs a non-passive native listener
  const wheelRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(frame);
  useEffect(() => {
    frameRef.current = frame;
  });
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const f = frameRef.current;
      const factor = e.deltaY > 0 ? 1.18 : 1 / 1.18;
      const cLat = (f.latMin + f.latMax) / 2;
      const cLon = (f.lonMin + f.lonMax) / 2;
      const latSpan = Math.min(8, Math.max(0.5, (f.latMax - f.latMin) * factor));
      const lonSpan = Math.min(14, Math.max(0.8, (f.lonMax - f.lonMin) * factor));
      setView({ latMin: cLat - latSpan / 2, latMax: cLat + latSpan / 2, lonMin: cLon - lonSpan / 2, lonMax: cLon + lonSpan / 2 });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return { frame, following: view === null, follow: () => setView(null), handlers, wheelRef };
}

/** FOLLOW chip — accent: interaction/identity, never status. */
export function FollowChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', top: 8, right: 8, zIndex: 4,
        fontFamily: 'var(--font-data)', fontSize: 10, letterSpacing: 1,
        color: 'var(--color-accent-bright)', border: '1px solid var(--color-accent-bright)',
        background: 'var(--color-surface-raised)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer',
      }}
    >
      ⌖ FOLLOW
    </button>
  );
}

export function NauticalChart({
  frame,
  width,
  height,
  children,
}: {
  frame: ChartFrame;
  width: number;
  height: number;
  children: (px: (lon: number) => number, py: (lat: number) => number) => React.ReactNode;
}) {
  const px = (lon: number) => ((lon - frame.lonMin) / (frame.lonMax - frame.lonMin)) * width;
  const py = (lat: number) => ((frame.latMax - lat) / (frame.latMax - frame.latMin)) * height;

  const landD = `M ${LAND.map(([lon, lat]) => `${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`).join(' L ')} Z`;
  const lonStep = gridStep(frame.lonMax - frame.lonMin);
  const latStep = gridStep((frame.latMax - frame.latMin) * 2) / 2;
  const midLat = (frame.latMin + frame.latMax) / 2;
  const pxPerNm = width / ((frame.lonMax - frame.lonMin) * 60 * Math.cos((midLat * Math.PI) / 180));
  const barNm = [200, 100, 50, 20, 10].find((nm) => nm * pxPerNm <= width * 0.3) ?? 10;

  return (
    <svg width={width} height={height} style={{ display: 'block', background: '#0b0e13' }}>
      <path d={landD} fill="#1a212b" stroke="#2f3a47" strokeWidth={1} />
      {/* sea-area label: chart furniture, very low contrast (round 4) */}
      {frame.lonMax - frame.lonMin > 6 && (
        <text
          x={width * 0.52}
          y={height * 0.72}
          fontSize={Math.min(22, width / 40)}
          fill="#273039"
          letterSpacing="0.35em"
          textAnchor="middle"
          fontFamily="var(--font-ui)"
        >
          GULF OF MEXICO
        </text>
      )}
      {ticks(frame.lonMin, frame.lonMax, lonStep).map((lon) => (
        <g key={`lon${lon}`}>
          <line x1={px(lon)} y1={0} x2={px(lon)} y2={height} stroke={GRID} strokeWidth={0.5} />
          <line x1={px(lon)} y1={0} x2={px(lon)} y2={6} stroke={CHART_INK} strokeWidth={1.5} />
          <line x1={px(lon)} y1={height - 6} x2={px(lon)} y2={height} stroke={CHART_INK} strokeWidth={1.5} />
          <text x={px(lon) + 3} y={14} fontSize={9} fill={CHART_INK}>{Math.abs(lon)}°W</text>
        </g>
      ))}
      {ticks(frame.latMin, frame.latMax, latStep).map((lat) => (
        <g key={`lat${lat}`}>
          <line x1={0} y1={py(lat)} x2={width} y2={py(lat)} stroke={GRID} strokeWidth={0.5} />
          <line x1={0} y1={py(lat)} x2={6} y2={py(lat)} stroke={CHART_INK} strokeWidth={1.5} />
          <line x1={width - 6} y1={py(lat)} x2={width} y2={py(lat)} stroke={CHART_INK} strokeWidth={1.5} />
          <text x={9} y={py(lat) - 3} fontSize={9} fill={CHART_INK}>{lat}°N</text>
        </g>
      ))}
      <g transform={`translate(${width - 46}, 52)`}>
        <circle r={16} fill="none" stroke={CHART_INK} strokeWidth={1} />
        <line x1={0} y1={13} x2={0} y2={-13} stroke={CHART_INK} strokeWidth={1} />
        <line x1={-13} y1={0} x2={13} y2={0} stroke={CHART_INK} strokeWidth={0.5} />
        <polygon points="-3.5,-7 0,-16 3.5,-7" fill={CHART_INK} />
        <text x={0} y={-21} fontSize={10} fill={CHART_INK} textAnchor="middle">N</text>
      </g>
      <g transform={`translate(20, ${height - 18})`}>
        <line x1={0} y1={0} x2={barNm * pxPerNm} y2={0} stroke={CHART_INK} strokeWidth={1.5} />
        <line x1={0} y1={-4} x2={0} y2={4} stroke={CHART_INK} strokeWidth={1.5} />
        <line x1={(barNm / 2) * pxPerNm} y1={-3} x2={(barNm / 2) * pxPerNm} y2={3} stroke={CHART_INK} strokeWidth={1} />
        <line x1={barNm * pxPerNm} y1={-4} x2={barNm * pxPerNm} y2={4} stroke={CHART_INK} strokeWidth={1.5} />
        <text x={barNm * pxPerNm + 6} y={3} fontSize={9} fill={CHART_INK}>{barNm} nm</text>
      </g>
      {children(px, py)}
    </svg>
  );
}
