// ROUND 4: this file is now the TS mirror of the FIGMA_STANDARD §5 token
// vocabulary populated in globals.css — components reference tokens, never
// raw values, so Anthony's Figma pass swaps CSS variable values, not code.

import type { Mode } from '../data/types';
import type { StatusLevel } from '../data/alerts';

/** The one radius token. Used everywhere a corner is rounded. */
export const RADIUS = 6;

/** Status hues map onto the standard vocabulary: data/nominal + alert/*. */
export const STATUS_COLOR: Record<StatusLevel, string> = {
  nominal: 'var(--color-data-nominal)',
  watch: 'var(--color-alert-caution)',
  degraded: 'var(--color-alert-warning)',
};

export const MODE_COLOR: Record<Mode, string> = {
  TRANSIT: 'var(--color-mode-transit)',
  STATION: 'var(--color-mode-station)',
  STANDBY: 'var(--color-mode-standby)',
  PORT: 'var(--color-mode-port)',
};

export const NEUTRAL = {
  ink: 'var(--color-ink-primary)',
  inkSecondary: 'var(--color-ink-secondary)',
  inkMuted: 'var(--color-ink-muted)',
  border: 'var(--color-line-strong)',
  surface: 'var(--color-surface-raised)',
  surfaceDim: 'var(--color-surface-overlay)',
};

export const FONT = {
  ui: 'var(--font-ui)',
  data: 'var(--font-data)', // tabular numerals, always
  display: 'var(--font-display)',
};

/** type/display · type/label · type/data · type/micro — 4 steps, no more. */
export const TYPE = {
  name: { fontFamily: FONT.display, fontSize: 22, fontWeight: 400, letterSpacing: 1 } as React.CSSProperties,
  hero: { fontFamily: FONT.data, fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
  meta: { fontFamily: FONT.data, fontSize: 12, fontWeight: 400, fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
  micro: { fontSize: 11, fontWeight: 400, color: NEUTRAL.inkMuted } as React.CSSProperties,
};
