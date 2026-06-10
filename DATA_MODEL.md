# Oceanus Fleet Fuel Efficiency Interface
## Systems Audit & Data Model — v2

Author: Anthony Espino
Purpose: Single source of truth for (1) Figma information architecture, (2) Claude Code mock data generator spec, (3) presentation "design process" section.

**v2 changelog (June 11) — incorporates Matthew McMunigle's answers to the Day 1 assumption email:**
1. Fleet profile CONFIRMED: target customer profile is a 15-OSV operator. Fleet count 16 → 15.
2. Operating modes are EXPOSED IN TELEMETRY (not derived). Our four-mode set stands as our stated assumption. Derivation logic retained as documented fallback only.
3. POSTURE FLIP: shore-side engineers decide from historical/analytical trends, not instantaneous signals. Real-time exceptions are supporting context, not the primary purpose. Default view is now analytical-first. (§1, §4, §8, §9 updated.)

---

## 1. User & Job Definition

**Target user:** Shore-side engineer at an offshore supply vessel operator.

**Profile (confirmed):** ~15 vessels of mixed size and capability, Gulf of Mexico / coastal US operations. The engineer knows every vessel by name but cannot watch them all simultaneously.

**Primary job:** Detect, diagnose, and act on fuel efficiency deviations across the fleet — where "detect" primarily means recognizing developing trends over weeks and months, not reacting to instantaneous alarms.

**The core question loop:**
1. Whose efficiency is trending wrong? (fleet level, trend-led)
2. Is it real, or is it the mode/weather? (context check)
3. Which bucket is the cause? (diagnosis)
4. What do I do about it? (action: call the vessel, schedule maintenance, flag routing)

**Design posture (confirmed by Matt, June 11):** Historical/analytical trends own the default view. Real-time exception surfacing remains present as context (alert strip, status badges) but is not the organizing principle of the home screen. Aviation analog for presentation: engine condition trend monitoring — catching slow failures from trend data weeks before any alarm threshold trips.

---

## 2. Operating Modes (first-class dimension)

Fuel burn is only meaningful relative to what the vessel is doing. Every efficiency judgment in the interface is mode-aware. Aviation analogy: phase of flight.

| Mode | Description | Expected burn profile |
|---|---|---|
| TRANSIT | Underway between ports/sites | High, speed-dependent. Burn vs. speed is roughly cubic: small speed increases cost disproportionate fuel |
| STATION | Holding position offshore (DP) | Moderate-high and weather-dependent. Thrusters fire continuously; burn rises with wind/current/sea state |
| STANDBY | Loitering near site, minimal maneuvering | Low-moderate. Mostly generator load |
| PORT | Docked or anchored | Low. Hotel loads only (generators). Main engines should be near zero |

**Source (confirmed):** Mode is exposed in vessel telemetry as a reported field. The four-state set above is our stated assumption of which modes/states are calculable, per Matt's invitation to assume.

**Fallback derivation (documented, not primary):** Where telemetry mode is absent or stale, mode can be inferred from speed-over-ground + position + engine load pattern (speed > ~4 kn → TRANSIT; ~0 kn offshore with thruster/main load → STATION; ~0 kn offshore minimal main load → STANDBY; within port geofence → PORT). Retained in the generator as a validation cross-check; presentable as data-resilience thinking.

---

## 3. Source Data Streams (from prompt)

### 3.1 Engine telemetry — 4 diesel engines per vessel
Split: 2 main propulsion + 2 generators (assumption; unchallenged by Matt/Carl).

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

### 3.4 Vessel status feed
- mode (TRANSIT | STATION | STANDBY | PORT) — confirmed telemetry field, v2

### 3.5 Crew roster (live)
- crew_member_id, name, role (Master, Chief Engineer, etc.)
- onboard_since (crew change date)

**Questions answered:** Did efficiency shift at a crew change? Which crews consistently run efficient? (Comparative, not punitive — framing matters in the UI.)

### 3.6 Weather (live, per vessel)
- wind_speed_kn, wind_dir_deg
- wave_height_ft, current_kn, current_dir_deg
- visibility, precip

**Questions answered:** Is elevated burn explained by environment? Normalizes efficiency so machine problems aren't masked by weather and weather isn't misread as machine problems.

### 3.7 Position & ports
- lat, lon, speed_over_ground_kn, heading_deg
- next_port_calls[] (port, eta)

**Questions answered:** Where is everyone? Route adherence. Idle/waiting time outside ports (burn with no progress).

**Data freshness:** All streams carry last_updated. Satellite links drop. STALE is a first-class UI state (gray, timestamped), never silently shown as current. (Avionics rule: a dead gauge must look dead.)

---

## 4. Derived Metrics (the synthesis layer)

Raw telemetry doesn't answer the engineer's questions. These do:

| Metric | Definition | Used for |
|---|---|---|
| burn_rate_gph | Vessel total fuel consumption per hour | Live status (context) |
| efficiency_transit | Gallons per nautical mile (TRANSIT only) | The headline efficiency number underway |
| efficiency_station | gph normalized against weather loading (STATION only) | Station-keeping efficiency |
| mode_baseline | Expected burn range for this vessel, this mode, this weather band — built from the 1-year history | The reference everything is judged against |
| efficiency_delta | Current vs. mode_baseline, in % | Instantaneous deviation (context) |
| **trend_30d / trend_90d** | Slope of efficiency_delta over time | **The primary fleet-level signal (v2).** Slow degradation (hull fouling, engine wear) that snapshots miss |
| **sustained_deviation** | Trend-weighted ranking score (e.g., 30d mean delta combined with slope) | **What sorts the fleet view (v2)** — sustained drift outranks momentary spikes |
| endurance | Usable fuel ÷ current burn rate → hours and nm | Bunkering planning |
| reconciliation_error | (Tank level change) − (flow meter total) over window | Sensor fault / transfer error / leak detection |

**The one-sentence pitch for the panel (v2):** the interface's job is to turn six raw streams into one trend per vessel, surface the vessels whose trajectories are degrading, and let the engineer unfold *why* on demand.

---

## 5. Cross-Checks (trust layer)

Fuel data flows through a chain: storage tanks → feeder tanks → flow meter → engines. Each stage independently measures roughly the same fuel, which means the system can verify itself:

- Σ engine fuel_rate ≈ flow meter reading (disagreement → engine sensor fault)
- Flow meter total over time ≈ feeder tank drawdown + transfers (disagreement → meter fault, transfer error, or leak)

UI implication: when streams disagree, show the disagreement explicitly rather than picking one silently. Engineers trust instruments that admit uncertainty. Reconciliation also protects the trend layer: a drifting sensor must not masquerade as a drifting vessel.

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

## 7. Alert Hierarchy (avionics-derived) — context layer in v2

Alerts remain, but as supporting context per Matt's answer: they annotate the analytical view rather than organize it.

| Level | Meaning | Example | UI behavior (v2) |
|---|---|---|---|
| WARNING (red) | Immediate attention; safety/operational risk | Feeder tank critically low underway; engine oil pressure out of limits; reconciliation error large (possible leak) | Context strip, persistent, requires acknowledgment |
| CAUTION (amber) | Abnormal, attention soon | sustained efficiency deviation; EGT trend exceeds rate limit; reconciliation degrading endurance confidence; endurance below route requirement | Badge on vessel row + context strip |
| ADVISORY (white/blue) | Informational | Crew change occurred; bunkering recommended within 72h; data stale > 30 min | Log/feed, subtle badge |

Rule carried over from flight deck work: alert on *conditions requiring action*, not on raw thresholds. An amber that the engineer can't act on is noise.

---

## 8. Information Hierarchy (Figma IA) — v2

**Level 1 — Fleet view (default screen): the trend board**
- Ranked vessel list/grid sorted by **sustained_deviation** (trend-led, not instantaneous): vessels whose efficiency trajectories are degrading float to top
- Per vessel row/card: name, mode chip, **30/90d trend visualization (primary graphic)**, current efficiency_delta (context number), alert badges, endurance
- Fleet-level efficiency trend strip: the whole fleet's trajectory over the year (also informs the fleet_total_daily_spend UNDEFINED decision)
- Alert context strip: active WARNING/CAUTION across fleet — present, demoted from hero position
- Fleet map (position + mode color-coding)
- Healthy vessels compress (stable trends, no alerts → "N vessels nominal" row)

**Level 2 — Vessel view (one click)**
Organized by the causal chain, top to bottom:
- Header: identity, mode, position (relative reference), next port, crew summary, endurance
- Efficiency panel: **trend history first (30d/90d/1y), then current delta vs. mode baseline**
- Machine: 4 engine cards (twin comparison emphasized), EGT/load/fuel rate, with trend overlays
- Fuel system: tank schematic (2 storage → 2 feeder), flow rate, reconciliation status
- Environment: weather vs. burn overlay
- Context: crew tenure timeline, route/port timeline, mode timeline

**Level 3 — Comparison & history (deep analytical)**
- Vessel vs. sister vessel, crew A vs. crew B, this quarter vs. last
- Acknowledged in the presentation as roadmap; only Level 1 and 2 get full Figma treatment. (Quality over quantity per the brief.)

---

## 9. Demo Anomaly Scenario (scripted) — v2 narrative

The 60-second story for the live React demo, now trend-led:

1. Fleet view: 14 vessels with stable trajectories, one (*Meridian*) at the top of the trend board — efficiency degrading steadily for 3 weeks, now ≈ +14% in TRANSIT. **No alarm dragged the engineer here; the trend view surfaced it.** (A CAUTION badge is present as context — the trend crossed the sustained threshold — but the discovery is analytical.)
2. Click into vessel view. Trend panel confirms a 3-week monotonic slide. Weather: calm in the window → environment excluded. Route on plan → operations excluded. No crew change in the window → human factors excluded.
3. Machine panel: Engine 2 EGT diverging from its twin (≈50-60°F at matched load), fuel rate diverging, for the same 3 weeks.
4. Conclusion spoken to panel: "Injector fouling on Engine 2, caught three weeks of trend before it becomes a casualty report — this is the difference between analytical monitoring and waiting for alarms."

Mock data generator must support: nominal fleet noise + this one scripted, time-coherent anomaly.

---

## 10. Assumption Status (was: open questions)

All three Day 1 questions answered by Matthew McMunigle, June 11:
1. Fleet profile: CONFIRMED — 15-OSV operator is the target customer profile.
2. Mode-aware efficiency: CONFIRMED — modes exposed in telemetry; our four-state set stands as stated assumption.
3. Default posture: ANSWERED WITH FLIP — analytical/historical primary, real-time exceptions as context. Incorporated throughout v2.

---

## 11. Claude Code Handoff Notes

- This file is the spec. Mock data generator implements §3 fields, §2 mode logic, §4 derived metrics, §9 scenario.
- 15 vessels (v2), 1 year of hourly history (for trend charts), last 24h at 1-min resolution (for live feel).
- Deterministic seed + scripted anomaly timeline; demo exactly repeatable.
- PROGRESS.md maintained per session; DECISIONS.md is the ruling ledger; FIGMA_STANDARD.md binds all UI/styling sessions.
