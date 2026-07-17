// ROUND 89 — the dedicated IA page. Reachable from the D-panel "IA / SYSTEM
// MAP" section; renders the shared ia-model. Purely additive — does not touch
// the live demo path (FleetView / VesselInspector / the Meridian walkthrough).
import { IASystemMap } from '../../ia/IASystemMap';

export const metadata = { title: 'IA / System Map — Oceanus Fleet' };

export default function IAPage() {
  return <IASystemMap />;
}
