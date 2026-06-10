// LAYOUT PROBE tokens (branch: layout-probe — disposable, do not merge).
// Kept separate from gb.ts so main's greybox tokens are untouched and the
// whole probe vocabulary is one file.
//
// Color budget: exactly three semantic status tokens. Mapping to status
// levels comes from src/data/alerts.ts (vesselStatus) — the thresholds ARE
// the alert constants; this file only assigns hue.

import type { StatusLevel } from '../data/alerts';

/** The one radius token. Used everywhere a corner is rounded. */
export const RADIUS = 6;

/** status/nominal · status/watch · status/degraded — the only color allowed. */
export const STATUS_COLOR: Record<StatusLevel, string> = {
  nominal: '#1e7a3c', // status/nominal (green)
  watch: '#b07800', // status/watch (amber)
  degraded: '#b3261e', // status/degraded (red)
};

export const NEUTRAL = {
  ink: '#000000',
  inkSecondary: '#555555',
  inkMuted: '#888888',
  border: '#cccccc',
  surface: '#ffffff',
  surfaceDim: '#f4f4f4',
};

/** 4-step type scale; data uses tabular figures so columns don't jitter. */
export const TYPE = {
  name: { fontSize: 19, fontWeight: 700 } as React.CSSProperties, // primary element
  hero: { fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
  meta: { fontSize: 12, fontWeight: 400, fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
  micro: { fontSize: 11, fontWeight: 400, color: NEUTRAL.inkMuted } as React.CSSProperties,
};
