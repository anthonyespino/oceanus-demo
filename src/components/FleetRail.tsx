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
import { useFleet, type ColorTreatment } from '../state/FleetProvider';
import { Glyph, MODE_GLYPH } from './Glyph';
import { ACCENT, NEUTRAL, RADIUS, STATUS_COLOR, TYPE, selectionBorder } from './probeTokens';
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
  const { railMode } = useFleet();
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
        style={{
          display: 'block',
          ...TYPE.meta,
          color: NEUTRAL.inkSecondary,
          textDecoration: 'underline',
          padding: '4px 8px',
          marginBottom: 6,
        }}
      >
        ← fleet board
      </Link>
      {ranked.map((v) => {
        const status = vesselStatus(v.alerts);
        const colored = treatment === 'automotive' || status !== 'nominal';
        const selected = v.static.id === selectedId;
        const alerted = v.alerts.length > 0;
        const active = ACTIVE_MODES.has(v.derived.mode);
        // three layers: alerted never dims; selection never dims
        const dim = !alerted && !active && !selected && status === 'nominal';
        const transitStroke = railMode === 'stroke' && v.derived.mode === 'TRANSIT' && !selected && status === 'nominal';
        return (
          <Link
            key={v.static.id}
            ref={selected ? selectedRef : undefined}
            href={`/vessel/${v.static.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: transitStroke
                ? `1px solid ${NEUTRAL.ink}` // flagged risk: reads close to selection
                : `1px solid ${selectionBorder(status, selected)}`,
              borderRadius: RADIUS,
              background: selected ? ACCENT.wash : NEUTRAL.surface,
              padding: '4px 8px',
              marginBottom: 4,
              textDecoration: 'none',
              color: alerted && status !== 'nominal' ? STATUS_COLOR[status] : NEUTRAL.ink,
              fontWeight: selected ? 700 : 400,
              fontSize: 13,
              opacity: dim ? 0.45 : 1,
            }}
          >
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
            {railMode === 'glyph' && (
              <span {...layer('FleetRail / row / mode.glyph', 'MODE_GLYPH 11px · ink/muted', '{derived.mode}')} style={{ color: NEUTRAL.inkMuted, lineHeight: 0, flexShrink: 0 }}>
                <Glyph name={MODE_GLYPH[v.derived.mode]} size={11} />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
