'use client';
// Persistent rail — ROUND 24: three visible layers + sticky.
//   IDLE+NOMINAL (port/standby, no alerts) → dims to ~45%: idle recedes.
//   ACTIVE (transit/station) → full ink.
//   ALERTED (any severity, any mode) → NEVER dims; status-tinted name when
//   the status class earns it. Alerts outrank mode everywhere.
// Selection stays the strongest affordance: border + fill, never dimmed,
// regardless of variant. Mode indicator behind the dev toggle: right-aligned
// glyph vs a 1px ink stroke on transit rows (built despite the flagged
// selection-border collision — honest comparison). Rail pins below the
// header on scroll, scrolls independently, and auto-scrolls the selected
// vessel into view on open.

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { compareVessels } from '../data/fleetState';
import { type ColorTreatment } from '../state/FleetProvider';
import { useLearn } from '../learn/LearnProvider'; // EXPERT MODE — strip before demo week
import { Glyph, MODE_GLYPH } from './Glyph';
import { ACCENT, NEUTRAL, RADIUS, STATUS_COLOR, FONT, selectionBorder } from './probeTokens';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

const ACTIVE_MODES = new Set(['TRANSIT', 'STATION']);

export function FleetRail({
  fleet,
  selectedId,
  treatment,
}: {
  fleet: VesselState[];
  selectedId: string;
  treatment: ColorTreatment;
}) {
  const { expertOn } = useLearn();
  const ranked = [...fleet].sort(compareVessels); // round 21 A1: shared comparator
  const selectedRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  return (
    <nav
      style={{
        width: 168,
        flexShrink: 0,
        position: 'sticky',
        top: 48, // below the app header
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 60px)',
        overflowY: 'auto',
      }}
      aria-label="fleet rail"
    >
      <Link
        href="/"
        aria-label="fleet board"
        {...layer('FleetRail / nav / back.glyph', 'back link · glyph-only in expert mode', '→ /')}
        style={{
          display: expertOn ? 'flex' : 'block',
          justifyContent: expertOn ? 'center' : undefined,
          fontFamily: FONT.data, fontSize: 'var(--type-context)', fontVariantNumeric: 'tabular-nums',
          color: NEUTRAL.inkSecondary,
          textDecoration: expertOn ? 'none' : 'underline',
          padding: '4px 8px',
          marginBottom: 6,
        }}
      >
        {expertOn ? <Glyph name="back" size={18} /> : '← fleet board'}
      </Link>
      {ranked.map((v) => {
        const status = vesselStatus(v.alerts);
        const colored = treatment === 'automotive' || status !== 'nominal';
        const selected = v.static.id === selectedId;
        const alerted = v.alerts.length > 0;
        const active = ACTIVE_MODES.has(v.derived.mode);
        // three layers: alerted never dims; selection never dims
        const dim = !alerted && !active && !selected && status === 'nominal';
        // ROUND 115: COMBINED, permanent rail treatment (toggle removed). Every row
        // ALWAYS shows its mode glyph; TRANSIT vessels ADDITIONALLY get a subtle
        // reinforcing accent — a thin neutral stroke in the left gutter — so underway
        // vessels are marginally more glanceable. It is NOT the old full-border stroke
        // (which competed with the selection border); it's an inset accent that leaves
        // the selection + severity borders untouched. Greyscale (no color), and severity
        // (status border + name tint) still reads over it.
        const transit = v.derived.mode === 'TRANSIT';
        return (
          <Link
            key={v.static.id}
            ref={selected ? selectedRef : undefined}
            href={`/vessel/${v.static.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
              border: `1px solid ${selectionBorder(status, selected)}`,
              borderRadius: RADIUS,
              background: selected ? ACCENT.wash : NEUTRAL.surface,
              padding: '4px 8px',
              marginBottom: 4,
              textDecoration: 'none',
              color: alerted && status !== 'nominal' ? STATUS_COLOR[status] : NEUTRAL.ink,
              fontWeight: selected ? 700 : 400,
              fontSize: 'var(--type-context)',
              opacity: dim ? 0.45 : 1,
            }}
          >
            {/* ROUND 115: TRANSIT reinforcing accent — thin neutral stroke in the left
                gutter, only underway. Subtle (ink/secondary, 2px), reinforcing not
                competing; non-transit rows show the glyph only. */}
            {transit && (
              <span aria-hidden style={{ position: 'absolute', left: 3, top: 6, bottom: 6, width: 2, borderRadius: 1, background: NEUTRAL.inkSecondary }} />
            )}
            <span
              {...layer('FleetRail / row / dot.status', 'status color | ink/muted nominal (treatment B)', '{vesselStatus(alerts)}')}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                background: colored ? STATUS_COLOR[status] : NEUTRAL.inkMuted,
              }}
            />
            <span {...layer('FleetRail / row / name.text', 'font/ui 13 · status tint when alerted · 45% dim idle nominal (round 24 layers)', '{vessel.static.name}')} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {v.static.name}
            </span>
            {/* ROUND 115: mode glyph ALWAYS renders (universal mode indicator from the
                single MODE_GLYPH source) — no longer behind a toggle. */}
            <span {...layer('FleetRail / row / mode.glyph', 'MODE_GLYPH · ink/muted · learn/title = full mode name (round 43) · always shown (round 115)', '{derived.mode}: TRANSIT | STATION | STANDBY | PORT')} title={v.derived.mode} style={{ color: NEUTRAL.inkMuted, lineHeight: 0, flexShrink: 0 }}>
              <Glyph name={MODE_GLYPH[v.derived.mode]} size={15} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
