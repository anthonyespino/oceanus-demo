'use client';
// LAYOUT PROBE round 3.1: HTML overlays for SVG charts — the hover tooltip
// (through the Contextual primitive, controlled mode) and the cluster splay.
// Both position absolutely inside the chart's measured wrapper.

import Link from 'next/link';
import { Contextual } from './Contextual';
import { NEUTRAL, RADIUS } from './probeTokens';

export function MarkerTooltip({
  x,
  y,
  label,
  children,
}: {
  x: number;
  y: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x + 14,
        top: y - 14,
        pointerEvents: 'none',
        zIndex: 2,
        background: NEUTRAL.surface,
        border: `1px solid ${NEUTRAL.inkMuted}`,
        borderRadius: RADIUS,
        padding: '2px 6px',
        whiteSpace: 'nowrap',
      }}
    >
      <Contextual label={label} open>
        {children}
      </Contextual>
    </div>
  );
}

export function ClusterSplay({
  x,
  y,
  members,
  onClose,
}: {
  x: number;
  y: number;
  members: { id: string; name: string; dotColor: string }[];
  onClose: () => void;
}) {
  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: 'absolute',
        left: x - 10,
        top: y - 10,
        zIndex: 3,
        background: NEUTRAL.surface,
        border: `1px solid ${NEUTRAL.inkMuted}`,
        borderRadius: RADIUS,
        padding: 4,
      }}
    >
      {members.map((m) => (
        <Link
          key={m.id}
          href={`/vessel/${m.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 6px',
            fontSize: 12,
            color: NEUTRAL.ink,
            textDecoration: 'none',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.dotColor, flexShrink: 0 }} />
          {m.name}
        </Link>
      ))}
    </div>
  );
}
