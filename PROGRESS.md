# PROGRESS — 2026-06-10

## Done

- Repo scaffold: Next.js 16 (App Router) + TypeScript + Tailwind, private GitHub repo `anthonyespino/oceanus-demo`.
- Data disposition registry (`src/data/dispositions.ts`): every §3/§4 field registered with `{ field, level, disposition, note }` per the PM's v1 classification; 4 UNDEFINED items flagged for Anthony (listed in Questions).
- Mock telemetry generator (`src/data/generator.ts` + `schedule.ts` + `fleet.ts`): 16 fictional vessels (11× 150-170 ft coastal, 5× 205-280 ft OSV), Gulf of Mexico ports/sites, 4 engines + 4 tanks + flow meter + weather + crew + position per vessel, 1 year hourly + last 24 h at 1-min, live 1-min tick advance, fully deterministic from one `SEED`.
- §9 scripted anomaly: *Meridian* (240 ft, transit-heavy) Engine 2 EGT ramps +60°F over 3 weeks at matched load, fuel rate diverging (+27% at ramp end) → vessel efficiency_delta **+14.1%**, CAUTION. Calm scripted weather, held-over crew, on-plan route — the other three causal buckets are excluded in the data.
- Two more scripted events: *Cormorant* flow meter +5% bias → reconciliation DISAGREE (sensor disagreement demo); *Sabine* weather feed frozen 45 min → STALE state demo.
- Derived metrics layer (`derived.ts`), separate from raw generation: mode_baseline from each vessel's own year of history (median per mode × wind band), efficiency_delta, trend_30d/90d, endurance, reconciliation, 24 h sparkline, daily delta series, EGT twin gap, per-stream staleness.
- Alert evaluation (`alerts.ts`): WARNING/CAUTION/ADVISORY per §7.
- Verification harness: `npm run verify` — fleet table, anomaly story in numbers, reconciliation sweep, staleness, determinism (sha256 of two independent generations match), live-tick checks. **All checks pass.** Exit code gates on failures.
- Minimal `/inspect` page (unstyled tables): fleet summary, per-vessel current state, disposition registry. Verified rendering on a production build.
- `npm run lint`, `tsc --noEmit`, `npm run build` all clean.

## In Progress

- Nothing carried over; session scope complete.

## Decisions Made (one line each: decision + why)

- Fixed `DEMO_EPOCH` (2026-06-18T15:00Z) instead of wall-clock "now" — wall clock would shift the timeline every run and break exact demo repeatability.
- Added one devDependency, `tsx` — runs the TypeScript verify CLI directly; zero runtime footprint (kickoff requires logging any new dependency).
- Renamed `DATA_MODEL_1.md` → `DATA_MODEL.md` — kickoff and code reference the spec by that exact name.
- Meridian's schedule stream is deterministically re-salted until a TRANSIT leg covers the demo epoch — §9 shows the CAUTION "+14% in TRANSIT"; leaving it to chance could open the demo with the anomaly vessel in port.
- Anomaly crew held over one hitch (28-day change suppressed inside the window) — §9 requires "no recent crew change"; a held-over crew is operationally plausible.
- STATION efficiency = gph ÷ explicit weather-loading factor, then wind-banded — §4 defines efficiency_station as weather-normalized gph; banding alone left too much within-band variance (false CAUTIONs on DP vessels).
- Efficiency CAUTION only evaluated in TRANSIT/STATION — PORT/STANDBY burns are tiny absolute numbers where % deltas are noise, and §7 says alert on actionable conditions only.
- Reconciliation not judged below 150 gal metered flow in the window — at port hotel loads, integer-gallon tank resolution dominates any real disagreement (this fixed a false DISAGREE on Blue Heron).
- Baselines use bucket medians — robust so the 3-week anomaly can't drag its own reference upward.
- Sabine's stale weather freezes the *reported* observation while physics keeps responding to actual weather — that's what a dropped satellite feed actually does.
- Flow-meter disagreement scripted at 5% → ADVISORY, not CAUTION — kickoff's verify spec wants exactly one CAUTION-level vessel; level for sensor disagreement is a real design question, asked below.

## Questions / Objections for Anthony

1. UNDEFINED dispositions awaiting your call: `fleet_total_daily_spend` (fleet), `heading_deg`, `wind_direction_visualization`, `crew_efficiency_comparison` (vessel).
2. Sensor disagreement (flow meter vs tanks, ~5%) is currently ADVISORY so Meridian stays the only CAUTION vessel. Should a sustained reconciliation disagreement be CAUTION instead? §7 lists only the large/leak case (WARNING).
3. Demo epoch is pinned to 2026-06-18T15:00Z (onsite day). Confirm that's the "now" you want on screen, or give a different time of day.
4. Vessel count: DATA_MODEL §1 says ~15-20, kickoff says 16 — built 16. Flag if Matt/Carl's reply changes this.

## Next Session Plan

- Fleet view UI from your Figma component names (VesselCard, FleetMap, AlertRail, …), consuming the disposition registry.
- Add Recharts (logged as a dependency when it happens) for sparklines/trends.
- Live mode wiring: advanceFleet(1) on a 1-min (or accelerated) tick for the demo.
- Nothing else from Level 2/3 until fleet view is signed off.
