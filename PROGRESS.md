# PROGRESS — 2026-06-16 (Session 107: ROUND 120 — minimal presenter sim transport (reset + pause/resume) by the master clock)

## Done (verified docs/screens/r120-sim-transport.png)
- A small, discreet transport cluster sits LEFT of the top-right master clock — two dim
  greyscale glyph buttons (pause/resume + reset), no labels (titles on hover). Quiet utility,
  reads as dev tooling, does NOT compete with the clock or instruments; the master clock stays
  rightmost + undisturbed.
- **Pause/Resume** rides the existing `live` flag (so the D-panel live toggle stays in sync):
  pause freezes the sim clock → telemetry holds; resume continues from where it paused. The
  glyph reflects state (pause when running, play when paused; play tinted one step brighter so
  "held" is subtly noticeable). The DATALINK breath is CSS (UI liveness), unaffected by pause.
- **Reset** (`resetSim` on FleetProvider) drops the live-advanced runtimes (`resetFleet()`) and
  re-snapshots the deterministic seed — identical to a fresh page load but IN-PLACE: scenario,
  mode, dev settings, and the master wall clock are all preserved (no URL reload). Clears the
  crossing/prev-status bookkeeping; yields one frame for the ~2s rebuild.
- Verified: PAUSE froze the sim clock at 15:03Z across 2.6s; RESUME advanced to 15:05Z; RESET
  snapped to 15:00Z (DEMO_EPOCH seed) and Meridian's sustained hero back to +58°F. Scenario
  switcher + D-panel sim controls (60x etc.) undisturbed.

## Scope/holds
Presenter/dev tooling (an operator wouldn't pause a live fleet), kept always-reachable but
subtle so it stays out of the demo's visual story. New glyphs pause/play/reset (neutral
utility). No green, greyscale, earned-color held (no severity color on the control). Master
clock display + scenario switcher untouched. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-16 (Session 106: ROUND 119 — EGT-gap trend chart headroom (no top clip))

## Finding (reported honestly): the clip is NOT mode-specific
- The GapTrend chart has NO mode branch (no `expertOn` in the component; fixed `H=120`).
  Captured Default vs Expert back-to-back: byte-identical — same svg height, same line peak
  position (lineMinY 17.4 both), same axis. So Expert does NOT compress or clip it differently.
- The real cause: the live 60x sim climbs Meridian's EGT gap toward a TIGHT ceiling. The old
  `hi = ceil(max/10)*10` left ~0 headroom when the peak sat just under a ×10 tick (peak 68 →
  ceiling 70 → peak crowds/touches the top). This happens in BOTH modes as the gap climbs;
  it was observed in Expert by timing (the gap had climbed by the time the mode was switched).

## Fix (verified docs/screens/r119-gaptrend-headroom.png)
- Guaranteed headroom on the y-domain: `hi = max(20, ceil((max + 10)/10)*10)` — always keeps
  the peak ≥10°F below the upper bound. The trend chart is SIGNAL (the sustained-divergence
  evidence), so it must stay legible; this preserves clear headroom at current data (~65°F)
  and higher. Verified: peak now sits ~18px below the +80 ceiling (was ~7px below +70); no
  top clipping; Default and Expert render identical (lineMinY 25.9, ticks [-20,0,+80] both).
- No data / line / color change (line stays greyscale, data untouched); only the y-axis upper
  bound rounds one band higher to hold the headroom.

## Note on "Default unchanged"
Because the chart is shared + mode-identical, the fix necessarily applies to both modes —
there's no Expert-only knob to turn. Default is NOT regressed: it gains the same clear
headroom (peak well below the ceiling), which is exactly the legibility the request wanted.
The only visible Default change is the upper-bound tick rounding up a band when the peak is
near it (+70 → +80 here). Holds: signal stays legible in Expert; no green; greyscale line.
TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-16 (Session 105: ROUND 118 — Engine-Twins hero = sustained divergence, severity-yellow, mains-off safe)

## The bug
- The EGT panel hero was the raw LIVE instantaneous gap (`egtGapNow`), which is 0°F when
  both mains are OFF (no differential when neither runs) → misread as "all clear" while the
  caution still says +58/+60. And the sustained gap (the number the caution is about) was
  the quietest, dimmest element.

## Done (verified docs/screens/r118-engine-hero.png)
- **Hero = SUSTAINED divergence** (`derived.egt_twin_gap_f`, the 24h-averaged figure), never
  the raw live gap. Mains running → live≈sustained, hero shows the real divergence; mains OFF
  → hero stays the sustained gap (never drops to 0).
- **Severity yellow on the sustained hero** when caution-level (`|gap| > EGT_GAP_CAUTION_F`).
  It's now the loudest element, not the quietest. Clean twins read neutral. No green.
- **Live state = dim secondary**, timeframe explicit: mains running → "live +61 °F · fuel
  +32.2% at matched load"; mains OFF → "**live — · mains off**" (the live 0 attributed to
  mains-off, never the headline). Hero label "E2 vs E1 EGT · sustained".
- **Caution message conveys SUSTAINED, not a spike:** alerts.ts EGT_DIVERGENCE →
  "…+58°F over twin at matched load, **sustained 30d**". Language stays divergence-at-matched-
  load (efficiency/trend register) — **no "overheating" anywhere** (grep-confirmed none).
- Verified: Meridian (mains running, divergent) → hero +58 **yellow** + live +61 secondary;
  Bayou Runner (PORT, mains off, clean) → hero -2 neutral + "live — · mains off". The
  divergent+mains-off combination is now impossible to misread (hero = sustained yellow
  independent of mains state; live-0 only ever appears in the dim "mains off" secondary).

## Holds
Earned color (yellow only on the sustained severity figure; no green); severity unmissable
(sustained reads at a glance — fixes "had to dig for it"); substantiation (hero matches the
caution; transient engines-off 0 ≠ all-clear); type scale; Expert keeps the sustained value
(signal), section header label strips per round 107. Demo path (Meridian, mains running)
unchanged — still shows the live gap (now in the secondary) + the +58 (now the yellow hero).
TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-16 (Session 104: ROUND 117 — resolve the Learn-vs-IA conflation: provenance → IA page/builder, purpose → Learn)

## Audit (reported before the rewrite) — the conflation had THREE Learn surfaces
- ia-model IANode fields split: PURPOSE = what/why (operator); PROVENANCE = path/tier/
  rulings (builder). The IA page (IASystemMap) already renders provenance — nothing to add.
- (1) Annotated IA card rendered name+path+tier+what+why+ruling — mixed (path/tier/ruling
  + code-language rulings in operator Learn). (2) Docent ANNOTATIONS = operator copy, clean
  but with stale/orphaned entries. (3) LayerLens (LAYER/TOKENS/BINDS + copy-to-Figma) =
  pure builder provenance, gated by operator `learnOn` — the biggest leak.

## Done (verified docs/screens/r117-learn-card.png)
- **1 — LayerLens decoupled from Learn → its own D-panel toggle** (`layerLens`, default OFF,
  in the "ia / system map" builder section). Now gated by the toggle, not `learnOn`. Verified:
  Learn + lens OFF → NO LAYER/TOKENS/BINDS overlay on hover; Default + lens ON → overlay shows
  ("LAYER FleetHealthBand / census / … · click — copy layer path"). Independent of the three
  operator modes; copy-to-Figma kept. Three operator modes stay exactly three.
- **2 — Learn IA card → name + what + why ONLY.** Dropped path, tier, ruling (provenance →
  IA page). Verified card reads "Vessel Tile / what · … / why · …" — zero code/hierarchy/
  tier/ruling references. (Dropped the "IA ·" builder prefix too; trimmed card-height est.)
- **3 — three operator-copy gaps rewritten:** calm-sea (dropped "WebGL" + the fish/birds/
  matrix-rain process history → "atmosphere, never a readout…"); voyage-bar (fixed the stale
  "maximize toggle / detail columns" ref → "endpoint detail (ETA, distance-to-go)"); engine-twin
  why ("survives the causal-bucket filter" → "holds up after weather, route, and load are ruled out").
- **4 — docent ANNOTATIONS cleaned: 13 ORPHANED entries removed** (Annotated name no longer
  rendered / component removed/renamed/merged): FleetTrend, AlertRail, NominalRow, VesselSitrep,
  VesselHeader, EfficiencyCurve, WeatherPanel, CrewPanel, EngineCard, TankSchematic,
  FlowReconciliation, ModeTimeline, EventLog. Kept 11 (all map to a live `<Annotated name=…>`);
  refreshed the FleetHealthBand entry off its stale round-12 "trend" alias.

## Holds
Single source intact (ia-model is the one model; Learn filters purpose, IA page filters
provenance — no duplication). Three operator modes unchanged (Default/Expert/Learn; layerLens
is a dev toggle, not a mode). Learn = operator-only (what/why, plain language). IA page still
renders full provenance (path/tier/rulings — untouched). TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-16 (Session 103: ROUND 116 — reconcile voyage-bar ETA/NM-to-go with the round-114 signal ruling)

## The drift (confirmed, not a data gap)
- Round 114 ruled ETA + NM-to-go are SIGNAL and should stay in Expert (NM-to-go is the
  endurance-vs-distance number the fuel persona reads; ETA is independent signal, not
  restated by the progress marker). But the voyage bar still carried the round-106
  `!expertOn` gate hiding them — decided-keep, built-strip, never reconciled.
- Confirmed via Default↔Expert on Meridian: DEFAULT showed "ETA 2026-06-19 17:43Z" +
  "332 NM TO GO"; EXPERT showed neither. So it was strip-drift, not a seed gap (the data
  is present in both modes).

## Fix (verified across all three scenarios)
- The voyage-bar ETA + NM-to-go now render in BOTH modes; EXPERT strips only the
  ORIENTATION labels, the VALUES stay (orientation-vs-signal rule):
  - Transit (Meridian, Marlin Ridge): EXPERT shows "◇ {ETA timestamp}" (the "ETA" word
    drops, ◇ glyph + value stay) and "{n} NM" (the "TO GO" label drops, number + unit
    stay). DEFAULT unchanged ("◇ ETA {time}", "{n} NM TO GO").
  - Non-transit (Osprey, station): the next-call ETA VALUE is kept in EXPERT too
    ("· {port} ◇ {time}"); the "next call"/"ETA" labels strip. DEFAULT unchanged.
  - Origin spec (240 ft OSV) + speed + position reference stay EXPERT-stripped — static
    spec is orientation, speed is already on the gauge (restatement). No orientation
    labels resurrected.
- Verified: EXPERT keeps ETA value (Meridian/Marlin Ridge/Osprey all show the timestamp)
  + NM-to-go value (Meridian 332 NM, Marlin Ridge 98 NM; Osprey is station = none); the
  "ETA"/"TO GO" labels are gone; DEFAULT unchanged. The build now obeys the round-114
  keep-live-signal rule at its most decision-relevant point (the fuel persona's NM-to-go).

## Safety
Signal kept (ETA + NM-to-go values); only orientation labels stripped; severity untouched;
greyscale (no color); type scale; Default + Learn unchanged. Demo path intact.
TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-16 (Session 102: ROUND 115 — rail mode combined into one permanent treatment)

## Done (verified docs/screens/r115-rail.png)
- The Rail Mode either/or toggle (glyph vs transit-stroke) is GONE — combined into one
  permanent, baked treatment:
  - **Every** rail row ALWAYS shows its mode glyph (universal, from the single MODE_GLYPH
    source — transit=route / station=crosshair / port=anchor / standby=clock). Verified
    all 15 rows render a glyph.
  - **Transit** vessels ADDITIONALLY get a subtle reinforcing accent — a thin (2px) neutral
    stroke in the left gutter (ink/secondary). NOT the old full-border "transit stroke"
    (which competed with the selection border); an inset accent that leaves the selection +
    severity borders untouched. Verified the accent renders ONLY on TRANSIT rows
    (v01/v03/v13/v15/v09), zero on station/port/standby.
  - Non-transit rows show the glyph only (quieter — presence reflects activity).
- Removed the Rail Mode `<Row>` from the D-panel; removed `RailMode` type + `railMode`
  state/setter + context entries from FleetProvider (baked out, like the round-108 locks).
- Verified: selection (Meridian, gold border + wash) and severity (Meridian's gold caution
  name + dot) read cleanly OVER the transit accent — not muddied. Accent is greyscale (no
  color added). Glyph matches each vessel's real mode (single source).

## Safety
Glyph honesty (mode from single source); greyscale (accent neutral, no color creep);
severity unmuddied + glance-readable; type scale unchanged; consequence logic (transit gets
marginally more presence — consistent). TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-16 (Session 101: ROUND 114 — orphaned bearing, flat header strips, Expert re-audit on the orientation-vs-signal principle)

## 1 — Orphaned bearing glyph killed in non-transit (verified)
- The InspectorChart dashed BRG ray (bearing-to-next-call) rendered for ANY vessel
  with a next port call, regardless of mode — so a moored/on-station/in-port vessel
  showed an orphaned "BRG {PORT}" ray with no active voyage to describe. Gated to
  `mode === 'TRANSIT'`. Verified: v04 (ON STATION) → 0 rays / no BRG label; v01
  (TRANSIT) → 1 ray "BRG GALVESTON TX".

## 2 — Flat background for header/context strips (verified)
- Rule going forward: **gradient (the sea) = floating instrument surfaces only;
  header/context strips are FLAT near-black.**
- Fixed the TRIP-SUMMARY voyage bar (CommandBand voyage `<section>`) — it had the glass
  fill (`surfaceGlass ? glassFill`) so the sea bled behind a strip that shouldn't float.
  Now flat `var(--color-surface-base)` (#101010). Verified: flat, no gradient.
- Spot-check found the global AppHeader also had no bg (sea leaking behind it) → flat
  near-black too (verified rgb(16,16,16)). Floating instruments (FleetHealthBand,
  FleetMap, sticky command band, engine/efficiency/fuel panels) unchanged.

## 3 — Expert re-audit on the orientation-vs-signal principle (verified)
- **Principle (now the rule):** Expert strips ORIENTATION (what tells you "this is what
  you're looking at" — labels, section headers, gauge captions, static spec lines).
  Expert KEEPS all LIVE SIGNAL (values, instruments, scales, severity, real-time
  conditions — "the current state of the world right now"). Test per element: does a
  trained operator already know this (strip) or read it right now (keep)?
- **The fix:** wind/waves/current VALUES were hidden entirely in Expert (round 112) —
  that's LIVE SIGNAL (and in the weather scenario it IS the diagnosis). Now shown in ALL
  modes. The cluster is already glyph+value (the glyph is the orientation marker; there
  is no text label to strip), so Default and Expert read identically. Verified Expert
  shows "🌬 5.9 kn ≋ 2.4 ft → 0.2 kn 183°"; severity (+13.7% gold) still reads cleanly.
- **Full audit (each Expert strip tagged):**
  - ORIENTATION → correctly stripped: section headers (POSITION/ENGINE TWINS/EFFICIENCY/
    FUEL/CREW); gauge captions (SPEED/BURN/EFF Δ/ENDURANCE); census tier labels →
    glyph; bunker label → glyph; CommandBand vessel-class spec (240 ft OSV, static).
  - SIGNAL → kept (and the env-cluster fix): all gauge VALUES + SCALES; severity (alert
    color/lines — never stripped); tank levels; engine EGT/fuel values; efficiency
    now-Δ / 30d / envelope point / 24h spark; **wind/waves/current values (fixed)**.
  - RESTATEMENT-of-kept-signal / SECONDARY-reference → text stripped, primary signal
    kept by a shown instrument (so no signal hidden): position text "X nm from port"
    (kept graphically by the track+marker + position panel); transit ETA / NM-TO-GO and
    non-transit "next call ETA" (live progress kept graphically by track+marker+%; the
    precise schedule/distance is reference); efficiency deep-history (90d trend / 1y
    sparkline / baseline range — historical reference, the live-now efficiency is kept);
    fuel reveal (tank capacity = static spec; transfer status = minor live adjunct, the
    tank LEVELS carry the fuel signal in Expert).
  - **No PRIMARY value / instrument / scale / severity / live-reading is stripped in
    Expert** after this round. The env cluster was the one genuine primary-signal hide.

## Flagged (borderline, for Anthony)
- Among the stripped RESTATEMENT/REFERENCE items, the closest to "live signal" are the
  transit **ETA / NM-TO-GO** and the fuel **transfer-active** status. They're currently
  treated as reference because the primary live state is shown by a kept instrument
  (progress track/marker; tank levels). If you'd rather those exact values stay in
  Expert too, it's a small follow-up — say so.

## Safety
Severity never stripped (loudest signal, reads cleanly over transit + caution); values/
instruments/scales kept; glyph honesty (env glyphs distinct, mode from single source);
type scale; greyscale (flat fills neutral, no color added). Default + Learn unchanged.
Demo path intact. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-16 (Session 100: ROUND 113 — Fleet Health Band census: one confirmed-clear model)

## Done (verified docs/screens/r113-census-default.png, r113-census-expert.png)
- **One confirmed-clear model across the census.** Every count now renders its number
  INCLUDING at zero (a confirmed-clear reading, not hidden):
  - **The fix:** the caution/WATCH count was hidden at zero (round-45 presence filter) —
    now shows. Removed the `cls === 'nominal' || counts[cls] > 0` filter so degraded +
    watch + nominal all always render. e.g. S1 now reads "0 DEGRADED · 1 WATCH · 14 NOMINAL".
  - Nominal + bunker already showed counts; aligned all to the same behavior.
- **Earned color preserved (white-at-zero, color-only-when-real):** rewrote `censusColor`
  to return neutral/white (inkSecondary) when `counts[cls] === 0`, and the severity color
  only when ≥1 (watch = gold, degraded = red; nominal = neutral/quiet or green/automotive).
  The white-zero gate is `counts[cls] === 0` ONLY — it never strips color from a genuine
  non-zero count. Verified: WATCH 1 = gold (227,209,65), DEGRADED 0 = neutral (176,176,176).
- **Bunker flags:** zero now white/neutral (was inkMuted/dim); advisory tint only when ≥1.
- **Default vs Expert labels (107 strip rule):** Default shows text (DEGRADED/WATCH/NOMINAL,
  BUNKER FLAGS); Expert replaces the label with a glyph, the NUMBER stays in both. Verified
  Expert: "0 / 1 / 14" with 3 distinct glyphs (alert-triangle / gauge / vessel) + the bunker
  tank glyph; the gold 1 stays gold in Expert too.
- **Census glyphs distinct** (degraded=alert-triangle, watch=gauge, nominal=vessel,
  bunker=tank — all existing PATHS placeholders, no collisions).

## Note (flagged)
- The literal white-zero CAUTION (watch = 0) isn't reachable in the three demo scenarios —
  each is a single-outlier board with exactly ONE caution by design (round 110). The
  identical white-zero code path is demonstrated by DEGRADED = 0 (neutral) in all three
  scenarios; the logic is uniformly count-gated, so watch = 0 would render white the same way.
- I extended the always-show to DEGRADED too (not just watch/nominal/bunker the brief named)
  for the "one consistent model" — "0 DEGRADED" is the affirmative no-warnings reading. Trivial
  to revert degraded to presence-only if you'd rather not show it at zero.

## Safety
Earned color held (white at zero, severity only when real — gold caution not stripped);
greyscale base; type scale unchanged; glyph honesty (distinct, no collisions); severity still
glance-readable. Demo path intact. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-16 (Session 99: ROUND 112 — current + environmental cluster, expert/chevron cleanup, Learn z-index, inspector spacing)

## PART A — current in the data model (verified coherent + scenario-flowed)
- Current was ALREADY a real field (`WeatherSample.current_kn` + `current_dir_deg`),
  generated by time-addressable `smoothNoise` (no RNG-perturbation — verify untouched)
  and already consumed in the DP-load calc. Coherent per vessel/mode (~0.5–1.2 kn;
  Meridian calmest at 0.20 kn under the anomaly-calm factor).
- Wired ELEVATED current through the S3 override: Osprey Point now 2.4 kn @ 18°
  (was 1.22). Wind 24 + waves 8 + current 2.4 now all corroborate the rough-conditions
  story → "weather justifies the burn" fully substantiated. Verified S1→S3→S1: current
  elevates in S3, returns to 1.22 in S1 (no stale bleed — clones from immutable base).

## PART B — environmental cluster + mode treatment (verified)
- The command band now shows a THREE-value cluster: wind 24 kn / waves 8 ft / current
  2.4 kn 18°, three DISTINCT glyphs (wind = gust lines, wave = sea sines, current =
  directional flow arrow — added `glyph.current` + PATHS placeholder, distinct per
  glyph-honesty; drop `docs/glyphs-import/current.svg` to replace).
- Mode treatment: DEFAULT exposed · EXPERT hidden (`!expertOn`) · LEARN explains each
  via glyph title from ia-model (`IA_GLYPH_MEANING` wind/wave/current — makes the
  wind-vs-current-vs-waves vocabulary distinction explicit). `weather.current`
  disposition promoted CONTEXTUAL→VISIBLE.
- Killed the broken round-83 reveal CHEVRON on the cluster (shown or stripped, never
  click-to-hide). Current speed+direction read as one value; visibility/precip dropped
  from the cluster (kept compact). Verified: default shows all three, expert strips all.

## PART C — efficiency chevron + expert header strip (verified)
- Killed the EfficiencyPanel reveal chevron → its deeper context (90d trend · 1y history
  · baseline band) is default-shown / expert-hidden, no collapse.
- ALSO killed the VesselSynoptic (fuel) reveal chevron for guardrail-11 consistency
  (no chevrons in product UI) — same default-show/expert-hide pattern. **All three
  reveal chevrons now gone; verified chevron count = 0.** (Flagged: this extended scope
  one panel beyond the two named — the fuel reveal — to honor "no chevrons.")
- All inspector panel header TEXT hidden in Expert: all five panels (POSITION / ENGINE
  TWINS / EFFICIENCY / FUEL / CREW & LOG) use `Label`, already → null in Expert via
  round 107. Reconciled, no double-implementation. Verified headers present in Default,
  gone in Expert; severity/values/instruments stay.

## PART D — Learn z-index bug (verified)
- Learn IA/docent cards are `position:fixed` but were trapped by ancestor containing
  blocks (the round-97/108 `backdrop-filter` glass panels create a containing block +
  stacking context for fixed descendants) — that was the "Learn renders behind the
  panel" bug. Fixed by PORTALING the cards to `document.body` (createPortal), so they
  escape every ancestor stacking context and layer above ALL content. Fixed coords are
  viewport-based, so placement is unchanged. Verified: card portals to body and renders
  above the panels. Universal fix — covers trip-summary + every section.

## ADDED (mid-round request) — inspector vertical rhythm + top-edge bleed
- One spacing token `--pad-stack: 16px` now governs ALL inter-panel gaps (replaced the
  scattered hardcoded `marginBottom: 8` across CommandBand / Collapse / EngineTwin /
  Efficiency / Synoptic / CrewLog / InspectorChart / general). Uniform rhythm, Default +
  Expert (Expert label-stripped but evenly spaced). Spacing only — no value/severity/
  glyph/type/glass change.
- Top-edge "blurred row" CONFIRMED real but NOT a stacking bug (band z:6 is correctly
  above content) — it was the sticky command band's frosted glass (~0.62–0.72 alpha +
  blur) TRANSMITTING scrolled content through it. Fixed by making the STICKY band's fill
  near-OPAQUE (0.97–0.985) while keeping the blur/radius glass aesthetic; the non-sticky
  floating sections (FleetHealthBand/FleetMap) keep the lighter frost (they never overlap
  scrolled content). Verified scrolled: no content bleeds through the band.

## Safety
Substantiation (current real + coherent, corroborates wind/waves); earned color (no
green/new color — env values neutral context); severity untouched + still glance-readable
both modes; glyph honesty (current distinct from wind/wave); type scale (cluster at
context); greyscale; no product-UI chevrons. S1 Meridian unchanged. Demo path intact.
TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-15 (Session 98: BATCH — ROUND 111 + ROUND 107; 108/109/110 already shipped this session)

## Context
Anthony bundled four rounds (108 → 111 → 109 → 107). 108 (9aa0dd6), 109 (ca7b5ae),
110 (d77294c) were already built + pushed earlier this session. This session adds the
two new rounds — 111 then 107 — plus the one batch-introduced delta to 108: Rail Mode
startup default → Transit Stroke.

## ROUND 111 — Done (verified docs/screens/r111-minimal-board.png)
- **D-key bug FIXED:** the round-108 DevPanel rewrite dropped the keydown handler;
  restored. `d`/`D` toggles the panel; ignores typing in inputs; no collision with
  Learn's `e`/`l`. Verified: opens true · closes true.
- **Bearing toggle now works in FleetView (was inspector-only — bug):** FleetMap draws
  a dashed BRG ray from each UNDERWAY (TRANSIT) vessel to its next port, clipped at the
  chart edge (same dashed style as the inspector ray; no per-ray label — markers carry
  names). Verified: default BRG-ray ON → 5 rays; "voyage card only" → 0; back on → 5.
- **Rail Mode startup default → Transit Stroke** (FleetProvider; toggle kept). [Sets the
  108 rail default.]
- **Density MINIMAL shrinks the board:** grid min column 210→150, gap 20→10; VesselTile
  mini steps name + hero value down a tier and trims padding + glyph. Verified: tile
  484→347, tiles-per-row 4→6 (more vessels), standard unchanged, severity still pops
  (meter strip + status tint untouched). Scenario switcher (110) undisturbed.

## ROUND 107 — Done (verified docs/screens/r107-inspector-default.png, r107-inspector-expert.png)
Rule: Expert removes what a trained operator already knows, keeps what the data provides.
- **Section headers GONE in Expert** (Label → null; supersedes round 44's glyph-only).
  Strips both the inner panel headers and the Collapse minimized headers. Verified:
  DEFAULT has ENGINE TWINS / EFFICIENCY (count 1 each); EXPERT has 0.
- **Gauge captions** (SPEED/BURN/EFF Δ/ENDURANCE): already stripped in Expert (round 44);
  scales/range markings KEPT. Verified DEFAULT 1 / EXPERT 0.
- **Verbose alert phrasing → essential in Expert:** new `essentialAlert()` keeps the
  value-bearing head (value + substantiation) and drops the trailing " — " advice/context
  prose; severity ([LEVEL] tag + color) untouched. Applied to docked + general alerts.
  Verified: S2 ENDURANCE shows "Endurance 52 h below 78 h required (return + reserve)"
  with "— plan resupply/return timing" dropped; [CAUTION] tag kept.
- **Descriptive/context prose stripped in Expert** (CommandBand): the STATION/PORT spec
  line (class + position + speed — class is fixed knowledge, speed on the gauge), the
  "next call ETA" appendage, and the transit position reference. Verified spec line gone.
- **Kept:** all values + instruments + gauge scales + severity + glyphs; reflows DENSE
  (header space reclaimed, not Default-with-holes); Calm Sea persists (round 95).
- **Census labels stay glyphs** in Expert (round 94, untouched).
- **Default + Learn UNCHANGED** (headers/captions/prose all present; verified).

## JUDGMENT CALL (flagged) — "X nm from {port}" position reference
The governing RULE ("keep what the data provides") says a live POSITION fix is data, not
chrome — so I KEPT the position panel's "X nm from {port}" Collapse summary, while
stripping the *redundant* copy of it from the CommandBand spec line (position lives in the
position panel). If you'd rather it be stripped everywhere in Expert, one-line change.

## LEVEL 2 HELD (not built)
Reducing gauge scales/ticks toward bare faces — only if you judge L1 insufficient.

## Safety
Earned color held (gold severity only, no green, no new colors); severity NEVER stripped
(alert color/state intact in Expert); type scale held (mini steps tiers, no orphans);
greyscale; demo path = S1 default, intact. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-15 (Session 97: ROUND 110 — scenario switcher: three selectable whole-fleet states)

## PART A — AUDIT (reported, confirmed by Anthony)
- A scenario LIBRARY already existed (`src/state/scenarios.ts`, 10 overlays + D-panel
  chips + FleetProvider `scenarioById(scenario).apply(fleet)` → viewFleet). Not a
  single hardcoded state.
- **Root-cause of the carry-through bug (the key find):** overlays patched only
  `alerts` + `derived`, but the INSPECTOR computes its panels from raw
  `vessel.history.minutes` (engine EGT/fuel, tanks, weather) + `history` envelopes.
  So a synthetic caution's inspector fell back to seed telemetry → only Meridian
  (v01, the seed anomaly) told a coherent end-to-end story.
- **Vessels confirmed:** S2 = Marlin Ridge (v03, transit OSV, lowest clean-transit
  endurance → smallest override), S3 = Osprey Point (v14, STATION, already roughest
  seed weather → environment story substantiated by existing data).

## PART B — Done (verified docs/screens/r110-s1-board, -s2-board, -s2-inspector, -s3-board, -s3-inspector)
- SCENARIOS refactored to THREE selectable whole-fleet states; D-panel scenario
  section is now a labeled **1 / 2 / 3** selector (default S1). One active at a time.
- **THE FIX:** scenarios now also override the caution vessel's latest `history.minutes`
  sample (`setNow`) + the derived trend series, so the inspector's COMPUTED panels
  read coherently — not just summary numbers.
- **S1 Meridian (mechanical, hero):** identity/unchanged. v01 lone caution, EGT +58°F,
  endurance 179h (fuel÷burn coherent). #1 by sort.
- **S2 Marlin Ridge (fuel/endurance → logistics):** v03 lone caution. Engines CLEAN
  (gap ~+5°F, flat 30d EGT chart), efficiency normal (+3.7%), tanks drawn to 17%/39%
  (low, not starved), endurance **52h** with fuel÷burn coherent by construction
  (14,521 gal ×0.95 ÷ 264.7 gph = 52h), ENDURANCE caution docks at fuel → logistics.
- **S3 Osprey Point (station-keeping → environment):** v14 lone caution, STATION.
  Engines CLEAN (−4°F, flat 30d chart), efficiency Δ **+10.2%** vs station baseline
  (sustained; trend chart + sparkline lifted to match), weather elevated **8 ft / 24 kn**,
  burn high-for-station **118 gph**, endurance recomputed 170h (fuel÷burn coherent).
  EFF_DELTA caution docks at efficiency → environment.
- **No stale bleed:** `apply` is pure over the immutable base; switch S1→S2→S3→S1 and
  every bystander returns identical (data test: demo-reapply v01/v03/v14 byte-identical;
  v03 tanks 29,039 == base, no drawdown residue). Board #1 returns to v01.
- **Non-caution coherence:** `clean()` strengthened — clears alerts, freshens streams,
  clamps elevated performance numbers into the nominal band, and matches the now-sample
  MAIN engines, so a bystander (e.g. Meridian in S2/S3) shows NO lingering +7.6% trend
  or +58°F gap (verified: v01 bystander → trend 3, eff 3, gap 0, 0 alerts). Clean
  single-outlier boards in all three (census "1 CAUTION").

## KNOWN LIMITATION (flagged for Anthony)
- A *bystander* anomaly vessel's deep 30D EGT-GAP HISTORY chart (reads `history.hourly`,
  30 days) is NOT rewritten — only v01, only when it is NOT the active caution, and only
  if someone clicks into it (off the demo path). Its headline/verdict/gauges read clean
  (now-sample matched, derived clamped); only the historical 30d gap chart retains the
  seed climb. Rewriting 30 days of hourly history per scenario was out of proportion for
  a bystander off the walkthrough. Easy follow-up round if you want it fully scrubbed.

## Safety
Earned color held (gold caution only, NO green, no new colors). Severity unmissable.
Substantiation: each scenario internally coherent — endurance=fuel÷burn (S1/S2/S3 all
check), weather-justifies-burn (S3), engines clean where the cause is elsewhere. Sort
(caution #1), type scale, greyscale, presence/absence datalink all held. Demo path = S1
Meridian, default on load, unchanged. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-15 (Session 96: ROUND 109 — census trend: confirm source + mode-aware labeling)

## PART A — CONFIRMED (read from source: FleetHealthBand.tsx + fleetState.fleetDailyTrend + derived.daily_delta_1y)
- **Exact metric:** the census-strip trend LINE plots the **fleet-wide MEAN
  efficiency delta vs each vessel's mode baseline** — `fleetDailyTrend()` averages
  every vessel's daily `efficiency_delta` per day, then the band draws a **7-day
  rolling mean** of that fleet series. ✓ Matches the expected "me-problem vs
  everybody-problem" read.
- **The value (+0.3%)** beside it is the **30-day mean** of the same daily fleet
  delta (fixed 30d window — independent of the line's range toggle).
- **Span of the line:** the toggleable `range` — default **90d** (toggle 30d / 90d
  / 1y). (So the value=30d and the line=90d by default; the new span label anchors
  the LINE's window.)
- **Zero reference line:** **ALREADY EXISTS** (FleetHealthBand.tsx line ~170,
  `<line y1={y(0)} y2={y(0)}>`, stroke `--color-line-strong`), plus a **p10–p90
  envelope band** (surface-overlay). So Part B item 2 was already partly satisfied;
  this round adds the *labeling/anchoring* around it, not the line itself.
- **Data source:** `fleetDailyTrend(fleet)` ← `v.derived.daily_delta_1y` ←
  efficiency_delta vs mode_baseline (§4). Greyscale; no color.

## PART B — Done (verified docs/screens/r109-default-trend.png, r109-expert-trend.png, r109-learn-hover.png)
- **DEFAULT (minimal anchor):** added a **"0" label** on the existing zero reference
  line + a **span label** ("90D", reflecting `range`) at the chart's top-right.
  Both greyscale, micro tier (10px font/data, ink-muted). Direction now legible
  (above the labeled zero = worse / over-burn). **No** Y-axis ticks, **no** X time
  ticks — still a glance strip. Verified svg labels = ["0","90D"].
- **EXPERT (bare):** both labels stripped (`!expertOn`). Verified svg labels = [].
  The minimal default labels do NOT leak into Expert. The zero line + envelope stay
  exactly as before (Expert unchanged).
- **LEARN (full meaning):** the trend chart is wrapped in `Annotated` bound to a new
  ia-model node `fleet-trend`; hover reveals the full card — metric (fleet-mean eff
  delta vs mode baseline, 7d rolling), how to read (against zero; flat fleet + one
  outlier = isolate that vessel), span, units. Single source = ia-model. Verified
  card renders with full what/why/ruling.

## Safety
Greyscale held (zero line + labels neutral, no color). Earned-color untouched (no
green; value tint logic unchanged — value stays neutral). Substantiation: the trend
is now anchored to zero + span so it can't read as an unanchored wiggle. Type scale:
labels at micro tier. No clutter added to default/expert. Demo path intact.
TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

---

# PROGRESS — 2026-06-15 (Session 95: ROUND 108 — lock startup defaults + dev-panel cleanup; datalink green struck per amendment)

## Done (verified docs/screens/r108-default.png, r108-devpanel.png, r108-expert.png)
- STARTUP DEFAULTS LOCKED in FleetProvider — fresh load comes up demo-ready, no
  manual toggling. Verified live on a fresh load:
  - SimClock LIVE + 60x ON (sim clock advanced 15:05Z→15:07Z in 2.5s).
  - Surface Glass locked ON; Status type locked CONTEXT (13); Color B quiet
    (automotive off); Motion Breathe; State Marks on; Ambient Sea on; Auto-2x on
    (legacy) — 1 expanded tile in default; Bearing BRG ray; Rail Mode glyph;
    Density standard; Texture on (baked).
- EXPERT forces auto-2x OFF (officer sizes): verified 0 expanded tiles in Expert.
- REMOVED ENTIRELY: ripple sliders; surface-glass toggle (glass just the locked
  state); IKB band + IKB fill (FleetHealthBand fill gone — no IKB renders); state-
  marks toggle; ambient-sea toggle; water-mode + the ENTIRE water-styling group
  (mode + all sliders + readout) — values BAKED as constants in AmbientSea
  (gradient, waveAmp 0.08, texDens 0.0, texBright 0.25, dotSize 0.5, dotSpace 120,
  mag 2.5, flow 1.0 — byte-identical to prior startup defaults); status A/B toggle;
  the ripple MOTION option (+ orphaned .probe-ripple CSS).
- KEPT TOGGLES (startup value locked, toggle usable): color (automotive), motion
  (off/breathe), density, bearing, rail mode, auto 2x.
- DEV PANEL → collapsible chevron sections (minimized by default): scenario / ia /
  mode / clock / color·motion / layout. Dev-tool affordance only — product UI
  stays chevron-free.
- DATALINK GREEN (amendment D): NO green added. Confirmed green renders NOWHERE on
  the demo path (automated greenish-pixel scan = 0 hits). Datalink live/degraded
  is carried by BREATH/motion only (FRESH → grey + `.datalink-breath`; DEGRADED/
  STALE → still + advisory-blue), exactly as the amendment specifies — no code
  change needed. Earned-color rule stays STRICT: color = severity only.
  - NOTE: the green token `--color-data-nominal` (#3fb950) still exists but renders
    ONLY inside the KEPT Automotive treatment (ruling 14 — green-nominal canonical),
    which is NOT the demo path. Default/quiet path uses neutral grey for nominal.

## Safety
Severity/alert color untouched (gold caution intact). Baked water/texture identical
to prior look. Determinism + DEMO_EPOCH + verify untouched. TSC-OK · LINT-CLEAN ·
verify PASSED · offline build OK.

## NOTE — Round 107 (Expert aggressive strip) is still a DRAFT awaiting review; NOT built.

---

# PROGRESS — 2026-06-15 (Session 94: ROUND 106 — remove CommandBand voyage-detail chevron)

## Done (verified docs/screens/r106-default.png, r106-expert.png)
- Removed the round-88 voyage detail maximize/minimize chevron (overlapped the
  destination label + gated secondary context behind a click). Verified: 0 toggle
  buttons.
- Gated content was the endpoint DETAIL columns — origin spec (240 ft OSV) +
  speed (kn), destination ETA + NM TO GO. Secondary context (not severity/primary).
- Now DEFAULT-VISIBLE, EXPERT-HIDDEN (!expertOn) — matches the mode model.
  Verified: default spec/eta/togo all visible; expert all hidden.
- Overlap fixed: detail lays out inline under each endpoint label, clean spacing,
  no button crowding the destination.
- Removed detailOpen state (+ unused useState import); added useLearn (expertOn).
- The separate whole-band minimize chevron (collapses entire band) is a different
  affordance, retained (gates primary instruments, not secondary context).

## Safety
Severity unaffected (context info only). Demo path intact. TSC-OK · LINT-CLEAN ·
verify PASSED · build OK.

## NOTE — Round 107 (Expert aggressive strip) is a DRAFT awaiting review; NOT built.

---

# PROGRESS — 2026-06-15 (Session 93: ROUND 105 — sort subtitle → Learn docent + status bar type down)

## Done (verified docs/screens/r105-default.png, r105-learn-statusbar.png)
- "ranked by sustained deviation" REMOVED from default; now Learn-only, inline
  with the global status bar below the map (single source ia-model IA_SORT_THESIS).
  Verified: absent in default, present in Learn. Default top-fold tighter, no
  orphan gap (FleetHealthBand owns the top).
- Status bar type dropped a tier: clusterType default PRIMARY 16 → CONTEXT 13
  (dev toggle remains). Verified DATALINK = 13px/600. Quiet status line; CAUTION
  gold + clickable, DATALINK degraded-blue + breath intact.
- Fleet plot position unchanged (prior reorder scrapped).

## Safety
Sort behavior unchanged (on-screen explanation only); type scale held (no orphan);
earned color intact. TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 92: ROUND 104 — now/baseline clock → pulse-live glyph)

## Done (verified docs/screens/r104-tile-footer.png)
- Tile now.glyph (live efficiency reading) clock → new glyph.pulse (ECG-like
  live-indicator; placeholder until drawn, round-48 fallback). A clock falsely
  implied time-of-day for a live value.
- Clock freed from the now slot (grep: slot → glyph.pulse). Clock RETAINED for
  the STANDBY mode glyph + the text mission/master clocks (untouched).
- Calendar (30d span) + pulse (now/instant) now read as a span/instant pair —
  same metric, two timeframes; both context, greyscale, consistent scale.
- ia-model IA_GLYPH_MEANING: calendar = "30-day sustained trend (span)", pulse =
  "current live reading, now (instant)" — distinct, consumed via Learn title
  (verified now.glyph title = the pulse meaning).
- Only the glyph changed; value tint logic unchanged. No severity color on glyph.

## Safety
Demo-path safe (glyph swap). TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 91: ROUND 103 — fix wave/endurance glyph collision)

## Done (verified docs/screens/r103-tile-footer.png)
- wave height + endurance were sharing glyph.wave (false association, caught by
  Learn). Separated: wave height → glyph.wave (CommandBand + WeatherPanel);
  endurance → glyph.fuel-drop (VesselTile, placeholder until drawn, round-48
  fallback). Grep-confirmed no endurance slot resolves to wave.
- Endurance does NOT inherit the weather stale-tint (tile endurance glyph has no
  stale logic). Wave keeps the round-79 weather stale-tint (correct — it's weather).
- ia-model: new IA_GLYPH_MEANING (single source) gives wave (=sea state) and
  fuel-drop (=fuel endurance, not weather) distinct meanings; consumed via each
  element's Learn title. CommandBand endurance is a Gauge (text label, no glyph) —
  no collision there; only the tile shared a glyph.
- Both greyscale/context, no severity color. Visual: tile endurance now shows the
  fuel droplet, no longer the wave.

## Safety
Demo-path safe (glyph swap only). TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 90: ROUND 102 — audit mode set + add mode glyph to thumbcard)

## Part A — mode set audit (reported)
- Modes (4): TRANSIT, STATION, STANDBY, PORT (Mode type, src/data/types.ts).
- Single source: sample.mode → derived.mode = now.mode (derived.ts).
- Glyphs (MODE_GLYPH, Glyph.tsx): TRANSIT→route, STATION→crosshair,
  STANDBY→clock, PORT→anchor.
- Rail glyph, CommandBand mode chip, and mission clock prefix all read the same
  derived.mode — they AGREE (no divergence). Voyage line phrases PORT as
  "MOORED" (label wording, same underlying mode).

## Part B — mode glyph on thumbcard (done; verified docs/screens/r102-tiles.png)
- Added mode glyph above the vessel name on each card, reusing the rail's exact
  MODE_GLYPH + single source (derived.mode). Verified card↔rail agree for all 15
  seed vessels.
- Quiet: ink/muted, rail scale 15, context register, greyscale (state not
  severity). Vertical order: mode glyph → name → calendar → deviation value →
  footer; header top padding trimmed so it doesn't crowd.
- Learn/title exposes the mode name (matches the rail). Meridian still alerted —
  mode glyph neutral grey (rgb 117) while name + value stay gold (rgb 227,209,65);
  severity undiluted.

## Safety
Sort/severity/alerts unchanged (additive). TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 89: ROUND 101 — remove glass-edge bottom divider stroke)

## Done (verified docs/screens/r101-glass-on.png, r101-float-off.png)
- Removed the CommandBand bottom seam STROKE (boxShadow 0 1px 0 line-strong) —
  a drawn line at a glass edge contradicts the glass material + borderless-float.
  Verified: sticky boxShadow = none.
- Instrument row is now its own floating block (full radius); a small gap
  (marginBottom 8) separates it from the voyage bar — gap + glass-edge/diffraction
  do the separating, not a stroke. Voyage paddingTop returned to pad-card (the
  seam it was airing is gone).
- Scope = structural/decorative glass-edge strokes only. Severity outlines
  (gauge bands, value tints) untouched — gold EFF Δ + amber arc still sharp.
  FleetHealthBand internal cell hairlines (vertical region separators, round 94)
  left as-is (not a glass-edge bottom stroke). Inspector Position/Engine
  Twins/Fuel/Crew are filled gb.box cards (not glass); engine-twin divider
  already removed round 99.

## Safety
Borderless-float enforced, greyscale, severity sharp on glass. Visual only.
TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 88: ROUND 100 — dock alerts to related panels + general fallback)

## Done (verified docs/screens/r100-demo-v01.png, r100-general-area.png)
- Alert routing rule established: `ALERT_TARGET` map + `alertTarget()` in
  data/alerts.ts route each alert by code to the panel that substantiates it.
- Collapse gained an `alerts` prop → docks the alert to the panel header
  (compact `[LEVEL] message`, earned color, visible even when collapsed).
- Standalone full-width ALERTS box REMOVED; space reclaimed. Compact GENERAL
  area (~70px) renders ONLY when there are unroutable alerts.
- Routing verified (deterministic via data-panel attr):
  · DEMO v01: EGT→v01:twins, Efficiency→v01:efficiency
  · MULTI-CASUALTY: v04 EGT→twins, v01 EFF→efficiency, v02 FEEDER→fuel
  · DATALINK BLACKOUT v01: STALE_DATA advisories→general (scenario now raises
    the advisory so the general path is exercised)
  · ALL NOMINAL: no docked alerts, no general area (no empty boxes)
- Substantiation guard logged: datalink/weather have no evidence panel → general;
  no forced docks. Severity intact ([CAUTION] gold, reads clearly).

## Safety
Type scale held, greyscale, no new boxes/strokes. Demo seed alert values
unchanged (verify PASSED). TSC-OK · LINT-CLEAN · build OK.

---

# PROGRESS — 2026-06-14 (Session 87: ROUND 99 — drop engine-twin divider + improve glass fill)

## Done (verified docs/screens/r99-glass-on.png, r99-engine-twins.png)
- Engine-twin BOTTOM divider removed (borderTop above the sensor cluster) —
  separation by spacing alone (engine-row hairlines = row grammar, kept).
- Glass FILL improved within greyscale: round-97 fill (0.82/3px) read muddy;
  rebalanced to a 0.62→0.72 greyscale vertical gradient over blur 8px so the
  wave motion is softly perceptible through clean frost (not flattened grey).
  Subtle internal gradient = hint of glass depth. Blur modest (perf+subtlety).
- "Apple lens"/color-light diffraction REJECTED (logged): no chroma/lens/bloom/
  bright edge — unearned color/light, off-thesis. Greyscale frost only.

## Constraints held (verified)
- Reads solid; NO glow/edge/stroke. Severity SHARP (EFF Δ +13.7% gold crisp
  under glass). Sticky diffraction persists on scroll. 60fps HELD: glass-off
  ~121 / glass-on ~122 (no drop). Reduced-motion = frost over frozen still.
- Toggle state CONFIRMED: surfaceGlass DEFAULT OFF (verdict still pending; not
  made default-on — Anthony hasn't locked it).
- TSC-OK · LINT-CLEAN · verify PASSED · build OK. Data/behavior unchanged.

---

# PROGRESS — 2026-06-14 (Session 86: ROUND 98 — drop TREND BOARD label + FLEET glyph, keep sort subtitle)

## Done (verified docs/screens/r98-default-top.png, r98-expert-top.png)
- Removed the "TREND BOARD" page label (default text + Expert chart.trend glyph)
  and the "FLEET" scope label + ship glyph (FleetHealthBand header) — redundant
  noise, gone in DEFAULT and EXPERT. Verified: "TREND BOARD" absent both modes.
- Kept "ranked by sustained deviation" as a quiet SUBTITLE — CONTEXT 13px,
  ink-muted (rgb 117) dimmed, both modes. The one line stating the consequence-
  sort thesis (demo opening beat). Verified present both modes.
- Reflow clean: subtitle sits where the header was; band header row now carries
  only the range toggle, right-aligned — no orphan gap.
- Pruned now-unused imports (useLearn/expertOn in FleetView, Label in
  FleetHealthBand).

## Safety
Sort behavior unchanged (label cleanup only); subtitle uses existing tier (no
orphan). TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 85: ROUND 97 — glass toggle on floating sections + CommandBand padding)

## Done (verified docs/screens/r97-glass-off.png, r97-glass-on.png)
### Padding (always on)
- Vessel NAME top air: sticky paddingTop 16→24. Seam divider gets air both sides:
  instrument-row paddingBottom 16→20 (above) + voyage paddingTop 16→20 (below),
  so the divider no longer crowds the wind/waves line.
### Surface glass (dev toggle, attempt #5, pending verdict)
- FleetProvider `surfaceGlass` (default OFF). D-panel "surface glass" row
  off(float)/on(glass). Applied to CommandBand, voyage bar, Fleet Plot,
  FleetHealthBand via shared `glassFill` (gb.ts).
- Bounded: near-opaque fill (rgba 24/0.82) + backdrop-blur(3px), NO glow/edge/
  stroke. Verified: backdrop-blur applied; severity sharp (EFF Δ +13.7% gold
  rgb(227,209,65) crisp under glass); sticky diffraction maintained on scroll.
- **fps 60 floor HELD**: glass-off ~120 vs glass-on ~120 on the test display —
  no drop. Reduced-motion: glass over the static frozen gradient (cheap).
- No verdict — judge on pixels (prior glass attempts cut as SaaS-tells; the
  94/96 float is the new justification).

## Safety
Greyscale, earned gold, no glow/stroke, type scale held. Data/sort/behavior
unchanged. TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 84: ROUND 96 — float CommandBand + voyage bar)

## Done (verified docs/screens/r96-commandband-float.png)
- VesselCommandBand instrument row (gauges + center stack) + voyage bar panel
  fills (gb.box surface-raised) REMOVED — both float on the Calm Sea gradient,
  extending the round-94 treatment across the inspector. Gradient is now the
  consistent connective surface (FleetView + VesselInspector).
- The thin horizontal seam divider between instrument row and voyage bar
  (sticky boxShadow 0 1px 0 line-strong) RETAINED — structural, not severity.
- Sticky mechanics, padding, gauges, clock, voyage progress, maximize button
  unchanged (visual only).
- Legibility verified against the gradient: HERO values + DISPLAY name + arcs
  crisp; dimmed context (Dale Calloway, GALVESTON, 5.9 kn/2.4 ft, captions,
  Viosca Knoll 786, 49 nm from Venice) readable; severity dominates (gold
  +13.7% EFF Δ + amber arc); voyage bar greyscale/no-blue intact.

## Safety
Data/sort/alert/behavior unchanged. TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 83: ROUND 95 — Calm Sea in Expert + status cluster type toggle)

## Done (verified docs/screens/r95-*.png)
### Calm Sea persists in Expert (round-46 Expert-off reversed)
- Removed the `!expertOn` gate in AmbientSea — the gradient now renders in BOTH
  default and Expert. Rationale: round 94 floated the Fleet Plot + FleetHealthBand
  on the gradient, making the background STRUCTURAL; stripping it in Expert left
  sections on black (broken). Verified: canvas present in Expert.
- Other off-ramps intact: manual `ambientSea` toggle still off; prefers-
  reduced-motion still freezes to a still. Expert still strips labels→glyphs +
  docent (verified: 0 band label words in Expert) — just not the background.
- Pruned the now-unused useLearn import from AmbientSea.

### Status cluster type toggle (dev, pending verdict)
- New FleetProvider `clusterType` ('primary' | 'context'), default **primary**.
  D-panel "status type" row: A primary 16 / B context 13. StatusHeader prominent
  reads it.
- Verified: PRIMARY = 16px/600, CONTEXT = 13px/600 — bold weight kept in both,
  cycles cleanly, centered position held. CAUTION clickable + datalink-breath
  binding intact (0 breath nodes in DEGRADED seed = correct static).
- DATALINK degraded-blue + CAUTION gold unchanged (severity intact). Both tiers
  existing (no orphan).

## Safety
Data/sort/alert unchanged. TSC-OK · LINT-CLEAN · verify PASSED · build OK.

## Next
Anthony judges 16 vs 13 on pixels → lock one, retire the toggle.

---

# PROGRESS — 2026-06-14 (Session 82: ROUND 94 — float fleet sections + labels-default/glyphs-expert)

## Done (verified docs/screens/r94-*.png)
### Float
- Fleet Plot (FleetMap) + FleetHealthBand panel fills (gb.box surface-raised)
  REMOVED — both float on the Calm Sea gradient. The chart's navy water stays
  (the instrument); only the container fill goes. Pruned now-unused gb/RADIUS
  imports.
- Structural separators = the band cells' thin vertical hairlines
  (--color-line-hairline). Logged as a section rule, distinct from severity
  outlines (which stay severity-reserved).

### Descriptors — three states (resolves round-52 thread)
- DEFAULT → text labels (WATCH/NOMINAL/30D FLEET MEAN/FLEET BURN/ARRIVALS 24H/
  BUNKER). Verified all present.
- EXPERT (E) → glyphs only, labels hidden. Verified: 0 label words in expert.
- LEARN → labels + round-92 hover IA callout (verified 1 callout on band hover).
- Names + glyphs both from the shared ia-model (single source).
- Centered in BOTH modes (Stat gained `center` prop; column cells alignItems
  center). Fixes arbitrary left-aligned glyphs.

## Rulings / safety (verified)
- WATCH census count stays gold when >0 (rgb 227,209,65) — severity dominates
  against the now-visible gradient. Labels use existing MICRO/CONTEXT tiers (no
  orphan). Data/sort/alert unchanged. TSC-OK · LINT-CLEAN · verify PASSED · build OK.

---

# PROGRESS — 2026-06-14 (Session 81: ROUND 92 — Learn mode: hover-gated reveal + de-dup)

## Done (verified docs/screens/r92-hover-tile.png)
- Learn-mode annotations changed from always-visible (round-89 foundation) to
  **HOVER-REVEALED**. Default Learn state = clean interface + mode bar, NO
  callouts. Verified: Learn ON + no hover = 0 callouts; mode bar present.
- Hovering an element reveals ONLY that element's callout; moving away hides it.
  Verified: hover tile v01 = 1 callout (vessel-tile); move away = 0.
- **De-dup**: hover-gating solves it (option a) — only the innermost hovered
  wrapper anchors. Verified: hover tile v03 = still 1 callout (not 15).
- **One card at a time**: node-bound element shows the IA callout; the round-8
  docent card yields (suppressed when node bound) and the round-35 LayerLens
  hover card yields via a new `iaHover` context flag (click-to-copy still works).
- Clean positioning: fixed + horizontal clamp + vertical flip — never off-screen
  (verified an edge card stayed within the viewport). Subtle ≤100ms opacity fade
  (`.learn-callout`), disabled under prefers-reduced-motion (matches the existing
  reduced-motion pattern in globals.css).
- **Hover-to-teach scoped to Learn mode** — logged as intentional, NOT a
  violation of the operational hover-points-click-asks ruling (that governs the
  live interface, unchanged). Mode bar's "hover anything" is now literally true.
- **Source unchanged**: only the Learn consumer's reveal behavior changed; the
  shared ia-model content + binding (round 89) untouched.

## Demo-path safety (verified)
- Learn OFF renders identically — 0 callouts in the DOM. Operational hover
  behavior unchanged. TSC-OK · LINT-CLEAN · verify PASSED · offline build compiled.

## Note for a later content pass
- The vessel-tile IA node still records tier DISPLAY/24; round 90 demoted the
  tile NAME to PRIMARY/16 (value-first). Not touched here (round 92 = no source
  change); worth a one-line ia-model fix in a future content round.

---

# PROGRESS — 2026-06-14 (Session 80: ROUND 91 — master clock, demote date below time)

## Done (verified docs/screens/r91-clock.png)
- Global Zulu master clock split into two type weights: **TIME is the hero**
  (HERO 20, weight 600, ink-secondary), **DATE is a subordinate prefix** (CONTEXT
  13, weight 400, ink-muted) — pulled back on BOTH axes (smaller + lighter/dimmer)
  so the long date string stops fighting the time.
- Same line, date left / time right, baseline-aligned. Plex Mono, greyscale.
- Verified: DATE 13px/400/#757575, TIME 20px/600/#b0b0b0 — both existing tiers
  (no orphans); clock still ticks (…21Z → …22Z) and stays Zulu (Z suffix).
- Scope: master clock only. Nothing else touched. TSC-OK · LINT-CLEAN · build OK.

---

# PROGRESS — 2026-06-13 (Session 79: ROUND 90 — fleet-band glyphs + thumbcard value-first rebalance)

## Done (verified — docs/screens/r90-*.png)
### FleetHealthBand — descriptors → placeholder glyphs + Learn labels
- Every descriptor word (WATCH / NOMINAL / DEGRADED / 30D FLEET MEAN / FLEET BURN
  / ARRIVALS 24H / BUNKER) → a neutral placeholder library glyph; band reads
  glyph + value. Verified: 0 descriptor words visible in default mode.
- Names + meanings authored in the **shared ia-model** (`IA_BAND_DESCRIPTORS`) —
  single source, no separate label store. Default = glyph alone; **Learn mode
  surfaces the name** from the model (verified: all six names appear in Learn;
  grep-confirmed names live ONLY in ia-model.ts).
- Glyphs greyscale/neutral; the census **values keep their treatment** (WATCH "1"
  stays gold). `Stat` gained an optional `glyph` prop (neutral, never inherits the
  value's status tint) + optional `label` (passed only in Learn).

### Thumbcard — value-first rebalance
- Deviation value is now the card HERO (HERO 20, tint logic unchanged); vessel
  NAME demoted DISPLAY 24 → **PRIMARY 16** (a label, not a headline; status tint
  kept). Verified on Meridian: name 16px / value 20px, both gold.
- **Audit follow-up**: the name sat at DISPLAY 24 (inspector register) while the
  fleet-mean above was HERO 20 — they competed. Demoting resolves it; card row +
  upper fold now read at one consistent summary register.
- Card glyphs unified: calendar/wave/clock were 26/24/14 → all **18** (calendar
  was the oversized offender). Glyph px ≠ type tier — no type orphan; tiers used
  stay 16 + 20.

## Severity / demo-path safety (verified)
- **Meridian still pops**: gold name + gold +7.6% value + gold meter strip — the
  clear alerted card. Demoting the name did NOT weaken severity (strip + value
  tint carry it, round 66 holds).
- Data / consequence sort / meter strip / expand / alert logic all unchanged.
  TSC-OK · LINT-CLEAN · `npm run verify` PASSED · offline build compiled.

## Next session
Anthony to refine which band descriptors keep glyphs vs revert to labels, and
which drawn glyphs replace the placeholders (drawing queue).

---

# PROGRESS — 2026-06-13 (Session 78: ROUND 89 — IA SYSTEM: shared source + dual-consumer skeleton)

## Done (verified — screenshots docs/screens/r89-*.png)
- **Single source of truth**: `src/ia/ia-model.ts` — one typed structure, four
  layers + process. No IA content duplicated; distinctive phrases grep ONLY to
  ia-model.ts. Both consumers `import` from it (grep-confirmed: IASystemMap +
  Annotated).
- **Four layers modeled**: NODES (10 instruments — VesselTile, Command Gauges,
  Meter Strip, Fleet Health Band, Fleet Plot, Engine Twin, Fuel Synoptic, Voyage
  Bar, Global Status Cluster, Calm Sea; each id/name/path/tier/what/why/rulings),
  HIERARCHY (four-level renderable tree), PERSONAS (primary fuel engineer +
  ops-manager + duty-watch), JOURNEYS (Meridian anomaly walkthrough, step→nodes).
  Plus PROCESS layer (rulings-with-receipts + tested-and-killed).
- **Consumer #1 — IA PAGE** (`/ia`, `src/ia/IASystemMap.tsx`): renders Hierarchy /
  Node inventory / Personas / Journeys / Process, all from the source. Reachable
  from a new D-panel **"IA / SYSTEM MAP"** section; "← fleet board" back-nav.
  Unified round-86 type scale + greyscale + borderless fills (the page is itself a
  worked example of the discipline). Verified: 5 sections render; journey +
  sort-bug receipt present.
- **Consumer #2 — LEARN BINDING**: `Annotated` gained an optional `node` prop;
  bound live elements surface the node's what/why/ruling as a STATIC callout from
  the shared source. Wired across both pages: vessel-tile, fleet-health-band,
  fleet-plot, status-cluster (board) + engine-twin, fuel-synoptic, voyage-bar
  (vessel) = 7 distinct nodes. Verified: Learn ON → 18 callouts on the board (4
  nodes) + 3 on the vessel; content shows.

## Demo-path safety (verified)
- Learn OFF → **0** IA callouts in the DOM; FleetView / VesselInspector / gauges /
  alerts / sort / Meridian seed unchanged. Annotated is a `<>{children}</>`
  passthrough when learn is off — zero cost. No regression.
- `src/ia/` is PERMANENT (a real feature); it survives the strip-before-demo of
  `src/learn/` (Learn is just the second consumer).

## Scope held (explicit deferrals)
NO animations, hover choreography, connective lines, or reveal transitions — the
Learn callouts are simple static annotations this round. Those are deferred.

## Checks
TSC-OK · LINT-CLEAN · `npm run verify` PASSED · offline build compiled (`/ia`
route present).

## Next session
Per Anthony's roadmap: the deferred Learn-mode choreography (hover reveal,
connective lines from live element → IA node) builds on this binding.

---

# PROGRESS — 2026-06-13 (Session 77: ROUND 88 — UI polish batch, 10 items)

## Done (verified — screenshots in docs/screens/r88-*.png)
1. **OCEANUS FLEET wordmark** → PRIMARY tier (16, font/display 700) — no longer
   DISPLAY. Identity chrome, not a hero datum.
2. **Global status cluster relocated** to a centered row BELOW the fleet-plot map
   and directly ABOVE the thumbcards, promoted to PRIMARY (`StatusHeader
   prominent`). CAUTION·ADVISORY still clickable DetailChips. **Round-79 DATALINK
   breath binding SURVIVED the move** — verified 0 breath elements in the DEGRADED
   seed (breathes only when FRESH; static here, correct).
3. **Redundant headers** "FLEET PLOT — GULF OF MEXICO" + "PORT CALLS — 72H" gated
   to Learn-only (`learnOn`). **"TREND BOARD — ranked by sustained deviation"
   subtitle KEPT** (explains the consequence sort).
4. **Fleet chart maximize** shows on hover only (`chartHot`) — verified
   default:0 / hover:1 / leave:0. Click still toggles 240↔520.
5. **Zulu master clock** → HERO tier (20, weight 600).
6. **Port-call right-edge bleed FIXED** — chips within ~100px of the right edge
   right-anchor at their ETA and grow leftward. Verified: 0 chips overflow their
   lane. PORT CALLS header now Learn-only; all chips contained.
7. **Trip summary bar** → ONE maximize/minimize button (replaces the two round-83
   chevrons), default collapsed; click reveals BOTH detail columns. **%/dest
   overlap FIXED**: marker labels flip left when `frac > 0.82`. Verified at seed
   fractions 6% (v01) / 48% (v13) / 86% (v09 — exercises the flip) + expanded
   state. (95/100% don't occur in the fixed DEMO_EPOCH seed.)
8. **FOLLOW** → bullseye/crosshair Glyph (neutral ink); function/state unchanged.
   Verified: appears on pan with the crosshair svg (docs/screens/r88-follow.png).
9. **Fuel-twin (VesselSynoptic) type audit** → unified scale: tank %/gph →
   context, node/small marks → micro, RECON OK → context (keeps reconColor). No
   orphan sizes.
10. **ALERTS bar tightened** (VesselInspector) — padding 16→6px, lines at context
    + lineHeight 1.45. The two `[CAUTION]` anomaly-evidence lines KEPT (this is
    also why the global cluster reads "2 CAUTION" — Meridian's two caution alerts,
    still one CAUTION vessel).

## Rulings held
Greyscale + earned color · severity unmissable · no orphan type sizes (every
change reuses an existing tier) · maximize/minimize = click · chart + FOLLOW
controls = hover (control affordance, not data-reveal). DEMO_EPOCH/LAND geometry
untouched.

## Checks
TSC-OK · LINT-CLEAN · `npm run verify` PASSED · offline build compiled.

## Next session
Awaiting PM review of the polish batch. The two dev-decisions worth a flag:
hover-hiding the chart maximize (item 4) and the marker-label flip threshold 0.82
(item 7) — both verified but logged as DEV DECISIONS (pending Anthony).

---

# PROGRESS — 2026-06-13 (Session 76: ROUND 87 — position track: distinguish history from projection)

## Done (verified `docs/screens/r87-pos-v01.png`, `r87-marker-zoom.png`)
- **Recorded history** = SOLID, confident, higher-opacity (ink/secondary) — was a
  thin dashed `3 3` `#7a7a7a` that read as ambiguous. The real course bend is
  preserved (not smoothed/straightened).
- **Forward projection** ADDED = dim, sparse-dashed (`1.5 5`), FADING via an
  opacity gradient to 0. Heading + speed bounded: ~3h extrapolation along
  `heading_deg` at `speed_over_ground_kn`. Speed-scaled and short — no long
  confident forward line.
- **Marker is the clean past/future boundary**: solid history ends at the stern,
  dim projection begins at the marker heading-forward. At the zoom: solid (east,
  where Meridian came from) vs dim-dashed (west, heading 260° forward) — instantly
  legible past vs future. The "returning from open water" misread is gone.
- **Substantiation confirmed**: projection only where data justifies — Meridian
  (transit, 12 kn) draws it; Frigate Bird (on station, ~0 kn) draws NONE (verified
  projection-line count: 1 vs 0). No fake forecast for a holding vessel.
- Greyscale throughout (history + projection neutral grey, projection dimmer);
  marker keeps alerted-gold. The other plot dots are real other-vessel positions
  (`ghosts` from the fleet) — confirmed real, not artifacts.

## Scope held
Only the track render in InspectorChart. FOLLOW/compass/scale/marker/ghosts/
coastline-omission (round 84) untouched. TSC-OK · LINT-CLEAN · verify PASSED.

---

# PROGRESS — 2026-06-13 (Session 75: ROUND 86 — APPLY UNIFIED TYPE SCALE (global, single source))

## Single source established
- CSS `--type-*` tokens are now the ONLY type-size system. Defined: display 24 /
  hero 20 / primary 16 / context 13 / micro 10 / micro-floor 8 (+ context-mono 12.5,
  defined-but-unused). Deleted: `--type-hero-size` (30), `--type-data-size`,
  `--type-micro-size`, and **probeTokens `TYPE`** (name/hero/meta/micro).
- **grep-confirmed**: no component reads a type size from probeTokens; no
  `--type-hero-size` anywhere; the only hardcoded fontSize left is the documented
  16px "✓" checkmark orphan (+ the computed responsive GULF-OF-MEXICO furniture
  label). `gb.big` → var(--type-hero); body base → var(--type-context).

## Verified on the running build (computed sizes)
- name **24** (display) · gauge value **20** (hero) · mission clock **16**
  (primary) · context elements **13** · section header POSITION **11** · gauge
  ticks/captions **10** (micro) · EngineTwin floor **8**.
- DISPLAY/HERO collision resolved: name (24) out-ranks gauge values (20); nothing
  on the old 30. CONTEXT collapsed 11–15 → 13 (fleet tile footer was 14 → now 13;
  progress %/destination now 13 — the "too big" complaint solved). MICRO collapsed
  8–11 → 10 with the 8 floor only on EngineTwin.
- Screens: `r86-vessel.png`, `r86-fleet.png`, `r86-tile.png` (TERREBONNE 24 / −3.0%
  20 / footer 13).

## Mono/UI optical — what I landed on
Defined `--type-context-mono: 12.5` for the case Plex (mono) reads larger than UI
at 13. On render the single 13 read at equal rank for both (most context is Plex;
the UI context — FleetRail names, computed 13 — matched). **Landed on a single
`--type-context` (13)** for both families; the 12.5 mono token is defined and
available if a later round wants the 0.5px split.

## Orphans handled
16px decorative ✓ kept (intentional); vestigial TYPE.name (21) deleted; body base
14 → token. Section-header treatment (11, gb.label) left separate as the labeling
style. TSC-OK · LINT-CLEAN · verify PASSED · offline build clean.

---

# PROGRESS — 2026-06-13 (Session 74: ROUND 85 — TYPE SCALE AUDIT (report only, no changes))

Inventory pulled from source (CSS tokens + probeTokens/gb + every inline
`fontSize`). NO styles changed. Scope: whole app, FleetView + VesselInspector
called out.

## A. Token-level scales (the root of the drift)
TWO parallel, DISAGREEING scales exist:
- **CSS** (`globals.css`): `--type-label-size 11` · `--type-hero-size 30` ·
  `--type-data-size 13` · `--type-micro-size 11`.
- **probeTokens `TYPE`**: `name 21` (D-DIN 700) · `hero 15` (Plex 500) ·
  `meta 12` (Plex 400) · `micro 11`.
- **Collisions:** "hero" is defined TWICE and 2× apart — `--type-hero-size = 30`
  vs `TYPE.hero = 15` (the Gauge anchors off the 15). `--type-label-size` ==
  `--type-micro-size` (both 11), so the "4-step" CSS system is really 3 distinct
  values (11/13/30). `--type-data-size 13` ≈ `TYPE.meta 12` (1px apart, same role).

## B. Every distinct size → elements (family/weight)
- **30px** `--type-hero-size`/`gb.hero` — CommandBand vessel NAME (D-DIN 700);
  VesselTile trend value std + expanded-tile Stat values + EngineTwin EGT-gap hero
  (Plex 500). *(DISPLAY and HERO collide here.)*
- **~20px** Gauge VALUES (SPEED/BURN/EFF Δ/ENDURANCE: 12.1 kn, +13.7%, …) — Plex
  500, computed `TYPE.hero(15) × k` at gauge size 116.
- **24px** VesselTile NAME std (D-DIN 700); VesselTile trend value mini (Plex 500).
- **21px** `TYPE.name` token (D-DIN 700) — vestigial: VesselTile overrides it to
  18/24, no element renders raw 21.
- **18px** CommandBand mission CLOCK (calc 30×0.6, Plex 500); CommandBand collapsed
  name + VesselTile name mini (D-DIN 700); AppHeader wordmark "OCEANUS FLEET" (D-DIN).
- **16px** VesselTile automotive nominal "✓" only (orphan, decorative).
- **15px** `TYPE.hero` — wind/waves; ALL CommandBand context (endpoint labels,
  origin/dest detail, ETA, NM-to-go, Venice, progress %) (Plex). *(round-83 unify.)*
- **14px** VesselTile footer values (endurance h / now %) (Plex); DevPanel/EngineTwin chrome.
- **13px** `--type-data-size` — FleetView "TREND BOARD" page header (Plex,
  letterspaced, gb.label+override); FleetRail vessel-name list (UI).
- **12px** `TYPE.meta` — AlertSheet popover rows; LiveControls sim-clock; AppHeader
  MASTER CLOCK; Contextual/DataRow/many panels; CommandBand stale-weather line (Plex/UI).
- **11px** `--type-label-size`/`--type-micro-size`/`TYPE.micro`/`gb.label` — ALL
  section headers (Plex, letterspaced); global-bar status chips (DATALINK/SYNC/
  CAUTION counts); Stat labels; VesselTile alert lines; many panel labels.
- **10px** Gauge min/max axis labels (0/17, -20/+20, 12/2.4k, Plex); NauticalChart
  compass/scale labels; DevPanel rows; chart tick labels.
- **9px** Gauge unit CAPTIONS (SPEED/BURN/EFF Δ/ENDURANCE, Plex caps); chart axis
  labels (EfficiencyCurve/PortCalls/TrendChartFill/VesselSynoptic/EngineTwin).
- **8px** EngineTwin smallest label only (orphan, MICRO floor).

## C. Mapped onto the proposed five tiers (with spread)
- **DISPLAY** (name/titles) — D-DIN 700, consistent FAMILY. Sizes: **18, 21, 24,
  30** across ~5 elements (CommandBand name 30, tile name 24/18, collapsed 18,
  wordmark 18, vestigial token 21). **4 sizes.**
- **HERO DATA** (gauge values + big numbers) — Plex 500, consistent family. Sizes:
  **~20** (gauges) · **24** (tile mini) · **30** (tile std, Stat, EGT gap). **3
  sizes**, and **collides with DISPLAY at 30**.
- **PRIMARY LABEL** (mission clock + section headers) — three roles lumped: section
  headers **11**, FleetView page header **13**, mission clock **18**. **3 sizes**
  (arguably 3 different roles, not one tier).
- **CONTEXT** (master/place/wind-waves/endpoint labels/%/Venice/ETA/spec/tile
  values) — Plex/UI. Sizes: **11, 12, 13, 14, 15** across ~12+ elements. **5
  sizes — the worst spread.**
- **MICRO** (axis ticks/captions/smallest) — Plex. Sizes: **8, 9, 10, 11**. **4 sizes.**

## D. Near-duplicates flagged (≤2px, same tier drifted = the noise)
- **CONTEXT 11/12/13/14/15** — five sizes doing one job. Biggest collapse target:
  status chips 11, panels/popovers 12, FleetRail 13, tile footer 14, wind-waves/
  CommandBand 15. (round 83 moved CommandBand context to 15 but tile values stayed
  14 and chips/panels stayed 11–12.)
- **14 vs 15** — tile footer values (14) vs the wind/waves context register (15):
  meant to be the same CONTEXT size.
- **9 vs 10** — gauge captions/chart-axis (9) vs gauge ticks/chart ticks (10): MICRO drift.
- **12 vs 13** — `TYPE.meta`(12) vs `--type-data-size`(13): same role, 1px apart.
- **20 vs 21** — gauge value (~20, Plex) vs `TYPE.name` (21, D-DIN): cross-tier
  near-collision (different families, so reads distinct — noted, not noise).
- **18 reused across tiers** — DISPLAY (names) and PRIMARY (mission clock) share 18px.

## E. Orphans
- **16px** — VesselTile automotive "✓" (one decorative element; genuinely special).
- **8px** — EngineTwin smallest label (one element; MICRO floor).
- **21px** `TYPE.name` — vestigial token, overridden everywhere; no raw render.
- **13px** `--type-data-size` — only the TREND BOARD header + FleetRail; not a
  general data size despite the name.

## F. Section headers — CONSISTENT at 11px, ONE drift
POSITION · ALERTS · ENGINE TWINS · FUEL · FLEET · PORT CALLS — 72H · EFFICIENCY ·
ROUTE · MODE 24H · CREW & LOG · FLEET PLOT — all render via the `Label` component →
`gb.label` → **11px** Plex Mono, letterSpacing 1.2. **Consistent.** The one drift:
**FleetView "TREND BOARD — RANKED BY SUSTAINED DEVIATION"** is a raw div using
`gb.label` **overridden to 13px** (it's the page-level header, not a section
header). So: section headers uniform at 11; the FleetView page header sits at 13.

## Bottom line for a 5-tier collapse
Distinct sizes in play: **8, 9, 10, 11, 12, 13, 14, 15, 16, 18, ~20, 21, 24, 30**
(~14 values) feeding 5 intended tiers. The fixable noise is CONTEXT (11–15, collapse
to one) and MICRO (8–11, collapse to ~2). DISPLAY and HERO both anchoring to the
same 30px token is the structural collision to resolve. No changes made this round.

---

# PROGRESS — 2026-06-13 (Session 73: ROUND 84 — position chart, fix unrealistic geometry spike)

## Diagnosis (reported before fixing)
The dark filled wedge spiking to a V at ~89°W/29°N (at the Meridian marker, open
water) is the **coastline polygon** (`LAND`, src/data/coast.ts) drawn by
NauticalChart — specifically the **Mississippi-delta bird's-foot** points
(`[-89.2,29.12],[-88.95,28.95],[-89.25,29.35]`), a coarse zigzag.
**Data approximation rendered correctly**, not a render bug / unclosed path: it's
fine at the full-Gulf FleetMap zoom, but the InspectorChart frames a ~2–3° window
centred on the vessel, so the crude delta fills a sharp wedge right at the marker.

## Fix (render-scope; geometry NOT touched)
`LAND` is shared with the schedule's land-avoidance + the verify harness — editing
it would alter the deterministic seed. So, per the substantiation ruling ("better
no coastline than a fake one"), the **InspectorChart omits the landmass**
(`NauticalChart land={false}`); the FleetMap keeps the full-Gulf coastline.
Geometry untouched → `npm run verify` still PASSES (schedule/seed intact).

## Verify
- Demo seed (Meridian, v01): position chart clean — water + graticule + compass +
  scale + marker + smooth dashed track, NO wedge (`docs/screens/r84-pos-v01.png`).
- Spot-check (Frigate Bird, v04): clean too — not seed-specific
  (`docs/screens/r84-pos-v04.png`).
- Scope held: FOLLOW, compass rose, scale bar, vessel marker, dashed track all
  unchanged. Only the land fill is omitted at the inspector zoom.
TSC-OK · LINT-CLEAN · verify PASSED · offline build clean.

---

# PROGRESS — 2026-06-13 (Session 72: ROUND 83 — voyage bar collapsible endpoints, progress %, type unify, wave-glyph re-fix)

## Done (verified on running build)
- **Collapsible endpoint columns**: the endpoint label + a small chevron is the
  toggle — click expands origin (spec/speed) or destination (ETA/NM-to-go).
  **Collapsed by default**, independent, **click-only** (no hover). Verified:
  `docs/screens/r83-collapsed.png` (columns hidden, chevrons ⌄ visible) vs
  `r83-expanded.png` (clicked → columns show, chevrons ^).
- **Progress %** (`6%`) added above the vessel marker, bound to real `frac`.
- Collapsed band still shows labels + bar + marker + Venice (`49 nm from Venice,
  LA`) + progress %; only the detail columns hide.
- **Context type unified to the wind/waves scale** (font/data 15): origin/dest
  detail, Venice, %, endpoint labels. NAME / gauge values / mission clock untouched.
- **WAVE GLYPH GREYED — third time, root cause finally fixed.** The two prior
  attempts (79/81) did nothing because the imported glyphs hardcode `fill="white"`
  (a NAMED colour) and the importer's normalize only converted HEX → currentColor —
  so white survived and the glyph ignored the `color` prop. Fixed the normalizer to
  convert ANY non-`none` fill/stroke → currentColor; regenerated glyphs.generated.ts
  (all 3 now `fill="currentColor"`). The wave (passed ink/muted) now renders dim
  grey, MATCHING the wind glyph — confirmed on a 4× pixel crop
  (`docs/screens/r83-wx-glyphs.png`): both dim grey, wave no longer white.

## Held
Voyage bar greyscale/no-blue (round 81) intact; non-transit modes keep their single
centered context line (collapse applies only where the bar renders). TSC-OK,
LINT-CLEAN, verify PASSED.

---

# PROGRESS — 2026-06-13 (Session 71: ROUND 82 — voyage bar endpoint-anchored detail columns)

## Done (verified `docs/screens/r82-commandband.png`)
- Restructured the round-81 centered ETA + spec lines into two **endpoint-anchored
  columns** + a marker label:
  - **Origin column** (left-aligned under `Viosca Knoll 786`): `240 ft OSV` (spec)
    / `12.1 kn` (speed).
  - **Destination column** (right-aligned under `Galveston, TX ◇`): `◇ ETA
    2026-06-19 17:43Z` / `333 NM TO GO`.
  - They bracket the route as two corners of info.
- **Redundant location text removed**: each place name appears once as its endpoint
  label (dropped the repeated "Galveston, TX" from the ETA line; no repeated
  origin name).
- **Venice reference relocated to the vessel marker**: `49 nm from Venice, LA`
  (nearest port to the vessel's CURRENT position — neither endpoint) floats as a
  small label at the marker's position on the bar.
- All of it stays reference/context: neutral, dimmed (ink/muted), context-scale,
  no tint/weight/alert.
- **Voyage bar unchanged** (round 81): white = covered / grey = remaining, marker
  + halo at real progress, no blue. Non-transit modes keep a centered context line
  (no route → no columns).

## Verify
Columns bracket the route cleanly without crowding; Venice floats with the marker;
bar greyscale/no-blue intact. TSC-OK · LINT-CLEAN · offline build clean · verify PASSED.

---

# PROGRESS — 2026-06-13 (Session 70: ROUND 81 — CommandBand reorder + voyage bar greyscale progress)

## Done (verified `docs/screens/r81-commandband.png`)
- **Reordered the band below the instruments**: instrument row → ETA line
  (centered) → voyage bar (full-width) → spec line (centered, bottom).
  - ETA line: `Galveston, TX ◇ ETA 2026-06-19 17:43Z` (StateMark = the ◇),
    ink/muted, context-scale — the absolute ETA moved off the voyage bar's
    destination onto its own line.
  - Spec line at the very bottom: `240 ft OSV · 49 nm from Venice, LA · 12.1 kn`,
    ink/muted, context-scale. Both ETA + spec are neutral/dimmed, no tint/weight.
- **Voyage bar → greyscale progress**: removed the blue fill (no assigned meaning,
  not defensible). **WHITE = covered** (behind marker), **GREY = remaining**
  (ahead) — standard progress read. Split bound to the real `frac` (6% · 333 NM
  TO GO data retained), not a fixed visual. Origin/destination labels kept.
- **Vessel marker preserved** (white outline) with a dark drop-shadow halo so it
  reads clearly where white meets grey (Anthony's contrast preference held).
- Navy absent from the bar (chart-water only); blue may return only if it earns a
  meaning (logged, not built).

## Composition
Each register breathes (ETA / bar / spec spaced by --pad-section); ETA + spec
centered, bar full-width; band stays balanced. Gauge internals/tint + severity
treatments untouched; mission clock stays in the center stack. Removed the now-
unused ACCENT import.

TSC-OK · LINT-CLEAN · offline build clean · verify PASSED.

---

# PROGRESS — 2026-06-13 (Session 69: ROUND 80 — persist water defaults (all pages))

## Done
- Set the persisted Calm Sea / water defaults in FleetProvider (above the router →
  global, every fresh load on any page): WATER MODE gradient · TEXTURE on ·
  WAVE AMP 0.08 · TEX DENS 0.00 · TEX BRIGHT 0.25 · DENSITY 120 · DOT SIZE 0.50 ·
  FLOW/RIDGE 1.00 · MAGNIFY 2.50. (AmbientSea inputs-ref placeholder matched too.)

## Verify (running build, both pages)
- **Sliders identical & exact on fresh load** — FleetView and VesselInspector both
  read: wave amp=0.08, tex dens=0, tex bright=0.25, density=120, dot size=0.5,
  flow/ridge=1, magnify=2.5; mode=gradient, texture on. No page differs.
- **Dataset binding still dynamic (not frozen)**: the water readout shows the live
  round-50 amp/freq per scope — FleetView `amp 0.46 · freq 1.12` (fleet mean),
  VesselInspector v01 `amp 1.17 · freq 1.34` (single vessel). The slider values are
  the baseline; the binding modulates amp/freq on top, confirmed per-scope.

## Round-78 status (asked) — NEVER LANDED
git log goes **77 → 79, no round 78** committed, and no round-78 brief was received
this session. So particle + dot-flow were never cut — they remain in the picker
(gradient | particle | dot flow). Per the brief's option and Anthony's provided
dot-slider values, **modes RETAINED** and their values persisted. Say the word and
I'll cut particle/dot-flow + drop the orphaned dot sliders in a follow-up.

TSC-OK · LINT-CLEAN · offline build clean · verify PASSED.

---

# PROGRESS — 2026-06-13 (Session 68: ROUND 79 — global status bar + CommandBand composition)

## Global status bar (all pages) — done
- AppHeader is now the GLOBAL system-state bar (FleetView + VesselInspector,
  app-level): wordmark + **DATALINK + LAST SYNC** (left) · **CAUTION · ADVISORY**
  counts (center, clickable DetailChips → alert popover) · **master clock** (right).
- **Global UTC master clock built** — real Zulu wall clock (system time), ticking,
  IBM Plex Mono / neutral ink. Verified identical on both pages (fleet
  `2026-06-13 23:45:39Z`, vessel `…41Z`). Distinct from the per-vessel mission
  clock (T−26:43), which stays in the CommandBand center stack. Client-only +
  mounted-gated (no SSR hydration mismatch).
- **Round-73 split reversed**: DATALINK + LAST SYNC moved from the CommandBand
  bottom footer to the global top-left; the bottom footer is REMOVED. The
  per-page StatusHeaders (CommandBand top, FleetHealthBand) are removed too — one
  global bar now, no duplication. `StatusHeader` gained nothing new (reused its
  `parts` prop: health left, alerts center).
- **DATALINK breath, substantiation-bound**: pulses (slow opacity heartbeat) ONLY
  when LIVE/FRESH; still/flagged when DEGRADED/STALE; bound to actual state;
  reduced-motion freezes it (globals.css). **Demo seed is DEGRADED → it does NOT
  breathe** (verified: 0 `.datalink-breath` elements in the seed) — the one thing
  that would pulse doesn't, because the link is degraded.

## CommandBand composition (VesselInspector) — done
- Removed the band's own status strips (top alerts + bottom health → global bar).
- **Gauges enlarged 96 → 116px**, clusters pulled inward (gutter 44 → 30) — dead
  air gone, three-mass balance held (consequence = size). Gauge internals/anatomy
  /tint unchanged (EFF Δ +13.7% still gold + amber arc, white needle).
- **Wave glyph greyed to match wind** — the drawn filled wave glyph drops to
  ink/muted so it reads at the wind placeholder's dim weight (color-match only,
  size held). Verified on a 3× crop (`docs/screens/r79-wx-line.png`): wind + wave
  now read at matching dim context weight.
- Center stack (NAME · master · mission clock · place · wind/waves) still breathes
  with distinct registers after the gauges grew and the global bar took the top.

## Verify
TSC-OK · LINT-CLEAN · offline build clean. Screens: `r79-fleet-bar.png`,
`r79-vessel.png`, `r79-wx-line.png`. Severity treatments intact; mission clock in
the center stack; gauge internals/tint unchanged.

---

# PROGRESS — 2026-06-13 (Session 67: ROUND 77 — DOT FLOW FIELD (dense flowing dot-ridges))

## Done
- Rebuilt the dot-based water as a **FLOW FIELD** (per the envato reference, colour
  stripped to white). Dots **concentrate on the wave crests** — brightness + size
  pack onto the ridge (`ridge = pow(crest, 1 + flow·9)`), so crests read as bright
  dense flowing lines of dots and troughs go dark/sparse; the ridges travel as the
  wave drifts (the flow). Magnification on the crest kept on top.
- **Folded into the existing dot slot** (relabeled "dot flow") — picker is
  gradient / particle / dot flow, NOT a sixth mode.
- **Defaults retuned to SHOW it on load** (the prior shipped near-invisible): dense
  (72 rows, fine columns), fine dots (1.4), magnify 1.0, ridge-sharpness 0.5, with
  a ×4 in-shader brightness boost so the shared brightness slider reads as bright
  ridges. Verified visible on default load (`docs/screens/r77-flow-board.png` /
  `-crop.png`) — dense flowing ridges, not a thin/invisible field.
- New **flow/ridge** sharpness slider (the dial for lines-vs-scattered) + density /
  dot size / magnify / wave amp / brightness.

## Verify (running build)
Dots flow along contours + pack densely on crests (reads as flowing ridges, not
scattered points); default shows the effect on load; magnification on crests
retained; recession + haze + no horizon/sky; **greyscale/white only, no colour**;
frequency+amplitude delta-bound; **severity dominates** (Meridian gold over the
thin bright ridges); sliders present; **~120 fps** in-shader (single-cell O(1) →
density is free); reduced-motion freezes a frame (canvas one-frame paint, key
includes mode); cards untouched (glass/shadow cut).

---

# PROGRESS — 2026-06-13 (Session 66: ROUND 77 — DOT MATRIX rebuild (dense + magnification) + particle mark fix)

## Done
- **PARTICLE FIELD mark fixed**: the round-75 point+line tiled into a directional
  chevron/fish read. Now a simple round dot (neutral points only). Verified
  (`docs/screens/r77-particle-fixed.png`) — round dots, no glyph shape.
- **DOT MATRIX rebuilt** (replaces the sparse round-76 one, NOT a 5th mode):
  - DENSE + FINE lattice (small dots, dense rows; defaults dotSpace 46 / dotSize 2).
  - **Per-dot MAGNIFICATION is the primary wave cue**: crest dots SWELL +
    BRIGHTEN, trough dots stay small/dim → the wave reads as a travelling swell of
    enlarged brighter dots through a fine field. Displacement secondary.
  - Recession / haze / no-horizon / no-sky kept; frequency delta-bound (u_freq).
  - White, subtle, subordinate — magnified crest dots are the brightest points but
    stay below severity.
- **New `magnify` slider** + density (dot space) + dot size; wave amp + tex bright
  (contrast) reused. The two key dials (magnification + density) are exposed.

## Performance — solved cleanly
First pass used a 3×3 neighbor search → only ~56–61 fps (right at the floor) and,
worse, density-INdependent so the slider couldn't relieve it. Realized round-77's
displacement is small and the magnified dot radius stays well under half a cell at
every depth, so a **single-cell lookup is correct** → O(1) per pixel. Result:
**sustained ~120 fps** on the board (gate 60), and **density is FREE** (finer
lattice costs nothing). All in-shader (no per-dot DOM/SVG, no element resizing).

## Verify (running build, `docs/screens/r77-matrix-board.png` / `-crop.png`)
Dense fine lattice clearly visible; magnification makes crest dots swell/brighten
and troughs settle; recession + haze + no horizon retained; greyscale/white;
severity dominates (Meridian gold); sliders present (density/size/magnify/amp/
contrast); ~120 fps; reduced-motion freezes mid-wave (canvas one-frame paint, key
includes mode); cards untouched (glass/shadow cut).

---

# PROGRESS — 2026-06-13 (Session 65: ROUND 76 — Calm Sea DOT MATRIX (fourth mode))

## Done
- **DOT MATRIX** added as a fourth selectable WATER MODE (gradient | particle |
  dot matrix) — not a replacement.
- A regular receding lattice of small WHITE dots. **Waves = vertical DISPLACEMENT
  of the dots** (crests push up + brighter, troughs settle); the lattice placement
  is fixed, the wave is the deformation. **Perspective recession** — larger/sparser
  dots foreground, smaller/denser toward the back — with **NO horizon line and NO
  sky**: fades into haze at the top (depth, not seascape). Rows neighbor-searched
  so displaced dots still draw.
- **White + subtle** (low opacity), kept in the subordinate band — quieter than
  the blue reference, severity out-reads.
- **Wave FREQUENCY bound to fleet/vessel delta** (`u_freq` in the phase, round 50)
  — more delta → different cadence; greyscale, so the data shows in motion.
- Dev sliders reused + **dot size** and **dot spacing** sliders added.

## Verify (running build, `docs/screens/r76-matrix-board.png`)
- Fourth selectable mode; white greyscale subtle lattice; waves from dot
  displacement not placement; recession present with no horizon/no sky (haze fade).
- Severity dominates (Meridian gold over the faint lattice).
- **FPS ~71** on the board (gate 60) — GPU-only fragment lattice (no thousands of
  DOM/SVG nodes), no per-frame allocation; density tunable via sliders.
- Reduced-motion freezes the lattice (canvas paints one frame; canvas key includes
  waterMode so the mode mounts a fresh ctx); expert-off + toggle-off inherit
  governance. Background z-order/scope unchanged; cards untouched (glass/shadow cut).

## Note
The lattice is intentionally subtle per the brief; the dot-size/spacing/brightness
sliders let it be dialed louder on pixels without another round.

---

# PROGRESS — 2026-06-13 (Session 64: ROUND 75 — Calm Sea PARTICLE FIELD (third mode))

## Held (pending Anthony)
Sub-item 1 (persist current shimmer/wave settings as new defaults) is ON HOLD —
the values are in a screenshot Anthony will re-send. Defaults UNCHANGED until then.

## Done
- **WATER MODE selector** added to the `D` panel (gradient | particle) — selectable,
  not a replacement; gradient stays for comparison.
- **PARTICLE FIELD**: a different rendering model — the wave is built from DISCRETE
  marks (points + short line segments) on a screen-space lattice; marks AMASS on
  crests (present-probability rises with crest) and are DISPLACED upward by the
  wave, so the form emerges from the field of marks (not a luminance fade). Motion
  = marks shifting. 3×3 cell neighborhood search so displaced marks + cell-crossing
  line segments actually draw.
- Greyscale; dataset-bound (u_amp/u_freq); reuses the round-74 sliders.

## Two real bugs found + fixed
1. Default slider values (gradient-tuned) made the marks invisible → boosted mark
   size/density-floor/brightness so the field reads.
2. **Canvas context-loss on mode switch**: the canvas `key` only keyed on reduced-
   motion, so switching water mode reused the same canvas and cleanup's
   `loseContext()` left it dead → fell to the fallback gradient (looked black).
   Fixed: `key` now includes `waterMode` → fresh canvas per mode.

## Verify (running build, `docs/screens/r75-particle-board.png` / `-crop.png`)
- Particle field is a selectable third mode; waves built from discrete lines/points
  amassing into form (not gradient); motion from mark displacement; greyscale.
- Severity dominates (Meridian gold over the grey marks).
- **FPS ~70** on the board (gate 60) — GPU-only fragment field, instanced via the
  fullscreen-triangle + procedural lattice (no thousands of DOM/SVG nodes), no
  per-frame allocation. Density tunable on the slider if more headroom wanted.
- Reduced-motion freezes a particle frame (canvas paints one frame; same path as
  round 74, and the canvas-key fix makes particle+reduced mount a fresh ctx);
  expert-off + toggle-off inherit governance. Background z-order/scope unchanged;
  cards untouched (flat-matte; glass/shadow cut).

---

# PROGRESS — 2026-06-13 (Session 63: ROUND 74 — Calm Sea, restore wave form + dense texture + dev sliders)

## Round-73 status: LANDED (commit 28817db)
The screenshot Anthony saw was pre-73 (status row at top, mode glyph present)
because 73 wasn't committed yet. It is now in the branch (header rearranged,
gauges flank, mode glyph gone, status split). 74 builds on top.

## Done (verified on running build)
- **Wave FORM restored**: slower depth decay (exp −0.22) + narrower depth floor
  (0.05→0.15) so crests/troughs read as moving undulation, not a flat fade. Wave
  amplitude/contrast is now a uniform. Still smooth (no coarse round-62 noise).
- **Dense fine texture**: finer ~2px screen-space value-noise, density-driven
  threshold + higher brightness, gated to the wave CRESTS + near foreground so it
  reads as surface detail ON the waves (not a floating wash). ON by default now
  (textured water is the look); toggle still turns it off.
- **Dev sliders added** (`D` panel): WAVE AMP, TEX DENS, TEX BRIGHT — live tuning
  on the running build (the efficiency move; no new round to re-dial).
- **Reduced-motion → textured frozen still**: the canvas paints ONE mid-motion
  frame (wave form + texture), not a flat gradient. Fixed a real bug — cleanup's
  `loseContext()` left a dead canvas for the re-run; now a fresh canvas mounts per
  mode (`key`). Confirmed: reduced-motion renders the canvas (not the gradient).

## Verify / reported
- Waves read as moving waves (crop `docs/screens/r74-crop.png`); texture clearly
  visible as surface detail following the form; greyscale only.
- **Severity dominates**: Meridian gold name + value out-read the textured grey
  waves on the board (`docs/screens/r74-board.png`).
- **FPS: sustained ~120** on the board with texture ON by default (gate 60) — no
  density reduction needed; the slider can push further if wanted.
- Reduced-motion frozen textured still confirmed (`docs/screens/r74-reduced-still.png`);
  expert-off + toggle-off inherit the existing governance.

## Scope
`AmbientSea.tsx` (shader + uniforms + reduced-motion frame + canvas key),
`FleetProvider.tsx` (3 slider states + texture default ON), `DevPanel.tsx`
(Slider component + 3 sliders).

---

# PROGRESS — 2026-06-13 (Session 62: ROUND 73 — VesselCommandBand header rearrangement)

## Done (verified on the running build, `docs/screens/r73-commandband.png`)
- **Gauges flank the center stack**: SPEED + BURN left, EFF Δ + ENDURANCE right,
  identity stack between — three balanced masses, even gutters (round 53 held).
- **Center stack reordered** top→bottom: NAME (D-DIN) · master (crew.glyph + Dale
  Calloway) · mission CLOCK · place (anchor.glyph + GALVESTON, TX) · wind+waves on
  their OWN line below place (context-scale 15px, not promoted).
- **Mode glyph removed**; clock carries mode. Confirmed in build: transit
  `T−26:43`, station `ON STATION 51:00` (port/standby use the same branch — only
  `T−` pre-existed; the word prefixes were added this round).
- **Status row split**: CAUTION · ADVISORY counts at TOP near the name, still a
  clickable DetailChip (alert popover intact). DATALINK + LAST SYNC moved to a
  quiet bottom footer strip — separated from the band by a borderless fill-STEP
  (recessed surface-base) + spacing, no line. DATALINK DEGRADED keeps its advisory
  treatment. Reasoning: data-health is ambient, alert state is consequence.
- **Sticky preserved**: footer lives INSIDE the one sticky `<section>` — no second
  sticky element. Severity tints intact (MERIDIAN gold name, EFF Δ +13.7% gold
  value + amber arc, white needle); gauge internals untouched.

## Note (interpretation flagged)
The footer "no stroke/border" is read as the BAR's separation from the band (→
fill-step, satisfied). The DATALINK/LAST SYNC chips keep their round-43 DetailChip
hairline affordance (they're clickable, same as the top alert chip) — if you want
those chips themselves borderless, that's a quick follow-up.

## Verify
TSC-OK · LINT-CLEAN · offline build clean. `StatusHeader` gained a `parts`
prop (`all`/`alerts`/`health`); FleetHealthBand still uses the default `all`.

---

# PROGRESS — 2026-06-13 (Session 61: ROUND 72-B — Calm Sea fine particle shimmer (toggle))

## Done
- **Fine shimmer added behind a dev toggle: SHIMMER OFF (default) / ON.** Rides
  ON the round-67 smooth gradient (added to luminance, gradient stays underneath).
- **FINE, not the round-62 coarse grain:** value-noise in SCREEN space at ~2.4px
  cells (sub-pixel-scale at 1×, smoothly interpolated → no blocks/aliasing), two
  soft octaves drifting so it twinkles, hard-gated (`smoothstep 0.66–0.97`) to
  sparse glints that ride the wave crests and concentrate in the near foreground.
- **Greyscale**, low amplitude (max +0.06 lum) so it stays in the wave band —
  severity still out-reads. **Dataset-bound**: intensity scales with `u_amp` (the
  same fleet-mean / single-vessel delta the waves use, round 50).
- GPU-only, no per-frame allocations; the toggle is a uniform-coherent branch
  (free when off, keeps the round-67 baseline intact).

## Verify (running build)
- Toggle present, **OFF by default** (confirmed: default load is the smooth
  gradient). Off vs on crops differ — shimmer engages: `docs/screens/r72-shimmer-
  off.png` (smooth) vs `r72-shimmer-on.png` (fine speckle on the gradient).
- **Reads fine, not chunky at 1×** (sparse grey glints, not blocks).
- **FPS — both states well above the 60 gate:** OFF ~121 (121/121/121), ON ~120
  (120/121/121). No particle reduction needed.
- Greyscale; severity (gold Meridian) dominates; rides on the gradient (doesn't
  replace it). Reduced-motion → static still (no shimmer, frozen); expert-off →
  canvas null (shimmer dies with the waves) — both by construction (shimmer only
  runs inside the live shader). Cards untouched (flat-matte; glass/shadow cut).

## Scope
`AmbientSea.tsx` (shader + uniform), `FleetProvider.tsx` (shimmer state),
`DevPanel.tsx` (toggle row). No card treatment touched.

---

# PROGRESS — 2026-06-13 (Session 60: ROUND 71 / 72-A — consequence sort completed)

## Audit (round-21 comparator, before changing)
It pinned the right TIERS (status → active → idle) and DID sort the active tier —
but by `|sustained_deviation|`, the HIDDEN v2-§4 weighted score. That score
diverges from the tile's displayed hero number (`trend_30d`), so the active tier
looked unsorted: e.g. Calcasieu (trend −1.2, weighted −1.21) outranked Marlin
Ridge (trend +2.8, weighted +1.19). Both FleetView AND FleetRail render via this
one comparator (confirmed). So: it existed and was applied, but ranked by the
wrong (invisible) metric — answer to "is the in-transit tier sorting by
|deviation| worst-first?": **NO** (it sorted by a different, hidden score).

## Fix (completing round 71)
Rewrote `compareVessels` (built on round 21, not duplicated): three explicit
tiers, within-tier tiebreaker now **`|trend_30d|`** (the displayed hero), ABSOLUTE
(round 72 — magnitude is consequence, sign is diagnosis). ETA/alphabetical/data
order rejected. Stable vessel-id final tiebreak (no refresh jitter).

## Verified in the RUNNING build (rendered tile order, not just data)
demo seed: **1 MERIDIAN** (alert) · **2 TERREBONNE** (−3.0, worst active) ·
**3 MARLIN RIDGE** (+2.8) · 4 Cormorant (2.4) · 5 Sabine (1.5) · **6 CALCASIEU**
(1.2) · … · 13–15 BAYOU RUNNER / ALBATROSS / GULF HARRIER (idle, dimmed, bottom).
**Marlin Ridge now outranks Calcasieu** (the exact inversion flagged) and the
active tier descends by magnitude. NOTE: **Terrebonne (−3.0%) sits directly under
Meridian**, not Marlin — it's the largest active deviation, so the rule puts it
#2 (Anthony's Part-A example omitted Terrebonne, which was buried at row 11 under
the old weighted sort). Marlin is #3. Scenarios verified: MULTI-CASUALTY (degraded
above watch, worst-first), PORT-WEEKEND (most vessels dimmed bottom), ALL-NOMINAL
(no T1, idle last) — all correct.

## Glass — CUT
Confirmed no glass scaffolding exists in the branch (nothing to remove). Logged as
permanently cut for scope in DECISIONS. Cards stay flat-matte.

## Verify
TSC-OK · `npm run verify` ALL CHECKS PASSED · offline build clean. Commit hash in
the commit message; rendered order confirmed above on that build.

---

# PROGRESS — 2026-06-13 (Session 59: ROUND 70 — VesselTile, remove header band, separate by spacing)

## Done
- **Header grey band removed.** Dropped the round-63 `#2b2b2b` fill-step behind
  the vessel name; the name now sits directly on the tile base fill (#181818).
- **Separation is spacing alone** — generous vertical gap (header bottom-pad 26 +
  body top-pad 16 ≈ 42px on standard tiles), no fill-step, no divider stroke.
- **Sparkline fill band RETAINED** (round 63) — only the TOP band was removed;
  the bottom spark band still groups the 24h signature as a distinct data region.
- Name position/size (D-DIN)/tint (gold alerted, neutral nominal) unchanged.
  Maximize/resize control (tile top-right) untouched. RADIUS 1px held.

## Verify
Confirmed on fresh build (commit below): `docs/screens/r70-calcasieu.png`
(nominal — neutral name on base fill, no band) and `docs/screens/r70-meridian.png`
(alerted — gold name on base fill, no band). Both read as ONE unified surface,
content floating; header/body separated by whitespace only (no line, no box);
spark band present at the bottom. TSC-OK, offline build clean.

## Scope
Only the VesselTile header region. Body/footer/strip/spark-band/value untouched.

---

# PROGRESS — 2026-06-13 (Session 58: ROUND 69 — footer glyph squeeze, root-cause fix)

## Bug fix (no ruling)
The footer glyphs read squeezed (wave cramped). **Root cause: not the slot/flex —
the rendered svgs measured perfectly square** (calendar 26×26, wave 24×24, clock
22×22; `Glyph` already sets equal w/h + flexShrink:0). The distortion was baked
into the GENERATED art: `scripts/glyphs.ts` `normalize()` used a **per-axis
`scale(24/w 24/h)`**, which squeezes any non-square source — wave (40×29) →
`scale(0.60 0.83)`, calendar (32×35) → `scale(0.75 0.69)` (~9%, subtle), clock
(35×35) → `scale(0.69 0.69)` (already uniform, so it WAS round).

**Fix:** normalize with a UNIFORM scale `24/max(w,h)` and center the art in 24×24
(translate the leftover on the short axis). Regenerated `glyphs.generated.ts`:
wave `scale(0.60)` + `translate(0 3.3)`, calendar `scale(0.6857)` + `translate(1.03 0)`,
clock `scale(0.6857)`. Verified on a 3× crop (`docs/screens/r69-footer.png`):
clock renders perfectly round, wave at natural proportion, both match the
calendar family/scale. Because the fix is uniform-scale in the shared art, the
aspect holds at every size and state by construction (no per-axis squeeze
possible). Calendar's prior ~9% is also corrected (strictly better, no regress).

## Scope
Only `scripts/glyphs.ts` (normalizer) + regenerated `glyphs.generated.ts`. No
meter strip, value, layout, or other component touched. No DECISIONS entry (fix).
TSC-OK, offline build clean.

---

# PROGRESS — 2026-06-13 (Session 57: ROUND 68 — branch reconciliation + land mandatory; FleetView chart-band)

## 1. Git log 58 → HEAD (commit by commit, actual branch)
```
fdf99e6 Round 67: Calm Sea — smooth gradient bands, drop grain
6d59914 Round 66: resolve severity to STRIP, drop card border + name divider
21c71c9 Round 63: VesselTile — match Figma layout (rulings held)
e185d15 Round 62: Calm Sea — raise presence (light + texture + motion)
ce0f766 Round 61: resolve ⚖14 — meter strip sole affordance + severity toggle
16451ed fix(atlas) · 73b3df0 chore(atlas) · 3a9172c Round 58: bridge diagnostic
```
**Per-round landed/absent (from commits, not intent):**
| Round | Status | Note |
|---|---|---|
| 59 | **ABSENT** | never committed |
| 60 (consequence sort) | **ABSENT as a commit** — but the FEATURE is present (see §3) |
| 61 | **LANDED** ce0f766 |
| 62 | **LANDED** e185d15 |
| 63 | **LANDED** 21c71c9 |
| 64 (text-selection) | **ABSENT** — landed THIS round (§4) |
| 65 (glass) | **ABSENT** — optional, still deferred |
| 66 | **LANDED** 6d59914 |
| 67 | **LANDED** fdf99e6 |

## 2. Round-66 border in HEAD — reconciled
**The perimeter severity border IS removed in committed code.** `VesselTile.tsx`
HEAD line 87 = `border: 'none'`, and the running build computes `borderTopWidth:
0px / borderStyle: none` on the Meridian tile. The border removal genuinely
committed (6d59914). **Anthony's screenshot showing Meridian WITH a gold border
is PRE-66** (round 61/63-era — those screenshots, still on GitHub, show the
round-37 border that 66 removed). The round-66 PASS stands; it did not conflict
with reality, only with an older screenshot.

## 3. Rail/board sort — CONSEQUENCE, not default order
The board AND rail both sort through `compareVessels` (`src/data/fleetState.ts`,
round 21 A1): **status class first** (degraded→watch→nominal, so an alert always
rises), **then activity** (TRANSIT/STATION above STANDBY/PORT), **then
|sustained_deviation| desc**. That IS the consequence tier (alerted →
active-worst-deviation-first → idle-dimmed); idle nominal tiles also dim
(opacity 0.45). **Meridian is first BY the sort** (sole alerted vessel), not
incidentally. So the round-60 "consequence sort" feature is functionally LANDED
(under the round-21 name) — only the round-60 *commit* is absent. If round 60
specced refinements beyond this comparator, that brief never reached me — flag.

## 4. Landed this round
- **Text-selection fix (round 64):** the dashboard had NO `user-select` rule, so
  drag/click smeared blue selection across tiles/labels. Added `user-select:
  none` to `body`, re-enabled on `input/textarea/[contenteditable]/.selectable`
  and the `/inspect` data tables (so data stays copyable). *(Implemented from the
  symptom — the round-64 brief text isn't in my session context; correct me if
  the spec differed.)*
- **Consequence sort:** confirmed already present (§3); no new code needed.

## 5. Addendum — FleetView resolved to chart-band only
**Audit:** there were NOT two structural layouts. `layoutVariant`
('board-first'|'chart-band') only set the FleetMap *height* (480/560 vs 240); a
separate `chartTop` toggle set chart *position* (above/below). Reported before
removing. **Landed:** chart-band is now the sole layout (FleetMap = shallow band
on top, board below); removed `layoutVariant` + `chartTop` (both layout-mode
machinery) and their DevPanel rows. Added a **transient maximize** control on the
band (resize posture). Verified on the build: FleetMap **240 → 520 → 240**, first
tile Y **568 → 848 → 568** (tiles hold size, reflow down, stay visible —
one-elastic-element); not persisted (local state, defaults to 240).

## Unmissability gate — RE-RUN on the confirmed-borderless build: **PASS**
Ran on the fresh build of commit **57d2d00** (border computed `0px/none`).
Meridian is the only colored tile on the 15-tile board — gold name + gold value +
wide gold strip vs 14 white/grey — and sorts first. `docs/screens/r68-gate-board.png`.

## Verification habit (starts now)
Every "done" report from here states the **commit hash** + a one-line
confirmation the change is visible in the running build at that hash. Four rounds
(59/60/64/65) were believed done but absent; this entry is built from the actual
git log, not intent.

## Scope held
No new design (audit + land only). Touched FleetView/FleetProvider/DevPanel
(layout), globals.css + inspect page (selection). Rounds 36/61/63/66/67 intact.

---

# PROGRESS — 2026-06-13 (Session 56: ROUND 67 — Calm Sea, smooth gradient bands, drop grain)

## Done
- **Value-noise grain REMOVED** (round 62's `hash`/`vnoise` and the grain term)
  — it read as low-res/pixelated. No per-pixel noise texture remains.
- **Depth gradient RETAINED** (the valued element): a vertical falloff from
  darker near the bottom easing up into the lighter haze band (`depthLum =
  mix(0.05, 0.17, smoothstep(0,0.92,v))`).
- **Waves rebuilt as smooth gradient bands**: three layered sine octaves with
  soft falloff riding within the gradient — sinuous, sleek, no edges to alias.
- **Anti-banding**: a sub-LSB ordered dither (±1/255 — invisible as texture, NOT
  grain) breaks up 8-bit gradient stair-stepping on high-DPI. Inspected a 2x-DSF
  margin crop (`docs/screens/r67-sea-crop.png`): smooth falloff, no banding, no
  jaggies on the wave edges.

## Verify / reported
- No grain; depth gradient retained; waves smooth/crisp; greyscale only (R=G=B);
  round-50 binding intact (amp/freq untouched); reduced-motion fallback is a
  smooth static CSS gradient (unchanged, no grain).
- **Severity still dominates**: on the board the gold MERIDIAN + amber census
  clearly out-read the smooth grey waves (`docs/screens/r67-sea-fleet.png`).
- **Framerate: sustained ~97 fps** (4 samples 95–98; worst frame ~18 ms = an
  occasional single-frame hitch, no sustained drop) — well above 60. The shader
  is objectively **cheaper** than the round-62 noise field (removed two
  value-noise lookups + their 8 hash evaluations per pixel, added one dither
  hash). The absolute rAF number vs the earlier 120 sample is harness/vsync
  scheduling variance, not the effect getting more expensive — no regression.
- **Glass**: round 65 (glass) never landed on this branch — `grep glass` in src
  returns nothing — so there is no glass interaction to test. (Rounds 59/60/64/65
  remain absent; see round-62 flag.)

## Scope held
Only `AmbientSea.tsx` touched.

---

# PROGRESS — 2026-06-13 (Session 55: ROUND 66 — resolve severity to STRIP, drop card border + name divider)

## UNMISSABILITY GATE — PASS (run on the actual 15-tile board, demo seed)
Captured the real fleet board (`docs/screens/r66-gate-board.png`, also
`r66-tile-meridian.png` vs `r66-tile-standard.png`). Scanning cold with NO
perimeter border, **Meridian out-reads the 14 nominal tiles by a clear margin.**
It is the ONLY colored tile on a field of white/grey: gold **name** + gold
**+7.6% value** + a **wide gold meter strip** (|+7.6%|/20 ≈ 38% fill vs the thin
grey strips on nominals) — three reinforcing gold cues. Reads strongly; the eye
lands on it immediately. **Border removal HELD (gate passed).**

## Done
- **Severity placement resolved to STRIP fleet-wide** — edge/both retired,
  `severityPlacement` state + dev toggle removed (FleetProvider, DevPanel).
- **Perimeter severity border removed** from the tile (Link `border: none`).
  Removal, NOT recolored to white/neutral (that would be a non-severity outline
  on every tile). Borderless, fill only (round 37).
- **Name-divider `status.line` removed** (the stroke still rendering under the
  name). The round-63 fill-STEP seam now separates header/body alone — and since
  it was a touch subtle once the line went, **the delta was widened** (header +
  spark bands `#2b2b2b` over the `#181818` body). Confirmed on screenshot: the
  seam reads clearly with no line. Body stays #181818 so the borderless tile
  still contrasts against the page bg.
- Severity carriers now: strip (primary) + name tint + value tint. Nominal =
  neutral strip, no tint, no border.

## No stray strokes (confirmed)
No perimeter border, no header/name line, sparkline still frameless (round 63
`framed={false}`). The only thing on the tile carrying status color is the strip
+ name/value tint. Atlas dropped to 136 leaves (status.line leaf gone).

## Kept intact
Meter strip = sole expand affordance + deviation metering (round 61), VesselTile
layout (round 63), glyph art + neutral inking (round 63), 1px sharp corners
(round 36). TSC-OK · LINT-CLEAN · verify ALL CHECKS PASSED · offline build clean.

---

# PROGRESS — 2026-06-13 (Session 54: ROUND 63 — VesselTile, match Figma layout, rulings held)

Pulled Anthony's Figma VesselTile (node 11:68, 511×533) via the read-only bridge
(`get_metadata` for coords + `get_screenshot` for the render, saved
`docs/screens/r63-figma-mock.png`) and matched the layout.

## Done — layout/structure only
- **Three fill regions, separated by borderless fill-STEPS (no strokes):** a
  lighter HEADER band (name, generous air above/below), the darker BODY (tile
  base), and a lighter SPARK band. Header + spark = `surface/overlay` (#232323);
  body = `surface/raised` (#181818). The header/body seam is the fill step; the
  round-57/61 `status.line` rides that seam as the severity edge (untouched).
- **Primary value:** category glyph (calendar) centered ABOVE the deviation %,
  established value anatomy (tinted only when alert-backed, ✓ on nominal automotive).
- **Footer is now TWO-COLUMN** (was right-stacked): endurance glyph + hours LEFT,
  clock glyph + now-% RIGHT, glyph-above-value, even baseline, balanced gutters.
- **Sparkline full-width in its own fill band, NO stroke frame.** Added an opt-in
  `framed` prop to `Sparkline` (defaults true → every other caller unchanged); the
  tile passes `framed={false}` so separation is the fill band alone, not a border.
- **Glyphs sized to the mock** (calendar 26 / wave 24 / clock 22, up from ~13 —
  the "too small" complaint) and **neutral-inked** (white UI ink, not dim grey);
  glyphs are not status carriers here.

## Two mock properties deliberately NOT replicated (logged in DECISIONS)
1. **Rounded corners** — RADIUS stays 1px (round 36 sharp-corners holds).
2. **Divider / frame strokes** — converted to fill-step separation (round 37
   outlines-reserved-for-severity holds).
Principle logged: Figma is layout authority; standing rulings override individual
mock choices that conflict.

## Verify
TSC-OK · LINT-CLEAN · `npm run verify` ALL CHECKS PASSED · offline build compiled
(atlas 137 leaves / 25 glyphs / 3 drawn — names unchanged). Screenshots:
`docs/screens/r63-tile-standard.png` (standard tile = faithful to the mock),
`r63-tile.png` (expanded), `r63-board.png` (15-tile board). Header has air;
header/body + spark separated by fill-steps not strokes; value+glyph centered;
footer two-column (endurance left / clock right); spark full-width in its own fill
region, no frame; corners 1px sharp; glyphs legible + neutral.

## Scope held
Touched only `VesselTile.tsx` and an additive `framed` prop on `Sparkline.tsx`
(default preserves all other callers). Did NOT touch the round-61 meter strip
behavior or severity-placement toggle, Calm Sea (round 62), or any sort.

---

# PROGRESS — 2026-06-13 (Session 53: ROUND 62 — Calm Sea, raise presence: light + texture + motion)

## Done
- **Luminance raised.** The old [0.066, 0.085] floor (held below surface/raised
  #181818) made the layer invisible. New band: trough ~0.07, crests bleed to
  ~0.24 grey. Greyscale only (R=G=B), grey/white light bleed permitted, zero
  chroma — navy stays chart-only.
- **Texture added.** Two-octave value-noise grain (hash-based, drifting,
  sharpened with `pow`, depth-compressed via `exp(-depth*0.5)`) gives resolved,
  granular, visibly-moving point structure instead of a vague gradient. Reads as
  detailed water near the bottom, dissolving with distance.
- **Motion legibility up.** Drift doubled (0.25 → 0.5) and the grain animates, so
  movement is obvious at a glance, not subliminal. Amplitude/cadence still bound
  to the dataset (round 50 binding untouched — only the visible expression changed).
- Static-still fallback (reduced-motion / no-WebGL) luminance raised to match
  (0.07/0.03 → 0.18/0.09 grey), still greyscale, no layout shift.

## Verify / reported numbers
- **Visible + moving in default state: YES** (`docs/screens/r62-sea-fleet.png`,
  `r62-sea-vessel.png`) — granular grey water clearly present in the margins.
- **Greyscale only, no chroma in the field: YES** (mix of pure greys 0.07→0.24).
- **Severity still out-reads — ceiling reported:** crests land at **0.24 grey**.
  On the 15-tile board with one CAUTION vessel, Meridian's gold border + gold
  name + the amber "2 CAUTION" census dominate the brighter waves by a wide
  margin (greyscale vs chromatic). **No pullback required; the ceiling was not
  reached** — could go brighter, 0.24 chosen as a comfortable presence/dominance
  balance.
- **Framerate: 120 fps** (measured over 2s, fullscreen triangle, dpr capped 1.5).
  The grain is two cheap hash-noise octaves per pixel — no meaningful cost.
- **Off-ramps intact (unchanged):** operator toggle (default on), off in expert
  mode (E), frozen static still under prefers-reduced-motion, paused when hidden.
- **Per-context binding intact:** fleet → |mean delta|; vessel page rebinds to
  the inspected vessel (verified on Meridian, larger swells).

## ⚠ FLAG — the brief's "three water treatments" and "glass" do not exist in this branch
The brief asked to raise "across all three water treatments (SUBORDINATE / MID /
REFERENCE)" and referenced a "glass toggle (round 59 amendment)." **Neither
exists in the code on `layout-probe`.** There is ONE Calm Sea shader, no
treatment selector, no glass surface. Checked: **git log goes 58 → 61 → 62 — and
rounds 59 and 60 never landed on this branch** (no glass, no round-60 work
committed; the "ranked by sustained deviation" label predates round 60). I raised
the single existing Calm Sea layer (the actual complaint — it was invisible) and
did NOT invent a 3-treatment system or a glass surface, since that would be
building ahead of briefs (59/60) I haven't received. **Questions for Anthony:**
(1) Do rounds 59 (glass) and 60 (consequence sort) still need building, and in
what order? (2) Should SUBORDINATE / MID / REFERENCE become a real water-treatment
toggle, or were those conceptual luminance tiers for this single layer? Until
then, "brighter waves through glass" could not be tested — no glass to test.

## Scope held
Only `AmbientSea.tsx` touched. No VesselTile / meter-strip / severity-placement /
scenario / sort changes.

---

# PROGRESS — 2026-06-13 (Session 52: ROUND 61 — VesselTile, resolve ⚖14 to meter strip + severity placement toggle)

## Done
- **⚖ #14 resolved → the micro-meter strip is the SOLE expand affordance.** The
  `revealStyle` dev toggle (chevron / meter) and the chevron-vs-reveal options
  are removed as artifacts. Reason logged in DECISIONS: a meter strip carries
  affordance AND information; a chevron carries only affordance. `RevealZone`
  (the inspector reveal primitive) keeps a plain silent chevron — the meter
  belonged to the tile, not that primitive — and no longer depends on fleet state.
- **The strip now meters efficiency-deviation magnitude** (fill ∝ |Δ|, full
  scale ±20%), replacing the old fuel/endurance meter. It tints with status
  color only when alert-backed (value-tinted-only-when-alert-backed, gauge
  anatomy); nominal vessels show a neutral greyscale fill. The strip always
  meters deviation regardless of where color lives — never purely decorative.
- **New SEVERITY PLACEMENT dev toggle (D panel): edge / strip / both.** EDGE
  (default/current): status.line edge carries severity, strip neutral/data-only.
  STRIP: color on the strip, edge neutral. BOTH: redundant on both. Color
  placement is the ONLY variable — status semantics and the deviation metering
  are untouched in all three states. Atlas leaf renamed `footer/fuel.fill` →
  `footer/deviation.fill` (regenerated; 137 leaves, 25 glyphs / 3 drawn).

## Unmissability check (the gate) — PASS in all three states, STRIP-only does NOT fail
On the 15-tile board with one CAUTION vessel (Meridian), the alerted tile
out-reads in EDGE, STRIP, and BOTH. Verified by screenshot
(`docs/screens/r61-severity-{edge,strip,both}.png`). **Why STRIP-only survives**
despite the strip being thinner than the edge: the severity-placement toggle
governs only the status.line and the strip, but the alerted tile ALSO carries
two placement-independent severity channels — the round-37 amber tile **border**
(outline-means-severity) and the amber **name tint**. So Meridian reads as gold
border + gold name in every state; in STRIP mode only the under-name status.line
goes neutral. **No ceiling reached, no pullback needed** — severity has redundant
channels beyond the toggle. (If a future round removes the tile border or name
tint, STRIP-only would become the at-risk state the brief anticipated.)

## Verify
TSC-OK · LINT-CLEAN · `npm run verify` ALL CHECKS PASSED · offline build compiled.
Chevron+reveal gone; meter strip is the only affordance; strip fills by |Δ|;
strip tints only when alert-backed; nominal shows no color in any state; toggle
cycles edge/strip/both; color placement is the only variable changed.

## Scope held
Did not touch Calm Sea, scenario library, consequence sort, or status thresholds.

---

# PROGRESS — 2026-06-13 (Session 51: ROUND 58 — bridge diagnostic, DIAGNOSIS ONLY)

No styling changes, no DECISIONS change. (Repo also moved this session: `~/Documents/oceanus-demo` → `~/dev/oceanus-demo`.) Three findings:

## 1. Glyph import path — files now exist, but keyed to the wrong names

`docs/glyphs-import/` (exact):
| file | SVG? | viewBox | raster? | parses | import verdict |
|---|---|---|---|---|---|
| `endurance.glyph.svg` | yes | `0 0 40 29` | no | yes | **imports**, keyed `endurance.glyph` |
| `now.glyph.svg` | yes | `0 0 35 35` | no | yes | **imports**, keyed `now.glyph` |
| `trend.glyph.svg` | yes | `0 0 32 35` | no | yes | **imports**, keyed `trend.glyph` |
| `.DS_Store` | no | — | — | — | skipped (macOS cruft, not SVG) |
| `README.md` | no | — | — | — | skipped (docs) |
| `glyph.calendar.svg` / `glyph.clock.svg` / `glyph.wave.svg` | — | — | — | — | **ABSENT — never reached the folder** |

The PNG problem (round 55) is fixed — these are now real SVGs, valid, with viewBoxes, no embedded raster, and they DO import (normalized: viewBox→24×24, hex→currentColor). **But they import under their SLOT-name keys** (`endurance.glyph` / `now.glyph` / `trend.glyph`), because the importer keys by filename and the files are named for the slot, not the library icon. The expected library files (`glyph.calendar.svg` etc.) were never created.

## 2. Slot render state (after build): all three on PLACEHOLDER

`trend.glyph` / `now.glyph` / `endurance.glyph` render **placeholder pictograms**. The reason is **a key mismatch, not an unwired slot**: round 57 wired the slots to library glyphs `calendar` / `clock` / `wave`, so `Glyph` looks up `IMPORTED_GLYPHS['calendar' | 'clock' | 'wave']` — but the imported keys are `endurance.glyph` / `now.glyph` / `trend.glyph`. No match → fallback. So: **no matching library glyph (`glyph.calendar` etc.) imported** — the drawn art is present in the build but under keys nothing renders. The slots ARE wired correctly.

## 3. Scrape scope — names + structure + dimensions, NOT visual properties

**Direct answer: the binding scrape is names-and-structure (plus x/y/width/height). It does NOT read corner radius, fills, strokes, or spacing.** Checked, not guessed:
- The scrape uses `get_metadata`, whose output is exactly: layer **name, type, hierarchy, and x/y/width/height**. No fills, no radius, no strokes. (Confirmed across every scrape this project.)
- The MCP bridge also has `get_design_context`, which DOES return rich CSS (fills, strokes, type sizes, positions) + a screenshot — so *some* visual properties are readable through that tool. But the binding/apply workflow doesn't use it, and the rounded corners specifically can't be read as a property at all:
- **The rounded corners are baked into a vector, not a property.** `get_design_context` on VesselTile shows your rounded top corners in the screenshot, but `bg.shape` (8:23) is a flattened **vector exported as an `<img>` asset** (`imgBgShape`) — there is no `border-radius` value to read; the curve lives inside the vector geometry. (Same output also shows `spark.container` carries a `#b1b1b1` border in Figma that the build omits — another visual property name-binding doesn't carry.)

**Conclusion:** visual properties — corner radius, fills, geometry — **must be implemented in code via a round; they do not flow from Figma automatically.** The rounded corners didn't appear for three compounding reasons: (a) the scrape reads names + dimensions, not radius; (b) the radius is baked into a vector image, not a readable property; (c) the build's `RADIUS` token is 1px globally (round 36 sharp-corners ruling) and no round has changed the tile to rounded.

## To move forward (no change made this round)

Two clean fixes for the glyphs (your call next round): rename the three files to `glyph.calendar.svg` / `glyph.clock.svg` / `glyph.wave.svg`, **or** teach the importer to map a `{slot}.glyph.svg` file onto the library glyph its slot is wired to. Corner radius (and the spark.container border) need a styling round if you want them in the build.

## RESOLVED in-session

While the diagnostic was being written, Anthony **renamed the three files to the library convention** — `glyph.calendar.svg` / `glyph.clock.svg` / `glyph.wave.svg` (the slot-named `*.glyph.svg` exports are gone). The importer now keys them **`calendar` / `clock` / `wave`**, which match the slot wiring (round 57), so the build wired them and the three tile slots are now **LIVE on Anthony's drawn art** (was placeholder). End-to-end pipeline confirmed: SVG drop → importer (normalize) → `glyphs.generated.ts` → `Glyph` primitive → every render site. Screenshot `r58-glyphs-live.png`.

*Transparency: round 58 was scoped diagnosis-only, but this glyph go-live is the round-47/55/57 drop-in completing — triggered by Anthony providing correctly-named SVGs, not a code/design change authored this round. No other styling touched; DECISIONS.md untouched.*

## Repo move + git

Repo moved to `~/dev/oceanus-demo`. Git is intact — a clone uses relative refs, so the move broke nothing: remote correct, `git fsck` clean, no absolute paths in `.git/config`. The 3 drawn SVGs are now committed (were untracked); stale `next-server` on port 3000 (old path) killed, prod restarted at the new path.

---

# PROGRESS — 2026-06-13 (Session 50: ROUND 57 — apply VesselTile scrape + atlas update)

## Done (one-way Figma → code; no write-back to the file)

1. **11 matched leaves applied** — already aligned to the renamed Figma layers; code reflects them.
2. **status.dot → status.line** (Figma is source of truth): the tile's centered status dot is replaced by an integrated edge line under the name (annunciator-strip read), colored by status (amber/red when alerted, ink-muted nominal). Atlas updated to `status.line` in code → regenerated `atlas.json` + cheat sheet (status.line ×1, status.dot ×0). Verified: on the board, Meridian's amber line + amber border + amber name are one unified severity gesture; nominal tiles carry a neutral line.
3. **mode.glyph dropped from the tile** — the mode chip was removed from the build to match Figma; the `VesselTile / mode.glyph` atlas leaf is gone. Confirmed the only remaining `mode.glyph` leaves are `FleetRail / row` and `VesselCommandBand / centerStack` — neither referenced the tile's.
4. **Glyph slots wired to their library icons**: `trend.glyph → glyph.calendar`, `now.glyph → glyph.clock`, `endurance.glyph → glyph.wave`. No SVGs imported yet, so all three resolve to **placeholder pictograms** (the expected state — no error). They go live when the drawn SVGs land.
5. **DECISIONS.md** — `⚖ status` resolved: status.line over status.dot (severity as integrated edge line, unifies status border + indicator into one gesture; atlas follows Figma).

Atlas now 19 components / 137 leaves. Build clean; one-way confirmed (MCP reads only). Screenshot `r57-tiles.png`.

---

# PROGRESS — 2026-06-13 (Session 49: ROUND 55 — glyph import + VesselTile scrape, DIFF ONLY)

## Glyphs imported: 0 (all 3 dropped files skipped)

`docs/glyphs-import/` held three files — **`trend.glyph.png`, `now.glyph.png`, `endurance.glyph.png`** — all **skipped**, for two reasons:
1. **Format**: they're PNG. The pipeline takes SVG only — a raster can't be normalized to `currentColor`/24px viewBox, and a bitmap defeats the drop-in-vector point (won't scale or inherit tint at the render sites).
2. **Naming**: they're named after the *slot* (`{role}.glyph`), not the *library icon* (`glyph.{name}`). The trend slot's icon should export as **`glyph.calendar.svg`**, now → **`glyph.clock.svg`**, endurance → **`glyph.wave.svg`**.

The importer was upgraded (round 55 spec): normalizes viewBox → `0 0 24 24` (scales the artboard if different), swaps hex fills/strokes → `currentColor` (keeps `none`), strips `glyph.` prefix from the filename to the bare `GlyphName` key, and reports skipped/off-convention files instead of dropping them silently. Ready for SVGs.

## Slots: 0 live, all on placeholder

No SVGs landed, so every glyph render site stays on its placeholder pictogram. `IMPORTED_GLYPHS` is empty; `Glyph` falls back for all 25 names. (The tile slots also aren't yet *wired* to calendar/clock/wave — that's the round-49 §5 hold, still pending approval.)

## VesselTile scrape diff (frame 11:68 — read only, NOTHING applied)

- **Matched cleanly (11):** `bg.shape`, `name.text`, `trend.value.text`, `endurance.value.text`, `now.value.text`, `spark.container`, `spark.chart`, `spark.baseline.line`, and the three glyph slots `trend.glyph` / `now.glyph` / `endurance.glyph`.
- **Renamed in Figma, no atlas match (1):** `status.line` — the atlas has `status.dot`. Per round-55 rule this is a **rename needing an atlas update, not an error** (the round-49 §5 status-dot→line decision, still held).
- **Atlas paths with no Figma layer:** `status.dot` (superseded by his `status.line`); `mode.glyph` (his VesselTile has no mode chip). Expected-absent on a standard instance: `alert.line`, `body/trendChart.chart`, `footer/fuel.fill` (2x / meter only).
- **Glyph slots → library resolution:** all 3 slots present in Figma; their canonical library icons (`glyph.calendar`/`glyph.clock`/`glyph.wave`) **did not resolve** — no SVG imports landed (the dropped files were PNG + slot-named).

Atlas exports regenerated (138 leaves / 25 glyphs). **Held for approval** — code stays preview, the file is source of truth, one-way only. No DECISIONS.md change (no verdict until the diff is reviewed).

## To move forward (for Anthony)

Re-export the three icons from Figma as **SVG**, named for the library glyph: `glyph.calendar.svg`, `glyph.clock.svg`, `glyph.wave.svg` (24px artboard, `currentColor`, ~1.5px stroke). Drop them in `docs/glyphs-import/`; next build the importer pulls + normalizes them and the placeholders go live wherever those names render.

---

# PROGRESS — 2026-06-13 (Session 48: ROUND 54 — VesselTile single resize toggle)

## Done

The tile's two corner resize buttons (separate collapse + expand) collapse to **one state-aware toggle**: expand affordance when collapsed/default, collapse affordance when expanded. Anchored top-right, no drift. Verified: exactly 1 resize button per hovered tile; resize behavior unchanged (keyboard +/- keep the full mini↔standard↔expanded range, auto-promotion stays off per round 26); status dot unaffected. ⚖ #14 (chevron vs micro-meter affordance) untouched — still open. DECISIONS.md updated. Screenshot `r54-tile.png`.

---

# PROGRESS — 2026-06-13 (Session 47: ROUND 53 — CommandBand harmony, tighten + re-pad)

## Done

1. **Three balanced masses, equal gutters** — the center stack lost `flex:1`; speed/burn (left), center stack, effΔ/endurance (right) are wrapped clusters laid out `justifyContent:center, gap:44`, so the gutters left- and right-of-center are equal and the clusters pull inward (dead air killed) instead of pinning to the edges with a floating middle.
2. **Clock line loosened** — gap 16→26 (clock↔weather) and 14→18 (wind↔waves); the clock stays dominant (hero×0.6), wind/waves trail as context, each clears its neighbor.
3. **Wind/waves legibility within register** — 14→15px (glyph + value), NOT promoted to hero: nominal data that already feeds Calm Sea, so rendering large double-counts. Below the clock and far below the gauges.
4. **Center-stack spacing held** (round 52 gap:12), centering true. Consequence hierarchy unchanged — effΔ amber arc + endurance keep weight, CAUTION header untouched, no nominal element gained weight.

## Note

- **Round 51 (UI-font toggle) is not in this branch** — I never received a round-51 brief, so the "four font-candidate states" can't be exercised here. The rebalanced row uses `flex` + `flexWrap` + `justifyContent:center`, which reflows gracefully and wraps rather than breaking, so it's font-width-robust at the shipped face (Barlow); flag for when the font toggle lands.

Screenshot `r53-band.png` (Meridian): clusters inward, equal gutters, loosened clock line, amber effΔ intact.

---

# PROGRESS — 2026-06-13 (Session 46: ROUND 52 — CommandBand center stack glyph swap + spacing)

## Done

1. **Full-glyph center stack** (default mode): master line → `crew.glyph` (slot, placeholder until drawn) + name, the word "master" dropped; place line → `anchor.glyph` + place. Clock stays text (a glyph would make mode-state cryptic). Wind/waves keep their glyph prefixes; mode chip stays.
2. **Overlap/box artifact fixed**: the master line's `title` tooltip ("master · {name}") is removed and it's a single clean glyph + name element — no stroked box, no tooltip. Outlines reserved for severity (+ the mode chip's box, the one allowed affordance).
3. **Spacing**: center stack is now a flex column with `gap: 12` between registers (name / crew / mode glyph / place / clock-row), each reading as its own register — replaces the cramped marginTop:2/6.
4. **Confirmed**: no data value carries a label treatment; nothing in the stack strokes except the mode chip + severity; the DATALINK/CAUTION header row is untouched.
5. **DECISIONS.md**: default full-glyph center stack logged; **Expert mode open thread** flagged (its job needs re-earning now that default absorbs label glyphs — no verdict yet).

Screenshot `r52-band.png` (Marlin Ridge): crew glyph + Russell Babineaux, anchor glyph + FREEPORT TX, spaced registers, no box.

---

# PROGRESS — 2026-06-13 (Session 45: ROUND 50 — Calm Sea depth rebuild)

## Done

Replaced round 46's flat SVG paper-wave with a **WebGL receding water plane** (`AmbientSea.tsx`, rewritten).

1. **Rendering** — one fullscreen-triangle fragment shader, single canvas. The wave math runs per-pixel; JS writes ~3 uniforms/frame (time + eased amp/freq) and one `drawArrays`. No per-frame allocation, no textures. `low-power` context, dpr capped at 1.5. No horizon/sky/sun: the plane recedes upward (wavelength compresses + amplitude decays with depth) and dissolves into haze. Pure grey (R=G=B), luminance held in [0.066, 0.085] — below surface/raised (0.094), so the brightest water is dimmer than an idle tile fill. **No navy** (reserved for chart water).
2. **Persistent + per-context** — mounted in the layout (z-index −1, above body bg / below content), so it survives fleet↔vessel navigation and **eases** scope (no cut). FleetView binds amplitude to |fleet mean Δ| + frequency to avg burn; VesselInspector rebinds to the inspected vessel. Same signals as round 46, expression only.
3. **Governance** — off in expert; static depth-faded CSS-gradient still under prefers-reduced-motion and on WebGL fallback (`getContext` null or context lost) — never the old paper-wave, no layout shift; paused when hidden; settings toggle (default on).
4. **Dev readout** — 'D' panel shows `water · {scope} · amp · freq` (the inputs feeding the shader; `ambientReadout.ts` shared by the shader + the readout). No on-screen label in default mode.

## Verify (all pass)

- Normal: canvas present, no old `.sea` wave. Reduced-motion: still present, no canvas. Forced WebGL-null fallback: still present, no old wave. Expert: nothing (canvas + still both absent).
- **Meridian inspector measurably more agitated than fleet** (dev readout): vessel amp **1.17** vs fleet **0.46** (freq 1.34 vs 1.12).
- No navy in background (shader is pure grey by construction; confirmed in screenshots — the only navy is the position chart's own water). Brightest water (lum ≤ 0.085) below surface fill (0.094).
- DEMO MERIDIAN seed untouched; the scenario library drives the deltas, this changes expression. DECISIONS.md updated (r46 superseded, per-context binding, horizon/sky rejected).

---

# PROGRESS — 2026-06-13 (Session 44: ROUNDS 48 + 49 — glyph scrape pipeline + VesselTile glyph relationships)

*(Anthony meant 48 before 49; folded together since 49 builds on 48. Prep + diff reports only — the VesselTile visual apply is gated on his approval per 49 §5.)*

## Done (prep — no visual apply)

1. **Naming convention** (FIGMA_STANDARD §4b): `{role}.glyph` = a SLOT on a component (where + what data); `glyph/{name}` = a library ICON component (what the shape is); a slot CONTAINS a `glyph/{name}` instance. Canonical VesselTile wiring: trend.glyph→glyph/calendar, now.glyph→glyph/clock, endurance.glyph→glyph/wave. (Reconciled 49's `glyph.{name}` dot-form to 48's `glyph/{name}` slash-form — the slash is the Figma frame name the scrape matches.)
2. **Atlas glyph library** — `atlas.ts` now emits a `glyphLibrary` registry (25 `glyph/{name}` entries from `Glyph.tsx` PATHS keys, each with importFile + `drawn` flag) into `atlas.json` and a "Glyph library" section in the cheat sheet. Added `glyph/calendar` (placeholder) for the trend slot.
3. **`scrape glyphs` workflow** documented in FIGMA_MCP.md: name a frame `glyph/{name}`, ping `scrape glyphs` → read file, match glyph paths, extract + normalize SVG (viewBox 24, hex→currentColor, strip cruft) → `docs/glyphs-import/{name}.svg`. Auto-wire already exists (round 47): `Glyph` prefers a drawn SVG, no code change when glyphs land.

## Reports (read-only)

**`scrape glyphs` first run:** **0 `glyph/{name}` library frames found** in Anthony's file — the icon library isn't drawn as `glyph/*` components yet. The slot frames hold inline art, not library instances. All 25 glyphs remain placeholder. To pull: draw/name `glyph/{name}` frames.

**`scrape VesselTile` diff** (frame 11:68):
- **role.glyph slots wired (3/3):** `endurance.glyph` (17:2), `now.glyph` (17:3 — renamed from "Frame 1" since round 47 ✓), `trend.glyph` (17:4). All match.
- **Text/chart/shape leaves:** bg.shape, name.text, trend.value.text, spark.container, spark.chart, spark.baseline.line, endurance.value.text, now.value.text — all bind.
- **glyph/{name} pulled:** none (library not drawn).
- **Unmatched:** `status.line` (10:4) — build has `status.dot` (a colored dot); his design is a divider line under the name.
- **Visible design diff (apply on approval):** status dot → line; trend icon chart.trend → **glyph/calendar**; now icon delta → **glyph/clock**; endurance icon fuel-drop → **glyph/wave**; add the under-name divider line.

## Held for approval (49 §5)

The VesselTile visual changes above — status line, the three glyph swaps, the divider — are NOT applied. On your "approved," I wire the slots to calendar/clock/wave, switch status to a line, and add the divider, then push.

---

# PROGRESS — 2026-06-13 (Session 43: ROUND 47 — VesselTile inference + glyph import)

## Done

1. **VesselTile fully instrumented** to Anthony's flat rename list: `bg.shape`, `status.dot`, `name.text`, `trend.glyph`, `trend.value.text`, `mode.glyph`, `endurance.glyph`, `endurance.value.text`, `now.glyph`, `now.value.text`, `spark.container`, `spark.chart`, `spark.baseline.line`, `alert.line` (+ secondary `body/trendChart.chart`, `footer/fuel.fill` for 2x/meter). Trend became glyph + value (the "30D TREND" text label dropped — matches round 39's endurance/now treatment; `chart.trend` glyph + title carries identity). Endurance/now rows split into glyph + value leaves. Sparkline gained `layerSvg`/`layerBaseline` props so the tile's `spark.chart` + `spark.baseline.line` bind without polluting the shared primitive. 136 leaves.
2. **Borderless discipline confirmed** (round 37): `bg.shape` has no border at rest, status border only for watch/degraded. Verified in `r47-tile.png` — Meridian's amber border is the only outline.
3. **Glyph import pipeline**: `docs/glyphs-import/{name}.svg` → `scripts/glyphs.ts` (prebuild, before atlas) → `src/components/glyphs.generated.ts`; the `Glyph` primitive prefers a drawn glyph over its placeholder, drop-in (names already match, no atlas regen). Folder README + CLAUDE.md documented. Currently 0 imported (placeholders in use).
4. **Inference mode** documented in CLAUDE.md: one VesselTile instance = canonical; the build already maps it over 15 vessels + size variants from the data layer.

## First real round-trip — `scrape VesselTile` (read-only, nothing applied)

Anthony has renamed his Figma layers to the atlas convention. VesselTile frame `11:68`:

**Auto-binds (10/14 core leaves):** `bg.shape`, `name.text`, `trend.value.text`, `trend.glyph`, `endurance.glyph`, `endurance.value.text`, `now.value.text`, `spark.container`, `spark.chart`, `spark.baseline.line` — exact name matches.

**Unrecognized (2):**
- `Frame 1` (17:3) — default name, sits exactly where `now.glyph` belongs (x≈384, y≈355). Rename to `now.glyph` → binds.
- `status.line` (10:4) — a 0-height divider under the name; no atlas leaf by that name. Noted, no binding yet (see design question below).

**In the atlas, absent from his tile:** `status.dot` (he drew `status.line`, a divider, instead of a dot) and `mode.glyph` (no mode chip in his instance). Design questions, not errors.

**Bonus:** his `FleetHealthBand` (11:195) and `header` (10:5) frames are also renamed toward the atlas — though FleetHealthBand uses flat `degraded.value.text` / `burn.value.text` etc. where the atlas has `census / degraded.status` / `burn / value.text`. Slight divergence; FleetHealthBand wasn't this round's scrape target.

## Questions for Anthony

- **Status indicator:** your tile has `status.line` (a divider under the name) where the build has `status.dot` (a colored dot). Is status meant to read via the name tint + `bg.shape` border alone (drop the dot), or do you want the dot? If the divider is intentional, I'll add a `status.line` leaf.
- **Mode glyph:** your VesselTile has no `mode.glyph` — drop the mode chip from the tile, or is it just not drawn yet?
- One unnamed layer: rename `Frame 1` → `now.glyph` and the tile binds 11/14.

---

# PROGRESS — 2026-06-13 (Session 42: ROUND 46 — Calm Sea)

## Done

A fleet-metric-bound ambient wave behind the fleet view (`AmbientSea`, default on).

1. **Data bindings (settled values confirmed in the recordings):** amplitude = f(|fleet mean Δ|), capped — ALL NOMINAL **0.374** (flat) → ONE WATCH **0.465** → MULTI-CASUALTY **0.596** (swell). Frequency = f(avg burn fraction), subtle (~1.12). Tint = worst active severity at 9% via soft-light: nominal **#2b3a44** (neutral cool) → watch cooled amber → degraded **#f85149** (red). Velocity = constant slow drift.
2. **Rendering — GPU/compositor only:** one static periodic SVG path (repeats every 1200u → seamless `translateX(-50%)` loop), two parallax copies on 44s/67s keyframes. Amplitude/frequency/tint ride **registered `@property` custom properties** that CSS eases over 5s, so the JS layer writes 3 values per metric change and the geometry never re-tessellates. `position:fixed`, behind content, mix-blend soft-light, opacity 0.09.
3. **Performance — passes the gate:** main-thread frame timing over 120 frames held ~8.3ms avg / 9.3ms max with the wave on — **zero long frames**, no main-thread stalls (the drift runs on the compositor; metric eases are occasional registered-property interpolations). No impact on chart animations or scroll.
4. **Governance:** settings-sheet "ambient sea" switch (default on); auto-off under `prefers-reduced-motion` (CSS `display:none` + JS matchMedia guard); auto-off in EXPERT mode; paused via Page Visibility API when the tab is hidden.
5. **The line for the room** (per brief): "The fleet's baseline state is information. Every other instrument reports exceptions; this one reports the calm. It's bound to fleet mean delta and average burn, not animated for decoration — when the sea gets choppy, the fleet is drifting. It has an off switch and respects reduced-motion."

## Deliverable

Screen recordings (motion-only — a still doesn't convey it), committed to `docs/videos/`: `r46-calm-nominal.webm`, `r46-onewatch.webm`, `r46-multicasualty.webm`.

---

# PROGRESS — 2026-06-13 (Session 41: ROUND 45 — conditional census + scenario library)

## Done

1. **Conditional census** — FleetHealthBand presence rule: DEGRADED and WATCH cells render only when count > 0; NOMINAL always (the affirmative all-clear). At rest: "NOMINAL 15". One caution: "WATCH 1 · NOMINAL 14". Multi-casualty: full "2 · 2 · 11". The band's shape encodes severity — verified in pixels across scenarios.
2. **Scenario library** (`src/state/scenarios.ts`) — 10 named, deterministic synthetic overlays on the base seed; demo/telemetry never mutated (only alert/derived/staleness/mode on clones). `demo` is identity (no badge); the rest badge "SCENARIO: {label} — synthetic, not the demo path". Ships: DEMO—MERIDIAN, ALL NOMINAL, ONE WATCH, MULTI-WATCH, ONE DEGRADED, MULTI-CASUALTY, DATALINK BLACKOUT, PORT WEEKEND, FUEL EMERGENCY, EFFICIENCY DRIFT. `viewFleet = scenarioById(scenario).apply(fleet)` in FleetProvider; `stress`/`applyStress`/`STRESS_MODS` retired. Adding a scenario = one array entry.
3. **Settings sheet** — the gear (D / ⚙) now opens a three-section sheet: SCENARIO (the library chips), MODE (default/learn/expert), DEV (sim clock + verdict toggles). Replaced the flat panel-of-toggles. Atlas: `SettingsSheet / sheet / settings.sheet`, `/ scenario / scenario.chip`, `/ mode / mode.chip`.
4. **Presence-rule audit** — status-strip alert chip hides entirely at zero alerts (silent absence; census nominal carries the all-clear); the inspector's per-vessel alerts section already collapses when empty (round 37 guard) — confirmed, no "ALERTS · (empty)". AlertRail is long dead (→ StatusHeader), N/A.

19 components / 131 leaves.

## Screenshots

`r45-band-allnominal.png` (NOMINAL 15), `r45-band-onewatch.png` (WATCH 1 · NOMINAL 14), `r45-band-multicasualty.png` (full row), `r45-settings-sheet.png` (three sections), `r45-inspector-noalerts.png` (alerts section absent on a clean vessel).

---

# PROGRESS — 2026-06-13 (Session 40: ROUND 44 EXPERT MODE)

*(Anthony reused "Round 44" — this is the Expert Mode brief, distinct from the startup-defaults micro below.)*

## Done

1. **Tri-state mode** — LearnProvider now holds one `mode: default | learn | expert`; `learnOn`/`expertOn` derive from it, so the two are mutually exclusive by construction. **L** toggles learn, **E** toggles expert (each off→on→off, and switches if the other was on). Expert badge: "EXPERT MODE — labels hidden · E to exit", accent-bordered, bottom-right (learn badge stays bottom-left). Dev panel: the "learn" row became a `mode` selector (default / learn (L) / expert (E)).
2. **Header treatment** — `Label` is expert-aware: text strips, glyph stands alone at 1.4× (size 20), centered where the header sat. Applied to every section header via Label (engine, fuel, crew&log, position, alerts, efficiency, fleet, port calls, fleet plot) plus the two non-Label headers handled inline: FleetView page h1 → chart.trend glyph, rail "← fleet board" → back glyph.
3. **Micro labels strip** — DataRow left labels hide (value right-aligns into the space); gauge micro labels (EGT/COOLANT/SPEED/BURN/…) hide. Kept: mode-glyph location (data), vessel name (identity), value units (gph/kn/ft/°F), and census labels (DEGRADED/WATCH/NOMINAL — not redundant with any glyph or unit, so they remain the only identifier).
4. **Glyph disambiguation** — added to the contract (Figma icon library mirrors these names): **chart.fleet** (scatter motif — the position plot), **chart.trend** (sorted-bars — board ranking), **chart.efficiency** (curve — burn vs speed), plus **back** (rail). FleetMap→chart.fleet, FleetView→chart.trend, EfficiencyPanel→chart.efficiency.
5. **Learn ⇄ Expert mutually exclusive** — single state; badge always reflects it. Verified: E from learn switches to expert, learn badge clears.
6. **Atlas** — header glyph leaves added (`{Component} / header / header.glyph` ×9, `VesselInspector / alerts / header.glyph`, `FleetRail / nav / back.glyph`). 18 components / 128 leaves.

## Notes

- **TELEMETRY header**: the brief listed it, but no telemetry header exists — TelemetryBand merged into VesselCommandBand at round 27, and the band has no Label header to strip. Nothing to do; logged.
- Collapse/RoutePanel/ModeTimeline headers also strip via the shared Label (consistent), without atlas leaves (not on the brief's audit list / legacy unrouted).
- Atlas prefix uses real component names (e.g. `EfficiencyPanel / header / header.glyph`) rather than the brief's `VesselInspector / efficiency / …` shorthand, to stay consistent with the barrel.

## Screenshots

`r44e-default.png`, `r44e-learn.png`, `r44e-expert.png` (board in each mode), `r44e-expert-inspector.png` (glyph headers + stripped gauge labels + back glyph).

---

# PROGRESS — 2026-06-13 (Session 39: ROUND 44 — startup defaults from the panel)

## Done

Set the dev-panel `useState` initials (= boot defaults) to match Anthony's screenshot. Five differed from prior defaults:

| toggle | was | now |
|---|---|---|
| COLOR | automotive | **quiet (dark-cockpit)** |
| CHART POS | below board | top |
| STATE MARKS | off | on |
| BEARING | BRG ray | voyage card only |
| REVEAL | chevron | meter strip |

(density standard, motion off, layout board-first, ikb off, learn off, rail glyph, auto-2x off, stress off, live off / 60x — all already matched.)

Dev-panel COLOR labels updated: "A automotive" / "B quiet (default)" (the round-38 "dies at token lock" framing removed).

## Flag

**COLOR = quiet supersedes round 38's automotive default** as the boot treatment — done per Anthony's explicit "make these the startup defaults" + the panel showing B quiet selected. Automotive stays available behind the toggle. The board now boots with no green confirmation (nominal = grey dots/numerals, watch = cooled amber, degraded = red). If that reversal wasn't intended (e.g. the panel caught a comparison toggle), it's a one-line revert of the `treatment` initial back to `'automotive'`.

---

# PROGRESS — 2026-06-13 (Session 39: ROUND 42 — tank matrix grid discipline)

## Done

1. **Fixed 4-column grid** — the tank quartet is now `repeat(4, 152px)` (cell width sized from the worst case "100.0% · 99,999 gal" + padding), centered, equal gutters. Cells never resize to their content.
2. **Cell internals** — dot matrix top-aligned at a fixed grid origin; value row pinned to the bottom edge (`margin-top:auto`). The value row is a 3-column sub-grid `[pct 52px][· 12px][gal 84px]`: pct and gal each right-aligned in their own fixed subcolumn, tabular-nums, so the `·` separator and the digits/commas stack vertically across all four tanks — no jitter when values change. Verified in the screenshot.
3. **Atlas** — per-tank value leaves added: `VesselSynoptic / tanks / {ST1,ST2,FD1,FD2}.{pct,gal}.value.text` (8 leaves, static-literal lookup so each enumerates). 116 leaves total.

## Note

- Brief shorthand was "FuelCard / tanks / …"; I kept the component prefix **VesselSynoptic** to match the barrel and the card's existing leaves (FIGMA_STANDARD: atlas component names = barrel names). If the fuel card should actually rename VesselSynoptic → FuelCard, that's a deliberate barrel rename pass (both places, one sitting) — flag it and I'll do it.

---

# PROGRESS — 2026-06-13 (Session 39: ROUND 43 — amber cooler + label diet + chip affordance)

## Done

1. **Amber cooled** — `--color-alert-caution` #e3b341 → #e3d141 (hue 42°→53°, ~+11° toward green, S+L preserved). Single token; tile/synoptic tints and the eff-Δ/endurance gauge bands consume it, so all propagate. **Verified in the stress screenshot:** watch (Meridian/Sandpiper/Albatross) reads distinctly from red (Gulf Harrier) and from nominal green — no muddiness, no saturation drop needed.
2. **Mode chips → glyphs** (band + tile; rail was already glyph-only): text label dropped, glyph 1.4× (12→17 band, 11→15 tile/rail), chip keeps its 1px hairline. Full mode name via `title` (a11y + hover) and the learn leaf binding. Leaf renamed `mode.chip` → `mode.glyph`.
3. **Master prefix dies** — band identity is just `{name}` now; `title`="master · {name}" keeps the role teachable. Leaf `master.text` → `master.name.text` (role preserved in the path).
4. **Location repositioned** — destination/site moved out of the clock subtitle to its own line coupled under the mode glyph (centered on it), at facts-row type size (12px, no longer demoted). Clock is now the time alone. New leaf `location.text`.
5. **DetailChip primitive** (new system component, barrel-exported): 1px hairline chip → popover anchored to the chip (never center modal), Esc/click-outside dismiss, only where real drillable detail exists. First applications in StatusHeader: DATALINK → per-vessel stale-feed breakdown; LAST SYNC → per-vessel sync ages; alert counts → the round-33 alert sheet. The old inline "+N more" expansion is retired into the DATALINK popover.
6. **Atlas** regenerated — new leaves `mode.glyph`, `location.text`, `master.name.text`, `datalink.chip`, `lastsync.chip`, `alertcount.chip` (+ `StatusHeader / alerts / line.text`). 13 components / 109 leaves.

## Notes / next

- Bookmark (not built, per brief): DetailChip on tank cells, crew names, endurance, mission clock — wherever a short summary hides a richer fact.
- The location-move + glyph-swaps this round are exactly what Anthony's sketch was steering toward, so the build has converged on it directly. When he renames the FleetView layers to the atlas paths, `scrape FleetView` should round-trip clean (confirmation, not a big diff). Bridge stands ready.

---

# PROGRESS — 2026-06-13 (Session 38: ROUND 41 — instrument FleetHealthBand + stale-sketch rule)

## Done

1. **FleetHealthBand instrumented** — 9 `layer()` leaves on the region/role.kind convention: `census / {degraded,watch,nominal}.status`, `mean / value.text`, `mean / trend.chart`, `burn / value.text`, `burn / spark.chart`, `arrivals / value.text`, `arrivals / bunker.text`. Census leaves are a static-literal lookup (`CENSUS_LAYER`) so the atlas regex enumerates all three rather than seeing one templated path. Atlas now 14 components / 108 leaves; the cheat sheet lists every nameable path for this band.
2. **Diff held — nothing applied** (per brief): census colors STALE (automotive canonical), Inter STALE (placeholder), borderless fills ALREADY SHIPPED (round 37, sketch confirms).
3. **Stale-sketch rule documented in CLAUDE.md**: a divergence from a shipped ruling is flagged once, then STALE — never re-surfaced on later scrapes unless Anthony re-opens. The three round-40 items recorded as standing STALE dispositions.
4. Next: Anthony renames his Figma layers (rename list + cheat sheet); the next `scrape FleetHealthBand` should auto-bind every named leaf.

---

# PROGRESS — 2026-06-13 (Session 38: ROUND 40 — Figma MCP bridge)

## Done

1. **Bridge connected + verified.** Figma Dev Mode MCP authenticates via OAuth on Anthony's own account (`whoami` → Anthony Espino). Round-trip against `8AyEt8kSSo2jlS7Tt3ej2W` (Oceanus Sketchpad) reads clean: page → frames → per-layer geometry/fills/fonts/text.
2. **No PAT, nothing in `.env` (deliberate deviation from the brief).** OAuth already authenticates the server, and this is a public repo — a Figma token in the tree is the exact secret-leak risk the project guards against. `.env*` stays gitignored; nothing Figma goes in it. Logged for Anthony to override.
3. **Atlas export (item 4):** `atlas.ts` now emits `docs/LAYER_ATLAS_FIGMA.md` (the component→region→leaf cheat sheet) and `docs/atlas.json` (machine-readable scrape index) alongside `LAYER_ATLAS.md`, all on the prebuild hook.
4. **Workflow + scope documented:** `docs/FIGMA_MCP.md` + a CLAUDE.md section — the `scrape {frame}` flow and the one-way, read-only, approval-gated, probe-only guardrails. Bridge never writes back to the file.

## First scrape (item 5): `fleet-trend-bar-index` — read clean, nothing applied

- **No auto-binding, two reasons:** FleetHealthBand has **zero instrumented `layer()` leaves** (round 35 skipped it); and Anthony's layer names use his own scheme, not `region / role.kind`. Both surfaced honestly rather than faked.
- **Recognized by meaning:** census 0/1/14, 30D mean +0.3%, fleet burn 1,580 gph, arrivals 4, trend curve + IQR band — all match the current build; borderless fills confirm round 37.
- **Flagged divergences (not applied), sharpened by Anthony's two screenshots of the full frame:**
  - **The board is monochrome white + a single amber accent — no green anywhere.** Census reads `0`(white) `1`(muted amber #6c5224) `14`(white); mean/burn/arrivals all white. This isn't just the census — it reads as a whole-board treatment that does NOT use round 38's green-on-nominal default. Likely a partial revert of round 38.
  - **Vessel-card glyph reassignments vs round 39:** sketch uses calendar→30d-trend (new — round 39 left the trend hero glyphless), waves→endurance (round 39 = fuel-drop), clock→now (round 39 = delta). His MERIDIAN card.
  - **Card appears bordered with a header divider** under the name — possible round-37 divergence (borderless fills), or just a drawn frame outline. Ambiguous from a static sketch.
  - Values are placeholders (−7.6% / 175h vs build's +7.6% / 179h); font Inter = sketch placeholder; scale artboard-relative (2851w), px not literal.

## Questions for Anthony

- **DOMINANT: is the board going monochrome-white + amber-only (no green)?** The screenshots show zero green — this would partially revert round 38 and change how every future scrape translates. Subsumes the census-color question.
- **Vessel-card glyphs:** adopt his calendar/waves/clock assignments, or keep round 39's fuel-drop/delta? (His waves-for-endurance is semantically odd; worth a beat.)
- **Card border + header divider:** intentional, or sketch frame artifact? (round 37 made nominal cards borderless.)
- **Naming contract:** rename Figma layers to `region / role.kind`, or maintain an alias map from his names to atlas paths?
- **Next step:** instrument FleetHealthBand leaves so this frame binds automatically (round 40 was verify-only).

## Ops

Killed the self-healing tunnel watchdog — Cloudflare was rate-limiting quick tunnels under restart pressure, thrashing a new URL every ~2 min. One unwatched tunnel up; GitHub screenshots + the Figma bridge are the review surfaces now. Demo day is localhost.

---

# PROGRESS — 2026-06-12 (Session 37: ROUND 39 — tile label diet + full-width spark)

## Done

1. **Stat labels died**: tile rows are now [fuel-drop glyph] 179 h and [Δ glyph] +13.7% — glyph column fixed at 16px so numerals align down the board, values keep tabular figures. New `glyph/delta` in the contract (clean uppercase delta outline, 24px grid; distinct from alert-triangle, which carries its mark).
2. **Full-width 24h signature**: the sparkline docks at every tile's bottom edge — full card width (ResizeObserver-measured), fixed 20px height, every size including mini and 2x; the 2x trend chart remains the only elastic element. The spark's DATA changed with its meaning: it now draws `sparkline_24h` (hourly efficiency delta — "the 24h signature") instead of the 90d daily series. **Registry: `efficiency_sparkline_24h` CONTEXTUAL → VISIBLE — this resolves ruling 12's "pending Anthony's registry ruling" clause; noted in DECISIONS.md.** The meter-variant fuel strip sits just above the spark when toggled.
3. **Learn leaves updated**: `VesselTile / body / endurance.glyph`, `delta.glyph`, and `footer / spark24.chart` (with the new binding); the atlas regenerated at build.

## Ops

Quick tunnels kept dying today (QUIC flakiness, then registration losses). The watchdog is now SELF-HEALING: it restarts cloudflared on failure and announces each new URL as a monitor event instead of waiting for a manual fix. Reiterating: demo day is localhost; the tunnel is review-only.

---

# PROGRESS — 2026-06-12 (Session 36: ROUND 38 micro — treatment verdict)

## Done

1. **Automotive (green-on-nominal) is the DEFAULT.** The quiet-nominal variant stays behind the dev toggle, relabeled "B quiet (dies at token lock)".
2. **Consistency sweep:** green audit across all `STATUS_COLOR` consumers. Compliant already: tile/rail dots, census numeral, the nominal ✓ moments, chart markers (status dots in hull form); values everywhere stay ink (ruling 14's round-19 amendment holds — gauge values never green). **One violation found and fixed:** PortCallsTimeline gave NOMINAL time-span blocks green edges in automotive — decorative green on a duration; nominal edges are now neutral in both treatments (severity edges unchanged). The dead `treatment` prop was removed from its signature.
3. **Idle dimming:** idle nominal rows/tiles dim at the element level (whole-row opacity), so their green dots dim with them — quiet green, by construction.
4. **Stress check (screenshots):** with the fleet green at rest, the synthetic multi-vessel scenario reads instantly — Gulf Harrier's red border/name/hero and three amber tiles dominate the green field. Green stays at its current step (#3fb950): it reads as background truth, amber/red as figure. No brightness drop needed.

---

# PROGRESS — 2026-06-12 (Session 36: ROUND 37 — fills, not fences)

## Done

1. **Card chrome purged**: `gb.box` lost its hairline stroke — every section card is a filled surface (surface/raised, 1px radius). Tiles lost their nominal hairline (`transparent` border keeps layout stable); rail rows lost theirs (`selectionBorder` returns transparent for nominal+unselected). Border tokens survive exactly where the brief says: selection (rail accent), status borders (tile/rail severity voice — untouched), and divider hairlines (engine rows, band seam, cluster divider).
2. **Floating headers**: section headers (glyph + title) moved ABOVE their fills in FleetHealthBand (whole header row: label + status header + range toggles), FleetMap, InspectorChart, the alerts card, EngineTwinPanel, EfficiencyPanel (label left the RevealZone — the reveal zone is now the fill only), VesselSynoptic (label + recon chip row), CrewLogPanel, PortCallsTimeline. Gap rhythm: 4px header→fill, 8px unit→unit — header + surface read as one unit.
3. **Contrast pass**: surface/raised #181818 on base #101010 carries the separation cleanly at both treatments in the after screenshots — no ramp nudge needed. (Charts keep their surface/base wells inside cards, which now adds depth instead of competing with strokes.)
4. **The payoff confirmed in pixels**: on the after board, Meridian's amber border is the only rectangle outline on the entire screen.

## Notes

- SCOPE CALL (DEV DECISION, pending Anthony): control chrome — chips (mode/recon/filter), toggle buttons, the collapse chevrons, and floating overlays (alert sheet, tooltips, dev panel) — kept their strokes; they're affordances, not section fences. Flag if chips should go filled too.
- Before/after: befores are the round-33/34 captures (`r33-board-calm.png`, `r34-inspector-full.png`); afters are `r37-board-after.png`, `r37-inspector-after.png`.

---

# PROGRESS — 2026-06-12 (Session 35: ROUND 36 — sharp corners + directional vessels)

## 1. RADIUS → 1px

The token flipped (6 → 1); everything inherits. **Audit (grep borderRadius/rx) found and fixed these bypasses, all now consuming the token:** gb.box + gb.boxTight (the card grammar itself was hardcoded 6!), VesselTile endurance meter (2), Contextual meter strip (2), VesselSynoptic tank rects + fill + recon badge (rx 3/2/3), NauticalChart FOLLOW chip (6), the stress badge in FleetProvider (6 — state layer can't import component tokens, so it carries the literal with a comment), and the three learn-mode overlays. Exceptions honored: status dots stay circles (50%), gauge arcs untouched.

## 2. Directional vessel markers (⚖ #6 RESOLVED: yes)

- `glyph/vesselMarker` added to the Glyph contract (Figma 1:1) + `VESSEL_MARKER_PATH`, the filled hull for charts: pointed bow, flat stern, elongated pentagon — local coords bow (0,−6) / stern y+5, rotated to `heading_deg` (0° = north).
- FleetMap singles and the InspectorChart focus marker (1.3× scale) are hulls now; status fill, hit areas, hover ring, and click-through unchanged. Cluster chips stay squares (groups, not boats).
- **Registry updated**: `heading_deg` UNDEFINED → VISIBLE, "rendered as marker rotation, never as a numeral" — ⚖6 logged RESOLVED in DECISIONS.md. (Three UNDEFINED dispositions remain: fleet spend, wind direction viz, crew comparison.)
- Label anchors recomputed for rotation: the bow reaches ~7px from center at any heading, so the keep-out box and all eight candidate anchors moved out radially (E/W 7→9, N/S 18/9→20/11, diagonals 11→12); the inspector name label moved +9→+12.
- The profile strip's vessel dot is the same hull glyph rotated 90° — bow along the track.
- PortCallsTimeline blocks untouched: time spans, not boats.

## 3. Trails meet the stern

Both charts: the trail's final point is now the stern anchor (`sternPoint()` in Glyph.tsx — center offset rotated with the heading), so the 24h trail visually connects to the back of the boat instead of poking out under the hull. Verified in the inspector screenshot: Meridian's trail arrives from the east and tucks into the stern while the bow points at Galveston.

---

# PROGRESS — 2026-06-12 (Session 34: ROUND 35 — learn mode v2, the layer atlas)

## Done

1. **Leaf instrumentation.** New `layer(path, tokens, binds)` helper (src/learn/layer.ts) emits inert `data-layer*` attributes; 13 components / ~99 leaves instrumented across the redraw set — band, tile, rail row, engine panel, gauge primitive, efficiency (panel + envelope internals), synoptic + quartet, crew & log, status header + alert sheet, chart furniture (water/land/graticule/compass/scale/sea label). Convention enforced: `Component / region(camelCase) / role.kind`; kinds closed to text · line · shape · chart · glyph · chip · status; roles data-meaningful, no styling words.
2. **Hover card v2** (`LayerLens`, src/learn/): learn-mode hover on any instrumented element shows LAYER / TOKENS / BINDS for the innermost `data-layer` ancestor. Component docent cards survive and yield via a shared `leafActive` flag — leaf beats region beats component.
3. **Click = copy.** In learn mode any instrumented element click-copies its layer path (capture-phase, beats the reveal/docent handlers; clipboard API with execCommand fallback; toast confirms). Verified end-to-end in the acceptance run: clipboard read back exactly `VesselTile / header / name.text`.
4. **The atlas.** `scripts/atlas.ts` regenerates `docs/LAYER_ATLAS.md` from the instrumentation on every build (npm prebuild hook) — per component, the layer tree with tokens + bindings exactly as the hover cards report. Can't drift: the same `layer()` strings feed both.
5. **FIGMA_STANDARD.md §4a** added: the three rules + the kind/role vocabulary + the atlas pointer. Learn mode stays strip-by-directory; the data attributes are inert in production (≈3 KB of DOM strings, zero behavior) and go with the strip sweep.

## Acceptance (screenshots)

- `r35-hover-tilename.png` — VesselTile / header / name.text with tokens + {vessel.static.name}
- `r35-hover-needle.png` — Gauge / dial / needle.line, ink/primary-always noted with its ruling
- `r35-hover-flowline.png` — VesselSynoptic / flow / feedLine.line with transfer-state binding
- `r35-copy-toast.png` — copy confirm; clipboard verified programmatically

---

# PROGRESS — 2026-06-12 (Session 33: ROUND 34 — merges + hierarchy)

## 1. Band absorbs the profile (one container)

Primary row and the facts/profile section now share ONE frame silhouette: the radius splits across the seam, the lower half drops its top border, and the primary row's bottom hairline is the internal divider. The round-32 sticky mechanics are untouched — the primary row alone pins. Wind · waves moved UP onto the mission clock's line (one centered row: clock · port · [wind] kn · [waves] ft); the WIND/WAVES micro labels died, and the "mission clock" micro label went with them (the row is no longer only the clock; T− self-describes — flag if it should return). The weather reveal (current/vis/precip) now lives on the clock row.

## 2. Band header row

Centered; every glyph sits on the text line via one flex centerline (the floating-above-baseline misalignment is gone). The "…" reveal died: degradation renders inline — "DATALINK DEGRADED · SABINE WX 45M STALE" (vessel + feed + age, worst first); multiple stale feeds collapse to "+N more", expanding in place. Feed abbreviations: WX/POS/ENG/TANK/FLOW/STATUS/CREW.

## 3. Efficiency: one card

Burn-vs-Speed merged into EfficiencyPanel: header EFFICIENCY · {mode} → hero row (30D TREND · NOW VS BASELINE) → chart row (envelope ~60% left, 30d trend ~40% right, equal 250px height) → footer (baseline · 24h strip). EfficiencyCurve survives as the embedded chart component (name unchanged). Dedup honored: "vs envelope" stays on the envelope (speed-specific) beside the mode-wide vs-baseline number — both labeled; burn gph left the footer (the band gauge owns it). Collapse keys: `curve` retired, `efficiency` carries both summaries.

## 4. Engine twins: newsroom layout

Row 1: verdict block left (~30%) — micro label → gap °F at hero scale (largest in the section) → fuel Δ 14px → 24h avg micro — with the EGT GAP 30D chart filling ALL remaining width (responsive, was fixed 360px). Row 2: E1/E2 + G1/G2 one-liners, two columns enforced (a wide panel was wrapping three-across — basis fixed at 40%). Row 3: cluster centered, unchanged. The round-31 maxWidth wrapper died — every row spans the panel, no side voids.

## 5. Sweep

Inspector: band(+facts+profile, one frame) → position → alerts (alerted vessels only) → engines → efficiency → fuel → crew & log. No nested frames found (chips/charts/diagram exemptions per round 32).

---

# PROGRESS — 2026-06-12 (Session 32: ROUND 33 — alert diet + status integration)

## Done

1. **Status strip dissolved.** SystemStatusStrip + AlertRail died into `StatusHeader` (rename recorded for barrel + Figma): [datalink] DATALINK {state} · LAST SYNC {age} · counts in severity colors. FleetHealthBand embeds it in its header row (board); VesselCommandBand embeds it in the primary row's header (inspector — still constant-height, still pure-CSS sticky). The AppHeader is now the wordmark only; sim clock + live/speed controls moved into the dev panel — simulator chrome, not product.
2. **Alerts summoned, not standing.** The board's ALERTS card is gone. The counts are the click target: an anchored sheet opens beneath them — full lines, click a line → that vessel, click-outside or Esc closes. Zero standing pixels when closed. **Ordering note:** alerts carry no onset timestamp in the model (only the event log does), so "newest first" is approximated as severity class → fleet ranking score; flagged if true recency ordering matters enough to add onset times to the alert model.
3. **Line grammar (one severity voice per line):** [LEVEL] tag in severity color · vessel name link (sheet only) · message in plain ink. Applied in the sheet, expanded tiles, and the inspector's alerts card. The per-line triangle glyph is gone (the sheet's one triangle lives on the summon control). This amends round 21 A6 (whole-line severity color) — the tag is the line's one color now.
4. **Standing tile cleanup:** the `alert [CAUTION]` DataRow (1x) and the mini `[CAUTION]` badge line are deleted — border + dot + name tint are the badge, and the sort puts alerted vessels first. Full alert lines render only at 2x.

**Acceptance check (screenshots):** board at rest shows zero alert prose; any alert's full text is one click away (counts → sheet) from both views.

---

# PROGRESS — 2026-06-12 (Session 32: ROUND 32 — sticky fix, container purge, voyage profile)

## 1. Sticky, priority fix

The band split into PRIMARY ROW (the only sticky element) + a static secondary section. The primary row is constant-height, pure CSS sticky — the stuck-state IntersectionObserver, sentinel, gauge-size swap, and secondary-row hiding are all GONE, so scroll-coupled height changes (the source of the bounce) are impossible by construction. **Acceptance run:** programmatic scroll walk, both directions, at 700/1000/1300px viewports, sampling the band's bounding rect every step — pinned at exactly 0 with zero negative excursions, all three heights.

## 2. Band composition

- "← fleet" link DELETED from the band (grep confirms: rail's "fleet board" link and the unknown-vessel fallback are the survivors — they're navigation surfaces, not band furniture).
- Center stack: NAME → master: {name} (muted sub-heading — honors the authority, names who you're calling) → mode chip → mission clock. Master left the facts line (dedup ledger extended).
- Weather docked under the clock in the center column's negative space: wind · waves as gauge-anatomy stat pairs (glyph + hero value + micro label), current/vis/precip behind the existing reveal, stale tint preserved (stale timestamp text lives in the facts line).

## 3. Voyage profile strip

Automotive trip canvas in the secondary section (scrolls away): origin → 2px track with accent fill = distance covered → destination, vessel glyph riding the live position; "{pct}% · {nm} NM TO GO" right-aligned above; ETA + Z at the destination end; MOORED/STATION text variants keep honest no-progress forms.

**Data honesty fix found during the build:** "origin = last port visited" lies on return legs — schedule legs run port→site→port, so Meridian's strip initially read "Galveston → Galveston, 100% · 333 NM TO GO". Origin is now where the current transit RUN began (minute window, hourly-extended), labeled with the nearest port (<5 nm) or work site: Meridian honestly reads "Viosca Knoll 786 → Galveston, TX, 6% · 333 NM TO GO".

## 4. Container purge (audit, removals listed)

Rule applied: one frame per section, inner structure = whitespace + hairline dividers.
- **EngineTwinPanel gap hero**: nested box + overlay background REMOVED — value + chart sit directly in the section.
- **CrewLogPanel mode strip**: outer border demoted — segment dividers carry the structure.
- Audited clean: EfficiencyPanel, EfficiencyCurve, alerts section, InstrumentCluster, CrewLogPanel roster (boxTight cells already border-none).
- Exempt by rule/kind: synoptic tank rects + engine nodes (diagram), Sparkline/TrendChartFill/GapTrend frames (charts), mode/recon/filter chips and buttons (chips, not containers).

## 5. Fuel matrices

Quartet centered under the synoptic, equal 40px gutters, same centered-width discipline as the gauge cluster.

---

# PROGRESS — 2026-06-12 (Session 31: ROUND 31 — engine panel restructure)

## Done

1. **Twin-gap hero centered, owns the 30d GAP trend**: daily-mean E2−E1 EGT (both mains running) as an area chart with axis ticks, zero line, low-alpha fill (`fill/level` token — data display, not alert color). This replaces the cluster's absolute-EGT 30d sparkline: the GAP is the diagnosis, and the chart is the demo's "three weeks early" graphic — Meridian's climbs ~0 → +58°F across the window.
2. **Calm-not-empty floor**: the trend's y-domain floors at ±20°F, so a nominal twin (Marlin Ridge, +4°F now / −0.2°F 24h avg) reads as a flat line hugging zero instead of auto-ranged noise filling the frame. Verified in pixels on both vessels.
3. **Engine rows, one grammar**: E1/E2/G1/G2 collapse to one-line rows — `ID ROLE · RUNNING · load% · fuel gph` (OFF when stopped) — mains and gens identical, two aligned columns on wide (E1|E2 over G1|G2; the G1/G2 orphan split is gone). EngineCard died (rename recorded for barrel + Figma; its docent annotation unanchored).
4. **Cluster uniform**: centered grid, selector chips above-right, and EVERY gauge gets the same micro 24h area-trace beneath it (minute data sampled to ~96 points, gauge-cell width, dimmed with dormant dials). No orphans.
5. **Text/gauge contract enforced**: state/load/fuel appear ONLY in the rows; sensor internals ONLY in the cluster; the hero holds only the twin comparison. Nothing repeats.
6. **Panel composition**: content max-width 880, centered — same discipline as the command band.

## Screenshots

- `r31-engines-meridian.png`: gap visible — +58°F hero, climbing 30d gap trend, E2 dials amber.
- `r31-engines-nominal.png`: Marlin Ridge — +4°F, calm trend near the zero line, traces under all five dials.

---

# PROGRESS — 2026-06-12 (Session 31: ROUND 30 — band absorbs voyage, crew+log merge)

## Done

1. **Mission clock drops one type step** (60% of hero via `calc`) — the vessel name is the band's only hero; micro label unchanged.
2. **Fuel card composition resolved**: VesselSynoptic IS the fuel card — synoptic on top, dot-matrix tank quartet beneath (ST1 ST2 FD1 FD2, label + dots + % · gal each, TANK_LOW tints carry through). FuelViewSwitch retired (one round old — it existed to compare the variants this round resolves), TankSchematic deleted (bars + flow-box schematic), `tankStyle` provider state gone. **⚖ #9 (dots) and ⚖ #11 (synoptic+dots composition) logged RESOLVED in DECISIONS.md.** The transfer-state reveal moved into the synoptic's capacity reveal so no CONTEXTUAL field lost its surface.
3. **Voyage card died into the command band** (third row, hidden when stuck/collapsed): route strip (from-port → progress → to-port, MOORED/ON STATION variants) + compact wind/waves glyph-stats + the weather reveal (current/vis/precip) + stale handling. **DEDUP LEDGER enforced:**
   - countdown: mission clock ONLY · absolute ETA + Z: route strip ONLY
   - distance-to-go: route strip ONLY · next-port name: clock subtitle ONLY (the secondary row's "next: …" fact deleted)
   - wind/waves: band ONLY (the voyage card was the sole other surface; legacy greybox WeatherPanel is unrouted on this branch)
   - DEV CALL within the round's intent: the round-22 route-progress hairline under the clock died too — progress is the strip's fact, and the band shouldn't say it twice.
4. **Mode strip relocated** to the log column's header in the merged card — it's recent memory, same family as the log.
5. **CREW & LOG**: one card, CrewLogPanel (CrewPanel + EventLog die — renames recorded for Figma). Roster left (roles + names + shared-date footer, round-19 dedup kept); log right (mode strip header → filter chips → entries → load-earlier). Crew-change events in the log tie the halves. The log's internal open/close toggle died — the card-level Collapse already does that job. **For the deck: no rest/sleep inference — the roster shows operational facts only (who is aboard, since when). Fatigue modeling would be invented capability and a sensitive framing; crew correlation stays UNDEFINED pending Anthony (registry unchanged).**
6. **Sweep**: inspector stack = band → position → alerts → engine twins → efficiency row → fuel → crew & log. No orphan cards; voyage/environment/route/mode all absorbed. Collapse keys: `crewlog` replaces `crew` + `log` (+`voyage` gone).

## Notes

- Docent annotations for VesselHeader/TankSchematic/CrewPanel/EventLog are now unanchored (components died) — pending Anthony's copy for the merged surfaces.
- Legacy greybox VesselView swapped to the surviving components to stay compiling (unrouted on this branch).

---

# PROGRESS — 2026-06-12 (Session 30: ROUND 28 — gauge anatomy, value on top)

## Done

1. **Gauge is a vertical stack**: VALUE (Plex Mono, tabular, hero scale) on top → arc + needle below → micro label at bottom. The dial interior is empty except the needle hub. The round-27 hard rule is now satisfied by construction, so the min/max scale labels return at the arc terminals at ALL sizes (the round-27 clearance gate is gone with the collision it guarded against) and the ticks stay. This also dissolves the round-27 flag about cluster-size labels — they're back everywhere.
2. **Color rules untouched**: value keeps earned color (status tint only when alert-backed; white = stillness), needle stays ink/primary always, ruling 11 bands unchanged.
3. **Hero value sized per context via the type ratio**: anchored to `TYPE.hero` (15) and scaled by dial size, so the command band (96 → 17px) sits a step above the engine cluster (86 → 15px) with no extra props.
4. **Stuck-band rhythm**: value-on-top makes gauges taller, and the pinned band stopped reading as one tight row — stuck now drops the dials one step (96 → 80) and it tightens back up. Also cleared the "← fleet" link, which the raised speed value had started colliding with (primary row offset).

## Screenshots

- `r28-band-anatomy.png`: command band at top — values riding above the dials, min/max at the terminals.
- `r28-cluster-anatomy.png`: stuck band (one tight row, 80px dials) over the engine cluster — all five dials with min/max back, E2's alerted values amber on top.

---

# PROGRESS — 2026-06-12 (Session 30: ROUND 27 — command band)

## Done

1. **Gauge label clearance, hard rule.** Min/max scale labels render only when both clear the value's bounding box by ≥6px at the arc terminals (Plex Mono fixed-advance width estimate); otherwise the pair drops and the ticks alone carry the scale. At band size this lands as ticks-only, as the brief expected.
2. **FLAG — clearance at cluster size:** the brief expected full min/max to return at cluster size (86px), but wide values ("935°F", "1569" against "400"/"2000") genuinely fail the 6px clearance there too, so the rule drops them at the cluster as well. Enforced honestly rather than special-cased. Round 28's value-on-top anatomy empties the dial and brings min/max back at all sizes — resolution lands in the next commit.
3. **VesselCommandBand** (new; VesselHeader + TelemetryBand both die — renames recorded for barrel + Figma). Broadcast symmetry: [SPEED][BURN] · NAME (D-DIN, hero) over mode chip over MISSION CLOCK, all centered · [EFF Δ][ENDURANCE]. Secondary facts row beneath, full width, muted: relative position · speed · next port + ETA (state mark kept) · master. "← fleet" top-left of the band. Mode chip consumes the shared MODE_GLYPH map — the old header carried a stale private copy (STATION still mapped to the vessel glyph from round 16); the merge killed it, so band, rail, and tiles now provably share one glyph set.
4. **Placement + sticky.** Band is the inspector's first element, above the position chart. `position: sticky` with a 1px sentinel + IntersectionObserver for stuck detection: stuck collapses the secondary facts row (band tightens to its primary row), un-stuck expands it; shadow hairline + elevation only when stuck; zIndex over the scrolling cards. Collapse chevron works: collapsed = name + mode chip + clock on one line (per-vessel session persistence, same mechanism as the other panels).
5. **`sticky band` dev toggle retired** — round 27 makes stickiness the spec, not a trial. The round-22 toggle and its provider state are gone.

## Notes

- DEV DECISION (pending Anthony): the old header's length/class fact ("240 ft OSV") wasn't in the brief's secondary-row list but dropping data silently felt wrong — it leads the secondary row in muted ink. Strike it if the row should hold exactly the four listed facts.
- The VesselHeader docent annotation is unanchored (component died) — pending Anthony's copy for VesselCommandBand, same as the round-21 card merges.
- Legacy greybox VesselView (unrouted on this branch) swapped to the band to stay compiling.

## Screenshots

- `r27-band-top.png`: top of page — full band with secondary facts row.
- `r27-band-stuck.png`: mid-scroll — pinned, primary row only, shadow hairline.
- `r27-band-collapsed.png`: chevron-collapsed — one line.

---

# PROGRESS — 2026-06-11 (Session 29: ROUND 26 — de-can the board)

## Done

1. **Tile stroke grammar = rail grammar.** The 3px status top-border is gone. Every tile sits on a uniform 1px hairline; an alerted tile earns a 1px status-colored border plus a status-tinted name (same "when the class earns it" rule as the rail — advisory stays muted per A6); active (transit/station) holds full ink; idle nominal unalerted dims to 45%. One grammar, three surfaces (rail, minis, tiles) — the round-24 layers now describe the whole board. Meridian is the only status-bordered tile on the demo seed, exactly as §9 wants the eye to land.
2. **Type swap: Barlow (UI) + IBM Plex Mono (data).** Self-hosted woff2 (Barlow 400/500/700 → `--font-ui`, Plex Mono 400/500 → `--font-data`), OFL licenses committed, DM Sans/DM Mono removed from the repo entirely. D-DIN display face untouched. Offline build re-verified with proxies blackholed.
3. **Fitting pass (Plex Mono runs ~4% wider than DM Mono):** checked in pixels at production scale — board DataRows (labels-left/numerals-right) hold alignment, gauge center values clear their min/max labels at sizes 62/86/96, mission-clock hero fits its 200px min-width cell, timeline chips un-clipped. No layout edits needed; the round-10 overflow guards absorbed the width.
4. **In-card fuel view switcher.** New `FuelViewSwitch` (barrel + Figma contract): three glyph buttons — vessel (synoptic), tank (bars), dots (matrix) — in the fuel card header next to the recon chip, active view in accent wash/bright (interaction voice, not severity). Clicks don't trigger the card reveal. The dev-panel "fuel view" row is retired; the view choice now lives where the officer looks. All three views remain shippable pending ⚖11.
5. **Auto-promotion to 2x disabled by default.** The board points, the human zooms: tiles open at standard/mini and only the officer's own sizing (corner controls, +/− keys) expands them. The legacy behavior is preserved behind a new `auto 2x` dev toggle (default off) so the A/B stays honest for the Figma pass; the promotion-cap logic is intact, not deleted.

## Screenshots

- `r26-board-decanned.png`: full board, default state — uniform hairlines, Meridian's amber border + tinted name the only status stroke, idle row (Bayou Runner / Albatross / Gulf Harrier) dimmed to 45%, no tile auto-expanded.
- `r26-fuel-switcher.png`: Meridian fuel card — switcher in the header (synoptic active in accent), recon chip beside it.

## Notes

- New glyph `dots` added to the contract (24px grid, 1.5px stroke, Figma 1:1).
- `npm run verify` ALL CHECKS PASSED (no data-layer changes this round); offline production build clean.

---

# PROGRESS — 2026-06-11 (Session 28: ROUND 24 — rail states + sticky)

## Done

1. **Three rail layers**: IDLE+NOMINAL (port/standby, no alerts) dims to 45% — idle recedes; ACTIVE (transit/station) full ink; ALERTED never dims at any severity or mode — full ink, status dot, status-tinted name when the class earns it (advisory-only vessels stay full-ink untinted, since A6 made advisory the muted voice — DEV DECISION, flag if advisory should tint). Alerts outrank mode everywhere.
2. **Mode indicator variants** behind `rail mode` dev toggle: (a) right-aligned mode glyph per row — and the brief's crosshair resolves round 16's weakest mapping: STATION = crosshair now, consolidated into one shared MODE_GLYPH map used by rail, tiles, and header chips; (b) 1px ink stroke on transit rows, built despite the flagged selection-border collision for honest comparison (it does read close — Anthony judges).
3. **Selection stays strongest**: border + wash fill, never dimmed, wins over the transit stroke.
4. **Sticky rail**: pins below the header on inspector scroll, independently scrollable beyond viewport height, selected vessel auto-scrolled into view on open.
5. **Board minis share the grammar**: idle nominal mini tiles dim to 45% (alerted/active/selected minis never do).

## Notes

- Rail ordering already used the shared activity comparator (round 21), so the dim layer lands exactly on the rows that sort to the bottom — the two systems agree by construction.

---

# PROGRESS — 2026-06-11 (Session 27: ROUND 23 — greyscale base, water-only blue, land discipline)

## 1. Neutral desaturation

Surface/ink/line/stale/scrim/hairline/fill tokens re-derived as true greys at the same lightness steps (e.g. base #0e1116 → #101010, ink #e8eaed → #ebebeb). ACCENT (IKB) and STATUS hues untouched — interaction and severity are now the only chromatic voices outside chart water. Both treatments + the IKB band verified reading on grey.

**Contrast re-log (vs surface/base #101010 / raised #181818):** ink/primary 15.8 / 14.5 · ink/secondary 8.6 / 7.9 · ink/muted 4.2 / 3.9 · accent/bright 4.9 / 4.5 · caution 9.7 / 8.9 · warning 5.6 / 5.2 · advisory 7.5 / 6.9 · nominal 7.4 / 6.8 — all ratios within 0.1 of the round-5 table (lightness preserved by construction).

**FLAGGED for Anthony's Figma pass:** mode chip hues left as-is — transit's steel-blue may want to move off blue now that blue = water.

## 2. Water = the only navy

`chart/water` token (#0d1924, deep desaturated navy) + `chart/land` (#1d1d1d) with a hairline coastline between, on both charts via the shared core. Chart furniture (graticule, ink, markers, trails, ghosts) all grey.

## 3. Nothing sails over land

- The coastline polygon moved to the DATA layer (`src/data/coast.ts`) — ONE polygon shared by chart rendering, the schedule builder, and verify.
- `avoidLand`: two-pass deterministic fixer — segments sampled at 0.01° (then a 0.004° fine pass for vertex grazes); each violating run's midpoint is pushed offshore (fixed direction priority, southward first) and inserted as a waypoint; transit legs carry the waypoint path and the generator interpolates along it by distance fraction (headings follow segments); leg duration follows the avoided path's true length.
- **Port nodes moved to sea entrances**: Morgan City, Mobile, Corpus Christi and Venice sat miles inside the polygon (inshore channels aren't modeled) — every departure crossed a land carpet no waypoint could fix. Documented in fleet.ts; names unchanged.
- **Scripted-vessel guard**: the reroute shifted Cormorant into PORT at the demo epoch, where reconciliation isn't judgeable (below the 150-gal metered floor) and its scripted DISAGREE vanished — it now gets the same deterministic salt search as Meridian, requiring a judgeable mode at epoch. Meridian's story re-verified intact (+13.7%, both CAUTIONs, transit at epoch).
- **Verify case added**: no trail point on land across the demo seed — ~120k positions checked (PORT samples and <4 nm port approaches exempt, same rule as the fixer). PASSING.
- **Bearing indicator**: the straight line to the next port is NOT a route — restyled as a dashed bearing ray clipped at the chart edge, labeled "BRG {PORT}", port marker only when in frame; behind the `bearing` dev toggle (vs voyage-card-only) for Anthony's judgment.

## Ops

Quick tunnel died a third time mid-session; restarted (watchdog re-armed). Reiterating: demo day is localhost.

---

# PROGRESS — 2026-06-11 (Session 26: ROUND 22 — telemetry strip + type swap)

## Done

1. **TelemetryBand** (renamed from VesselInstrumentBand — barrel updated, Figma rename recorded): broadcast composition [SPEED] [BURN] ··· [MISSION CLOCK] ··· [EFF Δ] [ENDURANCE]. Mission clock is mode-aware at DM Mono hero scale: TRANSIT → "T−HH:MM · GALVESTON TX" counting down to the live ETA with a 1px accent route-progress hairline beneath; STATION/PORT/STANDBY → elapsed clocks ("ON STATION 14:54"), elapsed computed across the minute window and extended through hourly history when a mode spans >24h. Gauges keep round 19 geometry and earned color. Sticky variant (band pins on inspector scroll) behind the `sticky band` dev toggle for Anthony's pixel judgment.
2. **Display face: Bebas Neue → D-DIN**: self-hosted regular + bold woff2 (converted from the foundry WOFFs via fonttools), OFL license committed (`src/fonts/OFL-D-DIN.txt`), token-level swap at `font/display` — vessel names, hero headers, wordmark. DM Mono stays data, DM Sans stays UI. Bebas removed from the repo entirely.
3. **All-caps fitting pass**: D-DIN isn't caps-only like Bebas — caps now enforced at the token (`TYPE.name` textTransform) and on the header name; weight bumped to 700 for the display role. Overflow guards verified in pixels against the longest names ("Osprey Point", "Frigate Bird" both render un-clipped on tiles and rail — r22 screenshots).
4. Offline build re-verified with proxies blackholed (new fonts included).

## Screenshots

- `r22-band-transit.png`: Meridian, T−06:53 · GALVESTON TX, hairline at ~⅔, EFF Δ amber.
- `r22-band-station.png`: Cormorant, ON STATION 14:54, no hairline, advisory line in muted ink (A6 holding).

## Decisions (reversible)

- REVERSIBLE: transit clock shows port inline at 15px secondary after the hero countdown; could drop to a micro line below if the row gets tight on small laptops.
- REVERSIBLE: mission-clock cell min-width 200px; hairline accent/bright.

---

# PROGRESS — 2026-06-11 (Session 25: ROUND 21 — sort, structure, consolidation)

## A-items

- **A1 activity-aware sort**: one shared comparator (`compareVessels`, data layer) for board + rail — status class, then activity (TRANSIT/STATION above STANDBY/PORT), then |sd|. An alert always outranks mode; idle nominals settle to the bottom everywhere.
- **A2 chart-top trial**: dev toggle `chart pos` re-orders the fleet view (band → alerts → chart → board → timeline) so the 2s Meridian glance test can be re-run honestly against the round-6 verdict — the band may have changed the equation.
- **A3 inspector restack**: chart → header → alerts → instruments → engine twins → efficiency row → fuel → voyage → crew → log.
- **A4 twins consolidation — ⚖ #13 RESOLVED: gauges win** (ledger updated). One panel: E1 | twin-gap hero | E2 (cards carry state/load/fuel only — per-engine text sensor rows DELETED), gens compressed to one slim two-column row, the gauge cluster embedded below bound to the E1/E2/G1/G2 chips. The EGT-30d trend moved into the cluster (selected engine) so demo step 3 survives the deletion. EnginesSummary and the sensors toggle removed.
- **A5 VOYAGE card**: Environment + Route + ModeTimeline merged — route strip + distance/ETA/"then", wind/wave glyph-stats (reveal holds current/vis/precip; stale state preserved), 24h mode strip. The three cards died; their docent annotations are unanchored pending Anthony's copy.
- **A6 alert text color everywhere**: shared `ALERT_TEXT_COLOR` — CAUTION amber, WARNING red, ADVISORY muted ink (EventLog's advisory-blue lines corrected to muted; the DATALINK strip keeps advisory blue as its own informational voice, logged).

## B-items

- **B1 burn-vs-speed legibility**: "12-MO NORMAL" micro-label on the band edge, "NOW" at the live point; OPTIMAL bracket moved to its own lane below the x-axis (KN title shifted right) — nothing renders over plot content.
- **B2 follow + pan + zoom** (`usePanZoom`, shared): both charts track their subject by default (inspector = focus vessel — Meridian can no longer walk out of its own chart; fleet = fit-to-fleet); click-drag pans and disengages follow (accent "⌖ FOLLOW" chip re-engages); wheel zoom clamped to sane spans; drags >5px suppress the marker click underneath; wheel uses a non-passive native listener.
- **B3 collapsible panels**: every inspector panel minimizes to header + ONE summary stat (instruments → kn+gph, twins → gap+fuelΔ, efficiency → now%, curve → vs-envelope%, fuel → recon+gal, voyage → ETA+wind, crew → "N aboard · Nd", log → last event, position → "N nm from port"). Collapsed state persists per vessel for the session. The alerts card is deliberately uncollapsible — severity never folds.
- **B4 glyph audit**: EventLog gained its clock glyph (Environment/Crew were already carried/are now inside voyage). **State silhouettes** (TX/LA) ship behind the `state marks` dev toggle beside port names in header + voyage. Honest flag stands: at 12px they may read as smudges — judge on pixels, cut without ceremony.
- **B5 spacing**: `gap/card` token (8px) drives card gaps; rows align-start; the A5 merge removed the double boundaries it asked about.

## Notes

- The retired RoutePanel/WeatherPanel/ModeTimeline files remain (greybox record, locked §8 names) but no longer render — same precedent as VesselView.
- verify/lint/build green (offline fonts); screenshots r21-*.png.

---

# PROGRESS — 2026-06-11 (Sessions 23-24: ROUNDS 19+20 — gauge redesign, click-only system, tank fill)

## Round 19 — gauge geometry + card density

1. **Gauge redesigned**: 270° C-arc opening at bottom (−135°→+135°), min/max scale labels + 3 intermediate ticks (the arc reads as a scale; log dials print their own labels, e.g. endurance 12–2.4k). Needle is ink/primary ALWAYS. Center value takes status color ONLY when an alert-backed threshold is crossed. DORMANT: stopped engine → arc dimmed 30%, no needle, no bands, OFF muted — a dead gauge looks dead.
2. **Ruling 11 regression noted and corrected**: the regression was round 11's own DEV DECISION (EGT/coolant/oil-temp display ceilings drawn as colored bands with no alert backing — flagged then, corrected now). Display-only limits are neutral ink ticks (`displayLimits`); colored bands (`band`) exist only where alert logic backs them: oil minimum red, band eff-Δ amber (`EFF_DELTA_CAUTION_PCT`), endurance amber (`BUNKER_SOON_H` — backing alert is ADVISORY; painted caution-amber per the brief's "amber/red", noted).
3. **Ledger amendment**: ruling 14's green-alive needle is superseded (needle always ink; value colors only on alert-backed crossings; white stillness retained for moored dials).
4. **Instruments panels**: fixed-cell grids (band: 4 equal columns; cluster: auto-fit 90px cells), consistent gutters, panel height = content — float-in-void killed.
5. **Environment/route/crew row sizes to content** (align-start, no stretch voids). Environment = wind/wave glyph-stat pair + reveal, nothing else. Route card ends at the strip. **Crew dedup**: when all hands share one onboard date (the normal case), the repeated column collapses to "all aboard since {date} · {n}d"; per-person dates return automatically if dates differ. The old "last crew change" line cut (the footer states it).
6. Text sweep cuts: engine-card "fuel" label (gph on an engine card self-describes); "load" kept deliberately (a bare % is ambiguous).

## Round 20 — click-only system + tank fill

1. **"Hover points, click asks" is now a SYSTEM RULE** — round 18's open question RESOLVED. All Contextual reveals and RevealZones are click-only (Enter on keyboard; links/buttons inside zones keep their own clicks; blur closes). The only hover behavior anywhere: chart-marker tooltips, debounced.
2. **Tank level as fill**: new token `fill/level` (white @ 10% alpha); both fuel views render level as vertical bottom-up fill; % numeral stays. Neutral always — tint exists ONLY via the new alert.
3. **TANK_LOW alert earns the color** (data layer): ADVISORY when a feeder < `FEEDER_LOW_PCT` (20%) while a main runs ("FD{n} low — verify transfer from storage."); CAUTION when any tank < `TANK_CRITICAL_PCT` (5%). Constants exported; thresholds documented in **DATA_MODEL Appendix A** (new — mirrors the alerts.ts exports, added per this brief). Verify drains a feeder in a fixture and asserts both tiers + that the demo seed carries no TANK_LOW (Meridian's story stays E2's injector).
4. **Stress synoptic confirmed in pixels** (`r20-stress-synoptic.png`): vertical fills, flow paths, RECON badge all read correctly; bonus — Gulf Harrier is moored there, so the band demonstrates white-stillness dials.

## Ops note

The quick tunnel died again mid-session (cloudflared exit 1). Fresh tunnel + watchdog re-armed; URL rotates on every restart — flagged again that demo day runs localhost, never a tunnel.

---

# PROGRESS — 2026-06-11 (Session 22: gauge vitality — Anthony ruling 14)

## Done

- **Gauges are vital-colored** (DECISIONS #14, per Anthony direct): needle + center value carry the state — `data/nominal` green when active and nominal, `alert/caution` amber when sub-nominal, `alert/warning` red at warning-backed breaches, **pure white when off or at port and not moving** (white = static stillness; color = alive). Arcs stay neutral ink; limit bands unchanged.
- States derive from EXISTING constants only: band eff-Δ goes amber past `EFF_DELTA_CAUTION_PCT`; endurance past `BUNKER_SOON_H`; oil pressure goes red below the same 30 psi the WARNING fires on; EGT/coolant/oil-temp go amber inside their display ceilings; speed/burn are green-alive / white-still (no thresholds exist). Cluster dials for an engine NAMED in an active alert inherit that alert's level (Meridian: E2's dials read amber across the cluster, E1's read green).
- Interpretation flagged in the ledger: "red when cautionary" implemented as red-for-WARNING / amber-for-CAUTION so gauges speak the same severity ladder as badges and borders — one constant to change if literal caution-red was intended.

---

# PROGRESS — 2026-06-11 (Session 21: ROUND 18 — calm the board)

## Done

1. **Tile hover reveals removed entirely**: the RevealZone is off the fleet tiles. Tiles are inert to hover except the size control appearing (round 17). Nothing opens, reflows, or flip-flops as the cursor crosses the board.
2. **Detail is click-only and explicit**: the expand control is the single path to more of a vessel on the board. The former hover content (burn · next port — registry-CONTEXTUAL fields) now renders inside the EXPANDED layout via `Field revealed`: the expand click IS the registry's "one interaction away," so the discipline holds without hover. The round 14 affordance folded into the size system: the meter variant survives as a **passive** endurance strip (indicator, not trigger); the chevron variant has no tile remnant (it was purely a reveal affordance) — DEV DECISION logged.
3. **Chart tooltips kept and debounced**: 150ms delay before a marker tooltip shows (FleetMap markers + InspectorChart ghosts); leaving cancels the pending timer — sweeping the cursor no longer strobes tooltips. Keyboard focus still shows immediately (a deliberate focus is not a sweep).
4. **OPEN CONSISTENCY QUESTION for Anthony's Figma pass**: inspector cards still use hover reveals (unchanged this round). The fleet board now says "hover is for pointing, click is for asking" — should the whole system go click-to-reveal? RevealZone supports pinning already; converting the inspector is a per-card prop, not a rework.

## Decisions Made (DEV DECISIONS pending Anthony)

- DEV DECISION: meter strip survives as passive indicator on tiles; chevron variant leaves no tile remnant — if Anthony wants a visible "expandable" cue beyond the hover control, the chevron could return as a static corner mark.
- REVERSIBLE: 150ms debounce constant.

---

# PROGRESS — 2026-06-11 (Session 20: ROUND 17 — manual tile sizing)

## Done

1. **Size control**: corner control appears on tile hover/focus — collapse/expand glyphs (added to the Glyph contract: `expand`/`collapse`, same Figma 1:1 rule) stepping mini ↔ standard ↔ expanded. One click, instant, no navigation (controls preventDefault inside the tile Link). Keyboard: +/− on the focused tile.
2. **Manual overrides auto, both directions**: per-tile size persists in FleetProvider; the resolved size = manual ?? (auto-promoted → expanded; else density default). Expand-in-place works for any vessel — a nominal tile expanded manually gets the full 2x layout, the elastic chart fills, and the alert section collapses cleanly when empty (chart takes the space).
3. **Cap interplay**: the promotion cap (2) gates only automatic promotion — manual expansions are unlimited; the engineer outranks the layout. Manually minimized degraded vessels keep status border + badge: mini tiles now render the [LEVEL] badge line explicitly so severity never hides at any size (verified in the scenario screenshot — Meridian minimized to 1x, amber border + [CAUTION] intact).
4. **Scenario polish**: badge renamed "SCENARIO: MULTI-VESSEL — synthetic". Full loop verified in pixels (`r17-scenario-mixed.png`): Gulf Harrier + (cap slot) auto-2x, Albatross manually expanded as a third CAUTION, Meridian manually minimized, grid reflowing dense with no orphan gaps.
5. **Dense grid flow enabled** — SUPERSEDES the round 3 "no dense packing" rule, per this brief's item 4 ("grid reflows dense without orphan gaps"): with mixed manual sizes, rank order alone cannot avoid holes. Rank remains the dominant order; dense fills the gaps manual sizing creates.
6. Size transitions instant, no animation (Figma choreography decision unchanged).

## Decisions Made (reversible)

- REVERSIBLE: manual sizes are session state (reset on reload) — persistence to storage is one line if the engineer's arrangement should survive.
- REVERSIBLE: mini layout = dot/name/hero/chip + badge; standard-tile extras start at `standard`.

---

# PROGRESS — 2026-06-11 (Session 19: ROUND 16 — containment, instruments up, glyphs)

Before/after: r15-inspector.png → r16-inspector.png, r15 → r16-fleet-board.png.

## Done

1. **Ambient canvas RETIRED** (experiment concluded: containment wins): the chart is a normal framed card at the top of the inspector stack — round 15 height cap kept (30vh/360px), fit-to-content framing kept, scrim token no longer used by any component, `ambient` prop deleted from InspectorChart. Nothing on the page overlaps anything.
2. **VesselInstrumentBand** (full width, under header/alerts): four dials from the shared Gauge — SPEED (0 to cruise×1.35) · BURN (scaled to the vessel's max observed burn from its own 1y history) · EFF Δ (−20..+20; the caution band starts at `EFF_DELTA_CAUTION_PCT` — alert-backed, color earned; Meridian's needle sits in it) · ENDURANCE (log scale 12–2400 h via Gauge's new `display` override; minimum band at the newly exported `BUNKER_SOON_H = 72`, replacing the inline literal). Speed/burn carry no bands — no operating limit exists in the alert logic. New stack order: chart → header/sitrep slot → alerts → instrument band → efficiency → machine → fuel → environment/route/crew → timeline/log.
3. **Glyph system** — placeholder contract, one file (`Glyph.tsx`): 14 schematic pictograms on a 24px grid, uniform 1.5px stroke, currentColor, no fills, no libraries. Names match the future Figma icon library 1:1 (Glyph/engine ↔ icon/engine) for a mechanical swap. Deployed: every section header (via the new `Label` helper), SystemStatusStrip items (datalink/clock/alert-triangle), mode chips on tiles and the vessel header (TRANSIT→route, STATION→vessel, STANDBY→clock, PORT→anchor — DEV DECISION, Anthony's icon language overrules), PortCallsTimeline port rows (anchor), AlertRail lines (triangle).
4. **Text density pass** — every cut logged:
   - Headers shortened: "machine — engine twin comparison" → ⚙ ENGINE TWINS; "efficiency — trend vs {mode} baseline" → 📈 EFFICIENCY · {mode}; "burn vs speed — 12mo transit envelope · N h" → 📈 BURN VS SPEED; "fuel system — storage → feeder → flow meter → engines" → ⛽ FUEL; "route & ports — voyage progress" → ROUTE; "mode — last 24 h" → MODE 24H; "active alerts" → ALERTS; "port calls — next 72 h" → PORT CALLS — 72H; "position — 24h trail · next port" → POSITION; "fleet" → FLEET (glyphs shown here as emoji shorthand; actual glyphs are the line pictograms).
   - DataRow labels dropped one ink step (secondary → muted) — values carry the hierarchy.
   - CUT "state" label on engine cards — "RUNNING/STOPPED" states itself.
   - CUT "level" and "volume" labels on tank cells — "72%" and "9,888 gal" self-describe.
5. The per-engine InstrumentCluster stays in the machine section (cell 3), unchanged.

## Decisions Made (DEV DECISIONS pending Anthony / reversible)

- DEV DECISION: mode→glyph mapping (route/vessel/clock/anchor) — placeholder semantics; Anthony's icon language overrules.
- DEV DECISION: STATION uses the vessel glyph (a DP vessel holding station is "being a vessel hard") — weakest mapping of the four, flagged.
- REVERSIBLE: dial set and scales on the band (speed ×1.35 ceiling, endurance log 12–2400 h); burn dial scales per-vessel by design (a 78 gph coastal and 300 gph OSV both read mid-dial at normal cruise).
- NOTE: the scrim token remains in the foundation block, now unused — Anthony may want it for Figma anyway; flag for removal at strip-week if not.

---

# PROGRESS — 2026-06-11 (Session 18: ROUND 15 — inspector voids killed)

Before/after: docs/screens/r14-inspector.png → r15-inspector.png,
r13-fleet-board.png → r15-fleet-board.png.

## Done

1. **Engine grid cell 3 never empty** (the bug): InstrumentCluster renders there by default; the sensors toggle now only switches what the per-engine reveal shows — text rows vs mini-gauges (Gauge gained a `size` param; 62px EGT/oil/RPM dials in reveal duty). When the gauges move per-engine, the cell holds a compact engines summary (4 running-state DataRows).
2. **Efficiency card, one-elastic-element rule**: fixed stats row (30d trend + now-vs-baseline) → TrendChartFill of the 30d series at flex-grow 1, matching the burn-vs-speed card's height → footer with the 24h strip + baseline/burn context. 90d/1y/band stay behind the whole-card reveal (round 14 affordance, no words).
3. **Burn-vs-speed y-domain** tightened (8%/10% pads, was 15%/18%) — the envelope + live point own the vertical middle two-thirds.
4. **Ambient chart**: (a) frame-to-content — viewport auto-frames focus vessel + 24h trail + up to 3 nearest ghosts (<120 nm), span clamped to a ~60-90 nm radius; the next port deliberately no longer drives the frame (it could buy half a screen of empty water — the bearing line still exits toward it); graticule recomputes. (b) height capped at min(30vh, 360px), resize-aware — the band is a ceiling, not half the room.
5. **pad/card-dense token** (12px): the inspector root overrides `--pad-card` via a scoped CSS-variable, so every card inside drops one padding step with zero per-component edits; fleet board keeps the roomy scale. Header/alerts cards size to content; only cardrow row-mates stretch.

## Decisions Made (reversible)

- REVERSIBLE: ambient span clamps lat [1.6, 3.0] / lon [2.2, 3.8]; canvas cap 360px / 30vh; clear zone 45% of canvas.
- REVERSIBLE: per-engine mini-gauge set is EGT/oil/RPM (3 of 5 — the diagnostic trio); coolant/oil-temp remain in the cluster.
- REVERSIBLE: efficiency elastic uses the 30d series (matches its hero stat); the 90d view stays in the reveal.

---

# PROGRESS — 2026-06-11 (Session 17: ROUND 14 — "details" killed)

## Done

1. **Every reveal text label removed from rendered UI**: "details …" (tiles, both sizes), "sensors …" (engine cards), "90d trend / 1y history / baseline band …" (efficiency panel), "current / vis / precip …" (environment), "capacity / transfer …" (both fuel views). The only `label=` remnants live in the two unrendered greybox-era components (VesselCard, FlowReconciliation card), which never paint on the probe.
2. **RevealZone** added to Contextual.tsx — the reveal policy stays one file. Whole card/section is the hover + keyboard-focus target; Enter pins on non-link cards (inside tiles, Link keeps Enter for navigation and focus alone reveals). Reveal content renders as a hairline-topped block at the card bottom. CONTEXTUAL registry fields render inside zones via the new `Field revealed` path — still exactly one interaction away.
3. **Two affordances behind the dev panel (⚖ verdict #14)**: (a) SILENT — hand-drawn chevron path bottom-right, rotates 90° when open, no icon lib; (b) METER — 3px full-width strip, fill = fuel fraction of usable range, neutral ink, status-colored only when an ENDURANCE/BUNKER alert is live; strip and card both trigger. Cards without meter data (inspector sections) fall back to the chevron even in meter mode — DEV DECISION pending Anthony.
4. **Learn-mode discoverability**: the affordance glyph/strip itself carries the Contextual docent copy (wrapped in its own Annotated), so the teaching registers on the new trigger without shadowing each card's own docent copy. The DATALINK strip keeps its labeled Contextual — there the label IS the value, not filler; logged as the one intentional survivor.

## Decisions Made (DEV DECISIONS pending Anthony / reversible)

- DEV DECISION: meter fallback to chevron on cards with no endurance meaning — a fuel strip on a weather card would lie.
- REVERSIBLE: reveal block opens downward inside the card (grows card height) rather than overlaying — honest about space, consistent with no-overlay-on-chart guardrails.
- REVERSIBLE: chevron 10px, meter 3px — geometry constants.

---

# PROGRESS — 2026-06-11 (Session 16: ROUND 13 — expanded tile, void killed)

## Regression archaeology (as asked)

The round 3.3 rule ("the chart takes whatever has nothing else to say") was
regressed by **round 7**: the card-grammar pass grew the grid cell (roomier
pad tokens, larger hero type made 1x rows taller, and the 2x cell spans two
of them) while the chart stayed a fixed 320×72 Sparkline — the growth went
to whitespace instead of plot. **Round 11** compounded it with equal-height
row stretching. Fixed structurally, not by nudging.

## Done

1. **Expanded tile = true vertical flex column** filling its grid cell: fixed header (dot, name, hero trend, mode chip) → **TrendChartFill** at flex-grow 1 (minHeight 96; the plot itself measures its flex box via ResizeObserver and scales — never a fixed pixel height; the void has nowhere to live) → alerts → footer stats → details link.
2. **Chart earned real axes at hero size**: labeled zero baseline (heavier rule), y ticks under the min-gap rule (22px), DM Mono labels in a reserved gutter. The 3-week ramp reads as the hero graphic.
3. **Alerts in full text on 2x**: the same WARNING/CAUTION lines as the strip, level-colored — replacing the "alert · [CAUTION]" label/value pair that wasted the story. 1x keeps the compact badge row (full text is the 2x privilege).
4. **Details link pinned bottom-left across sizes** via margin-top auto in the flex column — consistent on 1x, 2x, and stretched cells.
5. **Sanity checks**: 1x tiles content-define height inside stretched cells with the details link pinned (screenshot r13-fleet-board); stress scenario captured (r13-stress-board) — Gulf Harrier (WARNING) + Meridian fill their 2x cells identically, charts scaled to matching heights, while Albatross/Sandpiper hold 1x with full amber border + badge under the promotion cap.

## Decisions Made (reversible)

- REVERSIBLE: chart minHeight 96px; y-tick min-gap 22px.
- REVERSIBLE: 2x alert text small mono (11px) — could go data-size if Anthony wants the story louder.

---

# PROGRESS — 2026-06-11 (Session 15: ROUND 12 — FleetHealthBand)

## Done

- **FleetHealthBand** replaces the FleetTrend band (rename recorded in the barrel and flagged for the Figma library): one card, four cells — [STATUS CENSUS] [30D MEAN + trend curve] [FLEET BURN NOW] [NEXT 24H]. Existing type tokens only; hairline cell dividers; card grammar throughout.
- **Census**: counts by status class, numerals tinted per active treatment (dark-cockpit keeps nominal neutral). Clickable filters: tapping a class highlights matching tiles (non-matching dim to 30%), scrolls the first match into view, tap again to clear. Filter state lives in FleetProvider (interaction state).
- **Coupling rule encoded and commented in the component**: census and mean ALWAYS render together — an average without its exception counts beside it is how a fleet hides a failing ship; both cells are unconditional by construction.
- **Fleet burn**: live sum of burn_rate across vessels + 24h hourly fleet-burn sparkline (auto-ranged). Series computed in the data layer (`fleetBurnSeries24h`/`fleetBurnNow`).
- **Next 24h**: arrival count + BUNKER flag count, reusing the timeline's own `collectBlocks` (same ENDURANCE_RESERVE constant — still no second magic number); the cell links to the arrivals board anchor.
- **Spend slot (⚖ #4)** reserved in the mean cell: renders only if/when Anthony rules it in (Field returns null while UNDEFINED).
- 30/90d/1y range toggle and the IKB-fill experiment carry over into the mean cell.
- Learn Mode: the band carries the sanctioned FleetTrend docent copy as an alias — copy update is Anthony's (use-as-written rule).

## Decisions Made (DEV DECISIONS pending Anthony / reversible)

- DEV DECISION: census click = filter+scroll (dim non-matching to 30%) rather than a hard filter that removes tiles — the fleet never leaves the screen, consistent with the rail principle.
- REVERSIBLE: census shows all three classes including zeros — a visible "0 degraded" is information, not clutter.
- REVERSIBLE: arrivals cell counts scheduled ETAs only (moored vessels excluded from the 24h count).

---

# PROGRESS — 2026-06-11 (Session 14: ROUND 11 — inspector density + scale safety)

## Done

1. **Chart axis hygiene** (burn-vs-speed): axis titles in reserved gutters (GAL/NM rotated far-left, KN in its own row under the ticks) — no more title/tick fusing; tick spacing computed with a min-gap rule (44px x / 26px y — steps drop ticks before overlapping); plot domain pads to content (~15-18%), so envelope + live point + annotation fill ~70-80% of the plot; the delta annotation flips to anchor-end near the right edge. FleetTrend and the nautical charts audited: no titled axes to collide.
2. **RoutePanel restructure**: distance-to-go in a real right-aligned DM Mono micro slot above the strip (out of the 6px track); label/bar/label grid with min-width-0 — port names ellipsize before the bar compresses; ETA zero-shrink; following port on its own line.
3. **Density pass**: FlowReconciliation card dissolved into the fuel-system card as a header chip (`ReconChip`: status + magnitude, alert-band colored) — one fuel truth, one card; the synoptic's in-diagram meter badge stays the only in-diagram instance. Registry bookkeeping: `reconciliation_error_magnitude` CONTEXTUAL → VISIBLE (rides the chip; round 11 item 3). Alert dedup: inspector shows only this-vessel alerts; the global AlertRail renders on the fleet board exclusively. Sparse cards tighten (Environment vertical padding reduced).
4. **InstrumentCluster (⚖ verdict #13)**: one shared `Gauge` primitive (SVG arc, needle, DM Mono center value, micro label) × five dials — EGT, coolant, oil pressure, oil temp, RPM. Neutral ink arcs; status-colored band ONLY at operating limits (oil-pressure minimum in warning red, EGT/coolant/oil-temp ceilings in caution amber; RPM has no limit band). Lives as engine-grid row 2 cell 3 (GEN1 | GEN2 | cluster), defaulting to the alert-flagged engine with E1/E2/G1/G2 selector; ships behind the dev-panel "sensors" toggle vs the text rows.
5. **Scale safety**: board sort is now explicitly status-class-first (degraded > watch > nominal), then |sd|; promotion cap = at most 2 auto-promoted 2x tiles (worst by |sd|) — further degraded vessels stay 1x with full status border + badge. **Stress scenario** in the dev panel: synthetic overrides on 3 vessels (1 WARNING + 2 CAUTION, mixed severity → 4 degraded with Meridian) for designing the crowded board against real pixels. Loudly badged "STRESS SCENARIO — synthetic, not the demo path"; demo seed and generated data untouched (overrides clone alert/derived fields only).
6. **Equal-height rows**: `.cardrow` class (row-mates stretch, margins collapse into row gap) across the inspector grid.

## Decisions Made (ALL REVERSIBLE / DEV DECISION pending Anthony)

- DEV DECISION (pending Anthony): gauge operating limits are display constants (EGT 920°F+, coolant 203°F+, oil-temp 226°F+, oil pressure <30 psi) — the oil-pressure 30 matches the WARNING threshold in alerts.ts; the others have no alert-logic counterpart yet and exist only as gauge bands. If any band should alert, that becomes a PM ruling.
- DEV DECISION (pending Anthony): stress overrides are hand-picked (v02 WARNING feeder, v05 CAUTION efficiency, v08 CAUTION EGT) rather than a true alternate seed — a parametric seed means refactoring the global hash; not worth it for a design-only scenario.
- REVERSIBLE: promotion cap = 2 (constant); tick min-gaps 44/26px; domain padding 15-18%.
- REVERSIBLE: cluster defaults to the alert-flagged engine; selector remembers per mount, not per vessel.

## Open verdicts recap: ⚖ 11 fuel view (rows/dots/synoptic) · ⚖ 12 sd numeral on tiles · ⚖ 13 sensors (text rows vs gauges) — all in the dev panel.

---

# PROGRESS — 2026-06-11 (Session 13: ROUND 10 — fitting & resilience)

## Done

1. **Self-hosted fonts**: all three faces switched to `next/font/local`; six woff2 files (latin) committed under `src/fonts/` (DM Sans 400/500/700, DM Mono 400/500, Bebas Neue 400, ~137 KB total). **Network note: the production build was run twice with HTTP/HTTPS proxies blackholed (127.0.0.1:9) and succeeded — zero-network builds verified.** This was a real demo-day risk: next/font/google fetches at build time.
2. **Overflow safety pass**: tile and rail vessel names ellipsize (rail names get minWidth:0 in their flex row); RoutePanel port names truncate at 180px while ETAs carry flexShrink:0 — names give way before numerals/ETAs ever clip; the following-port hint truncates at 140px; SystemStatusStrip's header row wraps instead of overflowing; Contextual reveal boxes cap at 420px and wrap (the DATALINK affected-vessels list could previously explode the header).
3. **Timeline chips**: minWidth 96px floor; name span truncates first; ETA and the BUNKER flag are zero-shrink — they never clip.
4. **Ruling 11 amended in the ledger**: the metric + formula stand as the PM ruling; the "HIDDEN at fleet level / rank-order-only" clause was dev-proposed and is reclassified as DEV DECISION pending Anthony — **⚖ verdict #12** (sd numeral on tiles vs rank-order-only). Behavior unchanged until his verdict; the fleet-chart tooltip now shows **mode + 30d trend** (was mode + sd) so no surface contradicts another while it pends. Registry note updated to match.
5. **Engine-card trend overlays built** (spec v2 §8, ledger note closed): daily-mean EGT over 30d as a small auto-ranged sparkline in each engine card's "sensors" contextual layer (Sparkline gained a `zeroBaseline:false` mode — EGT at ~800°F against a zero axis would be a flat line). Demo step 3 material: Engine 2's line climbs ≈60°F while Engine 1 stays flat.
6. **Ledger hygiene rule** added to CLAUDE.md and DECISIONS.md notes: dev-proposed design choices log as "DEV DECISION (pending Anthony)", never folded into a numbered PM ruling's text.

## Decisions Made (ALL REVERSIBLE)

- REVERSIBLE: latin subset only for the committed fonts — the UI renders no non-latin strings; other subsets are a re-download.
- REVERSIBLE: port-name truncation widths (180px/140px) and chip floor (96px) are constants, tune in Figma.
- REVERSIBLE: EGT overlay = per-engine absolute EGT rather than twin-gap — reads directly on each card and the divergence is visible by comparison across the two cards; a twin-gap variant is ~5 lines if Anthony prefers one chart over two.

---

# PROGRESS — 2026-06-11 (Session 12: ROUND 9 — strip the scaffolding)

All meta/process language is out of the rendered UI. Learn Mode (L) is the
only meta layer; the dev panel (D/⚙) stays as a deliberate hidden tool.

## Done — every rendered-string change, listed

1. Field router: UNDEFINED and unregistered fields render NOTHING (were grey "UNDEFINED: …" / "NOT IN REGISTRY" boxes). `UndefinedField` component deleted. Affected slots now silent: fleet_total_daily_spend (band), wind_direction_visualization, heading_deg, crew_efficiency_comparison.
2. "fleet plot — gulf of mexico (fit-to-fleet viewport, probe)" → "fleet plot — gulf of mexico"
3. "active alerts — context strip (v2: annotates the trend board, does not organize it)" → "active alerts"
4. "position — 24 h trail, next port (probe)" → "position — 24h trail · next port"
5. "fuel system — synoptic (⚖️ verdict 11 vs boxes view)" → "fuel system"
6. "fleet trend — whole-fleet efficiency vs baselines (7d smoothed)" → "fleet trend — efficiency vs baseline · 7d smoothed"
7. "efficiency — trend history first (v2), then current vs mode baseline ({mode})" → "efficiency — trend vs {mode} baseline"
8. "expected range around {value} — band visualization pending design" → "expected range around {value}"
9. "efficiency curve — burn vs speed, 1y transit history ({n} h)" → "burn vs speed — 12mo transit envelope · {n} h"
10. Tile micro "30d efficiency delta vs mode baseline (zero line)" → "30d delta vs baseline"
11. AppHeader subtitle "design probe — press D for toggles" → removed (gear button remains, moved bottom-right clear of the header)
12. Dev panel: "probe toggles" → "toggles"; "synoptic ⚖️11" → "synoptic" (verdict bookkeeping lives here, not on screen)
13. Loading text "Generating deterministic fleet (seeded, ~2s)…" → "Loading fleet telemetry…" (both routes)
14. Page metadata description → "Fleet fuel-efficiency monitoring for shore-side engineers"
15. VesselSitrep placeholder no longer renders (dashed "designed in Figma tomorrow" box was scaffolding); slot documented in code; component copy neutralized to "SITREP / situation report — pending" for whenever it returns
16. Swept and confirmed clean in rendered strings: PROBE, UNDEFINED, registry, NOT IN REGISTRY, Figma, TODO, wireframe, greybox, v2, disposition, Anthony

## Judgment calls (logged)

- `/inspect` (the session-1 raw-data tables, including the registry dump) kept as-is — it is a deliberate engineering tool like the dev panel, not product surface. Say the word and it gets the same sweep or a route guard.
- Learn Mode badge and docent cards keep their sanctioned meta copy — that is the one meta layer by design.
- Code comments untouched per the brief (UI text only).

## Consequences

- Learn Mode annotations for VesselSitrep and NominalRow are both unanchored now (neither renders); both bind again the moment their components return.
- verify/lint/build green; tunnel current (fingerprint-matched after restart).

---

# PROGRESS — 2026-06-11 (Session 11: ROUND 8 — LEARN MODE + tidy pass)

## Done

- **LEARN MODE** (docent overlay for Anthony's onboarding, strip-before-demo by design): toggle via **L** key or dev panel; loud fixed badge ("LEARN MODE — interactions suppressed") whenever active so it cannot sneak into a demo. Hovering any registered component draws a 1px accent outline and a docent card: exact barrel name, disposition mark, description, "answers:" line. Cards position fixed with viewport clamping (never clip at edges). Innermost annotated component wins on hover; clicks are suppressed in capture phase while learn is on. Works on both views.
- **Removability**: everything lives in `src/learn/` (provider, `<Annotated>` wrapper, annotations.ts). Strip = delete the directory + remove the marked `// LEARN MODE — strip before demo week` imports. NOTE: the brief said `src/data/annotations.ts`, but that conflicts with one-directory removal — annotations.ts went to `src/learn/` to honor the stronger constraint.
- **Annotation copy**: used as written, all 23 entries. One has no anchor: **NominalRow** is not rendered on the probe (compression row suspended round 4: 15 tiles fit one screen) — the entry stays registered and binds if the fold returns.
- **Tidy pass** (lint-level, no behavior changes): dead `GULF_FRAME` export removed (fit-to-fleet superseded it); three duplicate toggle-button style definitions (DevPanel, FleetTrend, LiveControls) consolidated into one `toggleStyle()` in the token file.
- **Tidy proposals (logged, NOT done)**: `VesselCard.tsx` and `VesselView.tsx` are greybox-era components unused on the probe (superseded by VesselTile/VesselInspector) — they stay, as main's record; delete only if the probe ever becomes the product. `LayoutVariant`'s chart-band option survives but may be a dead verdict after round 3.2 — Anthony can kill it with verdict housekeeping.
- **Seatbelt**: `SYSTEM_NODES*.md` gitignored — Anthony's grounding document stays out of the repo; annotations.ts is its only public derivative.
- verify/lint/build green. Overnight the Cloudflare quick tunnel's hostname died (edge connection dropped, retries failed) — restarted with a fresh URL, build fingerprint re-verified matching local.

## Known limitations (logged, accepted)

- Learn-mode wrappers add a plain div around components, so flex/grid layouts can shift slightly while learn is ON — it is a docent overlay, not the demo surface.
- Hover-driven reveals (Contextual) can still open underneath a docent card; clicks are dead but hover effects are not — full hover suppression would break nested annotation targeting.

---

# PROGRESS — 2026-06-10 (Session 10b: ROUND 7 addendum — VesselSynoptic)

## Done

- **VesselSynoptic** (⚖️ **verdict #11** vs the TankSchematic boxes view, dev-panel "fuel view": rows / dot matrix / synoptic): top-down generic OSV — superstructure forward, working deck aft, schematic not illustrative. 2 storage + 2 feeder tanks with fill ratio + DM Mono percentages, 4 engine nodes (2 MAIN aft, 2 GEN) showing running/load (filled = running, outline = OFF), flow paths storage→feeder→meter→engines, flow rate at the meter, reconciliation badge anchored to the meter point, XFER tag when a transfer is active, ST1/ST2/FD1/FD2/E1–E4 leader-line callouts.
- **Status discipline**: hull and plumbing are neutral ink lines; status color appears ONLY where status exists — an engine node tints amber/red only when an active alert names that engine_id (Meridian's E2 tints watch-amber); the recon badge tints by its alert band (OK neutral / DISAGREE advisory / >7% caution).
- **Replaceable geometry**: `HULL_PATH`, `SUPER_PATH`, and the full `GEOM` block live at the top of one file — Anthony's Figma hull swaps in 1:1.
- verify/lint/build green; tunnel re-verified on the new build; screenshot `docs/screens/r7b-synoptic-meridian.png` (captured with the toggle flipped; default remains "rows" pending the verdict).

## Decisions Made (ALL REVERSIBLE)

- REVERSIBLE: engine-status attribution parses engine_id from active alert messages — if alerts ever stop carrying ids, this needs a structured field instead (1-line data change).
- REVERSIBLE: tanks fill bow→stern (horizontal) in the top-down view; could fill athwartships.
- REVERSIBLE: GEN nodes sit forward of the mains; swap positions in GEOM if the engine-room layout should read differently.

---

# PROGRESS — 2026-06-10 (Session 10: ROUND 7 — card grammar + inspector room)

High-fidelity reference for tomorrow's Figma session. Everything token-driven
and reversible; Figma remains the design of record.

## Done

- **Card grammar tokens** (`globals.css @theme`): `type/label 11px · type/hero 30px (≈2.7x) · type/data · type/micro`, `pad/card 16px · pad/section 12px`, `color/line/hairline` (ink @ 12% alpha), `color/scrim`. Anthony retunes the whole scale in one block.
- **Grammar applied globally** via the shared sources: `gb.box` = surface/raised + hairline + radius + pad/card; `gb.label` = DM Mono micro-caps letterspaced +11%, ink/muted (labels whisper). `Stat` hero numerals are token-sized (values shout) and now anchor: VesselTile (30d trend), EfficiencyPanel (30d trend + now-vs-baseline), EngineTwinPanel (E2 vs E1 EGT), FlowReconciliation (status), WeatherPanel (wind/waves), TankSchematic flow meter (gph), FleetTrend band (unchanged hero). Supporting data stays in DataRow rhythm.
- **Registry violation fixed**: tiles had displayed the sustained_deviation numeral since round 4 — the registry rules it HIDDEN (ruling 11, rank order expresses it). Hero is now the 30d trend numeral alone.
- **FleetView composition LOCKED**, dressing only: status strip → FleetTrend band → alert strip → trend board → chart → timeline, exactly as tested.
- **Inspector room**: InspectorChart promoted to ambient canvas (480px backdrop, frameless `ambient` mode, focus vessel + trail hero'd in the clear top zone); opaque cards float over its lower half in the brief's row order (sitrep slot → header → alerts → curve+efficiency → engine twins → tanks+reconciliation → weather/route/crew → mode timeline + event log); scrim gradient dims the chart beneath the card zone; mini-tile rail persists.
- **VesselSitrep slot reserved**: two-line dashed placeholder at the top of the room — designed in Figma tomorrow, templated in code after.
- Rules held: no orange, no glow, no icon libraries, status = only severity voice, one IKB moment max (still the band, still behind its toggle), motion budget unchanged, all six dev-panel toggles verified working.
- verify/lint/build green; screenshots `docs/screens/r7-*.png`; production build restarted; tunnel re-verified serving the new build.

## Legibility / contrast (guardrail re-measure)

- Cards are FULLY OPAQUE (surface/raised) — every text-on-card ratio from the round 5 table is unchanged; nothing sits on translucency.
- Scrim = rgba(11,14,19,0.62) over the chart's card zone only; chart furniture beneath it drops below readability BY DESIGN (it is backdrop there; the clear top zone keeps full chart legibility).
- Hairline (ink @ 12%) is a decorative border, not text — no WCAG minimum applies; the 3px status edge still does the separating where it matters.

## Decisions Made (ALL REVERSIBLE)

- REVERSIBLE: hero ratio set at 2.7x label (30px/11px) — one token to retune.
- REVERSIBLE: tile hero = 30d trend (the v2 primary signal); could be endurance or delta per Figma.
- REVERSIBLE: ambient canvas 480px with 170px clear zone; scrim gradient starts 60px above the card zone.
- REVERSIBLE: inspector grid spans: curve 480/efficiency 380, tanks 2:1 recon, weather/route/crew thirds, timeline 1:2 log.
- REVERSIBLE: minimal-density tile hero drops to 24px so 1x tiles stay compact.

## Questions / Objections for Anthony

1. The hero-per-card rule leaves CrewPanel and AlertRail without a numeral anchor (names and sentences) — intentional, or do they get one in Figma?
2. Clear-zone height (170px) vs chart drama — tune on the phone tonight.

---

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
