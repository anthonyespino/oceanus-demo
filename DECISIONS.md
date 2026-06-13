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
| ⚖ status | 2026-06-13 | RESOLVED (round 57): VesselTile status indicator is **status.line over status.dot** — severity as an integrated edge line (annunciator-strip read), unifying the status border and the status indicator into one gesture. Figma is the source of truth; the atlas follows it (status.dot → status.line, no Figma write-back). | Anthony, via round 57 (approving the round-49 §5 / round-55 diff) | Applied S50 (`VesselTile`, atlas) |

## Notes

- **Ledger hygiene (2026-06-11, standing)**: dev-proposed design choices are
  logged as "DEV DECISION (pending Anthony)" and never folded into a numbered
  PM ruling's text. Ruling 11 was the corrective case.
- **Ruling 12 pending item resolved (2026-06-12, round 39)**: the "24h
  sparkline → CONTEXTUAL pending Anthony's registry ruling" clause is settled —
  `efficiency_sparkline_24h` is VISIBLE at fleet level as the tile-bottom 24h
  signature (full card width, fixed height, every tile size).
- **Calm Sea (round 50 supersedes round 46)**: the round-46 flat SVG paper-wave
  is replaced by a WebGL receding water plane (`src/components/AmbientSea.tsx`).
  - **Per-context binding added**: FleetView water binds to the whole fleet's
    |mean delta| (amplitude) + avg burn (frequency); VesselInspector rebinds the
    same expression to the inspected vessel. Scope eases between states (the
    canvas persists in the layout), no cut. Source signals unchanged from r46 —
    expression only.
  - **Horizon / sky / sun REJECTED**: no decorative chroma, top-down language
    preserved. The plane recedes upward and dissolves into haze; no horizon line.
  - **Desaturated grey, never navy** in the background — navy stays reserved for
    chart water. Luminance subordinate: the brightest water point is below the
    dimmest UI surface fill (surface/raised), so nothing in the water competes
    with an idle tile.
  - Governance unchanged in intent: off in expert mode, static depth-faded still
    under prefers-reduced-motion and on WebGL fallback (never the old paper-wave),
    paused when hidden, settings toggle (default on). DEMO MERIDIAN seed
    untouched; the scenario library drives the deltas, this changes expression.
  - **Subordinate-luminance rule REVISED (round 62)**: the round-50 rule
    "brightest water below the dimmest UI surface" was too conservative — it made
    the layer effectively invisible. **An ambient layer that can't be seen is a
    failure, not subordination.** The rule is replaced by **"severity must
    out-read the waves"**: water luminance, texture, and motion are raised (crests
    now bleed to ~0.24 grey, two-octave value-noise grain, drift doubled) until
    the field is unmistakably present and moving — but an alerted element's status
    color must remain the most attention-commanding thing on screen. Verified: on
    the 15-tile board with one CAUTION vessel, Meridian's gold border + name + the
    amber census still dominate the brighter waves by a wide margin (crests at
    0.24 grey vs a chromatic alert color — no pullback needed; ceiling not
    reached). **Retained hard constraints: greyscale only (R=G=B, zero chroma,
    grey/white light bleed permitted) and severity-dominance.** Justified because
    the layer is operator-dismissible (toggle / expert-off / reduced-motion all
    intact) — agency licenses the increased presence. Binding (round 50) unchanged.
  - **Texture changed grain → smooth gradient bands (round 67)**: the round-62
    value-noise grain read as low-resolution/pixelated, so the per-pixel noise is
    REMOVED. Reasoning: the grain was not the valued element — the **depth
    gradient** (darker near the bottom easing up into the lighter haze band) is,
    and it stays. Waves are rebuilt as smooth sinuous luminance bands (layered
    sine octaves with soft falloff, no edges to alias). A sub-LSB ordered dither
    (±1/255 — invisible, NOT grain) prevents 8-bit gradient banding on high-DPI.
    Crests still ~0.24 grey (severity out-reads); greyscale + round-50 binding
    intact; cheaper than the noise field (sustained ~97 fps, no regression).
  - **Fine particle shimmer added as an OPTIONAL toggle (round 72)**: a dev-panel
    toggle SHIMMER OFF (default) / ON. This is NOT the retired round-62 coarse
    grain — it is FINE: value-noise sampled in SCREEN space at ~2.4px cells
    (sub-pixel-scale at 1×, smoothly interpolated so no blocks/aliasing), drifting
    so it twinkles like light on water, hard-gated to sparse glints that ride the
    wave crests and concentrate in the near foreground. It rides ON the round-67
    gradient (added to luminance, never replaces it). Greyscale only; low
    amplitude so it stays in the wave luminance band (severity still out-reads);
    intensity dataset-bound to the same delta as the waves (fleet-mean /
    single-vessel, round 50). Off by default so the smooth version is the
    baseline. Perf: a uniform-coherent branch (free when off); sustained ~120 fps
    in BOTH states on the board (gate was 60), no particle reduction needed.
    Reduced-motion and expert-off kill it with the waves (it only runs inside the
    live shader). Cards untouched (flat-matte; glass/shadow permanently cut).
- **FleetView resolved to chart-band ONLY (round 68)**: board-first is removed
  and the layout-mode toggle retired. Audit found there were never two structural
  layouts — `layoutVariant` only set the FleetMap height and `chartTop` set its
  position; both are removed. The FleetMap is now a shallow band on top, board
  directly below. The band gains a **transient MAXIMIZE control** (resize is an
  allowed posture: acknowledge/note/pin/resize/watch): one press grows the band
  (240 → 520), a second restores; the tiles below stay visible and reflow down.
  **One-elastic-element preserved** — only the band flexes, tiles hold their size.
  Maximize is NOT persisted (transient, not a saved layout-mode); default load is
  always the standard band size.
- **Text-selection disabled on the control surface (round 64, landed round 68)**:
  the dashboard is a control surface, not a document — `user-select: none` on the
  body stops click/drag smearing a blue selection across tiles/labels; re-enabled
  on form fields and the `/inspect` data tables so real data stays copyable.
- **Consequence sort — confirmed PRESENT, not a new decision (round 68 audit)**:
  the board + rail consequence tier (alerted → active-worst-deviation-first →
  idle-dimmed) is the round-21 `compareVessels` comparator and has been in the
  branch since then. Round 60 (a re-spec) never landed as a commit, but the
  feature is live; Meridian sorts first by the comparator, not incidentally.
- **Consequence sort COMPLETED (round 71–72)**: the round-21 comparator pinned
  the right TIERS (alert → active → idle) but its within-tier tiebreaker used the
  HIDDEN `sustained_deviation` weighted score — which diverges from the tile's
  displayed hero number, so the active tier looked unsorted (Calcasieu −1.2
  outranked Marlin Ridge +2.8 because its weighted score was marginally larger).
  **Fixed: the tiebreaker is now `|trend_30d|`** — the displayed hero (the
  "primary fleet signal" and what "ranked by sustained deviation" means), so the
  rendered order matches what the operator reads. Final behavior, three tiers:
  **T1 ALERTED** (CAUTION+), pinned top, worst severity first then |deviation|;
  **T2 ACTIVE** (underway), by |deviation| worst-first; **T3 IDLE** (port/standby),
  dimmed, bottom, by |deviation|. **Tiebreaker is ABSOLUTE** (round 72): magnitude
  is the consequence (a +3% and a −3% both warrant a look), sign is the diagnosis.
  **ETA rejected** as a sort key, as are alphabetical and data order — the deck is
  banked by consequence, not arrival or activity. Stable within tier (vessel-id
  final tiebreak → no jitter on refresh). The internal `sustained_deviation` field
  is retired as the sort key (DEV DECISION; it stays computed but unused for
  ranking). Verified in the running build: demo seed Meridian → Terrebonne (−3.0,
  worst active) → Marlin Ridge (+2.8) → … → idle dimmed at bottom; MULTI-CASUALTY
  (degraded above watch, worst-first), PORT-WEEKEND (most vessels dimmed bottom),
  ALL-NOMINAL (no T1, idle last) all sort correctly.
- **Glass / card shadow CUT for scope (rounds 59/65, confirmed permanent round
  71–72)**: not building it. No glass scaffolding existed in the branch to remove
  (verified). A judge-on-pixels nicety, not load-bearing — cut to protect the
  four-day runway. Cards stay flat-matte, borderless, fill-only.
- **CommandBand center stack is full-glyph in DEFAULT mode (round 52)**: category
  words drop wherever a glyph carries the category — master line = `crew.glyph` +
  name (no "master" word), place line = `anchor.glyph` + place. Clock stays text
  (a glyph makes mode-state more cryptic). Wind/waves keep their glyph prefixes;
  the mode chip stays. No line carries a stroke except the mode chip's box and a
  genuine severity state. `crew.glyph`/`anchor.glyph` are slots with placeholder
  fallback (drawn art arrives via the scrape). **OPEN THREAD**: Expert mode's job
  needs re-earning — it can no longer be "glyphs replace labels" alone now that
  default absorbs that. No verdict on Expert's new definition yet.
- **CommandBand primary row rebalanced (round 53)**: the center stack lost its
  `flex:1` greed; left cluster (speed/burn), center stack, right cluster
  (effΔ/endurance) are three masses centered with EQUAL gutters (44px each side),
  clusters pulled inward, dead air killed. Mission-clock line loosened (clock
  dominant; wind/waves trail). Wind/waves held at environment-context scale
  (15px, bumped from 14 for legibility only), NOT promoted to hero — nominal data
  that already feeds Calm Sea, so rendering large would double-count the signal.
  Consequence hierarchy unchanged; nothing nominal gained weight.
- **CommandBand header rearranged (round 73)**: gauges now FLANK the center
  identity stack directly — SPEED + BURN left, EFF Δ + ENDURANCE right, stack
  between (three balanced masses, even gutters per round 53). Center stack order,
  top→bottom: NAME · master (crew.glyph + name) · mission CLOCK · place
  (anchor.glyph + PLACE) · wind+waves on their OWN line below place (held at
  context-scale, NOT promoted — they feed Calm Sea, stay context; own line is a
  layout move, not a weight change).
  - **Mode glyph REMOVED** from the center stack; the mission clock now carries
    mode via prefix — `T−` transit (countdown), `ON STATION`, `IN PORT`, `STANDBY`
    (only `T−` pre-existed; the word prefixes were added so the clock alone reads
    the mode after the glyph removal). Confirmed in the build (transit/station).
  - **Status row SPLIT by information type.** CONSEQUENCE (CAUTION · ADVISORY
    counts) stays at the TOP near the name as a clickable DetailChip (opens the
    alert popover — kept clickable, not static text). Data-health (DATALINK + LAST
    SYNC) moves to a quiet BOTTOM footer strip across the band. **Reasoning:
    data-health is ambient ("is the feed trustworthy"); alert state is
    consequence — they live at different weights and positions.** The footer's
    separation from the band body is a borderless fill-STEP (recessed surface-base)
    + spacing, never a line; DATALINK DEGRADED keeps its advisory treatment. The
    footer lives inside the ONE sticky `<section>` — no second sticky element; the
    DetailChip hairline affordance (round 43) is retained on the chips themselves
    (same as the top alert chip), distinct from the borderless bar separation.
  Severity rules unchanged (name gold when alerted, EFF Δ value tinted +
  amber-arc only when alert-backed, white needle); gauge internals untouched.
- **VesselTile resize: two buttons → one state-aware toggle (round 54)**: the
  separate collapse + expand corner buttons are now a single top-right button
  that shows the expand affordance when collapsed/default and the collapse
  affordance when expanded. Control-count change only — same resize behavior,
  keyboard +/- keep the full mini↔standard↔expanded range, auto-promotion stays
  off (round 26). Does NOT resolve **⚖ #14** (chevron vs micro-meter reveal
  affordance) — that style debate is unrelated and stays open.
- **⚖ #14 RESOLVED — meter strip is the sole expand affordance (round 61)**:
  the chevron and reveal-style affordance options are dropped as artifacts. The
  micro-meter strip wins. Reasoning: **a meter strip carries affordance AND
  information; a chevron carries only affordance.** The `revealStyle` dev toggle
  is removed; `RevealZone` keeps a plain silent chevron for inspector reveals
  (the meter belonged to the tile, not that primitive). The strip now **meters
  efficiency-deviation magnitude** (fill ∝ |Δ|, ±20% full scale) and tints with
  status color **only when alert-backed** (value-tinted-only-when-alert-backed,
  same anatomy as the gauges); nominal vessels show a neutral greyscale fill.
  The strip is never purely decorative — it always carries the deviation read.
- **⚖ Severity placement RESOLVED to STRIP (round 66)** — edge/both retired, the
  dev toggle removed. Severity now expresses through the **meter strip + name
  tint + value tint**; the tile carries **no severity outline at all**. The
  round-37 perimeter status border is **removed** from the tile (removal, NOT
  recolored to a white/neutral stroke — that would be a non-severity outline on
  every tile, violating outlines-reserved-for-severity; the card edge is
  borderless, fill only). The round-57/63 name-divider `status.line` is **removed**
  — the round-63 fill-STEP seam separates header from body alone (delta widened to
  `#2b2b2b` header over `#181818` body so it reads without the line; body stays
  #181818 to keep the borderless tile contrasting against the page). Reasoning:
  border + name + strip triple-encoded the same signal; the strip carries the
  deviation it's metering, so severity color sits on its own substantiating
  quantity. **Unmissability gate RE-VERIFIED on the 15-tile board (demo seed):
  PASS** — scanning cold, Meridian out-reads the 14 nominal tiles by a clear
  margin via gold name + gold value + a wide gold strip (|+7.6%| ≈ 38% fill); no
  border needed (`docs/screens/r66-gate-board.png`). The strip stays the sole
  expand affordance and meters deviation unchanged (round 61).
- **Severity placement (edge / strip / both) — UNDER EVALUATION (round 61), no
  verdict** *(superseded by round 66 above)*: a dev toggle moves WHERE the alert color renders. EDGE (current):
  status.line edge carries severity, strip neutral/data-only. STRIP: color on
  the strip, edge neutral. BOTH: redundant signal on both. **Color placement is
  the only variable** — the strip meters deviation in all three states, and the
  status semantics (what counts as CAUTION/alerted) are untouched. The gate is
  **unmissability**: an alerted tile must out-read across a 15-tile board in
  every state; if STRIP-only (the thinner surface) lets a CAUTION tile hide,
  that is a failure of the state, flagged in PROGRESS, not a preference. Nominal
  shows no color anywhere in any state (the automotive nominal affirmation lives
  on the trend ✓, ruling unaffected).
- **VesselTile layout matched to the Figma mock (round 63)**: header gets
  generous air; primary value carries its category glyph (calendar) centered
  above it; the footer is two-column (endurance glyph + hours LEFT, clock glyph +
  now-% RIGHT, glyph-above-value, even baseline) replacing the old right-stacked
  rows; the sparkline docks full-width in its own fill region. Glyphs sized to the
  mock (calendar 26 / wave 24 / clock 22, up from ~13) and **neutral-inked**
  (white UI ink, not the dim placeholder grey) — glyphs are not status carriers
  here. **Two mock properties deliberately NOT replicated, by ruling:**
  - **Rounded corners → NOT replicated.** RADIUS stays 1px (round 36 sharp-corners
    holds; not defensible to overturn for one mock).
  - **Divider / frame strokes → converted to filled-surface separation.** The
    header/body seam and the sparkline frame are rendered as borderless fill-STEPS
    (header + spark bands step one surface value lighter than the body), never
    drawn lines — outlines-reserved-for-severity (round 37) holds. The round-57/61
    `status.line` still rides the header/body seam as the severity edge (its
    behavior untouched).
  - **Principle:** Figma is the design authority for LAYOUT; standing rulings
    override individual mock choices that conflict with them.
- **VesselTile HEADER BAND removed — header separated by spacing alone (round
  70)**: the round-63 grey header fill-step is removed. The vessel name sits
  directly on the tile's base fill (no band, no container, no stroke);
  separation from the body is a generous vertical gap (whitespace), not a
  fill-step and not a divider line (outlines stay severity-reserved). Reasoning:
  the band read as functionless chrome and competed with the name for focus, and
  severity already lives on the name/value/strip (round 66), so the header needs
  no container — the tile now reads as one unified surface with content floating
  on it. **The SPARK fill band (round 63) is RETAINED** (it groups the 24h
  signature as a distinct data region). Name position/size (D-DIN)/tint
  unchanged; RADIUS stays 1px.


- DATA_MODEL.md v2 arrived during Session 3 as `DATA_MODEL_v2.md` and was
  promoted to `DATA_MODEL.md` (the spec-of-record filename all code and docs
  reference); v1 is preserved in git history.
- v2 §8 Level 2 "trend overlays" on engine cards: **built round 10**
  (2026-06-11) — daily-mean EGT, 30d, on each engine card's contextual layer.
  Demo step 3 material: Engine 2's line visibly climbs while Engine 1's stays
  flat.
