'use client';
// ROUND 16: glyph system — placeholder CONTRACT, not final art. Schematic
// line pictograms on a 24px grid, uniform 1.5px stroke, ink-colored, no
// fills, no icon libraries. Names match the future Figma icon library 1:1
// (Glyph/engine ↔ icon/engine): Anthony's drawn icons replace these paths
// mechanically, file-for-file.

import { gb } from './gb';
import { useLearn } from '../learn/LearnProvider'; // LEARN/EXPERT MODE — strip before demo week

export type GlyphName =
  | 'vessel' | 'engine' | 'tank' | 'fuel-drop' | 'wind' | 'wave' | 'anchor'
  | 'route' | 'crew' | 'clock' | 'alert-triangle' | 'datalink' | 'gauge' | 'chart'
  | 'expand' | 'collapse' // round 17 control glyphs — same Figma 1:1 contract
  | 'crosshair' // round 24: STATION (DP holding) — replaces the weak vessel mapping
  | 'dots' // round 26: dot-matrix fuel view
  | 'vesselMarker' // round 36 (⚖6 resolved): directional hull — bow up, rotate to heading
  | 'delta' // round 39: clean uppercase delta — efficiency-vs-baseline rows
  // round 44: chart-glyph disambiguation for expert-mode headers — Figma
  // icon library mirrors these names (chart.fleet / chart.trend /
  // chart.efficiency); plus a back glyph for the rail's ← fleet board
  | 'chart.fleet' | 'chart.trend' | 'chart.efficiency' | 'back';

const PATHS: Record<GlyphName, string[]> = {
  vessel: ['M3 14 H21 L18 18 H6 Z', 'M9 14 V9 H14 V14', 'M11 9 V6'],
  engine: ['M6 9 H18 V18 H6 Z', 'M9 9 V6 M15 9 V6', 'M6 13 H3 M18 13 H21', 'M4 20 H20'],
  tank: ['M6 6 C6 4.6 18 4.6 18 6 V18 C18 19.4 6 19.4 6 18 Z', 'M6 13 C6 14.4 18 14.4 18 13'],
  'fuel-drop': ['M12 4 C12 4 6 11 6 14.5 A6 6 0 0 0 18 14.5 C18 11 12 4 12 4 Z'],
  wind: ['M3 8 H14 A2.6 2.6 0 1 0 11.4 5.4', 'M3 13 H18 A2.6 2.6 0 1 1 15.4 15.6', 'M3 18 H11'],
  wave: ['M2 10 C5 6.5 8 6.5 11 10 C14 13.5 17 13.5 20 10', 'M2 16 C5 12.5 8 12.5 11 16 C14 19.5 17 19.5 20 16'],
  anchor: ['M12 8 A2 2 0 1 0 12 4 A2 2 0 0 0 12 8', 'M12 8 V19', 'M8 10 H16', 'M5 14 C5 17.5 8.5 19 12 19 C15.5 19 19 17.5 19 14', 'M5 14 L3.2 12.4 M5 14 L7 12.4', 'M19 14 L20.8 12.4 M19 14 L17 12.4'],
  route: ['M5 18 C9 18 9 6 13 6 C17 6 16 14 20 14', 'M5 19.5 A1.5 1.5 0 1 0 5 16.5 A1.5 1.5 0 0 0 5 19.5', 'M20 15.5 A1.5 1.5 0 1 0 20 12.5 A1.5 1.5 0 0 0 20 15.5'],
  crew: ['M12 10 A3 3 0 1 0 12 4 A3 3 0 0 0 12 10', 'M5 19 C5 14.5 8.5 13 12 13 C15.5 13 19 14.5 19 19'],
  clock: ['M12 20 A8 8 0 1 0 12 4 A8 8 0 0 0 12 20', 'M12 7.5 V12 L15.5 14'],
  'alert-triangle': ['M12 4 L21 19 H3 Z', 'M12 9.5 V13.5', 'M12 16 V16.01'],
  datalink: ['M12 19 V11', 'M8.5 8.5 A5 5 0 0 1 15.5 8.5', 'M5.8 5.8 A9 9 0 0 1 18.2 5.8', 'M12 11 A0.8 0.8 0 1 0 12 9.4 A0.8 0.8 0 0 0 12 11'],
  gauge: ['M4 16 A8 8 0 0 1 20 16', 'M12 16 L16.5 10.5', 'M12 17 A1 1 0 1 0 12 15 A1 1 0 0 0 12 17'],
  chart: ['M4 4 V20 H20', 'M7 15 L11 9.5 L14 12.5 L19 6.5'],
  expand: ['M14 4 H20 V10', 'M20 4 L13 11', 'M10 20 H4 V14', 'M4 20 L11 13'],
  collapse: ['M10 4 V10 H4', 'M11 9 L4 2.5 M11 9 L11 9.01', 'M14 20 V14 H20', 'M13 15 L20 21.5'],
  crosshair: ['M12 19 A7 7 0 1 0 12 5 A7 7 0 0 0 12 19', 'M12 2.5 V7 M12 17 V21.5 M2.5 12 H7 M17 12 H21.5', 'M12 13.2 A1.2 1.2 0 1 0 12 10.8 A1.2 1.2 0 0 0 12 13.2'],
  dots: ['M6 7 V7.01 M12 7 V7.01 M18 7 V7.01', 'M6 12 V12.01 M12 12 V12.01 M18 12 V12.01', 'M6 17 V17.01 M12 17 V17.01 M18 17 V17.01'],
  vesselMarker: ['M12 3 L16.5 8.5 L16.5 20.5 L7.5 20.5 L7.5 8.5 Z'],
  delta: ['M12 4.5 L19.5 19.5 H4.5 Z'],
  // round 44 disambiguation: axes + a distinct data motif each
  'chart.fleet': ['M4 4 V20 H20', 'M9 14 V14.01 M13 8 V8.01 M17 12 V12.01'], // scatter — the position plot
  'chart.trend': ['M4 4 V20 H20', 'M7 19 V9 M11 19 V12 M15 19 V14 M19 19 V16'], // sorted bars — ranking
  'chart.efficiency': ['M4 4 V20 H20', 'M6 9 C10 10 13 16 20 17'], // curve — burn vs speed
  back: ['M11 6 L5 12 L11 18', 'M5 12 H19'],
};

/** Round 36 (⚖6 resolved: heading is VISIBLE as marker rotation): filled
    hull silhouette for chart markers. Local px, bow at (0,−6), flat stern
    at y=+5, beam 7 — `translate(x y) rotate(heading_deg)` points the bow
    along the heading (0° = north/up). Same hull as glyph/vesselMarker. */
export const VESSEL_MARKER_PATH = 'M 0 -6 L 3.5 -1.5 L 3.5 5 L -3.5 5 L -3.5 -1.5 Z';
const STERN_PX = 5;

/** Stern anchor for trails: trails meet the boat at the stern, not the
    marker center (the bow points away from where it's been). */
export function sternPoint(x: number, y: number, headingDeg: number, scale = 1): { x: number; y: number } {
  const r = (headingDeg * Math.PI) / 180;
  return { x: x - STERN_PX * scale * Math.sin(r), y: y + STERN_PX * scale * Math.cos(r) };
}

/** Mode → glyph, one map (round 24 consolidation; STATION = crosshair). */
export const MODE_GLYPH: Record<string, GlyphName> = {
  TRANSIT: 'route',
  STATION: 'crosshair',
  STANDBY: 'clock',
  PORT: 'anchor',
};

export function Glyph({ name, size = 14, color = 'currentColor' }: { name: GlyphName; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ verticalAlign: '-2px', flexShrink: 0 }} aria-hidden>
      {PATHS[name].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/** Section header: glyph anchors, shortened title beside it (round 16).
    ROUND 44 expert mode: the text strips and the glyph stands alone,
    enlarged (~1.4x) and centered where the header sat. `headerAttrs` carries
    the layer() leaf for the header glyph (static literal at each call site so
    the atlas enumerates it). */
export function Label({ g, children, style, headerAttrs }: { g: GlyphName; children: React.ReactNode; style?: React.CSSProperties; headerAttrs?: Record<string, string> }) {
  const { expertOn } = useLearn();
  if (expertOn) {
    return (
      <span {...headerAttrs} style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--pad-section)', ...style }}>
        <Glyph name={g} size={20} />
      </span>
    );
  }
  return (
    <span {...headerAttrs} style={{ ...gb.label, display: 'flex', alignItems: 'center', gap: 6, ...style }}>
      <Glyph name={g} />
      <span>{children}</span>
    </span>
  );
}
