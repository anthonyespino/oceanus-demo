# Oceanus Fleet Demo

Fleet fuel-efficiency monitoring dashboard for shore-side maritime engineers — a live interview demo: Figma design + working React prototype with simulated live telemetry.

**Spec of record: [DATA_MODEL.md](DATA_MODEL.md).** It is authoritative. **[FIGMA_STANDARD.md](FIGMA_STANDARD.md) is binding for all UI/styling sessions:** Figma and code are the same system described twice — component names match `src/components/index.ts` character for character, variant properties = React props (camelCase), tokens are semantic and mirrored in Tailwind, data-bound text uses `{field}` names from the disposition registry. Renames happen in both places in the same sitting or not at all. At the start of any Figma-connected session, pull current Figma MCP setup from official docs (don't trust memory) and diff the `02 · Components` page against the barrel as the drift check. If something in it looks wrong or unbuildable, log an objection in PROGRESS.md and ask Anthony — never silently deviate. Session briefs live in KICKOFF_PROMPT.md. Also read AGENTS.md: the installed Next.js is newer than training data; check `node_modules/next/dist/docs/` before leaning on memory of its APIs.

## Component naming rule

UI component names exactly match Anthony's Figma component names (e.g. `VesselCard`, `EngineTwinPanel`, `TankSchematic`, `FleetMap`, `AlertRail`). Never rename, "improve," or alias them.

## Data dispositions (the architectural spine)

Every data field is registered in `src/data/dispositions.ts` with a UI disposition that determines its layer in the interface:

- **VISIBLE** — rendered persistently at its level; the field earns permanent pixels
- **CONTEXTUAL** — revealed on hover, expand, or drill-down; one interaction away
- **HIDDEN** — feeds computation only; never rendered directly
- **UNDEFINED** — disposition pending a design decision by Anthony; flag, don't guess

UI sessions consume this registry. Dispositions live in data, not scattered in components. Global rule: every stream carries `last_updated`; staleness (>30 min) is a first-class STALE state that propagates to anything derived from it.

## File map

```
DATA_MODEL.md            spec of record (§ references in code point here)
KICKOFF_PROMPT.md        session briefs from Anthony
PROGRESS.md              session log: done / decisions / questions (PM-reviewed)
scripts/verify.ts        CLI verification harness (npm run verify)
src/data/
  types.ts               shared types for streams, derived metrics, alerts
  rng.ts                 SEED, DEMO_EPOCH, seeded PRNG + time-addressable smooth noise
  fleet.ts               16 fictional vessels, Gulf ports/sites, crew name pools
  schedule.ts            port → transit → station/standby cycles per vessel
  generator.ts           telemetry simulation (§2, §3, §9): 1y hourly + 24h 1-min + live ticks
  derived.ts             §4 metrics: mode_baseline, efficiency_delta, trends, endurance, reconciliation
  alerts.ts              §7 WARNING / CAUTION / ADVISORY evaluation
  dispositions.ts        data disposition registry (see above)
  fleetState.ts          single entry point: getFleet() / advanceFleet(n) / resetFleet()
src/state/
  FleetProvider.tsx      interaction state ONLY: fleet snapshot, live tick, speed, sim clock
src/components/          presentation ONLY: props in, events out; no generator imports
  index.ts               barrel — locked §8 names live here; rename passes start here
  Field.tsx              registry router: VISIBLE/CONTEXTUAL/HIDDEN/UNDEFINED per field
  Contextual.tsx         THE single shared reveal primitive (all hover/expand behavior)
  FleetView/VesselCard/FleetMap/AlertRail            Level 1 (fleet view, route /)
  VesselView/VesselHeader/EfficiencyPanel/...        Level 2 (vessel view, /vessel/[id])
src/app/inspect/page.tsx unstyled data inspection tables (NOT the dashboard)
```

## Greybox rules (until Anthony's Figma reskin)

Greyscale only; alert levels are bracketed text labels, never colors; no animations/shadows/radius/icons; system font stack. Three-layer separation is enforced by directory: data ← state ← components, never sideways. All reveals go through `Contextual`; all field rendering goes through `Field` (the disposition registry decides). Components stay ≤ ~150 lines.

## Verification harness

```
npm run verify
```

Regenerates the fleet from `SEED` and proves the §9 demo scenario in numbers: fleet table with exactly one CAUTION vessel (Meridian, ≈ +14% in TRANSIT), the 3-week EGT/fuel divergence story with the other three causal buckets excluded, fuel reconciliation across the fleet, staleness states, and byte-identical regeneration (determinism). Exits non-zero on any failed check. Run it after touching anything in `src/data/`.

Determinism contract: same `SEED` → identical fleet and timeline. "Now" is the fixed `DEMO_EPOCH` (2026-06-18T15:00Z), not wall clock; live mode advances 1-minute ticks from there.

## Session discipline

- Current session scope only — do not build ahead of the active kickoff brief.
- No new dependencies without logging the reason in PROGRESS.md.
- Update PROGRESS.md before the session ends (Done / In Progress / Decisions Made / Questions for Anthony / Next Session Plan). The PM reviews raw files on GitHub; write decisions for a skeptical CTO reviewer.
