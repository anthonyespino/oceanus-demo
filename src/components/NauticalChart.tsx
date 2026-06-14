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

export const CHART_INK = '#909090'; // round 23: grey furniture
const GRID = '#262626'; // graticule: faint, neutral

// Round 23: the coastline polygon lives in the DATA layer (src/data/coast)
// — the same polygon renders here, steers the schedule's land avoidance,
// and backs the verify no-trail-on-land case.
import { LAND } from '../data/coast';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

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
        fontFamily: 'var(--font-data)', fontSize: 'var(--type-micro)', letterSpacing: 1,
        color: 'var(--color-accent-bright)', border: '1px solid var(--color-accent-bright)',
        background: 'var(--color-surface-raised)', borderRadius: 1, padding: '2px 8px', cursor: 'pointer', // RADIUS token value
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
  land = true,
  children,
}: {
  frame: ChartFrame;
  width: number;
  height: number;
  /** ROUND 84: draw the coastline fill. The shared LAND polygon (src/data/coast)
      is a coarse approximation — fine at the full-Gulf FleetMap zoom, but at the
      zoomed InspectorChart extent its Mississippi-delta bird's-foot renders as a
      sharp filled wedge in nominally open water. Per the substantiation ruling
      ("better no coastline than a fake one"), the inspector omits it (land=false).
      Geometry is NOT changed (it still backs land-avoidance + verify). */
  land?: boolean;
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
    <svg {...layer('NauticalChart / base / water.shape', 'chart/water #0d1924 — the ONLY navy (round 23)', '{chart frame}')} width={width} height={height} style={{ display: 'block', background: 'var(--color-chart-water)' /* blue's only job */ }}>
      {land && <path {...layer('NauticalChart / base / land.shape', 'chart/land fill · hairline coastline — ONE polygon shared with the generator + verify (round 23) · omitted at zoomed inspector extent (round 84)', '{LAND polygon from src/data/coast.ts}')} d={landD} fill="var(--color-chart-land)" stroke="var(--color-line-hairline)" strokeWidth={1} />}
      {/* sea-area label: chart furniture, very low contrast (round 4) */}
      {frame.lonMax - frame.lonMin > 6 && (
        <text
          {...layer('NauticalChart / base / seaLabel.text', 'font/ui letterspaced · near-water contrast — furniture, not data', 'GULF OF MEXICO (static)')}
          x={width * 0.52}
          y={height * 0.72}
          fontSize={Math.min(22, width / 40)}
          fill="#22303c"
          letterSpacing="0.35em"
          textAnchor="middle"
          fontFamily="var(--font-ui)"
        >
          GULF OF MEXICO
        </text>
      )}
      {ticks(frame.lonMin, frame.lonMax, lonStep).map((lon) => (
        <g key={`lon${lon}`} {...layer('NauticalChart / graticule / meridian.line', 'grid faint 0.5px · frame ticks · 9px labels', '{longitude grid at adaptive step}')}>
          <line x1={px(lon)} y1={0} x2={px(lon)} y2={height} stroke={GRID} strokeWidth={0.5} />
          <line x1={px(lon)} y1={0} x2={px(lon)} y2={6} stroke={CHART_INK} strokeWidth={1.5} />
          <line x1={px(lon)} y1={height - 6} x2={px(lon)} y2={height} stroke={CHART_INK} strokeWidth={1.5} />
          <text x={px(lon) + 3} y={14} style={{ fontSize: 'var(--type-micro)' }} fill={CHART_INK}>{Math.abs(lon)}°W</text>
        </g>
      ))}
      {ticks(frame.latMin, frame.latMax, latStep).map((lat) => (
        <g key={`lat${lat}`} {...layer('NauticalChart / graticule / parallel.line', 'grid faint 0.5px · frame ticks · 9px labels', '{latitude grid at adaptive step}')}>
          <line x1={0} y1={py(lat)} x2={width} y2={py(lat)} stroke={GRID} strokeWidth={0.5} />
          <line x1={0} y1={py(lat)} x2={6} y2={py(lat)} stroke={CHART_INK} strokeWidth={1.5} />
          <line x1={width - 6} y1={py(lat)} x2={width} y2={py(lat)} stroke={CHART_INK} strokeWidth={1.5} />
          <text x={9} y={py(lat) - 3} style={{ fontSize: 'var(--type-micro)' }} fill={CHART_INK}>{lat}°N</text>
        </g>
      ))}
      <g {...layer('NauticalChart / furniture / compass.glyph', 'chart ink · ring + needle + N', 'north-up (static)')} transform={`translate(${width - 46}, 52)`}>
        <circle r={16} fill="none" stroke={CHART_INK} strokeWidth={1} />
        <line x1={0} y1={13} x2={0} y2={-13} stroke={CHART_INK} strokeWidth={1} />
        <line x1={-13} y1={0} x2={13} y2={0} stroke={CHART_INK} strokeWidth={0.5} />
        <polygon points="-3.5,-7 0,-16 3.5,-7" fill={CHART_INK} />
        <text x={0} y={-21} style={{ fontSize: 'var(--type-micro)' }} fill={CHART_INK} textAnchor="middle">N</text>
      </g>
      <g {...layer('NauticalChart / furniture / scale.line', 'chart ink · end + mid ticks', '{bar length adapts: 10–200 nm at mid-latitude}')} transform={`translate(20, ${height - 18})`}>
        <line x1={0} y1={0} x2={barNm * pxPerNm} y2={0} stroke={CHART_INK} strokeWidth={1.5} />
        <line x1={0} y1={-4} x2={0} y2={4} stroke={CHART_INK} strokeWidth={1.5} />
        <line x1={(barNm / 2) * pxPerNm} y1={-3} x2={(barNm / 2) * pxPerNm} y2={3} stroke={CHART_INK} strokeWidth={1} />
        <line x1={barNm * pxPerNm} y1={-4} x2={barNm * pxPerNm} y2={4} stroke={CHART_INK} strokeWidth={1.5} />
        <text x={barNm * pxPerNm + 6} y={3} style={{ fontSize: 'var(--type-micro)' }} fill={CHART_INK}>{barNm} nm</text>
      </g>
      {children(px, py)}
    </svg>
  );
}
