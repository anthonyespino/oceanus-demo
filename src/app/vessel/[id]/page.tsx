'use client';
// Route: /vessel/[id] — LAYOUT PROBE round 2: single-surface expand model.
// Same URL-driven route state as main (browser back = minimize); only the
// render mode changed: VesselInspector takes the main area, the fleet
// compresses into a persistent rail, the alert context strip persists.

import { use } from 'react';
import Link from 'next/link';
import { AlertRail, FleetRail, VesselInspector } from '../../../components';
import { useFleet } from '../../../state/FleetProvider';

export default function VesselPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { fleet, treatment } = useFleet();
  if (!fleet) return <main style={{ padding: 12 }}>Generating deterministic fleet (seeded, ~2s)…</main>;
  const vessel = fleet.find((v) => v.static.id === id);
  if (!vessel) {
    return (
      <main style={{ padding: 12 }}>
        Unknown vessel “{id}”. <Link href="/" style={{ textDecoration: 'underline' }}>← fleet</Link>
      </main>
    );
  }
  return (
    <main style={{ padding: 12, maxWidth: 1400, margin: '0 auto' }}>
      <AlertRail fleet={fleet} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <FleetRail fleet={fleet} selectedId={id} treatment={treatment} />
        <VesselInspector vessel={vessel} fleet={fleet} treatment={treatment} />
      </div>
    </main>
  );
}
