// ROUND 4: this file is now the TS mirror of the FIGMA_STANDARD §5 token
// vocabulary populated in globals.css — components reference tokens, never
// raw values, so Anthony's Figma pass swaps CSS variable values, not code.

import type { Mode } from '../data/types';
import type { StatusLevel } from '../data/alerts';

/** The one radius token. Used everywhere a corner is rounded.
    Round 36: sharp corners — 1px globally. Status dots stay circles
    (dots, not boxes); gauge arcs unaffected. */
export const RADIUS = 1;

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

/**
 * Accent (IKB) — interaction & identity ONLY. Never health/severity: any
 * visual conflict resolves status-over-accent (see selectionBorder).
 */
export const ACCENT = {
  primary: 'var(--color-accent-primary)',
  bright: 'var(--color-accent-bright)',
  wash: 'var(--color-accent-wash)',
};

/** Status outranks accent: selected-but-degraded keeps its status border. */
export function selectionBorder(status: StatusLevel, selected: boolean): string {
  if (status !== 'nominal') return STATUS_COLOR[status];
  return selected ? ACCENT.bright : 'var(--color-line-strong)';
}

export const NEUTRAL = {
  ink: 'var(--color-ink-primary)',
  inkSecondary: 'var(--color-ink-secondary)',
  inkMuted: 'var(--color-ink-muted)',
  border: 'var(--color-line-strong)',
  surface: 'var(--color-surface-raised)',
  surfaceDim: 'var(--color-surface-overlay)',
};

/** Round 21 A6: alert lines render in their severity color everywhere. */
export const ALERT_TEXT_COLOR: Record<string, string> = {
  WARNING: 'var(--color-alert-warning)',
  CAUTION: 'var(--color-alert-caution)',
  ADVISORY: 'var(--color-ink-muted)',
};

export const FONT = {
  ui: 'var(--font-ui)',
  data: 'var(--font-data)', // tabular numerals, always
  display: 'var(--font-display)', // D-DIN (round 22; was Bebas — removed)
};

/** Shared probe toggle-button style (tidy, round 8): active = accent. */
export function toggleStyle(active: boolean): React.CSSProperties {
  return {
    border: `1px solid ${active ? ACCENT.bright : NEUTRAL.border}`,
    background: active ? ACCENT.wash : NEUTRAL.surface,
    color: NEUTRAL.ink,
    borderRadius: RADIUS,
    padding: '1px 8px',
    fontSize: 11,
    cursor: 'pointer',
  };
}

/** type/display · type/label · type/data · type/micro — 4 steps, no more. */
export const TYPE = {
  name: { fontFamily: FONT.display, fontSize: 21, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' } as React.CSSProperties, // round 22: D-DIN isn't caps-only — caps enforced
  hero: { fontFamily: FONT.data, fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
  meta: { fontFamily: FONT.data, fontSize: 12, fontWeight: 400, fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
  micro: { fontSize: 11, fontWeight: 400, color: NEUTRAL.inkMuted } as React.CSSProperties,
};
