// Mock telemetry generator (DATA_MODEL.md §2, §3, §9).
//
// Sequential simulation per vessel: 1 year at hourly resolution up to T-24h,
// then 1-minute resolution for the last 24 h ("live" ticks continue from
// there). Tank levels integrate burn; weather is a time-addressable smooth
// field so the two resolutions sample the same world. Everything derives from
// SEED — same seed, identical fleet and timeline.

import {
  DEMO_EPOCH,
  DAY_MS,
  HOUR_MS,
  MIN_MS,
  Rng,
  smoothNoise,
  smoothNoise2,
} from './rng';
import { FIRST_NAMES, LAST_NAMES, bearingDeg } from './fleet';
import { buildSchedule, legAt, nextPortCalls, SIM_START } from './schedule';
import type {
  CrewMember,
  EngineSample,
  ScheduleLeg,
  TankSample,
  VesselHistory,
  VesselSample,
  VesselStatic,
  WeatherSample,
} from './types';

// §9 scripted anomaly: Engine 2 (MAIN) EGT +60°F and fuel rate diverging over
// the 3 weeks before the demo epoch, at matched load.
export const ANOMALY_START = DEMO_EPOCH - 21 * DAY_MS;
const ANOMALY_EGT_RISE_F = 60;
const ANOMALY_FUEL_MULT = 0.27; // E2 +27% fuel at ramp end → vessel ≈ +14%

const ENGINE_ROLES = ['MAIN', 'MAIN', 'GEN', 'GEN'] as const;

interface SimState {
  tanks: number[]; // [storage1, storage2, feeder1, feeder2] gallons
  runHours: number[];
  transferOn: boolean;
  bunkerOn: boolean;
  noise: Rng; // sequential measurement jitter
  t: number; // last simulated timestamp
}

export interface VesselRuntime {
  v: VesselStatic;
  legs: ScheduleLeg[];
  state: SimState;
  history: VesselHistory;
}

function anomalyRamp(v: VesselStatic, t: number): number {
  if (!v.scripted.anomaly) return 0;
  return Math.min(1, Math.max(0, (t - ANOMALY_START) / (21 * DAY_MS)));
}

// ---------------------------------------------------------------- weather --

export function weatherAt(v: VesselStatic, t: number): WeatherSample {
  // Seasonal + synoptic (≈3.5-day systems) + local chop. Pure function of t.
  const season = 1 + 0.25 * Math.sin(((t / DAY_MS) % 365) / 365 * 2 * Math.PI + 4.2);
  let wind = 11 * season + 8 * smoothNoise2(`wind:${v.id}`, t, 3.5 * DAY_MS) + 1.5 * smoothNoise(`gust:${v.id}`, t, 2 * HOUR_MS);
  // §9: the anomaly window is deliberately calm so environment can't explain
  // the deviation — scale the anomaly vessel's weather down across the window.
  const calm = 1 - 0.62 * anomalyRamp(v, t);
  wind = Math.max(1, wind * calm);
  const wave = Math.max(0.3, wind * 0.32 + 1.2 * smoothNoise(`wave:${v.id}`, t, 6 * HOUR_MS));
  const precipN = smoothNoise(`precip:${v.id}`, t, 9 * HOUR_MS);
  return {
    wind_speed_kn: round1(wind),
    wind_dir_deg: Math.round((180 + 160 * smoothNoise(`winddir:${v.id}`, t, 2 * DAY_MS) + 360) % 360),
    wave_height_ft: round1(wave),
    current_kn: round2(Math.max(0.1, 0.8 + 0.6 * smoothNoise(`cur:${v.id}`, t, 5 * DAY_MS)) * calm),
    current_dir_deg: Math.round((90 + 120 * smoothNoise(`curdir:${v.id}`, t, 3 * DAY_MS) + 360) % 360),
    visibility_nm: round1(precipN > 0.55 ? 2 + 4 * (1 - precipN) : 10),
    precip: precipN > 0.75 ? 'SQUALL' : precipN > 0.55 ? 'RAIN' : 'NONE',
  };
}

// ------------------------------------------------------------------- step --

function stepSample(v: VesselStatic, legs: ScheduleLeg[], st: SimState, t: number, dtH: number): VesselSample {
  const leg = legAt(legs, t);
  const mode = leg.mode;
  const wx = weatherAt(v, t);
  const ramp = anomalyRamp(v, t);
  const noise = st.noise;

  // Slow per-vessel efficiency wander (hull/trim/ops), ±2% — gives the fleet
  // a plausible efficiency_delta spread without tripping alerts.
  const drift = 1 + 0.02 * smoothNoise(`drift:${v.id}`, t, 60 * DAY_MS);

  // ---- speed & position ----
  let sog = 0;
  let lat: number;
  let lon: number;
  let heading: number;
  if (mode === 'TRANSIT') {
    sog = v.cruise_kn * (1 - 0.012 * wx.wave_height_ft) + 0.25 * smoothNoise(`sog:${v.id}`, t, HOUR_MS);
    const f = (t - leg.startMs) / (leg.endMs - leg.startMs);
    lat = leg.a.lat + (leg.b.lat - leg.a.lat) * f;
    lon = leg.a.lon + (leg.b.lon - leg.a.lon) * f;
    heading = bearingDeg(leg.a, leg.b);
  } else {
    sog = mode === 'PORT' ? 0 : round2(Math.abs(0.2 * smoothNoise(`dpsog:${v.id}`, t, 30 * MIN_MS)));
    lat = leg.a.lat + (mode === 'PORT' ? 0 : 0.004 * smoothNoise(`dlat:${v.id}`, t, 2 * HOUR_MS));
    lon = leg.a.lon + (mode === 'PORT' ? 0 : 0.004 * smoothNoise(`dlon:${v.id}`, t, 2 * HOUR_MS));
    heading = (200 + 140 * smoothNoise(`hdg:${v.id}`, t, 4 * HOUR_MS) + 360) % 360;
  }

  // ---- engine loads by mode ----
  // Which generator carries hotel load alternates by leg so hours accumulate
  // on both.
  const legIdx = legs.indexOf(leg);
  const activeGen = legIdx % 2 === 0 ? 2 : 3;
  const loads = [0, 0, 0, 0];
  if (mode === 'TRANSIT') {
    const base = 62 + 14 * (sog / v.cruise_kn) ** 3; // burn vs speed roughly cubic
    const wxLoad = 1 + 0.004 * wx.wind_speed_kn + 0.01 * wx.wave_height_ft;
    const l = clamp(base * wxLoad + 1.2 * smoothNoise(`load:${v.id}`, t, 45 * MIN_MS), 35, 92);
    loads[0] = l;
    loads[1] = l * (1 + 0.01 * smoothNoise(`lsplit:${v.id}`, t, 3 * HOUR_MS)); // matched twins
    loads[activeGen] = 38 + 4 * smoothNoise(`gload:${v.id}`, t, HOUR_MS);
  } else if (mode === 'STATION') {
    const dp = clamp(14 + 1.15 * wx.wind_speed_kn + 9 * wx.current_kn + 2 * smoothNoise(`dp:${v.id}`, t, 20 * MIN_MS), 8, 85);
    loads[0] = dp;
    loads[1] = dp * (1 + 0.012 * smoothNoise(`lsplit:${v.id}`, t, 3 * HOUR_MS));
    loads[2] = 34 + 3 * smoothNoise(`gload:${v.id}`, t, HOUR_MS);
    loads[3] = 34 + 3 * smoothNoise(`gload2:${v.id}`, t, HOUR_MS); // both gens on DP
  } else if (mode === 'STANDBY') {
    loads[activeGen] = 32 + 2 * smoothNoise(`gload:${v.id}`, t, HOUR_MS);
  } else {
    loads[activeGen] = 22 + 1.5 * smoothNoise(`gload:${v.id}`, t, HOUR_MS); // hotel only
  }

  // ---- engines ----
  const engines: EngineSample[] = [];
  let trueBurn = 0;
  for (let i = 0; i < 4; i++) {
    const role = ENGINE_ROLES[i];
    const load = Math.max(0, loads[i]);
    const running = load > 1;
    const maxGph = role === 'MAIN' ? v.main_max_gph : v.gen_max_gph;
    // §9: Engine 2 (index 1) burns more fuel and runs hotter at matched load.
    const fouling = i === 1 ? 1 + ANOMALY_FUEL_MULT * ramp : 1;
    const fuel = running ? maxGph * (0.08 + 0.92 * load / 100) * drift * fouling * (1 + 0.015 * noise.gauss()) : 0;
    trueBurn += fuel;
    const egtBase = role === 'MAIN' ? 640 + 3.0 * load : 590 + 2.6 * load;
    engines.push({
      engine_id: `${v.id}-E${i + 1}`,
      role,
      running,
      load_pct: running ? round1(load) : 0,
      rpm: running ? Math.round(role === 'MAIN' ? 650 + 11.5 * load : 1800) : 0,
      fuel_rate_gph: round2(fuel),
      exhaust_gas_temp_f: running ? Math.round(egtBase + (i === 1 ? ANOMALY_EGT_RISE_F * ramp : 0) + 4 * noise.gauss()) : 0,
      coolant_temp_f: running ? Math.round(164 + 0.22 * load + 1.5 * noise.gauss()) : 0,
      oil_pressure_psi: running ? Math.round(63 - 0.06 * load + 1.2 * noise.gauss()) : 0,
      oil_temp_f: running ? Math.round(176 + 0.34 * load + 2 * noise.gauss()) : 0,
      running_hours: round1(st.runHours[i] += running ? dtH : 0),
    });
  }

  // ---- tanks: feeders feed engines; storage→feeder transfers; bunkering ----
  const feederCap = v.feeder_capacity_gal;
  const storageCap = v.storage_capacity_gal;
  const burnGal = trueBurn * dtH;

  // Drain feeders evenly, spill remainder to the other if one runs dry.
  const drainEach = burnGal / 2;
  for (const fi of [2, 3]) {
    const other = fi === 2 ? 3 : 2;
    const take = Math.min(st.tanks[fi], drainEach);
    st.tanks[fi] -= take;
    st.tanks[other] = Math.max(0, st.tanks[other] - (drainEach - take));
  }

  // Transfer pump hysteresis: on below 35% feeder, off above 80%.
  const feederPct = (st.tanks[2] + st.tanks[3]) / (2 * feederCap);
  if (!st.transferOn && feederPct < 0.35) st.transferOn = true;
  if (st.transferOn && feederPct > 0.8) st.transferOn = false;
  if (st.transferOn) {
    const rate = (v.class === 'OSV' ? 2600 : 1400) * dtH; // gal this step
    const avail = st.tanks[0] + st.tanks[1];
    const xfer = Math.min(rate, avail, 2 * feederCap - st.tanks[2] - st.tanks[3]);
    for (const si of [0, 1]) {
      const share = avail > 0 ? (st.tanks[si] / avail) * xfer : 0;
      st.tanks[si] -= share;
    }
    st.tanks[2] += xfer / 2;
    st.tanks[3] += xfer / 2;
    if (xfer <= 0) st.transferOn = false;
  }

  // Bunkering: refill storage in port when below 50%, up to 95%.
  const storagePct = (st.tanks[0] + st.tanks[1]) / (2 * storageCap);
  if (mode === 'PORT') {
    if (!st.bunkerOn && storagePct < 0.5) st.bunkerOn = true;
    if (st.bunkerOn) {
      const rate = (v.class === 'OSV' ? 14000 : 6000) * dtH;
      for (const si of [0, 1]) {
        st.tanks[si] = Math.min(storageCap * 0.95, st.tanks[si] + rate / 2);
      }
      if ((st.tanks[0] + st.tanks[1]) / (2 * storageCap) >= 0.95) st.bunkerOn = false;
    }
  } else {
    st.bunkerOn = false;
  }

  const tanks: TankSample[] = [0, 1, 2, 3].map((i) => {
    const type = i < 2 ? 'STORAGE' : 'FEEDER';
    const cap = i < 2 ? storageCap : feederCap;
    return {
      tank_id: `${v.id}-T${i + 1}`,
      type: type as 'STORAGE' | 'FEEDER',
      level_gal: Math.round(st.tanks[i]),
      capacity_gal: cap,
      level_pct: round1((st.tanks[i] / cap) * 100),
      transfer_active: st.transferOn,
    };
  });

  // ---- flow meter (vessel total to engines), with scripted bias if any ----
  const bias = v.scripted.flow_meter_bias ?? 1;
  const flowGps = (trueBurn / 3600) * bias * (1 + 0.004 * noise.gauss());

  st.t = t;
  return {
    t,
    mode,
    engines,
    tanks,
    flow_gps: round4(flowGps),
    true_burn_gph: round2(trueBurn),
    weather: wx,
    position: { lat: round4(lat), lon: round4(lon), speed_over_ground_kn: round2(Math.max(0, sog)), heading_deg: Math.round(heading) },
  };
}

// ------------------------------------------------------------------- crew --

function buildCrew(v: VesselStatic, legs: ScheduleLeg[], now: number): { roster: CrewMember[]; changes: number[] } {
  const rng = new Rng(`crew:${v.id}`);
  const changes: number[] = [];
  let last = SIM_START - rng.range(2, 20) * DAY_MS;
  for (const leg of legs) {
    if (leg.mode !== 'PORT' || leg.startMs > now) continue;
    if (leg.startMs - last >= rng.range(26, 31) * DAY_MS) {
      // §9: the anomaly vessel keeps its crew through the anomaly window so
      // human factors can't explain the deviation (crew held over one hitch).
      if (v.scripted.anomaly && leg.startMs > ANOMALY_START - 3 * DAY_MS) continue;
      changes.push(leg.startMs + 2 * HOUR_MS);
      last = leg.startMs;
    }
  }
  const onboardSince = changes.length ? changes[changes.length - 1] : last;
  const roles = ['Master', 'Chief Mate', 'Chief Engineer', 'Second Engineer'] as const;
  // Roster names keyed to the change count so each hitch is a distinct crew.
  const nameRng = new Rng(`crewnames:${v.id}:${changes.length}`);
  const roster: CrewMember[] = roles.map((role, i) => ({
    crew_member_id: `${v.id}-C${changes.length}-${i}`,
    name: `${nameRng.pick(FIRST_NAMES)} ${nameRng.pick(LAST_NAMES)}`,
    role,
    onboard_since: onboardSince,
  }));
  return { roster, changes };
}

// -------------------------------------------------------------- simulation --

export function simulateVessel(v: VesselStatic): VesselRuntime {
  const legs = buildSchedule(v);
  const rng = new Rng(`init:${v.id}`);
  const st: SimState = {
    tanks: [
      v.storage_capacity_gal * rng.range(0.7, 0.92),
      v.storage_capacity_gal * rng.range(0.7, 0.92),
      v.feeder_capacity_gal * rng.range(0.65, 0.9),
      v.feeder_capacity_gal * rng.range(0.65, 0.9),
    ],
    runHours: [rng.range(9000, 30000), rng.range(9000, 30000), rng.range(12000, 35000), rng.range(12000, 35000)],
    transferOn: false,
    bunkerOn: false,
    noise: new Rng(`noise:${v.id}`),
    t: SIM_START,
  };

  const minuteStart = DEMO_EPOCH - 24 * HOUR_MS;
  const hourly: VesselSample[] = [];
  for (let t = SIM_START; t < minuteStart; t += HOUR_MS) {
    hourly.push(stepSample(v, legs, st, t, 1));
  }
  const minutes: VesselSample[] = [];
  for (let t = minuteStart; t <= DEMO_EPOCH; t += MIN_MS) {
    const s = stepSample(v, legs, st, t, 1 / 60);
    minutes.push(s);
    if (t % HOUR_MS === 0) hourly.push(s); // keep hourly series continuous to "now"
  }

  // Scripted satellite drop: the weather *feed* froze 45 min ago, so every
  // sample since then reports the last received observation. (Physics — burn,
  // DP load — still responded to actual weather; only the report is stale.)
  if (v.scripted.stale_weather) {
    const staleAt = DEMO_EPOCH - 45 * MIN_MS;
    const lastReport = weatherAt(v, staleAt);
    for (const s of minutes) {
      if (s.t > staleAt) s.weather = lastReport;
    }
  }

  const { roster, changes } = buildCrew(v, legs, DEMO_EPOCH);
  const now = DEMO_EPOCH;
  const history: VesselHistory = {
    hourly,
    minutes,
    crew: roster,
    crewChanges: changes,
    nextPortCalls: nextPortCalls(legs, now),
    timestamps: {
      engines: now,
      tanks: now,
      flow: now,
      // Scripted satellite drop: weather feed last heard 45 min ago → STALE.
      weather: v.scripted.stale_weather ? now - 45 * MIN_MS : now,
      crew: now,
      position: now,
    },
  };
  return { v, legs, state: st, history };
}

/**
 * Live mode: advance one vessel by n 1-minute ticks from wherever it is.
 * Same sequential state → replaying from the same seed reproduces the
 * identical timeline.
 */
export function advanceMinutes(rt: VesselRuntime, n: number): void {
  for (let i = 0; i < n; i++) {
    const t = rt.state.t + MIN_MS;
    const s = stepSample(rt.v, rt.legs, rt.state, t, 1 / 60);
    if (rt.v.scripted.stale_weather) s.weather = weatherAt(rt.v, rt.history.timestamps.weather);
    rt.history.minutes.push(s);
    rt.history.minutes.shift(); // keep a rolling 24 h window
    if (t % HOUR_MS === 0) rt.history.hourly.push(s);
  }
  const now = rt.state.t;
  const ts = rt.history.timestamps;
  ts.engines = ts.tanks = ts.flow = ts.crew = ts.position = now;
  ts.weather = rt.v.scripted.stale_weather ? ts.weather : now;
  rt.history.nextPortCalls = nextPortCalls(rt.legs, now);
}

function clamp(x: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, x));
}
const round1 = (x: number) => Math.round(x * 10) / 10;
const round2 = (x: number) => Math.round(x * 100) / 100;
const round4 = (x: number) => Math.round(x * 10000) / 10000;
