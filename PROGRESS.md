# PROGRESS — 2026-06-10 (Session 3: v2 spec revision — analytical-first)

## Done

- DATA_MODEL.md promoted to v2 (customer answers from M. McMunigle): arrived as `DATA_MODEL_v2.md` mid-session, renamed to the spec-of-record filename; v1 in git history. All three Day 1 assumptions resolved — fleet 15, modes reported in telemetry, posture flipped to analytical-first.
- DECISIONS.md created as the ruling ledger (per v2 §11): rulings 1–8 backfilled from the Session 2 PM review and brief references, rulings 9–13 appended for this session, all dated, customer-answer rationale cited.
- Fleet 16 → 15 (ruling 9): dropped *Petrel* (v16, unscripted coastal). Verify asserts the count.
- Mode is now reported telemetry (ruling 10): new §3.4 vessel status feed with `last_updated`; §2 derivation (`deriveMode` in `derived.ts`) retained as validation cross-check. New derived `mode_agreement_pct`; verify asserts ≥99.5% agreement on all vessels over 24h (worst observed: 100%).
- `sustained_deviation` (ruling 11): recency-weighted 30-day mean × sign-persistence. Verify proves the two requirements: Meridian's 3-week drift ranks #1 (+5.8 vs +1.2 for #2), and a synthetic one-day +25% spike (score 0.80) does not outrank a steady +5% drifter (score 3.22).
- FleetView is the trend board (ruling 12): sorted by |sustained_deviation|; 90d trend sparkline + 30d/90d slope numbers are the primary per-vessel graphic; efficiency_delta demoted to context number; 24h sparkline behind Contextual; AlertRail now a context strip below the ranking header; new `FleetView/FleetTrend` 1y whole-fleet strip (`fleetDailyTrend` aggregation lives in the data layer).
- Registry (rulings 6, 12, 13): `trend_30d`/`trend_90d`/`fleet_trend_1y` VISIBLE at fleet level; `efficiency_sparkline_24h` → CONTEXTUAL (pending Anthony); `sustained_deviation` HIDDEN (rank order expresses it); vessel-level `position` + `endurance_hours` added — VesselHeader now renders real values (position as relative reference: "N nm from {nearest port}") instead of NOT-IN-REGISTRY placeholders.
- §9 v2 wording applied (ruling 8): verify expects ≈50–60°F by week 3 (actual 51°F; instantaneous alert shows +58°F).
- EfficiencyPanel reordered trend-first per v2 §8 Level 2 (trend history, then current delta as context).
- The four UNDEFINED dispositions untouched (ruling 4).
- Verify green (incl. determinism re-hash), lint/tsc/build clean.

## In Progress

- Nothing carried over.

## Decisions Made (one line each: decision + why)

- sustained_deviation formula = recency-weighted mean (linear, 30d) × sign-persistence — spec v2 says "e.g., 30d mean delta combined with slope"; this variant is spike-proof by construction and verify enforces both ranking requirements (DECISIONS.md ruling 11 has the full rationale).
- sustained_deviation registered HIDDEN, not VISIBLE — v2 §8's card field list doesn't include it; rank order is its rendering; numerals would double-encode.
- Dropped *Petrel* specifically — unscripted, single-home-port coastal vessel; removal disturbs no scripted story (Meridian/Cormorant/Sabine untouched).
- Nominal-row compression now also requires |sustained_deviation| < 2 — a stable-but-drifting vessel must not hide in the "nominal" fold even while its instantaneous delta is small.
- VesselHeader position uses nearest-port relative reference ("43 nm from Port Fourchon, 12.4 kn") — v2 §8 says "position (relative reference)"; raw numerals stay off the header.
- Greybox order on the trend board: ranking header → alert context strip → fleet trend strip → ranked cards → map — explicitly provisional; Anthony's Figma call.
- Mode-agreement verify threshold 99.5% (observed 100%) — tolerance for future transition-boundary samples, not for real disagreement; no scripted status staleness exists yet to exempt.

## Questions / Objections for Anthony

1. 24h sparkline is CONTEXTUAL pending your registry ruling (ruling 12) — confirm or re-place.
2. v2 §8 Level 2 wants "trend overlays" on engine cards — not in this session's brief, so not built. It would strengthen §9 step 3 (EGT gap as a 3-week trend line in the EngineTwinPanel). Next session?
3. DECISIONS.md rulings 6–8 were reconstructed from brief references, not original ruling text — PM should confirm wording.
4. FleetTrend strip currently shows mean daily delta across vessels — if it should inform `fleet_total_daily_spend` (per v2 §8 note), that UNDEFINED needs your call first.

## Next Session Plan

- Engine-card trend overlays (pending Anthony's go), Level 2 polish per v2 §8.
- Anthony's Figma rename/reskin pass via the barrel; Recharts when styling starts.
- Baseline memoization if 60x live mode needs it.

---

# PROGRESS — 2026-06-10 (Session 2: greybox wireframe)

## Done

- PM rulings from Session 1 review applied to `src/data/alerts.ts`:
  1. Reconciliation severity is consequence-based: `RECON_CAUTION_PCT = 7` (commented rationale: fuel-accounting error propagates ~1:1 into endurance, >7% corrupts bunkering decisions) between ADVISORY (≤7%) and WARNING (>10%). Cormorant's 4.9% stays ADVISORY; Meridian remains the only CAUTION vessel.
  2. ENDURANCE requirement now derived: distance-to-next-port at cruise speed × 1.5 reserve (24 h floor; 36 h fallback when no port call in horizon), and the message states its basis.
  3. EGT_DIVERGENCE interpolates the actual hot engine's `engine_id` (handles either twin); verify now asserts the message names `v01-E2`.
  4. UNDEFINED dispositions untouched, rendered as placeholders (below).
  5. DEMO_EPOCH unchanged.
  - Verify needed only an addition (the ruling-3 message check), no expectation changes. All checks pass.
- Greybox fleet view (`/`): AlertRail (fleet-wide WARNING/CAUTION, linking to vessels), ranked VesselCards (registry-driven fields, crude SVG sparkline), healthy-vessel compression ("N vessels nominal" expandable row, |delta| < 3% + no alerts), FleetMap (grey rectangle, labeled squares, fixed Gulf frame, no numerals).
- Greybox vessel view (`/vessel/[id]`): causal-chain order — VesselHeader, alerts, ModeTimeline, EfficiencyPanel, EngineTwinPanel (twin gap explicit between two MAIN EngineCards), TankSchematic (storage → feeder → flow meter → engines as boxes/arrows), FlowReconciliation, WeatherPanel (STALE renders greyed + last-received timestamp — Sabine demonstrates), CrewPanel, RoutePanel.
- Three-layer separation: `src/state/FleetProvider.tsx` (snapshot + live tick + sim clock only), `src/components/` (presentation, props in/events out, no generator imports — only the registry and `worstLevel` helper), `src/data/` (untouched except PM rulings).
- Registry enforcement: `Field` router renders VISIBLE flat, CONTEXTUAL behind the single shared `Contextual` primitive, HIDDEN as nothing, UNDEFINED as literal grey "UNDEFINED: {field}" boxes (all four appear in situ). Unregistered fields surface loudly as "NOT IN REGISTRY" rather than guessing.
- Live mode: header control, tick on/off, 1x (1 sim-min per real minute) / 60x (1 sim-min per second), epoch stays pinned; `advanceFleet(1)` drives re-render.
- `npm run verify` all green; lint, tsc, build clean; all four routes smoke-tested 200.

## In Progress

- Nothing carried over.

## Decisions Made (one line each: decision + why)

- Contextual reveal = hover to show + click to pin/unpin, dotted-underline affordance — cheapest greybox guess; it's one file (`Contextual.tsx`) when Anthony overrules.
- CONTEXTUAL fields are GROUPED per card (one "details" reveal per VesselCard, one "sensors" reveal per EngineCard) — six separate hover targets per engine is hover-hell; rows still check the registry individually so a reclassified field drops out of its group.
- Fleet generates client-side in the provider (~2s, visible "Generating…" notice) — the full deterministic history is far too large to serialize over SSR, and the pinned epoch makes browser regeneration identical.
- Healthy-vessel compression uses a plain click-to-expand button, not Contextual — it's list compression, not a field reveal; flagged in case Anthony wants one reveal grammar everywhere.
- FleetMap uses a fixed Gulf frame (25.5–31.2°N, 98.2–86.8°W) instead of fit-to-fleet — markers shouldn't jump when live ticks move vessels.
- ModeTimeline differentiates segments with grey shades + text labels — shades are perceptual, not semantic; mode color-coding stays a Figma decision.
- Three primitives exist beyond the locked §8 names: `Field` (registry router), `Sparkline`, `LiveControls`/`AppHeader` — infrastructure, exported from the same barrel for any rename pass.
- 60x live tick re-derives all metrics every second (~100–200 ms) — acceptable greybox jank; baseline memoization is the known fix if it bothers during the demo (data-layer change, needs a ruling).

## Where the registry forced awkward layouts (signal for Anthony's Figma work)

- §8 wants position and endurance in the VesselHeader, but neither is registered at vessel level — they render as "NOT IN REGISTRY" placeholders in the header. Either the registry gains vessel-level entries or the header design drops them.
- `efficiency_sparkline_24h` is fleet-level only; the vessel EfficiencyPanel shows the 24h sparkline as part of the VISIBLE delta display rather than as its own registered field — worth a vessel-level entry if it should be independently controllable.
- Fleet-level CONTEXTUAL fields (next port, crew summary, weather summary, burn rate) share one grouped reveal gated on `burn_rate_gph`'s disposition — if Anthony reclassifies one of the four, the group needs splitting.

## Questions / Objections for Anthony

1. Walk `/` → Meridian → diagnosis and judge the flow; every interaction decision above is cheap to change.
2. The four UNDEFINED placeholders now sit in situ (fleet view bottom, WeatherPanel, CrewPanel, RoutePanel) — your call when Figma work starts.
3. Registry gaps listed above: add vessel-level `position`/`endurance` entries, or drop them from the header?
4. Note for the record: this session's brief referenced "cleanup rulings already relayed," but they arrived mid-session — applied in full this session (see Done #1).

## Next Session Plan

- Await Anthony's Figma component names + interaction rulings; mechanical rename pass via the barrel.
- Reskin pass: greybox → Figma design of record (colors, type, spacing, alert semantics).
- Recharts for real trend charts (dependency to be logged when added).
- Baseline memoization in the derived layer if 60x tick performance bothers (data-layer change, needs ruling).

---

# PROGRESS — 2026-06-10 (Session 1: data layer)

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
- Flow-meter disagreement scripted at 5% → ADVISORY, not CAUTION — kickoff's verify spec wants exactly one CAUTION-level vessel; level for sensor disagreement is a real design question, asked below. *(Resolved by PM ruling 1, Session 2.)*

## Questions / Objections for Anthony

1. UNDEFINED dispositions awaiting your call: `fleet_total_daily_spend` (fleet), `heading_deg`, `wind_direction_visualization`, `crew_efficiency_comparison` (vessel). *(Still open.)*
2. Sensor disagreement (flow meter vs tanks, ~5%) is currently ADVISORY so Meridian stays the only CAUTION vessel. Should a sustained reconciliation disagreement be CAUTION instead? §7 lists only the large/leak case (WARNING). *(Resolved by PM ruling 1, Session 2: consequence-based bands.)*
3. Demo epoch is pinned to 2026-06-18T15:00Z (onsite day). Confirm that's the "now" you want on screen, or give a different time of day. *(PM ruling 5: stays pinned pending onsite slot.)*
4. Vessel count: DATA_MODEL §1 says ~15-20, kickoff says 16 — built 16. Flag if Matt/Carl's reply changes this. *(Still open.)*

## Next Session Plan

- Fleet view UI from your Figma component names (VesselCard, FleetMap, AlertRail, …), consuming the disposition registry. *(Done in Session 2 as greybox.)*
- Add Recharts (logged as a dependency when it happens) for sparklines/trends. *(Deferred to reskin session.)*
- Live mode wiring: advanceFleet(1) on a 1-min (or accelerated) tick for the demo. *(Done in Session 2.)*
- Nothing else from Level 2/3 until fleet view is signed off.
