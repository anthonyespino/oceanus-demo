# Oceanus Fleet Fuel Efficiency Interface
## Systems Audit & Data Model — v1 (Day 1)

Author: Anthony Espino
Purpose: Single source of truth for (1) Figma information architecture, (2) Claude Code mock data generator spec, (3) presentation "design process" section.

---

## 1. User & Job Definition

**Target user:** Shore-side engineer at an offshore supply vessel operator.

**Profile assumption (pending confirmation from Matt/Carl):** ~15-20 vessels of mixed size and capability, Gulf of Mexico / coastal US operations. The engineer knows every vessel by name but cannot watch them all simultaneously.

**Primary job:** Detect, diagnose, and act on fuel efficiency deviations across the fleet.

**The core question loop:**
1. Whose burn is off? (fleet level)
2. Is it real, or is it the mode? (context check)
3. Which bucket is the cause? (diagnosis)
4. What do I do about it? (action: call the vessel, schedule maintenance, flag routing)

**Design posture (assumption #3 in email):** Real-time exception monitoring owns the default view. Historical analysis is one click deep.

---

## 2. Operating Modes (first-class dimension)

Fuel burn is only meaningful relative to what the vessel is doing. Every efficiency judgment in the interface is mode-aware. Aviation analogy: phase of flight.

| Mode | Description | Expected burn profile |
|---|---|---|
| TRANSIT | Underway between ports/sites | High, speed-dependent. Burn vs. speed is roughly cubic: small speed increases cost disproportionate fuel |
| STATION | Holding position offshore (DP) | Moderate-high and weather-dependent. Thrusters fire continuously; burn rises with wind/current/sea state |
| STANDBY | Loitering near site, minimal maneuvering | Low-moderate. Mostly generator load |
| PORT | Docked or anchored | Low. Hotel loads only (generators). Main engines should be near zero |

**Derivation:** Mode is not in the prompt's dataset directly. Derive from speed-over-ground + position + engine load pattern:
- Speed > ~4 kn → TRANSIT
- Speed ~0, offshore, thrusters/mains active → STATION
- Speed ~0, offshore, minimal main engine load → STANDBY
- Position within port geofence → PORT

This derivation is itself a presentable design decision: "the data doesn't give you mode, so the system infers it."

---

## 3. Source Data Streams (from prompt)

### 3.1 Engine telemetry — 4 diesel engines per vessel
Split: 2 main propulsion + 2 generators (assumption; confirm).

Fields per engine (sampled ~1/min for demo):
- engine_id, role (MAIN | GEN)
- running (bool), load_pct
- rpm
- fuel_rate_gph (per-engine consumption)
- exhaust_gas_temp_f (EGT — leading indicator of combustion problems)
- coolant_temp_f
- oil_pressure_psi
- oil_temp_f
- running_hours (cumulative — drives maintenance context)

**Questions answered:** Is an engine degrading? (EGT trending up at constant load = injector/fouling issues.) Is load shared sensibly across engines? Is a generator running unnecessarily?

### 3.2 Fuel tanks — 4 per vessel (2 storage, 2 feeder)
Fields per tank (sampled ~1/min):
- tank_id, type (STORAGE | FEEDER)
- level_gal, capacity_gal, level_pct
- transfer_active (bool, storage→feeder)

**Questions answered:** Endurance (time/distance remaining at current burn). When does this vessel need to bunker? Is fuel where it should be?

### 3.3 Flow rate sensor
- flow_gps (gallons per second, vessel total to engines)

**Questions answered:** Instantaneous total burn. Cross-check stream (see §5).

### 3.4 Crew roster (live)
- crew_member_id, name, role (Master, Chief Engineer, etc.)
- onboard_since (crew change date)

**Questions answered:** Did efficiency shift at a crew change? Which crews consistently run efficient? (Comparative, not punitive — framing matters in the UI.)

### 3.5 Weather (live, per vessel)
- wind_speed_kn, wind_dir_deg
- wave_height_ft, current_kn, current_dir_deg
- visibility, precip

**Questions answered:** Is elevated burn explained by environment? (Headwinds/seas in TRANSIT, wind/current loading in STATION.) Normalizes efficiency so machine problems aren't masked by weather and weather isn't misread as machine problems.

### 3.6 Position & ports
- lat, lon, speed_over_ground_kn, heading_deg
- next_port_calls[] (port, eta)

**Questions answered:** Where is everyone? Mode derivation input. Route adherence. Idle/waiting time outside ports (burn with no progress).

**Data freshness:** All streams carry last_updated. Satellite links drop. STALE is a first-class UI state (gray, timestamped), never silently shown as current. (Avionics rule: a dead gauge must look dead.)

---

## 4. Derived Metrics (the synthesis layer)

Raw telemetry doesn't answer the engineer's questions. These do:

| Metric | Definition | Used for |
|---|---|---|
| burn_rate_gph | Vessel total fuel consumption per hour | Live status |
| efficiency_transit | Gallons per nautical mile (TRANSIT only) | The headline efficiency number underway |
| efficiency_station | gph normalized against weather loading (STATION only) | Station-keeping efficiency |
| mode_baseline | Expected burn range for this vessel, this mode, this weather band — built from the 1-year history | The reference everything is judged against |
| efficiency_delta | Current vs. mode_baseline, in % | The ranking number on the fleet view |
| trend_30d / trend_90d | Slope of efficiency_delta over time | Slow degradation (hull fouling, engine wear) that snapshots miss |
| endurance | Usable fuel ÷ current burn rate → hours and nm | Bunkering planning |
| reconciliation_error | (Tank level change) − (flow meter total) over window | Sensor fault / transfer error / leak detection |

**The one-sentence pitch for the panel:** the interface's job is to turn six raw streams into one ranked number per vessel (efficiency_delta), then let the engineer unfold *why* on demand.

---

## 5. Cross-Checks (trust layer)

Fuel data flows through a chain: storage tanks → feeder tanks → flow meter → engines. Each stage independently measures roughly the same fuel, which means the system can verify itself:

- Σ engine fuel_rate ≈ flow meter reading (disagreement → engine sensor fault)
- Flow meter total over time ≈ feeder tank drawdown + transfers (disagreement → meter fault, transfer error, or leak)

UI implication: when streams disagree, show the disagreement explicitly rather than picking one silently. Engineers trust instruments that admit uncertainty.

---

## 6. Causal Buckets (diagnosis model)

Every efficiency deviation traces to one of four buckets. The single-vessel view is organized so the engineer can walk this chain:

| Bucket | Evidence streams | Signature |
|---|---|---|
| Machine | Engine telemetry | EGT/temps trending at constant load; one engine's fuel_rate diverging from its twin |
| Hull & environment | Weather + speed + burn history | Burn elevated vs. baseline *after* weather normalization, worsening over months → fouling. Explained by weather → environment |
| Human factors | Crew roster + burn history | Efficiency step-change at crew change; speed habits in TRANSIT |
| Operations | Position + ports | Off-plan routing, excessive idle time awaiting berth, speed above plan |

Twin-engine comparison (Engine 1 vs 2 on the same shaft load) and sister-vessel comparison (same class, same route) are the two most powerful diagnostic tools the data supports — both are pure UI wins, no new sensors required.

---

## 7. Alert Hierarchy (avionics-derived)

Three levels, mapped from Part 23 alerting philosophy:

| Level | Meaning | Example | UI behavior |
|---|---|---|---|
| WARNING (red) | Immediate attention; safety/operational risk | Feeder tank critically low underway; engine oil pressure out of limits; reconciliation error large (possible leak) | Top of fleet view, persistent, requires acknowledgment |
| CAUTION (amber) | Abnormal, attention soon | efficiency_delta > threshold for sustained period; EGT trend exceeds rate limit; endurance below route requirement | Ranked surfacing, badge on vessel |
| ADVISORY (white/blue) | Informational | Crew change occurred; bunkering recommended within 72h; data stale > 30 min | Log/feed, subtle badge |

Rule carried over from flight deck work: alert on *conditions requiring action*, not on raw thresholds. An amber that the engineer can't act on is noise.

---

## 8. Information Hierarchy (Figma IA)

**Level 1 — Fleet view (default screen)**
- Ranked vessel list/grid by |efficiency_delta|, exceptions float to top
- Per vessel row/card: name, mode chip, efficiency_delta, sparkline (24h), alert badges, endurance, position summary
- Fleet map (position + mode color-coding)
- Active alerts rail (WARNING/CAUTION across fleet)
- Healthy vessels compress (the "42 friends OK" pattern)

**Level 2 — Vessel view (one click)**
Organized by the causal chain, top to bottom:
- Header: identity, mode, position, next port, crew summary, endurance
- Efficiency panel: delta vs. mode baseline, 24h/30d/90d/1y trends
- Machine: 4 engine cards (twin comparison emphasized), EGT/load/fuel rate
- Fuel system: tank schematic (2 storage → 2 feeder), flow rate, reconciliation status
- Environment: weather vs. burn overlay
- Context: crew tenure timeline, route/port timeline

**Level 3 — Comparison & history (the analytical mode)**
- Vessel vs. sister vessel, crew A vs. crew B, this quarter vs. last
- This level is acknowledged in the presentation as roadmap; only Level 1 and 2 get full Figma treatment. (Quality over quantity per the brief.)

---

## 9. Demo Anomaly Scenario (scripted)

The 60-second story for the live React demo:

1. Fleet view: 16 vessels nominal, one (e.g. *Meridian*) carries a CAUTION — efficiency_delta +14% in TRANSIT, trending worse over 3 weeks.
2. Click into vessel view. Weather panel: calm seas, light wind → environment doesn't explain it. Route on plan → operations doesn't explain it. No recent crew change → human factors doesn't explain it.
3. Machine panel: Engine 2 EGT +60°F over its twin at matched load, fuel rate diverging for 3 weeks.
4. Conclusion spoken to panel: "Injector fouling on Engine 2, caught three weeks before it becomes a casualty report, from shore, in four clicks."

Mock data generator must support: nominal fleet noise + this one scripted, time-coherent anomaly.

---

## 10. Open Questions (sent to Matt/Carl, Day 1)

1. Fleet profile ~15-20 vessels — confirm
2. Mode-aware efficiency evaluation — confirm telemetry supports / philosophy agrees
3. Default posture: real-time exception monitoring vs. historical analysis — confirm

Fallback if no reply by Figma lock (Sat June 13): proceed on all three assumptions as written, note them as explicit assumptions in the presentation.

---

## 11. Claude Code Handoff Notes

- This file is the spec. Mock data generator implements §3 fields, §2 mode logic, §4 derived metrics, §9 scenario.
- Suggested structure: deterministic seed + scripted anomaly timeline so the demo is repeatable.
- 16 vessels, 1 year of hourly history (for trend charts), last 24h at 1-min resolution (for live feel).
- PROGRESS.md maintained per session; reviewed externally.
