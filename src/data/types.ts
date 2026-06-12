// Shared types for the Oceanus fleet data layer.
// Spec of record: DATA_MODEL.md (§2 modes, §3 streams, §4 derived metrics).

export type Mode = 'TRANSIT' | 'STATION' | 'STANDBY' | 'PORT';

export type EngineRole = 'MAIN' | 'GEN';
export type TankType = 'STORAGE' | 'FEEDER';

export type AlertLevel = 'WARNING' | 'CAUTION' | 'ADVISORY';

export type Freshness = 'FRESH' | 'STALE';

export interface EngineSample {
  engine_id: string;
  role: EngineRole;
  running: boolean;
  load_pct: number;
  rpm: number;
  fuel_rate_gph: number;
  exhaust_gas_temp_f: number;
  coolant_temp_f: number;
  oil_pressure_psi: number;
  oil_temp_f: number;
  running_hours: number;
}

export interface TankSample {
  tank_id: string;
  type: TankType;
  level_gal: number;
  capacity_gal: number;
  level_pct: number;
  transfer_active: boolean;
}

export interface WeatherSample {
  wind_speed_kn: number;
  wind_dir_deg: number;
  wave_height_ft: number;
  current_kn: number;
  current_dir_deg: number;
  visibility_nm: number;
  precip: 'NONE' | 'RAIN' | 'SQUALL';
}

export interface PositionSample {
  lat: number;
  lon: number;
  speed_over_ground_kn: number;
  heading_deg: number;
}

export interface PortCall {
  port: string;
  eta: number; // epoch ms
}

export interface CrewMember {
  crew_member_id: string;
  name: string;
  role: 'Master' | 'Chief Mate' | 'Chief Engineer' | 'Second Engineer';
  onboard_since: number; // epoch ms
}

/** One simulated timestep for a vessel (hourly for the year, 1-min for last 24h). */
export interface VesselSample {
  t: number; // epoch ms
  mode: Mode; // REPORTED via the §3.4 vessel status feed (v2); derivation is a cross-check only
  engines: EngineSample[];
  tanks: TankSample[];
  flow_gps: number; // metered, vessel total to engines
  true_burn_gph: number; // physical truth (HIDDEN; generator internal cross-check)
  weather: WeatherSample;
  position: PositionSample;
}

/** Per-stream last_updated timestamps; staleness derives from these (global rule). */
export interface StreamTimestamps {
  engines: number;
  tanks: number;
  flow: number;
  status: number; // §3.4 vessel status feed (reported mode), v2
  weather: number;
  crew: number;
  position: number;
}

export interface ScheduleLeg {
  mode: Mode;
  startMs: number;
  endMs: number;
  fromPort?: string;
  toPort?: string;
  site?: string;
  // route endpoints; TRANSIT legs may carry a land-avoiding waypoint path
  // (round 23 — nothing sails over land)
  a: { lat: number; lon: number };
  b: { lat: number; lon: number };
  path?: { lat: number; lon: number }[];
}

export interface VesselHistory {
  hourly: VesselSample[]; // 1 year, hourly
  minutes: VesselSample[]; // last 24 h, 1-min
  crew: CrewMember[]; // current roster
  crewChanges: number[]; // epoch ms of past crew changes
  nextPortCalls: PortCall[];
  timestamps: StreamTimestamps;
}

export interface Alert {
  level: AlertLevel;
  code: string;
  message: string;
}

export interface ReconciliationResult {
  status: 'OK' | 'DISAGREE';
  error_pct: number; // (tank drawdown − metered flow total) / metered, over window
  window_h: number;
}

export interface DerivedVesselMetrics {
  mode: Mode;
  burn_rate_gph: number;
  efficiency_delta_pct: number; // current vs mode_baseline (context number in v2)
  baseline_value: number; // the mode_baseline the delta is judged against
  baseline_metric: 'gal_per_nm' | 'gph';
  trend_30d: number; // efficiency_delta slope, % per 30 days — primary fleet signal (v2)
  trend_90d: number;
  sustained_deviation: number; // trend-weighted ranking score (v2 §4); sorts the fleet view
  mode_agreement_pct: number; // reported mode vs fallback derivation, last 24h (v2 §2 cross-check)
  endurance_hours: number;
  endurance_nm: number | null; // null when not underway
  sparkline_24h: number[]; // hourly efficiency_delta, fleet-card sparkline data
  daily_delta_1y: { day: number; delta: number }[]; // for trend charts later
  reconciliation: ReconciliationResult;
  staleness: Record<keyof StreamTimestamps, Freshness>;
  egt_twin_gap_f: number; // MAIN engine 2 − engine 1 EGT at matched load (24h avg)
}

export interface VesselStatic {
  id: string;
  name: string;
  class: 'COASTAL' | 'OSV';
  length_ft: number;
  cruise_kn: number;
  main_max_gph: number; // per main engine at 100% load
  gen_max_gph: number;
  storage_capacity_gal: number; // per storage tank
  feeder_capacity_gal: number;
  home_ports: string[];
  schedule_profile: 'standard' | 'transit_heavy';
  scripted: {
    anomaly?: boolean; // §9 Engine 2 EGT/fuel divergence
    flow_meter_bias?: number; // multiplicative, e.g. 1.05 → DISAGREE
    stale_weather?: boolean; // satellite drop on weather feed
  };
}

export interface VesselState {
  static: VesselStatic;
  history: VesselHistory;
  derived: DerivedVesselMetrics;
  alerts: Alert[];
}
