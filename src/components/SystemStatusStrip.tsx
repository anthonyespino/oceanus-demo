'use client';
// ROUND 5: global system self-report, top-right. Three DM Mono items driven
// ONLY by existing data — no invented health scores, no "98%" theater.

import type { VesselState } from '../data/types';
import { useFleet } from '../state/FleetProvider';
import { Contextual } from './Contextual';
import { ACCENT, FONT, NEUTRAL } from './probeTokens';

function fmtAge(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (m < 60) return `${m}:${String(s).padStart(2, '0')} ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

export function SystemStatusStrip() {
  const { fleet, simTime } = useFleet();
  if (!fleet || simTime === null) {
    return <span style={{ fontFamily: FONT.data, fontSize: 11, color: NEUTRAL.inkMuted }}>DATALINK —</span>;
  }

  const staleByVessel = fleet.map((v: VesselState) => ({
    name: v.static.name,
    stale: Object.entries(v.derived.staleness).filter(([, f]) => f === 'STALE').map(([k]) => k),
  })).filter((x) => x.stale.length > 0);
  const staleStreamCount = staleByVessel.reduce((a, x) => a + x.stale.length, 0);
  const datalink = staleStreamCount === 0 ? 'FRESH' : staleStreamCount === 1 ? 'DEGRADED' : 'STALE';
  const datalinkColor =
    datalink === 'FRESH' ? NEUTRAL.inkSecondary : 'var(--color-alert-advisory)';

  const oldestTs = Math.min(...fleet.flatMap((v) => Object.values(v.history.timestamps)));
  const counts = { WARNING: 0, CAUTION: 0, ADVISORY: 0 };
  for (const v of fleet) for (const a of v.alerts) counts[a.level]++;
  const alertText = (['WARNING', 'CAUTION', 'ADVISORY'] as const)
    .filter((l) => counts[l] > 0)
    .map((l) => `${counts[l]} ${l}`)
    .join(' · ') || 'NO ALERTS';

  const item: React.CSSProperties = { fontFamily: FONT.data, fontSize: 11, whiteSpace: 'nowrap' };
  return (
    <span style={{ display: 'inline-flex', gap: 14, alignItems: 'baseline' }}>
      <span style={{ ...item, color: datalinkColor }}>
        <Contextual label={`DATALINK ${datalink}`}>
          {staleByVessel.length === 0
            ? 'all streams fresh'
            : staleByVessel.map((x) => `${x.name}: ${x.stale.join(', ')}`).join(' · ')}
        </Contextual>
      </span>
      <span style={{ ...item, color: NEUTRAL.inkSecondary }}>LAST SYNC {fmtAge(simTime - oldestTs)}</span>
      <a href="#alert-strip" style={{ ...item, color: counts.CAUTION + counts.WARNING > 0 ? ACCENT.bright : NEUTRAL.inkSecondary, textDecoration: 'none' }}>
        {alertText}
      </a>
    </span>
  );
}
