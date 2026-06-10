# CLAUDE CODE KICKOFF PROMPT — Oceanus Fleet Demo, Session 1

Copy everything below this line into Claude Code, with DATA_MODEL.md placed in the repo root first.

---

## Context

I'm Anthony, an HMI/UX designer interviewing at Oceanus Marine Technologies (June 18 onsite). I'm building a live demo: a fleet fuel-efficiency monitoring dashboard for shore-side maritime engineers. I'll present a Figma design plus this working React prototype with simulated live telemetry.

You are the developer/CTO on this project. I'm the designer and final decision-maker. A separate Claude instance (Claude Desktop) acts as project manager and will review your work through PROGRESS.md and the code itself. Optimize your documentation for that review: clear, honest, decision-logged.

**Read DATA_MODEL.md in the repo root before doing anything. It is the spec. Treat it as authoritative; if you believe something in it is wrong or unbuildable, log the objection in PROGRESS.md and ask me rather than silently deviating.**

## Session 1 scope (this session only)

1. Project scaffold
2. Data disposition registry
3. Mock telemetry generator with scripted anomaly
4. Verification harness (CLI, no UI yet)

Explicitly OUT of scope this session: any dashboard UI, any styling, any component beyond a minimal data inspection page. Do not build ahead. The definition of done for the whole project is the §9 demo scenario in DATA_MODEL.md; the definition of done for THIS session is the data layer proving that scenario in numbers.

## 1. Scaffold

- Next.js (App Router) + TypeScript + Tailwind. No other dependencies without logging the reason in PROGRESS.md. (Recharts will be added in a later session for the UI; not now.)
- Create CLAUDE.md containing: project one-liner, link to DATA_MODEL.md as spec of record, the component naming rule below, the disposition concept, file map, and how to run the verification harness.
- Create PROGRESS.md with this exact structure and update it before the session ends:

```
# PROGRESS — [date]
## Done
## In Progress
## Decisions Made (one line each: decision + why)
## Questions / Objections for Anthony
## Next Session Plan
```

**Component naming rule (record in CLAUDE.md):** UI component names will exactly match Anthony's Figma component names (e.g. VesselCard, EngineTwinPanel, TankSchematic, FleetMap, AlertRail). Never rename, "improve," or alias them.

## 2. Data Disposition Registry

This is the architectural spine. Every data field in the system is registered with a UI disposition that determines its layer in the interface:

- **VISIBLE** — rendered persistently at its level; the field earns permanent pixels
- **CONTEXTUAL** — revealed on hover, expand, or drill-down; one interaction away
- **HIDDEN** — feeds computation only; never rendered directly
- **UNDEFINED** — disposition pending a design decision by Anthony; flag, don't guess

Implement as a typed registry (e.g. `src/data/dispositions.ts`): every field from DATA_MODEL.md §3 and §4 appears with `{ field, level: 'fleet' | 'vessel', disposition, note? }`. The UI sessions later will consume this registry, so dispositions live in data, not scattered in components.

### v1 classification (from Anthony's PM — implement as given; UNDEFINED items await my call)

**Fleet view level:**
- VISIBLE: vessel name, mode, efficiency_delta, alert badges (worst active level), endurance_hours, 24h efficiency sparkline data, position (as map marker)
- CONTEXTUAL: next port + ETA, crew summary (Master name, days since crew change), current weather summary, burn_rate_gph
- HIDDEN: lat/lon as numerals, baseline curve parameters, mode-derivation inputs, all per-engine and per-tank detail (lives at vessel level)
- UNDEFINED: fleet-total daily spend (CFO-flavored; may not belong in this role's view)

**Vessel view level:**
- VISIBLE: mode + mode timeline (24h), efficiency_delta vs mode_baseline, trend_30d, per-engine: role, running, load_pct, fuel_rate_gph; twin-comparison delta; per-tank: type, level_pct, level_gal; flow_gps; reconciliation status (OK / DISAGREE); weather: wind, waves; crew: names, roles, onboard_since; next_port_calls
- CONTEXTUAL: per-engine EGT, coolant_temp, oil_pressure, oil_temp, rpm, running_hours; weather: current, visibility, precip; tank capacity_gal, transfer_active; reconciliation_error magnitude; trend_90d and 1-year history; baseline band visualization
- HIDDEN: raw sample timestamps (surface only as freshness state), generator seed/internals
- UNDEFINED: heading_deg, wind direction visualization, crew efficiency comparison (sensitive framing — needs my design call)

**Global rule:** every stream carries last_updated; staleness (>30 min) is a first-class state (STALE) that must propagate to anything derived from it.

## 3. Mock Telemetry Generator

Implement per DATA_MODEL.md §2 (modes), §3 (streams/fields), §4 (derived metrics), §9 (scenario):

- 16 vessels, fictional names (no real company's vessel names), mixed profile: ~11 smaller 150-170ft class, ~5 larger 205-280ft class. Gulf of Mexico / US coastal positions and routes.
- 4 engines per vessel (2 MAIN, 2 GEN), 4 tanks (2 STORAGE, 2 FEEDER), flow meter, weather, crew roster, position/ports.
- History: 1 year at hourly resolution; last 24h additionally at 1-minute resolution; "live" mode advances 1-min ticks for the demo.
- Deterministic: single seed constant; same seed → identical fleet and timeline. The demo must be exactly repeatable.
- Realistic structure: mode schedules per vessel (port → transit → station → transit → port cycles), burn follows mode and weather (transit burn rises steeply with speed; station burn rises with wind/current), tank levels integrate flow, bunkering events refill storage tanks in port, crew changes every ~28 days, weather evolves smoothly.
- Internal consistency: Σ engine fuel rates ≈ flow meter ≈ tank drawdown (within small sensor noise), EXCEPT where the scripted anomaly or a scripted sensor disagreement intentionally breaks it.
- **Scripted anomaly (the demo moment):** one vessel, transit-heavy schedule: Engine 2 (MAIN) develops gradually rising EGT (+60°F over 3 weeks at matched load vs Engine 1) and diverging fuel_rate, producing vessel efficiency_delta drifting to ~+14%. Calm weather, on-plan route, no crew change in the window — the data must EXCLUDE the other three causal buckets, per §9.
- Derived metrics (§4) computed in a separate layer from raw generation, including mode_baseline built from the vessel's own generated history.

## 4. Verification Harness

Before any UI exists, prove the data in a CLI script (`npm run verify`):
- Prints fleet table: name, mode, efficiency_delta, active alerts — confirming exactly one CAUTION-level anomaly vessel and a plausible spread elsewhere
- Prints the anomaly vessel's story: EGT divergence over 3 weeks, twin comparison, weather normality, crew stability — i.e., §9 verified in numbers
- Reconciliation check across all vessels
- Plus minimal `/inspect` page (unstyled tables) so Anthony can eyeball data in the browser

## 5. Reporting

End of session: update PROGRESS.md fully (including Decisions Made and any Questions), update CLAUDE.md if structure changed. Anthony will push to GitHub and the PM reviews the raw files. Write decisions as if a skeptical CTO reviewer will read them, because one will.
