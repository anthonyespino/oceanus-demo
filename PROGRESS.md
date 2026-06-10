# PROGRESS — 2026-06-10 (Session 9: ROUND 6 — PortCallsTimeline, FINAL probe component)

Last new component on the probe. Nothing after this but Anthony's verdicts
and the Figma reskin.

## Done

- **PortCallsTimeline**, full-width below the fleet chart: rows are ports with arrivals inside 72h (plus moored vessels), sorted by soonest; NOW → +72h axis with 12h gridlines, NOW rule in accent/bright, +12H/+24H… DM Mono micro labels. Blocks = vessel name + ETA chip, left edge tinted by status color (treatment-aware, same logic as markers/tiles), body surface/raised; moored vessels pin as "IN PORT" at NOW. Click → that vessel's inspector via the same URL state. Empty state renders "NO PORT CALLS SCHEDULED — 72H".
- **BUNKER flag**: shown when `endurance_hours < hours-to-port × ENDURANCE_RESERVE` — the constant is now exported from `alerts.ts` and shared; zero second magic numbers. Tagged in advisory blue (it parallels the BUNKER_SOON advisory, not a fault).
- Scope held (item 2): no berth rows, no delay statuses, no congestion — ports and ETAs only, because that's all the generator knows.
- Registry: `port_calls_timeline` added as fleet-level VISIBLE with a note — it promotes next-port data to persistent at fleet level while `next_port_eta` remains CONTEXTUAL on tiles; Anthony to confirm or re-rule.
- verify/lint/build green; screenshot `docs/screens/r6-fleet-board.png`.

## Decisions Made (ALL REVERSIBLE)

- REVERSIBLE: BUNKER math uses schedule time-to-port (ETA − now) where the ENDURANCE alert uses distance/cruise-speed — same reserve constant, slightly different basis; unifying on distance is a 3-line change if the PM prefers strict parity.
- REVERSIBLE: multiple arrivals at one port stack as lanes inside the row (deterministic ETA order) rather than overlapping chips.
- REVERSIBLE: moored vessels show no BUNKER flag (they're at the dock — bunkering is an action available now, not a planning risk).
- REVERSIBLE: ETA chips clamp to 97% of the axis so late-window arrivals stay readable instead of bleeding off-frame.

## Questions / Objections for Anthony

1. Confirm `port_calls_timeline` VISIBLE at fleet level (registry note above).
2. Probe verdicts now due across all rounds: density, color treatment A/B, motion variant, layout a/b, IKB band, tanks bars/dots, green ✓ experiment — the dev panel (press D) flips everything in one place.

---

# PROGRESS — 2026-06-10 (Session 8: ROUND 5 — accent + design-system components)

## Done

- **IKB accent system** (`color/accent/primary #002FA7 · bright #4878FF · wash rgba(0,47,167,.22)`) — tokens only, FIGMA_STANDARD names. Wired to interaction & identity exclusively: global `:focus-visible` rings, chart marker hover rings, pinned-Contextual state, AlertRail links, FleetRail selection (wash background), active toggle states, live-tick pulse dot, route progress fill, EfficiencyCurve live-point ring. `selectionBorder()` codifies status-over-accent: a selected-but-degraded vessel keeps its status border. Accent/bright was tuned UP from #3D6BFF to **#4878FF** to clear 4.5:1 on the raised surface, not just base.
- **Mode collision fix**: `color/mode/transit` → desaturated steel `#475463`; mode chips no longer read interactive next to accent.
- **One large IKB moment**: fleet-band stat block (IKB fill, white DM Mono numerals) behind the `ikb band` dev-panel toggle for Anthony's judgment.
- **EfficiencyCurve** (inspector hero): median + IQR envelope from the vessel's own 1y transit history (0.5 kn bins, ≥6 samples/bin), optimal-speed bracket, live operating point (accent ring; status fill when watch/degraded), dotted drop-line labeled with the displacement. Sparse state renders the band faint + "INSUFFICIENT TRANSIT HISTORY" — no fake curves. **Verify proves the payoff**: Meridian's point sits +12.8% above its own envelope ≈ efficiency_delta +14.1% (±5pp tolerance; the gap is weather-banded baseline vs all-weather median).
- **SystemStatusStrip** (header): DATALINK FRESH/DEGRADED/STALE (worst-case stale-stream count; affected vessels behind a Contextual hover), LAST SYNC (oldest stream age, live-updating off the sim clock), ALERTS count by level linking to `#alert-strip`. Reports only what the system knows — no invented scores.
- **RoutePanel voyage strip**: last port ──●── next port, fill = great-circle fraction in accent/primary, following port noted; PORT collapses to "MOORED — {port}"; STATION/STANDBY names the anchor site — no fake progress. Departure port derives from the last PORT-mode sample in the 24h window; beyond that it degrades honestly to "UNDERWAY >24H + N NM TO GO".
- **EventLog** (inspector, collapsible): DM Mono terminal lines, newest first, 24h default + "load earlier" (8d), filter chips. Sources are existing generator facts only: mode transitions, crew changes, bunkering runs (storage-rise detection with port attribution), alert raises reconstructed from THE SAME exported constants the alert logic uses, staleness starts. Alert lines tint with status color.
- **Dot-matrix experiment**: TankSchematic 5×10 bottom-filled dot grid behind the `tanks` dev-panel toggle vs the row layout. Loser gets deleted after Anthony's call.
- **Dev panel**: all probe toggles (density, color treatment, motion, layout, IKB band, tank style) consolidated into one keypress-hidden panel — press **D**. FleetView's inline toggle row removed.
- verify/lint/build green; screenshots `docs/screens/r5-*.png`.

## Measured contrast ratios (hygiene item, vs dark surfaces)

| token | on surface/base #0e1116 | on surface/raised #151a21 |
|---|---|---|
| accent/bright #4878FF | 4.9:1 | 4.5:1 |
| alert/caution #e3b341 | 9.7:1 | 9.0:1 |
| alert/warning #f85149 | 5.6:1 | 5.2:1 |
| alert/advisory #79a8d8 | 7.6:1 | 7.0:1 |
| data/nominal #3fb950 | 7.4:1 | 6.8:1 |
| ink/primary #e8eaed | 15.9:1 | 14.7:1 |
| ink/secondary #a9b1ba | 8.7:1 | 8.1:1 |
| ink/muted #6e7681 | 4.1:1 | 3.8:1 |
| white on accent/primary #002FA7 | 10.7:1 | — |

ink/muted sits below 4.5:1 by design (it's the de-emphasis tone, 11px labels); flag if any muted text must be readable at distance during the demo.

## Decisions Made (ALL REVERSIBLE)

- REVERSIBLE: accent/bright lifted to #4878FF (from the suggested ~#3D6BFF region) to pass 4.5:1 on raised surfaces, not only base.
- REVERSIBLE: ADVISORY blue now has a real job — it colors the DATALINK item when DEGRADED/STALE (informational, matches §7 advisory semantics). Answers last round's question 3 in the affirmative; undo is one constant.
- REVERSIBLE: live-point ring is always accent; only its FILL carries status — ring = "this is the live thing" (identity), fill = health.
- REVERSIBLE: EventLog alert-raise reconstruction uses 3-consecutive-day persistence over the CAUTION threshold to date the raise.
- DATA-LAYER NOTE (needs PM ruling, not done): the burn-vs-speed envelope spans only ~1.5 kn because the generator sails fixed cruise speed per class — the curve is correct but visually narrow. Widening it means per-leg economic speed variation in the generator AND speed-aware baselines; too much regression risk this close to the onsite without a ruling.
- New data-layer files `curve.ts` and `events.ts` — analytics/extraction stay out of components per the three-layer rule; both consume only existing history.

## Deck material (roadmap-worthy, NOT built — round 5 item 7)

- Weather-window forecast overlay on the voyage strip (route + forecast = sail/hold call).
- Per-leg economic-speed recommendation derived from the EfficiencyCurve optimal band ("steaming 1.2 kn over optimal costs ~38 gal/h").
- Port-queue timeline (carried from round 4).
- Fleet-wide EfficiencyCurve overlay (sister-vessel envelope comparison — §6 sister-vessel diagnostic).

## Questions / Objections for Anthony

1. IKB band moment: judge with the dev-panel toggle (D → "ikb band").
2. Dot-matrix vs rows for tanks — loser gets deleted.
3. ink/muted at 4.1:1 — acceptable for micro labels, or lift it?
4. Envelope speed-range limitation (see data-layer note) — ruling wanted on generator speed variation post-onsite or never.

---

# PROGRESS — 2026-06-10 (Session 7: ROUND 4 — design foundation, branch `layout-probe`)

Anthony's locked visual identity applied as the BASE LAYER — foundation, not
final design. Everything routes through tokens; the Figma pass swaps values.

## Done

- **Token population** (first real 01·Foundations): full FIGMA_STANDARD §5 vocabulary as CSS variables in a Tailwind `@theme` block — `color/surface/base·raised·overlay` (near-black scale), `color/ink/primary·secondary·muted` (light scale), `color/alert/*` retuned for dark-background contrast (caution `#e3b341`, warning `#f85149` — both clear WCAG AA large-text on the surface scale), `color/mode/*` muted hues, `color/data/nominal·stale`, `space/1..8` on the 4px grid. `probeTokens.ts` is now the TS mirror — components reference tokens, never raw values.
- **VOCABULARY ADDITION pending Anthony's blessing**: `color/line/subtle·strong` (borders/strokes) — the §5 list has no border token and a dark theme needs one. Bless it into FIGMA_STANDARD or fold borders into `surface/overlay`.
- **Type system via next/font**: DM Sans (UI), DM Mono (all data/numerals, tabular — `type/data`), Bebas Neue (display: vessel names on tiles, fleet band numeral). Four type steps total (display/label/data/micro), per the probe hierarchy.
- **Fleet band instrument treatment**: new `Stat` primitive (letterspaced micro-label ABOVE oversized numeral); band hero is Bebas 46px; 2x tile endurance/now-vs-baseline use the same treatment in DM Mono.
- **Chart upgrades**: water near-black (`#0b0e13`), land slightly lighter, graticule faint; "GULF OF MEXICO" sea-area label (letterspaced, very low contrast, only on wide frames so it doesn't appear inside zoomed inspector views); 24h route trails on all fleet-chart markers — 0.75px neutral grey polylines in four opacity segments (0.07→0.30) for the fading tail. Status color remains on markers only; trails and labels stay neutral.
- **Chips/cards restyled** to dark surfaces with the existing radius token; geometry untouched. No glows, no gradients, no orange route lines.
- **Out of scope, logged**: port-queue timeline → roadmap/stretch candidate; icons still Anthony's; no new animation beyond the round-3 motion budget.
- verify/lint/build green; screenshots: `docs/screens/` (fleet board + Meridian inspector) — see below.

## Decisions Made (ALL REVERSIBLE — values are Anthony's)

- REVERSIBLE: every hex in this round lives in `globals.css @theme` — Anthony retunes by editing one block (or Figma Variables export replaces it).
- REVERSIBLE: band hero numeral uses Bebas per the brief's display assignment; Bebas digits are uniform-width but not formally tabular — if the numeral jitters in live mode, swapping to DM Mono is a one-prop change (`face="data"`), noted as the type-system tension between items 2 and 3.
- REVERSIBLE: nominal markers/dots in dark-cockpit treatment use neutral `#9aa3ad` (chart) / ink-muted (tiles) — light enough to read on near-black water without becoming a fourth status color.
- REVERSIBLE: trail sampling every 20 min, 4 segments — denser sampling or true gradient strokes are a Figma-stage call.
- REVERSIBLE: sea label sits at 52%/72% of the frame (open water, SE of the delta) — position is two constants.
- REVERSIBLE: mode hues: transit steel-blue, station green-grey, standby khaki, port neutral — all desaturated; pure placeholder values for Anthony's palette.

## Questions / Objections for Anthony

1. Bless or rename `color/line/subtle·strong` in FIGMA_STANDARD §5.
2. Bebas vs DM Mono for the band hero numeral (display impact vs tabular stability) — see the reversible note.
3. Advisory blue (`#79a8d8`) is populated but currently unused in the probe UI (advisories render as text) — wire it to ADVISORY badges or drop it from v1?
4. Port-queue timeline logged as roadmap — in or out for the onsite build?

---

# PROGRESS — 2026-06-10 (Session 6.2: LAYOUT PROBE round 3.2 — FleetTrend band)

## Done

- **FleetTrend promoted** to the full-width band at the top of the page; trend board directly below; chart below the board. This supersedes round 3's chart-on-top placement — the layout toggle now selects only the below-board chart's depth (a: 560px anchor / b: 240px band).
- **Band chart rebuilt**, tile-sparkline treatment: 7-day rolling mean over the fleet daily-mean series, zero-baseline reference line, subtle normal-range band (p10–p90 of the full smoothed year — a constant envelope independent of zoom), 30d/90d/1y range toggle (default 90d). Chart measures the band's content box and fills it — no orphaned space.
- **Hero numeral integrated**: 30px tabular "30d fleet mean +x.x%" sits left of the chart inside the band, not floating after it.
- **fleet_total_daily_spend slot reserved** under the hero numeral (placeholder unchanged — still UNDEFINED, ruling 4); removed from the page bottom. If Anthony rules it in, this is where it lives.
- verify/lint/build green.

## Decisions Made (ALL REVERSIBLE)

- REVERSIBLE: normal-range band = p10–p90 of the full year rather than of the visible window — a reference envelope shouldn't change meaning when you zoom; window-relative is one line.
- REVERSIBLE: 7-day rolling mean for smoothing (trailing window) — matches the 7d sustained gate in the alert logic.
- REVERSIBLE: range toggle is band-local state, not a FleetProvider toggle — it's a chart zoom, not a probe variant under comparison.
- REVERSIBLE: hero numeral reports the RAW 30d mean (not smoothed) — the number should match what derived metrics report elsewhere; smoothing is visual only.

---

# PROGRESS — 2026-06-10 (Session 6.1: LAYOUT PROBE round 3.1 fixes — branch `layout-probe`)

## Done

- **Overflow bug fixed**: both charts now measure their container's content box (`useContentWidth`: clientWidth + ResizeObserver, padding respected) and render inside a clipped wrapper — the SVG can no longer paint past the card stroke; fit-to-fleet refits re-derive from the measured width.
- **Label collision system** (`chartLayout.ts` — a systems decision, on record): (1) markers within 14px agglomerate into a cluster marker with a count chip ("2 ▾") that splays into a clickable member list on hover/focus; (2) remaining labels place greedily through 8 candidate anchors (E, W, N, S, then diagonals with leader lines), colliding against marker boxes, placed labels, chip boxes, and chart bounds; (3) an unplaceable label is dropped rather than overprinted — the tooltip still names the vessel. Placement order = rank order → fully deterministic. The same `clusterPoints` serves InspectorChart ghosts.
- **Marker affordances**: 28px invisible hit areas (24px on ghosts) — dots stay small, targets got big; hover/focus draws a marker ring and a tooltip (name, mode, sustained deviation, worst alert) rendered through the Contextual primitive (it gained a controlled `open` prop so SVG hover sources drive the same reveal — policy still one file); click/Enter/Space expands that vessel's inspector via the same URL state as a tile click; markers and cluster chips are tab-focusable.
- verify/lint/build green; routes smoke-tested.

## Decisions Made (ALL REVERSIBLE)

- REVERSIBLE: cluster radius 14px fleet / 10px ghosts; label font 9px with 0.58em width estimate — tune visually in Figma.
- REVERSIBLE: candidate order E → W → N → S → diagonals (leader lines only on diagonals) — biases labels to the right of markers, matching the chart's eastward-padded frame.
- REVERSIBLE: dropped-label fallback (vs. always-leader or font-shrink) — overprinting is the only banned outcome.
- REVERSIBLE: Contextual controlled mode (`open` prop) rather than a separate tooltip component — keeps all reveal policy in one file at the cost of one optional prop.
- REVERSIBLE: cluster splay panel overlaps its marker so the cursor crosses into it without a gap; closes on mouse-leave.

---

# PROGRESS — 2026-06-10 (Session 6: LAYOUT PROBE round 3 — branch `layout-probe`, no merge)

## Done

- **Chart promoted** (item 1; no per-tile maps existed to remove): SVG refactored into a shared `NauticalChart` core (water/coast/graticule/compass/scale, all recomputed from any lat/lon frame) composed by `FleetMap` and the new `InspectorChart`.
- **Inspector chart** (item 2): zoomed to focus vessel — frame fitted to its 24h trail + next port with floors so PORT vessels aren't absurdly zoomed; dashed route trail, dashed bearing line to next-port marker, other 14 vessels as faint ghost dots (dimmed, never removed).
- **Discrete tile tiers** (item 3): 1x nominal, 2x watch/degraded, promotion via the SAME `vesselStatus()` as color/badges — no separate thresholds. 2x spans 2×2 grid cells and spends the room on a 30d delta chart with the zero/baseline line. Grid uses default flow (NOT dense) — rank order + tier promotion are the only reflow. One surface, URL state untouched (item 4).
- **Addendum 5 — fit-to-fleet viewport**: `fitFleetFrame()` = fleet bounding box + padding + minimum spans; graticule steps and scale-bar length recompute from the frame (this overruled round 1's fixed-frame decision — markers may now shift slightly as the frame refits during live mode; flagged below).
- **Addendum 6 — alignment system**: new `DataRow` primitive (label left-ranged, numeral right-ranged, tabular); applied to tile data clusters, EngineCard state/load/fuel, tank cells. Composition (tiles, chart, page) stays centered. Prose sentences (recon explanation, weather summary line, crew tenure) are not label/value clusters and stay prose — if "no exceptions" includes those, say so and they become rows.
- **Addendum 7 — motion budget**: header toggle off/ripple/breathe. (a) one-time ripple ping on status threshold-cross during live mode (keyed to the crossing, runs once, steady after); (b) 2.5s opacity breathe on WARNING-only chart markers, paused on hover/focus. `prefers-reduced-motion` disables both. NO continuous blink anywhere.
- **Addendum 8 — layout variant toggle**: (a) board-first (trend board top, large anchor chart below — default) vs (b) chart-band (shallow 240px full-width fit-to-fleet band on top, board directly below).
- verify/lint/build green; routes smoke-tested.

## Pass/fail: the 2-second Meridian test

- **By size alone (treatment B, greyscale, no reading): PASSES.** Meridian is the fleet's only watch/degraded vessel, hence the only 2x tile — a 2×2 silhouette in a field of 1x squares is pre-attentive; no reading needed.
- **Layout variant verdict:** **(a) board-first survives cleanly** — the 2x tile sits top-left directly under the header. **(b) chart-band passes marginally** — the band + alert strip push the board ~400px down a laptop viewport; the 2x tile's top edge and width still read above the fold, and the band's amber marker gives a second cue, but the size cue is partially cropped at standard density. The round-3-as-built intermediate (560px anchor chart on top, before the addendum toggle) FAILED the test — it shoved the entire board below the fold; that failure is why the toggle exists and why (a) is the default.

## Decisions Made (ALL REVERSIBLE — Anthony overrules from Figma)

- REVERSIBLE: tier promotion = status ≠ nominal (watch AND degraded both go 2x) — alternative: 2x for degraded only, 1.5x never (discrete tiers per brief).
- REVERSIBLE: 2x tiles suppress the 90d micro-sparkline (the 30d baseline chart replaces it) — keeping both double-charts one tile.
- REVERSIBLE: fit-to-fleet padding (0.45° lat / 0.7° lon, extra east for name labels) and minimum window (2°×4°).
- REVERSIBLE: inspector chart sits at the top of the context (right) column, 480×300 — could go full-width under the header if spatial context should lead.
- REVERSIBLE: ripple fires on ANY status change (including improvements, e.g. watch→nominal) — could restrict to escalations only.
- REVERSIBLE: breathe paused via hover/focus on the marker itself — "stops on focus" could alternatively mean the inspector's focus vessel.
- NOTE: breathe is dormant in the scripted fleet (verify asserts zero WARNINGs) — mechanism is testable by hover-inspection or a future scripted WARNING; flag if a demo-visible WARNING should be scripted.
- NOTE: live-mode frame refits (fit-to-fleet) make chart markers drift slightly as the bounding box changes — if that reads as jitter during the demo, the frame can quantize to 0.5° steps.

## Questions / Objections for Anthony

1. Layout variant: confirm (a) board-first as the keeper, or tune the band height in (b) until it passes cleanly.
2. Does "labels left / numerals right, no exceptions" extend to prose lines (recon sentence, weather summary)? Convertible, but they stop reading as sentences.
3. Motion: ripple currently undemonstrable without a live-mode threshold cross (none occur in the scripted window) — script a synthetic crossing for testing, or judge from the mechanism?

## Next Session Plan

- Anthony picks variants (layout, motion, green experiment, density) → rulings → reskin session starts from the winning combination.

---

# PROGRESS — 2026-06-10 (Session 5: LAYOUT PROBE round 2 — branch `layout-probe`, no merge)

Direction approved; three revisions applied on the probe branch.

## Done

- **Nautical chart FleetMap** (hand-rolled SVG, zero libraries): dark water field, simplified single-path Gulf coastline (SW Texas → Mississippi birdfoot delta → Florida panhandle, approximate by design), 1°/2° graticule with frame ticks and °N/°W labels, compass rose and 100 nm scale bar drawn from SVG primitives, vessel markers as 7px squares colored by `vesselStatus()` per the active treatment (dark cockpit: nominal markers neutral light grey), name labels, click-through to the inspector.
- **Single-surface expand model**: `/vessel/[id]` keeps its URL-driven route state (browser back = minimize, zero state-architecture change) but now renders `VesselInspector` (existing VesselView sections reflowed: diagnosis chain left column — efficiency, engine twins, tanks; context right column — reconciliation, weather, crew, route) beside a persistent `FleetRail` of mini-tiles (status dot + name, 1 click to any vessel). AlertRail context strip persists. No animations — instant expand/collapse.
- **Green experiment** (Anthony's call, on record): treatment A marks nominal tiles with a green ✓ glyph beside the hero numeral — numerals stay ink so the tabular column doesn't go chromatic; not a tile wash. Treatment B (dark cockpit) untouched for comparison. Toggle unchanged.
- verify/lint/build green on the branch; both routes smoke-tested.

## Pass/fail checks

- **Meridian < 2 s, both treatments:** holds from round 1 (rank #1 top-left + only/most salient color). The chart markers now also carry status color, giving a second findability path on the map.
- **NEW — from expanded Meridian, another vessel in 1 click:** passes — every rail mini-tile is a direct link; the rail keeps all 15 vessels visible (selected highlighted) so positions never shift between expansions.

## Decisions Made (ALL REVERSIBLE — Anthony overrules from Figma)

- REVERSIBLE: green experiment implemented as the ✓-glyph variant, not green numerals — green digits on 13 nominal tiles re-introduces the chroma noise the dark-cockpit comparison exists to expose; switching to green numerals is a 2-line change in `VesselTile.tsx`.
- REVERSIBLE: rail keeps all 15 vessels including the selected one (highlighted) rather than "the other 14" — stable rail positions beat strict minimalism for repeated cross-vessel comparison; dropping the selected tile is trivial.
- REVERSIBLE: rail ordered by sustained_deviation (same as the board) — alternative is alphabetical for muscle-memory lookup; one comparator swap.
- REVERSIBLE: inspector reflow = two flex columns (diagnosis chain left, context right) — preserves §8 causal-chain order top-to-bottom within the left column.
- REVERSIBLE: chart frame fixed at 25.5–31.2°N / 98.2–86.8°W, slightly stretched vs true Mercator aspect (~15%) — keeps the strip wide for the layout; true-aspect is a constant change.
- REVERSIBLE: coastline is ~25 points, no bays/barrier islands beyond the delta birdfoot — "approximate is fine" per brief; more vertices is data entry, not design.
- REVERSIBLE: marker labels always on (15 labels fit the chart at this density) — could go hover-only via Contextual if Anthony wants a cleaner field.

## Questions / Objections for Anthony

1. Chart water/land greys are placeholders for your `color/surface/*` tokens — calibrate in Figma, not here.
2. Rail width (168px) and mini-tile anatomy (dot + name only) — does the rail want the hero metric too?
3. The ✓ experiment: keep, switch to green numerals, or kill after side-by-side with B?

## Next Session Plan

- Anthony reacts to round 2 → rulings to DECISIONS.md → probe graduates (reskin session) or dies.

---

# PROGRESS — 2026-06-10 (Session 4: LAYOUT PROBE — branch `layout-probe`, do not merge)

This branch is a disposable probe for Anthony to react to — input to Figma,
not the design. Main is untouched. Run it, walk it, overrule it.

## Done

- FleetView as a responsive center-aligned grid of `VesselTile`s (new probe-only component), still ranked by sustained_deviation. AlertRail/FleetTrend/FleetMap remain below the grid.
- Tile hierarchy: name (19px/700, primary) → hero metric (30d trend + sustained deviation, 15px tabular) → mode chip → 8px status dot. 4-step type scale (19/15/12/11), tabular figures on all data.
- Two densities behind header toggles: **minimal** (name + hero + dot + mode chip) and **standard** (adds endurance, alert badge text, 90d micro-sparkline, grouped "details" reveal).
- Two status-color treatments behind header toggles: **A automotive** (every tile edge/dot tinted, green included) and **B dark cockpit** (nominal stays grey; color only on watch/degraded).
- Color plumbing: `vesselStatus()` exported from `src/data/alerts.ts` maps WARNING→degraded, CAUTION→watch, ADVISORY/none→nominal — derived from the alert evaluation itself; the previously inline CAUTION thresholds are now named exports (`EFF_DELTA_CAUTION_PCT`, `EFF_SUSTAINED_7D_PCT`, `EGT_GAP_CAUTION_F`). `probeTokens.ts` only assigns hue. Zero second-set magic numbers.
- One radius token (`RADIUS = 6`) used on tiles, chips, toggles. No icons, shadows, gradients; system stack; color budget = the three status tokens.
- verify/lint/build green on the branch.

## Probe findings

**Anomaly check (item 7):** Meridian passes in both treatments. It ranks #1 (top-left tile) AND carries the only non-neutral color on a 15-tile board in dark cockpit — find time is effectively instant. Automotive also passes (amber vs 14 green tiles pops), but the field of green adds chroma noise that competes for the first saccade. Construction-stage observation, not a user test — Anthony judges with his own eyes.

**Alignment probe (item 5) — where center alignment degrades scanning:**
- *Minimal density:* center alignment holds. Identical tile anatomy (dot/name/metric/chip stack) means the eye lands on the same spot every tile; vertical scan is clean.
- *Standard density:* degrades visibly. (1) Variable-length meta lines ("endurance 157 h · [CAUTION]" vs "endurance 6150 h") rag symmetrically, so no shared left edge exists for comparing numbers down a column — tabular figures can't help without a common margin. (2) The centered sparkline floats unanchored between text rows. (3) The "details" reveal expands the tile asymmetrically and shoves its neighbors. Recommendation to test in Figma: center-align minimal tiles only; data-dense tiles want a left rail.

## Decisions Made (ALL REVERSIBLE — Anthony overrules from Figma)

- REVERSIBLE: status mapping CAUTION→watch (amber), WARNING→degraded (red), ADVISORY→nominal — advisories colored amber would make dark cockpit noisy; could be argued ADVISORY→watch.
- REVERSIBLE: status color placement = 3px top edge + dot (+ hero metric text when non-nominal) — edge chosen over full-tile tint to keep the Rams restraint.
- REVERSIBLE: hero metric format "30d +12.6% · sd +5.8%" — two numbers; could reduce to sd only if one-number tiles scan better in Figma.
- REVERSIBLE: mode chip kept in minimal density (brief's minimal list omitted it; without mode the trend number lacks its §2 context — flag if it should go).
- REVERSIBLE: healthy-vessel compression suspended in the grid (15 tiles fit one screen; the probe tests glanceability, not folding).
- REVERSIBLE: nominal sd values render in ink, not green, in automotive treatment text — only edges/dots carry green to cap chroma.
- REVERSIBLE: grid minmax 210px / 20px gap; tile padding 16/14 — "generous whitespace" starting point.
- Probe toggles live in FleetProvider (src/state) per the three-layer rule, defaulting to standard + dark cockpit.

## Questions / Objections for Anthony

1. Pick a treatment (A/B) and density — or specify the hybrid for Figma.
2. Confirm the ADVISORY→nominal color mapping (Sabine's stale-weather advisory shows no color in dark cockpit — intended?).
3. Should the tile grid keep AlertRail/FleetTrend/map below it, or does the grid replace more of the page?

## Next Session Plan

- Anthony reacts → rulings land in DECISIONS.md → either the probe dies (expected) or pieces graduate to main via the Figma reskin session.

---

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
