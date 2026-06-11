'use client';
// LAYOUT PROBE round 2: persistent rail of mini-tiles shown while a vessel
// inspector is expanded — the fleet is NEVER off screen. All 15 vessels stay
// in the rail (selected one highlighted) so positions don't shift between
// expansions. One click reaches any other vessel.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { compareVessels } from '../data/fleetState';
import type { ColorTreatment } from '../state/FleetProvider';
import { ACCENT, NEUTRAL, RADIUS, STATUS_COLOR, TYPE, selectionBorder } from './probeTokens';

export function FleetRail({
  fleet,
  selectedId,
  treatment,
}: {
  fleet: VesselState[];
  selectedId: string;
  treatment: ColorTreatment;
}) {
  const ranked = [...fleet].sort(compareVessels); // round 21 A1: shared comparator
  return (
    <nav style={{ width: 168, flexShrink: 0 }} aria-label="fleet rail">
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
        return (
          <Link
            key={v.static.id}
            href={`/vessel/${v.static.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: `1px solid ${selectionBorder(status, selected)}`, // status outranks accent
              borderRadius: RADIUS,
              background: selected ? ACCENT.wash : NEUTRAL.surface,
              padding: '4px 8px',
              marginBottom: 4,
              textDecoration: 'none',
              color: NEUTRAL.ink,
              fontWeight: selected ? 700 : 400,
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                background: colored ? STATUS_COLOR[status] : NEUTRAL.inkMuted,
              }}
            />
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.static.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
