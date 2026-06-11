'use client';
// Route: / = fleet view. Pages are thin: pull the snapshot from state,
// hand it to presentation components as props.

import { FleetView } from '../components';
import { useFleet } from '../state/FleetProvider';

export default function FleetPage() {
  const { fleet } = useFleet();
  if (!fleet) return <main style={{ padding: 12 }}>Loading fleet telemetry…</main>;
  return <FleetView fleet={fleet} />;
}
