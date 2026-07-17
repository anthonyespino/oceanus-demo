# Oceanus Fleet Demo

Fleet fuel-efficiency monitoring dashboard for shore-side maritime engineers — a live
interview/demo prototype: a Figma design system and a working React prototype driven by
deterministic, simulated live telemetry for a fictional Gulf-of-Mexico fleet.

The app opens on a launch splash, then a **fleet view** (trend board ranked by sustained
efficiency deviation), drills into a **vessel view** (causal-chain diagnosis: efficiency →
engine twins → fuel schematic → reconciliation → weather → crew → route), and has an unstyled
**inspect** page for raw data tables. The scripted story: one vessel (*Meridian*) shows a
3-week EGT/fuel divergence surfacing as a CAUTION.

---

## The repo

| Path / file | What it is |
|---|---|
| `src/app/` | Next.js App Router routes: `/` (fleet view + splash), `/vessel/[id]` (vessel view), `/inspect` (raw tables) |
| `src/data/` | Data layer — deterministic telemetry generator, derived metrics, alerts, and the **disposition registry** (`dispositions.ts`), the architectural spine that decides where each field renders |
| `src/state/` | `FleetProvider.tsx` — interaction state only (fleet snapshot, live tick, sim clock) |
| `src/components/` | Presentation only (props in, events out); locked component names live in `index.ts` |
| `scripts/verify.ts` | CLI verification harness (`npm run verify`) — proves the scripted demo scenario in numbers and asserts determinism |
| `docs/` | Design-system atlas (`atlas.json`, `LAYER_ATLAS*.md`), Figma MCP bridge notes, reference screens/videos |
| `Launch Oceanus Demo.command` | macOS double-click launcher (installs deps on first run, starts the server, opens the browser) |
| **Docs of record** | `DATA_MODEL.md` (spec), `DECISIONS.md` (ruling ledger), `CLAUDE.md` (architecture + working rules), `FIGMA_STANDARD.md` (design↔code binding), `KICKOFF_PROMPT.md` (session briefs), `PROGRESS.md` (session log) |

**Branch model:** `main` is the single source of truth — it contains the full redesign and the
launch splash. Do all work on `main` (or short-lived branches merged straight back). Historically
work drifted onto a long-lived `layout-probe` branch while `main` lagged on an early greybox; that
has been consolidated. If you clone and see a primitive greyscale UI, you are not on the merged
`main` — check `git log --oneline` for the "Round NNN" commits.

## Prerequisites

- **Node.js ≥ 20** (built and tested on Node 24 LTS) and npm. Check with `node -v`.
  If `node` is not found, install the LTS from [nodejs.org](https://nodejs.org) (or a version
  manager) and make sure its `bin` is on your `PATH`.

## Run it

```bash
npm install      # first time only
npm run dev      # starts http://localhost:3000
```

Then open **http://localhost:3000**.

On macOS you can instead **double-click `Launch Oceanus Demo.command`** — it installs
dependencies on the first run, starts the dev server, and opens the fleet view. Keep that
Terminal window open while presenting; close it (or Ctrl+C) to stop the server.

### Routes

- `/` — fleet view (launch splash → ranked trend board + fleet map)
- `/vessel/[id]` — vessel view (e.g. `/vessel/v01` = *Meridian*, the scripted anomaly)
- `/inspect` — raw data tables (not the dashboard)

## Verify

```bash
npm run verify
```

Regenerates the fleet from a fixed `SEED` and proves the scripted scenario in numbers: exactly one
CAUTION vessel (*Meridian*, ≈ +14% in TRANSIT), the 3-week EGT/fuel divergence with the other
causal buckets excluded, fleet-wide fuel reconciliation, staleness states, and **byte-identical
regeneration** (determinism). Exits non-zero on any failed check. Run it after touching anything in
`src/data/`.

**Determinism contract:** same `SEED` → identical fleet and timeline. "Now" is a fixed
`DEMO_EPOCH` (2026-06-18T15:00Z), not the wall clock; live mode advances 1-minute ticks from there.

## Other scripts

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Where to read next

Start with **`CLAUDE.md`** (architecture, the disposition registry, and working rules), then
**`DATA_MODEL.md`** (the authoritative spec) and **`DECISIONS.md`** (binding rulings).
`PROGRESS.md` is the running session log.
