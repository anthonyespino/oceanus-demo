# DECISIONS — ruling ledger

PM/customer rulings binding on implementation. Per DATA_MODEL.md §11 (v2),
this file is the ruling ledger; PROGRESS.md remains the session log.

*Ledger created Session 3 (2026-06-10). Rulings 1–5 are transcribed from the
PM's Session 1 review (relayed during Session 2); 6–8 are reconstructed from
their references in the Session 3 brief — PM: flag any drift from the
originals.*

| # | Date | Ruling | Rationale | Status |
|---|------|--------|-----------|--------|
| 1 | 2026-06-10 | Reconciliation severity is consequence-based: ADVISORY ≤7%, CAUTION 7–10% (`RECON_CAUTION_PCT`), WARNING >10% | Fuel-accounting error propagates ~1:1 into endurance; above ~7% it corrupts bunkering decisions | Applied S2 (`alerts.ts`) |
| 2 | 2026-06-10 | ENDURANCE alert derives its requirement from distance-to-next-port at cruise speed × 1.5 reserve; message states its basis | No microcopy implying computation that doesn't exist | Applied S2 (`alerts.ts`) |
| 3 | 2026-06-10 | EGT_DIVERGENCE interpolates the actual diverging `engine_id` | Don't hardcode "Engine 2"; either twin can diverge | Applied S2; verify asserts it |
| 4 | 2026-06-10 | The four UNDEFINED dispositions stay UNDEFINED, rendered as placeholder boxes | Pending Anthony's Figma work | Standing |
| 5 | 2026-06-10 | DEMO_EPOCH stays pinned at 2026-06-18T15:00Z | Clock adjusted once the onsite slot is confirmed | Standing |
| 6 | 2026-06-10 | Vessel-level registry entries for `position` (relative reference) and `endurance_hours`, VISIBLE | Resolves the S2 header gap; v2 §8 keeps both in the header | Applied S3 (`dispositions.ts`, `VesselHeader`) |
| 7 | 2026-06-10 | Grouped Contextual reveals approved (per-card "details", per-engine "sensors") | Six hover targets per engine is hover-hell; rows still consult the registry individually | Confirmed S3, no change |
| 8 | 2026-06-10 | §9 EGT wording: ≈50–60°F divergence by week 3 (weekly average; instantaneous peak ≈60°F) | Matches what the generated data actually shows | Applied S3 (verify wording, bounds 45–65) |
| 9 | 2026-06-10 | Fleet is 15 vessels (dropped *Petrel*, v16) | Per customer answer (M. McMunigle): target profile is a 15-OSV operator | Applied S3 |
| 10 | 2026-06-10 | Mode is a reported telemetry field (new §3.4 vessel status feed, carries last_updated); §2 derivation retained as validation cross-check / documented fallback only | Per customer answer (M. McMunigle): modes are exposed in telemetry | Applied S3; verify asserts ≥99.5% agreement |
| 11 | 2026-06-10 | New derived metric `sustained_deviation`: recency-weighted mean of last 30 daily deltas (linear weights) × sign-persistence fraction | Per customer answer (M. McMunigle): analytical-first posture needs a ranking score where sustained drift outranks momentary spikes. Formula proposed by dev (spec says "e.g."); verify proves Meridian #1 and spike < drifter | Applied S3 (`derived.ts`). **Amended 2026-06-11**: the "HIDDEN at fleet level / rank-order-only" clause was DEV-proposed, not part of this ruling — reclassified as DEV DECISION pending Anthony, ⚖ verdict #12 (sd numeral on tiles vs rank-order-only). Current behavior unchanged until his verdict; fleet-chart tooltip now shows mode + 30d so no surface contradicts another meanwhile |
| 12 | 2026-06-10 | FleetView becomes the trend board: sorted by \|sustained_deviation\|; 30/90d trend sparkline is the primary per-vessel graphic; 24h sparkline → CONTEXTUAL pending Anthony's registry ruling; AlertRail demoted to context strip below the ranking header (greybox position only — final placement is Anthony's Figma call); new `FleetView/FleetTrend` 1y strip | Per customer answer (M. McMunigle): posture flip — trends organize the view, alerts annotate it | Applied S3 |
| 13 | 2026-06-10 | `trend_30d` and `trend_90d` → VISIBLE at fleet level | Per customer answer (M. McMunigle): trend is the primary fleet-level signal | Applied S3 (`dispositions.ts`) |
| ⚖13 | 2026-06-11 | RESOLVED (round 21 A4): gauges win the sensors verdict — per-engine text sensor rows deleted; the cluster is the one sensor surface, embedded in the engine twins panel | Anthony, via round 21 brief | Applied S25 |
| 14 | 2026-06-11 | Instrument gauges are vital-colored: green when active and nominal, amber when sub-nominal, red at warning-backed breaches, WHITE when off / at port and not moving | Per Anthony (direct): "white represents static stillness and otherwise a color is designated and shows it's alive" | Applied S22; **amended by round 19 (S23)**: needle is ink/primary always, value colors only on alert-backed crossings (green-alive dropped), white stillness retained for moored dials, dormant = dimmed arc + OFF. Red-for-WARNING interpretation unchanged |
| ⚖6 | 2026-06-12 | RESOLVED (round 36): `heading_deg` → VISIBLE, rendered as directional hull-marker rotation on both charts (glyph/vesselMarker), never as a numeral | Anthony, via round 36 brief ("resolves ⚖ #6: yes") | Applied S35 (`dispositions.ts`, FleetMap, InspectorChart) |
| ⚖9 | 2026-06-12 | RESOLVED (round 30): dot-matrix wins the tank-fill verdict — the bars/row layout is deleted | Anthony, via round 30 brief | Applied S31 |
| ⚖11 | 2026-06-12 | RESOLVED (round 30): the fuel card is VesselSynoptic — synoptic on top, dot-matrix tank quartet beneath (ST1 ST2 FD1 FD2, % + gal); TankSchematic and the round-26 view switcher retired | Anthony, via round 30 brief | Applied S31 |

## Notes

- **Ledger hygiene (2026-06-11, standing)**: dev-proposed design choices are
  logged as "DEV DECISION (pending Anthony)" and never folded into a numbered
  PM ruling's text. Ruling 11 was the corrective case.
- **Ruling 12 pending item resolved (2026-06-12, round 39)**: the "24h
  sparkline → CONTEXTUAL pending Anthony's registry ruling" clause is settled —
  `efficiency_sparkline_24h` is VISIBLE at fleet level as the tile-bottom 24h
  signature (full card width, fixed height, every tile size).


- DATA_MODEL.md v2 arrived during Session 3 as `DATA_MODEL_v2.md` and was
  promoted to `DATA_MODEL.md` (the spec-of-record filename all code and docs
  reference); v1 is preserved in git history.
- v2 §8 Level 2 "trend overlays" on engine cards: **built round 10**
  (2026-06-11) — daily-mean EGT, 30d, on each engine card's contextual layer.
  Demo step 3 material: Engine 2's line visibly climbs while Engine 1's stays
  flat.
