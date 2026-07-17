// ROUND 50: shared water-input model. Both AmbientSea (drives the shader) and
// the dev panel (readout) compute the same amplitude/frequency inputs from the
// same source signals, so the dev readout shows exactly what feeds the water.
// Per-context: FleetView binds to the whole fleet; VesselInspector rebinds to
// the inspected vessel. Same signals as round 46 — |mean delta| and avg burn —
// expression only changed.

import type { VesselState } from '../data/types';

export type WaterScope = 'fleet' | 'vessel';

/** Scope + optional vessel id from the route. */
export function waterScope(pathname: string | null): { scope: WaterScope; vesselId: string | null } {
  const m = pathname?.match(/^\/vessel\/([^/?#]+)/);
  return m ? { scope: 'vessel', vesselId: m[1] } : { scope: 'fleet', vesselId: null };
}

function ampFreq(deltaAbsMean: number, burnFrac: number): { amp: number; freq: number } {
  // calm → flat sea; drift → larger swells, capped so casualties don't churn
  return {
    amp: Math.min(1.3, 0.35 + deltaAbsMean * 0.06),
    freq: Math.min(1.5, 0.85 + burnFrac * 0.6),
  };
}

const burnFraction = (v: VesselState) =>
  Math.min(1, v.derived.burn_rate_gph / (v.static.main_max_gph * 2 + v.static.gen_max_gph * 2));

/** The water inputs for the current scope. Pure — the dev readout calls the
    same function the shader targets. */
export function waterInputs(
  fleet: VesselState[] | null,
  scope: WaterScope,
  vesselId: string | null,
): { scope: WaterScope; amp: number; freq: number } {
  if (!fleet || fleet.length === 0) return { scope, amp: 0.4, freq: 1 };
  if (scope === 'vessel') {
    const v = fleet.find((x) => x.static.id === vesselId);
    if (v) return { scope, ...ampFreq(Math.abs(v.derived.efficiency_delta_pct), burnFraction(v)) };
  }
  const deltaAbsMean = fleet.reduce((a, v) => a + Math.abs(v.derived.efficiency_delta_pct), 0) / fleet.length;
  const burnFrac = fleet.reduce((a, v) => a + burnFraction(v), 0) / fleet.length;
  return { scope, ...ampFreq(deltaAbsMean, burnFrac) };
}
