'use client';
// ROUND 21 B4: state-outline mark beside port names (TX/LA set), behind the
// dev toggle. Honest flag in PROGRESS: at 12px a silhouette may read as a
// smudge — judge on pixels, cut without ceremony if it's noise.

import { useFleet } from '../state/FleetProvider';

const STATE_PATHS: Record<string, string[]> = {
  TX: ['M8 3 H11 V8 H16 L21 10 V12 L15 20 L11 17 L8 13 L3 11 L8 8 Z'],
  LA: ['M5 4 H12 V10 H19 L20 13 L14 15 L16 19 H8 L6 14 Z'],
};

function portState(port: string): string | null {
  if (port.includes(', TX')) return 'TX';
  if (port.includes(', LA')) return 'LA';
  return null; // AL/MS not in the trial set
}

export function StateMark({ port }: { port: string }) {
  const { stateMarks } = useFleet();
  const st = stateMarks ? portState(port) : null;
  if (!st) return null;
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" style={{ flexShrink: 0, verticalAlign: '-1px' }} aria-hidden>
      {STATE_PATHS[st].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--color-ink-muted)" strokeWidth={1.5} strokeLinejoin="round" />
      ))}
    </svg>
  );
}
