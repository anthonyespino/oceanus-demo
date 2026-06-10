// Verification harness (`npm run verify`) — proves the data layer supports
// the §9 demo scenario in numbers, before any UI exists.
//
// Checks:
//   1. Fleet table — exactly one CAUTION-level vessel, plausible spread elsewhere
//   2. The anomaly vessel's story — EGT divergence over 3 weeks, twin fuel
//      comparison, weather normality, crew stability, route on plan
//   3. Reconciliation across all vessels — OK everywhere except the scripted
//      flow-meter disagreement
//   4. Determinism — full regeneration produces a byte-identical fleet
//   5. Live ticks — advancing 1-min ticks keeps the window shape and clock
//
// Exit code is non-zero if any assertion fails.

import { createHash } from 'node:crypto';
import { getFleet, advanceFleet, resetFleet } from '../src/data/fleetState';
import { worstLevel } from '../src/data/alerts';
import { ANOMALY_START } from '../src/data/generator';
import { DEMO_EPOCH, DAY_MS } from '../src/data/rng';
import { undefinedDispositions } from '../src/data/dispositions';
import type { VesselState } from '../src/data/types';

let failures = 0;
function check(ok: boolean, label: string): void {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures++;
}
const fmt = (x: number, w: number) => String(x).padStart(w);
const pct = (x: number) => `${x > 0 ? '+' : ''}${x.toFixed(1)}%`;
const day = (t: number) => new Date(t).toISOString().slice(0, 10);

console.log(`Oceanus data layer verification — demo epoch ${new Date(DEMO_EPOCH).toISOString()}`);
console.log('Generating fleet…');
const t0 = Date.now();
const fleet = getFleet();
console.log(`16 vessels, 1y hourly + 24h 1-min, in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);

// ----------------------------------------------------------- 1. fleet table
console.log('== Fleet table (ranked by |efficiency_delta|) ==');
const ranked = [...fleet].sort((a, b) => Math.abs(b.derived.efficiency_delta_pct) - Math.abs(a.derived.efficiency_delta_pct));
console.log('  vessel         mode     eff_delta  burn_gph  endur_h  recon     alerts');
for (const v of ranked) {
  const d = v.derived;
  const alerts = v.alerts.map((a) => `${a.level}:${a.code}`).join(', ') || '—';
  console.log(
    `  ${v.static.name.padEnd(14)} ${d.mode.padEnd(8)} ${pct(d.efficiency_delta_pct).padStart(7)}   ${fmt(d.burn_rate_gph, 7)}  ${fmt(d.endurance_hours, 7)}  ${d.reconciliation.status.padEnd(8)}  ${alerts}`,
  );
}

const cautionVessels = fleet.filter((v) => worstLevel(v.alerts) === 'CAUTION' || v.alerts.some((a) => a.level === 'CAUTION'));
const anomaly = fleet.find((v) => v.static.scripted.anomaly)!;
const others = fleet.filter((v) => v !== anomaly);

console.log('\n== Checks: fleet ==');
check(cautionVessels.length === 1 && cautionVessels[0] === anomaly, `exactly one CAUTION-level vessel, and it is ${anomaly.static.name}`);
check(fleet.every((v) => v.alerts.every((a) => a.level !== 'WARNING')), 'no WARNING-level alerts in the nominal fleet');
const underway = others.filter((v) => v.derived.mode === 'TRANSIT' || v.derived.mode === 'STATION');
const spread = underway.map((v) => v.derived.efficiency_delta_pct);
check(underway.length >= 4, `plausible mode mix: ${underway.length} other vessels underway (TRANSIT/STATION)`);
check(spread.every((x) => Math.abs(x) < 8), `other underway deltas within ±8% (range ${pct(Math.min(...spread))} … ${pct(Math.max(...spread))})`);
check(anomaly.derived.efficiency_delta_pct >= 11 && anomaly.derived.efficiency_delta_pct <= 17, `${anomaly.static.name} efficiency_delta ≈ +14% (actual ${pct(anomaly.derived.efficiency_delta_pct)})`);
check(anomaly.derived.mode === 'TRANSIT', `${anomaly.static.name} is in TRANSIT at demo epoch (mode: ${anomaly.derived.mode})`);
check(fleet.every((v) => v.derived.sparkline_24h.length === 24), 'every vessel carries 24h sparkline data');

// ------------------------------------------------- 2. anomaly vessel story
console.log(`\n== Anomaly story: ${anomaly.static.name} (§9) ==`);
console.log(`  anomaly window: ${day(ANOMALY_START)} → ${day(DEMO_EPOCH)} (3 weeks)`);

// Weekly E2−E1 EGT gap at matched load, from hourly history.
console.log('  Engine 2 vs Engine 1 (MAIN twins) at matched load (±8% load):');
const weekly: { label: string; egtGap: number; fuelGap: number; n: number }[] = [];
for (let w = -1; w < 3; w++) {
  const from = ANOMALY_START + w * 7 * DAY_MS;
  const to = from + 7 * DAY_MS;
  const samples = anomaly.history.hourly.filter(
    (s) => s.t >= from && s.t < to && s.engines[0].running && s.engines[1].running && Math.abs(s.engines[0].load_pct - s.engines[1].load_pct) < 8,
  );
  const egtGap = avg(samples.map((s) => s.engines[1].exhaust_gas_temp_f - s.engines[0].exhaust_gas_temp_f));
  const fuelGap = avg(samples.map((s) => (s.engines[1].fuel_rate_gph / s.engines[0].fuel_rate_gph - 1) * 100));
  weekly.push({ label: w < 0 ? 'week before' : `week ${w + 1}`, egtGap, fuelGap, n: samples.length });
  console.log(`    ${(w < 0 ? 'week before' : `week ${w + 1}`).padEnd(12)} EGT gap ${egtGap.toFixed(0).padStart(4)}°F   fuel rate gap ${pct(fuelGap).padStart(7)}   (${samples.length} matched-load hours)`);
}

console.log('\n== Checks: anomaly (machine bucket IN, other three buckets OUT) ==');
check(weekly[0].egtGap < 10, `baseline week shows no EGT gap (${weekly[0].egtGap.toFixed(0)}°F)`);
check(weekly[3].egtGap >= 45 && weekly[3].egtGap <= 75, `EGT gap reaches ≈ +60°F by week 3 (${weekly[3].egtGap.toFixed(0)}°F)`);
check(weekly[1].egtGap < weekly[2].egtGap && weekly[2].egtGap < weekly[3].egtGap, 'EGT gap rises monotonically across the 3 weeks');
check(weekly[3].fuelGap > 15, `Engine 2 fuel rate diverged from twin (${pct(weekly[3].fuelGap)} at matched load)`);
check(anomaly.alerts.some((a) => a.code === 'EFF_DELTA'), 'CAUTION EFF_DELTA active');
check(anomaly.alerts.some((a) => a.code === 'EGT_DIVERGENCE'), 'CAUTION EGT_DIVERGENCE active');

// Bucket exclusions (§6): environment, human factors, operations.
const windowSamples = anomaly.history.hourly.filter((s) => s.t >= ANOMALY_START);
const anomalyWind = avg(windowSamples.map((s) => s.weather.wind_speed_kn));
const anomalyWave = avg(windowSamples.map((s) => s.weather.wave_height_ft));
const fleetWind = avg(others.flatMap((v) => v.history.hourly.filter((s) => s.t >= ANOMALY_START).map((s) => s.weather.wind_speed_kn)));
console.log(`  weather in window: wind ${anomalyWind.toFixed(1)} kn, waves ${anomalyWave.toFixed(1)} ft (fleet avg wind ${fleetWind.toFixed(1)} kn)`);
check(anomalyWind < fleetWind * 0.75 && anomalyWave < 3, 'environment bucket excluded: calm weather across the window');

const lastCrewChange = anomaly.history.crewChanges[anomaly.history.crewChanges.length - 1];
const crewDays = (DEMO_EPOCH - lastCrewChange) / DAY_MS;
console.log(`  last crew change: ${day(lastCrewChange)} (${crewDays.toFixed(0)} days ago)`);
check(lastCrewChange < ANOMALY_START, 'human factors bucket excluded: no crew change inside the window');

const transitLegs = windowSamples.filter((s) => s.mode === 'TRANSIT');
console.log(`  route: ${transitLegs.length} transit hours in window, schedule-driven (on plan); next: ${anomaly.history.nextPortCalls.map((p) => `${p.port} ETA ${day(p.eta)}`).join('; ')}`);
check(transitLegs.length > 100, 'operations bucket excluded: transit-heavy, on-plan schedule (no off-route legs exist in generator)');

// --------------------------------------------------------- 3. reconciliation
console.log('\n== Reconciliation (tank drawdown vs flow meter, trailing window) ==');
for (const v of fleet) {
  const r = v.derived.reconciliation;
  console.log(`  ${v.static.name.padEnd(14)} ${r.status.padEnd(9)} error ${pct(r.error_pct).padStart(7)} over ${r.window_h}h`);
}
const disagree = fleet.filter((v) => v.derived.reconciliation.status === 'DISAGREE');
const biased = fleet.find((v) => v.static.scripted.flow_meter_bias)!;
console.log('\n== Checks: reconciliation ==');
check(disagree.length === 1 && disagree[0] === biased, `exactly one DISAGREE vessel, and it is the scripted one (${biased.static.name})`);
check(others.filter((v) => !v.static.scripted.flow_meter_bias).every((v) => Math.abs(v.derived.reconciliation.error_pct) < 2), 'all unscripted vessels reconcile within ±2%');

// ------------------------------------------------------ 4. staleness state
const stale = fleet.find((v) => v.static.scripted.stale_weather)!;
console.log('\n== Checks: staleness ==');
check(stale.derived.staleness.weather === 'STALE', `${stale.static.name} weather stream is STALE (scripted satellite drop)`);
check(stale.alerts.some((a) => a.code === 'STALE_DATA'), `${stale.static.name} carries ADVISORY STALE_DATA`);
check(fleet.filter((v) => v !== stale).every((v) => Object.values(v.derived.staleness).every((f) => f === 'FRESH')), 'all other streams FRESH');

// -------------------------------------------------------- 5. UNDEFINED log
console.log('\n== UNDEFINED dispositions awaiting Anthony ==');
for (const d of undefinedDispositions()) {
  console.log(`  [${d.level}] ${d.field} — ${d.note}`);
}

// --------------------------------------------------------- 6. determinism
console.log('\n== Checks: determinism & live ticks ==');
const hash1 = fleetHash(fleet);
resetFleet();
const hash2 = fleetHash(getFleet());
check(hash1 === hash2, `full regeneration is byte-identical (sha256 ${hash1.slice(0, 12)}…)`);

const before = getFleet()[0].history.minutes.length;
const advanced = advanceFleet(5);
const lastT = advanced[0].history.minutes[advanced[0].history.minutes.length - 1].t;
check(advanced[0].history.minutes.length === before, 'live ticks keep a rolling 24h minute window');
check(lastT === DEMO_EPOCH + 5 * 60_000, 'live ticks advance the clock 1 min per tick');

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function fleetHash(fs: VesselState[]): string {
  const h = createHash('sha256');
  for (const v of fs) {
    for (const s of [...v.history.hourly, ...v.history.minutes]) {
      h.update(`${s.t}|${s.mode}|${s.flow_gps}|${s.true_burn_gph}|${s.position.lat}|${s.position.lon}`);
      for (const e of s.engines) h.update(`|${e.load_pct}|${e.fuel_rate_gph}|${e.exhaust_gas_temp_f}|${e.running_hours}`);
      for (const t of s.tanks) h.update(`|${t.level_gal}|${t.transfer_active}`);
    }
    h.update(JSON.stringify(v.history.crew) + JSON.stringify(v.derived));
  }
  return h.digest('hex');
}
