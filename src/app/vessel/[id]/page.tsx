'use client';
// Route: /vessel/[id] = vessel view. Drill-down is a route, not component
// state — browser back returns to the fleet view.

import { use } from 'react';
import Link from 'next/link';
import { VesselView } from '../../../components';
import { useFleet } from '../../../state/FleetProvider';

export default function VesselPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { fleet } = useFleet();
  if (!fleet) return <main style={{ padding: 12 }}>Generating deterministic fleet (seeded, ~2s)…</main>;
  const vessel = fleet.find((v) => v.static.id === id);
  if (!vessel) {
    return (
      <main style={{ padding: 12 }}>
        Unknown vessel “{id}”. <Link href="/" style={{ textDecoration: 'underline' }}>← fleet</Link>
      </main>
    );
  }
  return <VesselView vessel={vessel} />;
}
