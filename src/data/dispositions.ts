// Data Disposition Registry — the architectural spine.
//
// Every data field in the system is registered with a UI disposition that
// determines its layer in the interface. UI sessions consume this registry;
// dispositions live in data, not scattered in components.
//
//   VISIBLE    — rendered persistently at its level; earns permanent pixels
//   CONTEXTUAL — revealed on hover, expand, or drill-down; one interaction away
//   HIDDEN     — feeds computation only; never rendered directly
//   UNDEFINED  — pending a design decision by Anthony; flag, don't guess
//
// v1 classification per Anthony's PM (KICKOFF_PROMPT.md §2), implemented as
// given. UNDEFINED items await Anthony's call.

export type Disposition = 'VISIBLE' | 'CONTEXTUAL' | 'HIDDEN' | 'UNDEFINED';
export type UiLevel = 'fleet' | 'vessel';

export interface DispositionEntry {
  field: string;
  level: UiLevel;
  disposition: Disposition;
  note?: string;
}

export const DISPOSITIONS: DispositionEntry[] = [
  // ------------------------------------------------------ fleet view level --
  { field: 'vessel_name', level: 'fleet', disposition: 'VISIBLE' },
  { field: 'mode', level: 'fleet', disposition: 'VISIBLE', note: 'mode chip on card/row; reported via §3.4 status feed (v2)' },
  { field: 'efficiency_delta', level: 'fleet', disposition: 'VISIBLE', note: 'context number in v2; trend is the primary signal' },
  { field: 'sustained_deviation', level: 'fleet', disposition: 'HIDDEN', note: 'sort key (v2 §4); rank-order-only display is a DEV DECISION pending Anthony (verdict 12), not part of ruling 11' },
  { field: 'trend_30d', level: 'fleet', disposition: 'VISIBLE', note: 'primary fleet-level signal (v2, ruling 13)' },
  { field: 'trend_90d', level: 'fleet', disposition: 'VISIBLE', note: 'primary per-vessel graphic incl. 90d trend sparkline (v2, ruling 13)' },
  { field: 'fleet_trend_1y', level: 'fleet', disposition: 'VISIBLE', note: 'whole-fleet trajectory strip (v2 §8, ruling 12)' },
  { field: 'alert_badges', level: 'fleet', disposition: 'VISIBLE', note: 'worst active level; context layer in v2' },
  { field: 'endurance_hours', level: 'fleet', disposition: 'VISIBLE' },
  { field: 'efficiency_sparkline_24h', level: 'fleet', disposition: 'CONTEXTUAL', note: 'demoted from primary graphic (v2, ruling 12) — pending Anthony registry ruling' },
  { field: 'position', level: 'fleet', disposition: 'VISIBLE', note: 'as map marker, not numerals' },
  { field: 'next_port_eta', level: 'fleet', disposition: 'CONTEXTUAL' },
  { field: 'port_calls_timeline', level: 'fleet', disposition: 'VISIBLE', note: 'round 6: 72h arrivals board — promotes next-port data to persistent at fleet level for the window; Anthony to confirm vs next_port_eta CONTEXTUAL' },
  { field: 'crew_summary', level: 'fleet', disposition: 'CONTEXTUAL', note: 'Master name, days since crew change' },
  { field: 'weather_summary', level: 'fleet', disposition: 'CONTEXTUAL' },
  { field: 'burn_rate_gph', level: 'fleet', disposition: 'CONTEXTUAL' },
  { field: 'lat_lon_numeric', level: 'fleet', disposition: 'HIDDEN', note: 'map marker only at fleet level' },
  { field: 'baseline_curve_parameters', level: 'fleet', disposition: 'HIDDEN' },
  { field: 'mode_derivation_inputs', level: 'fleet', disposition: 'HIDDEN', note: 'speed/position/load pattern (§2)' },
  { field: 'per_engine_detail', level: 'fleet', disposition: 'HIDDEN', note: 'lives at vessel level' },
  { field: 'per_tank_detail', level: 'fleet', disposition: 'HIDDEN', note: 'lives at vessel level' },
  { field: 'fleet_total_daily_spend', level: 'fleet', disposition: 'UNDEFINED', note: "CFO-flavored; may not belong in this role's view — Anthony to call" },

  // ----------------------------------------------------- vessel view level --
  { field: 'mode', level: 'vessel', disposition: 'VISIBLE', note: 'plus 24h mode timeline; reported via §3.4 status feed (v2)' },
  { field: 'position', level: 'vessel', disposition: 'VISIBLE', note: 'header summary, relative reference (v2 §8, ruling 6)' },
  { field: 'endurance_hours', level: 'vessel', disposition: 'VISIBLE', note: 'header (§8, ruling 6)' },
  { field: 'efficiency_delta_vs_mode_baseline', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'trend_30d', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'engine.role', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'engine.running', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'engine.load_pct', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'engine.fuel_rate_gph', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'twin_comparison_delta', level: 'vessel', disposition: 'VISIBLE', note: 'most powerful diagnostic in the data (§6)' },
  { field: 'tank.type', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'tank.level_pct', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'tank.level_gal', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'flow_gps', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'reconciliation_status', level: 'vessel', disposition: 'VISIBLE', note: 'OK / DISAGREE — show disagreement, never pick silently (§5)' },
  { field: 'weather.wind', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'weather.waves', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'crew.names', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'crew.roles', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'crew.onboard_since', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'next_port_calls', level: 'vessel', disposition: 'VISIBLE' },
  { field: 'engine.exhaust_gas_temp_f', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'engine.coolant_temp_f', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'engine.oil_pressure_psi', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'engine.oil_temp_f', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'engine.rpm', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'engine.running_hours', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'weather.current', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'weather.visibility', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'weather.precip', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'tank.capacity_gal', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'tank.transfer_active', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'reconciliation_error_magnitude', level: 'vessel', disposition: 'VISIBLE', note: 'rides the RECON chip in the fuel-card header (round 11 density pass; was CONTEXTUAL)' },
  { field: 'trend_90d', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'history_1y', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'baseline_band_visualization', level: 'vessel', disposition: 'CONTEXTUAL' },
  { field: 'raw_sample_timestamps', level: 'vessel', disposition: 'HIDDEN', note: 'surface only as freshness state (FRESH/STALE)' },
  { field: 'generator_seed_internals', level: 'vessel', disposition: 'HIDDEN' },
  { field: 'heading_deg', level: 'vessel', disposition: 'VISIBLE', note: '⚖6 resolved round 36: rendered as chart-marker rotation (fleet + inspector), never as a numeral' },
  { field: 'wind_direction_visualization', level: 'vessel', disposition: 'UNDEFINED', note: 'Anthony to call' },
  { field: 'crew_efficiency_comparison', level: 'vessel', disposition: 'UNDEFINED', note: 'sensitive framing — needs Anthony\'s design call' },
];

export function dispositionsFor(level: UiLevel, disposition?: Disposition): DispositionEntry[] {
  return DISPOSITIONS.filter((d) => d.level === level && (!disposition || d.disposition === disposition));
}

export function undefinedDispositions(): DispositionEntry[] {
  return DISPOSITIONS.filter((d) => d.disposition === 'UNDEFINED');
}
