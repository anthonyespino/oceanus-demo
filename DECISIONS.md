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
  - **Wave FORM restored + texture made DENSE, dev sliders added (round 74)**: the
    round-67 over-smoothing had flattened the waves into a vertical fade, and the
    round-72 shimmer was too faint to register. Fixed: slower depth decay
    (exp −0.22) + a narrower depth floor (0.05→0.15) so the WAVES carry the read,
    with wave luminance amplitude/contrast now a uniform; the texture is denser
    (finer ~2px cells, threshold driven by a density uniform, brighter) and gated
    to the wave crests so texture and form REINFORCE (surface detail on moving
    water). Texture is ON by default now (textured water is the intended look; the
    toggle still turns it off). **Dev sliders added** (`D` panel) for wave
    amplitude, texture density, texture brightness — pixel-level tuning on the
    running build without a new round each time. Reduced-motion now freezes a
    TEXTURED still (the canvas paints one mid-motion frame showing wave form +
    texture, not a flat gradient still) — fixed a context-loss bug by remounting a
    fresh canvas per mode (key). Held: greyscale, round-50 binding, severity
    dominance (Meridian gold still dominates), expert-off/toggle-off. Perf:
    sustained ~120 fps on the board with texture on (gate 60), no reduction needed.
  - **Third treatment — PARTICLE FIELD added behind a mode selector (round 75)**:
    a dev-panel WATER MODE picker (gradient | particle) — selectable, not a
    replacement, so the gradient modes stay for comparison. The particle field is
    an ENTIRELY different rendering model: the wave is built from DISCRETE marks
    (points + short line segments) sampled on a screen-space lattice; marks AMASS
    on the crests (present-probability rises with crest) and are DISPLACED upward
    by the wave, so the form is emergent from the field of marks, not a luminance
    fade — reading as measured/sampled water. Motion is the marks shifting. A 3×3
    cell neighborhood search draws marks/lines that cross cell borders. Greyscale,
    dataset-bound (u_amp/u_freq), reuses the round-74 sliders (amplitude/density/
    brightness). Reasoning: a sampled-point field reads as MEASURED sensor data
    rather than a painted surface, strengthening the "instrument reports the calm"
    thesis. Severity dominance held (Meridian gold). Perf: GPU-only fragment field
    (no per-node DOM/SVG, no per-frame allocation); sustained ~70 fps on the board
    (gate 60) — headroom above the floor; density tunable via the slider.
  - **Fourth treatment — DOT MATRIX added (round 76)**: a regular receding lattice
    of small WHITE dots. The lattice placement is FIXED; the WAVE is the vertical
    DISPLACEMENT of the dots (crests push them up + brighter, troughs settle), so
    the pattern emerges from the grid deforming, not from dot placement.
    Perspective recession — larger/sparser dots in the foreground, smaller/denser
    toward the back — but NO horizon line and NO sky: the lattice dissolves into
    haze at the top (depth, not seascape — same rule as the gradient). White/low-
    opacity = a faint MEASURED lattice, kept SUBORDINATE (severity out-reads;
    deliberately quieter than the blue reference). Wave FREQUENCY is bound to the
    fleet/vessel delta (u_freq, round 50) — more delta = different cadence
    rippling through the grid; greyscale, so the data shows in motion not colour.
    Dev sliders reused + dot-size / dot-spacing controls added. Reasoning: a
    regular sampled lattice reads as the sea being measured at fixed points — the
    strongest expression of "the instrument reports the calm," the waves literally
    displacing the samples. Perf: GPU-only (neighbor-searched rows, no per-node
    DOM), sustained ~71 fps on the board (gate 60); density tunable via sliders.
  - **DOT MATRIX REBUILT — dense fine lattice + per-dot MAGNIFICATION (round 77)**:
    the round-76 lattice was too sparse to register, so it is rebuilt (not a fifth
    mode — replaces it). Much denser and finer (small dots, dense rows). The
    PRIMARY wave cue is now per-dot MAGNIFICATION: as a crest passes, dots there
    SWELL and BRIGHTEN; trough dots settle small and dim — the wave reads as a
    travelling swell of enlarged brighter dots through a fine measured field
    (light + depth moving across sampled points). Displacement is secondary.
    Recession / haze / no-horizon kept. Computed entirely in-shader (radius +
    brightness per dot), single-cell lookup → **O(1) per pixel, so density is FREE
    and fps is density-independent: sustained ~120 fps** (gate 60). New `magnify`
    slider + density/size; greyscale, white/subtle (magnified crest dots are the
    brightest points but stay below severity — Meridian gold re-confirmed),
    frequency still delta-bound. Reduced-motion freezes the lattice mid-wave.
  - **DOT FLOW FIELD — supersedes the dot-matrix as the dot-based water (round 77,
    2nd pass)**: the displaced lattice still read as too sparse/static, so it is
    rebuilt into a FLOW FIELD per the envato reference (colour stripped to white).
    Dots CONCENTRATE on the wave crests — brightness + size pack onto the ridge
    (`ridge = pow(crest, 1 + flow·9)`), so the crests read as bright dense flowing
    lines of dots and troughs go dark/sparse; as the wave drifts the ridges travel
    (the flow). Magnification on the crest is kept on top. **Defaults retuned to be
    VISIBLE on load** (the prior near-zero brightness / too-sparse density shipped
    invisible): dense lattice (72 rows, fine columns), fine dots (1.4), magnify 1.0,
    ridge-sharpness 0.5, with a ×4 in-shader brightness boost so the shared
    brightness slider reads as bright ridges here. Folded into the SAME picker slot
    (relabeled "dot flow"); the picker is gradient / particle / dot flow — NOT a
    sixth mode. New `flow/ridge` sharpness slider exposed (+ density / size /
    magnify / brightness). Recession / haze / no-horizon kept; greyscale only;
    frequency+amplitude delta-bound; single-cell O(1) → density FREE, ~120 fps;
    severity re-confirmed dominant (thin bright ridges stay below Meridian's gold).
  - **PARTICLE FIELD mark-shape bug fixed (round 77)**: the round-75 mark was a
    point + short line that tiled into a directional chevron/fish read. Replaced
    with a simple round dot (neutral points only, no directional/symbolic shape).
  - **Water defaults PERSISTED globally (round 80)**: Anthony's tuned baseline,
    initialized in FleetProvider (which sits above the router) so every fresh page
    load — FleetView and VesselInspector alike — comes up identical: WATER MODE
    gradient · TEXTURE on · WAVE AMP 0.08 · TEX DENS 0.00 · TEX BRIGHT 0.25 ·
    DENSITY 120 · DOT SIZE 0.50 · FLOW/RIDGE 1.00 · MAGNIFY 2.50. The round-50
    dataset binding (amp/freq from |fleet mean delta| / single-vessel delta) still
    modulates dynamically ON TOP of these — verified live and per-scope (FleetView
    amp 0.46/freq 1.12, VesselInspector v01 amp 1.17/freq 1.34), NOT frozen.
    Particle and dot-flow modes are RETAINED (round 78, which would have cut them,
    never landed — git goes 77 → 79, no round-78 commit/brief; their sliders are
    persisted alongside per Anthony's provided values).
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
- **GLOBAL top status bar established — all pages (round 79)**: the AppHeader is
  now the one system-state line, present on FleetView AND VesselInspector at the
  app level. Left→right: wordmark + **DATALINK + LAST SYNC** (data-health) ·
  **CAUTION · ADVISORY** counts (consequence, still clickable DetailChips → alert
  popover) · **global master clock**. This **reverses the round-73 split** (the
  ambient-at-bottom data-health footer) and pulls the per-page status strips
  (CommandBand top/bottom, FleetHealthBand) into one place — reasoning: a global
  system-state bar above all vessel content supersedes scattered/ambient
  placements; one line answers "is the feed trustworthy / is anything wrong /
  what time is it" everywhere.
  - **Global UTC master clock added** — a real Zulu wall clock (system time),
    top-right, identical on every page, IBM Plex Mono / neutral ink. DISTINCT
    from the per-vessel mission clock (T−/ON STATION/IN PORT), which STAYS in the
    CommandBand center stack.
  - **DATALINK breath, substantiation-bound** — the DATALINK indicator pulses (a
    slow opacity heartbeat = presence = alive) ONLY when the link is LIVE/FRESH;
    when DEGRADED/STALE it goes still/flagged (absence of breath IS the signal).
    Bound to actual datalink state, never decorative; reduced-motion freezes it.
    The demo seed is DEGRADED, so it correctly does NOT breathe (verified: zero
    breath elements in the seed).
- **CommandBand composition pass (round 79)**: the round-73 top alerts strip and
  bottom data-health footer are REMOVED from the band (now in the global bar).
  The flanking **gauges are ENLARGED** (96 → 116px) and the clusters pulled
  inward (gutter 44 → 30) — same dead-air fix as round 53 but this time the
  consequence-bearing instruments GROW (size tracks importance); three-mass
  balance + even gutters held. The **wave glyph is greyed to MATCH the wind
  glyph** (it's a drawn filled glyph, visually heavier than the stroked wind
  placeholder, so it drops to ink/muted to read at the same dim context weight —
  color-match only, size held). Gauge internals/anatomy/tint logic and the
  severity treatments are unchanged; the mission clock stays in the center stack.
- **CommandBand reordered + voyage bar to greyscale progress (round 81)**:
  - **Vertical order below the instruments**: instrument row (round 79) → ETA line
    (centered) → voyage profile bar (full-width) → vessel spec line (centered,
    bottom). ETA (`{destination} ◇ ETA {timestamp}`) and spec (`240 ft OSV · 49 nm
    from Venice, LA · 12.1 kn`) are reference/context — neutral, dimmed (ink/muted),
    context-scale, NO tint/weight/alert (no alert logic fires on them). The
    absolute ETA moved off the voyage bar's destination onto its own line. Each
    register gets its own spacing; ETA + spec centered, bar full-width.
  - **Voyage bar blue REMOVED** — the accent-blue fill carried no assigned meaning,
    and an interpreted colour with no meaning isn't defensible. Replaced with a
    greyscale progress convention: **WHITE = distance covered** (behind the marker),
    **GREY = distance remaining** (ahead) — standard progress read, no legend. The
    split is bound to ACTUAL voyage progress (the same `frac` / "6% · 333 NM TO GO"
    data), not a fixed visual. The vessel marker (white outline) is kept as the
    position indicator with a dark drop-shadow halo so it reads clearly at the
    white/grey boundary. **Navy stays chart-water only**; blue may return to the
    bar only if it first earns a meaning (future possibility, not built).
- **Voyage bar context → ENDPOINT-ANCHORED columns (round 82)**: the round-81
  centered ETA + spec lines are restructured so detail sits UNDER the endpoint it
  describes. **Origin column** (left-aligned under the origin label): vessel spec
  (`240 ft OSV`) + speed (`12.1 kn`). **Destination column** (right-aligned under
  the destination label): `◇ ETA {timestamp}` + `{nm} NM TO GO` (distance
  remaining). They read as two corners of information bracketing the route.
  **Redundant location text removed** — each place name appears ONCE as its
  endpoint label (the repeated "Galveston, TX" on the ETA line and any repeated
  origin name are dropped). The **current-position reference** (`49 nm from
  Venice, LA` — nearest port to where the vessel is NOW, a third landmark
  belonging to neither endpoint) moves to a small label floating with the
  **vessel marker** on the bar. Reasoning: detail sits under the endpoint it
  describes; position context anchors to the position marker. All reference/
  context — neutral, dimmed, context-scale, no tint/weight/alert. The voyage bar
  itself (round 81 white/grey, marker, no blue) is unchanged.
- **Voyage bar: collapsible endpoints + progress % + type unify + wave-glyph
  re-fix (round 83)**:
  - **Collapsible endpoint detail** — the endpoint LABEL (+ a small chevron
    affordance) is the toggle: click expands its column (origin → spec/speed,
    destination → ETA/NM-to-go). **Collapsed by default**, origin/destination
    independent, **click-only** (hover ruling: hover points, click asks; the
    chevron makes it read clickable without hovering). Collapsed still shows
    labels + bar + marker + Venice label + progress %; only the detail columns hide.
  - **Progress %** (e.g. `6%`) added as a label anchored ABOVE the vessel marker,
    bound to the real `frac` (same source as the white/grey split).
  - **Context type unified** to the wind/waves register (font/data 15) — origin
    detail, destination detail, Venice label, progress %, endpoint labels. NOT
    changed: vessel NAME (display), gauge values (data hero), mission clock.
  - **Wave glyph greyed — root cause finally found**: the rounds-79/81 greying
    never took because the imported glyphs hardcode `fill="white"` (a named colour)
    and the importer's normalize only converted HEX → `currentColor`, so the white
    survived and the glyph ignored the `color` prop. Fixed the normalizer to map
    ANY non-`none` fill/stroke → `currentColor`; regenerated `glyphs.generated.ts`;
    the wave (passed ink/muted) now renders dim grey, matching the wind glyph
    (confirmed on a 4× pixel crop). Greyscale/no-blue intact.
- **UNIFIED FIVE-TIER TYPE SCALE — single CSS-token source (round 86)**: the
  documented type scale. ONE source of truth: the `--type-*` CSS custom properties
  in globals.css. **probeTokens `TYPE` (name/hero/meta/micro = 21/15/12/11) is
  DELETED** and `--type-hero-size`/`--type-data-size`/`--type-micro-size` removed,
  so nothing anchors off a second numeric system (grep-confirmed: no component
  reads a type size from probeTokens). The five tiers (base 13, ~1.2 ratio):
  - `--type-display: 24` (D-DIN 700) — vessel name, page titles.
  - `--type-hero: 20` (Plex 500) — gauge values + big data numbers (Stat, tile
    trend, EGT gap). **DISPLAY/HERO collision resolved**: name 24 out-ranks gauge
    values 20 (was both anchored to the shared 30 — that anchor is gone).
  - `--type-primary: 16` (Plex) — mission clock + the few elements between hero
    and context.
  - `--type-context: 13` (Plex/UI) — ALL reference text: master/place/wind-waves/
    endpoint labels/progress %/Venice/ETA/spec/**fleet tile footer values**/panel
    + popover text. **CONTEXT collapsed 11–15 → 13** (the round-83 leftover: tile
    footer was stranded at 14 while CommandBand context went to 15 — both now 13;
    progress %/destination now context-size, the standing "too big" complaint solved).
  - `--type-micro: 10` (Plex) — gauge ticks, axis labels (collapsed 8–11 → 10),
    with `--type-micro-floor: 8` used ONLY for the single smallest EngineTwin label.
  - **Section-header label treatment kept SEPARATE** (`gb.label` = 11px Plex Mono,
    all-caps letterspaced) — it's a labeling style, not a tier size. Unchanged.
  - **Mono/UI optical**: defined `--type-context-mono: 12.5` for the case where
    Plex (mono) reads larger than UI at equal px. On render the single 13 read at
    equal rank for both families (most context is Plex, and the few UI elements —
    e.g. FleetRail names at 13 — matched), so I LANDED on a single `--type-context`
    (13) for both; the 12.5 mono token is defined and available if a future round
    wants the split. Reported.
  - **Orphans**: the 16px automotive "✓" is the one intentional decorative
    exception (kept, documented); vestigial `TYPE.name` (21, never rendered raw)
    deleted; document base `body` font-size repointed from a hardcoded 14 to
    `var(--type-context)`. Every component migrated to tokens; the only remaining
    hardcoded size is that ✓ checkmark (plus the computed responsive "GULF OF
    MEXICO" furniture label, intentionally left). No element on the old 30.
- **Position track distinguishes HISTORY from PROJECTION (round 87)**: the
  recorded trail and any forward path were one dashed style, so the historical
  course bend misread as the vessel "returning" from open water. Now:
  - **Recorded history** (behind the marker) = SOLID, confident, higher-opacity
    line (ink/secondary). It is real data and may legitimately bend (OSV courses
    divert around weather/traffic/lease blocks/holds) — NOT smoothed or
    straightened. A bending recorded track is correct/substantiated.
  - **Forward projection** (ahead of the marker) = DIM, sparse-dashed, FADING
    (opacity gradient to nothing) — reads as an estimate, not a fact. **Bounded by
    REAL heading + speed**: a ~3h extrapolation along `heading_deg` at
    `speed_over_ground_kn`, so it's speed-scaled and short — a moored/holding
    vessel (≈0 kn) projects nothing (verified: Meridian/transit draws it,
    Frigate Bird/on-station does not). No confident long forward line (no-fake-
    forecasts); length is data-bounded, not a fixed visual.
  - The **marker is the legible past/future boundary** (solid history terminates
    at it; dim projection begins at it, heading-forward). Greyscale throughout
    (history + projection neutral grey, projection dimmer); the marker keeps its
    alerted-gold (substantiated severity). The other plot dots are real
    other-vessel positions (`ghosts` from the fleet), not artifacts — left as-is.
- **Position chart geometry artifact fixed (round 84)**: the dark filled wedge
  spiking to a sharp V at ~89°W/29°N (at the Meridian marker, in open water) was
  the **coastline polygon** (`LAND`, src/data/coast) — specifically the
  **Mississippi-delta "bird's-foot"** approximation (`…[-89.2,29.12],
  [-88.95,28.95],[-89.25,29.35]…`), a coarse zigzag that renders as a sharp filled
  spike. Root cause is a **data approximation rendered correctly**, not a render
  bug: fine at the full-Gulf FleetMap zoom, but at the InspectorChart's ~2–3°
  zoomed extent (centred on the vessel) the crude delta dominates and reads as
  fake. The `LAND` geometry is **shared** with the schedule's land-avoidance + the
  verify harness, so changing it would alter the deterministic fleet/seed — not
  allowed. **Fix (render-scope, substantiation ruling "better no coastline than a
  fake one"):** the InspectorChart omits the landmass (`land={false}`); the
  FleetMap keeps the full-Gulf coastline. Geometry untouched (verify still PASSES
  → schedule/seed intact). The position chart now shows only substantiated
  geometry (water, graticule, compass, scale, marker, real track). Verified on the
  demo seed (Meridian) + a spot-check (Frigate Bird) — spike gone, not seed-specific.
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

- **DEV DECISIONS (pending Anthony) — ROUND 88 UI polish batch (10 items)**.
  Each holds the standing rulings (greyscale + earned color, severity unmissable,
  no orphan type sizes, maximize/minimize = click, chart/FOLLOW = hover control
  affordance not data-reveal):
  1. **OCEANUS FLEET wordmark** reverted from DISPLAY to PRIMARY tier
     (`--type-primary` 16, font/display 700, letter-spacing 2). The wordmark is
     identity chrome, not a hero datum — DISPLAY is reserved for the largest
     in-view value. No new orphan size (reuses PRIMARY).
  2. **Global status cluster** (DATALINK + LAST SYNC + CAUTION·ADVISORY) moved
     out of the AppHeader to a CENTERED row below the fleet-plot map and directly
     above the vessel thumbcards, promoted to PRIMARY (`StatusHeader prominent`:
     font 16, weight 600, glyphs 12→15). CAUTION·ADVISORY remain clickable
     DetailChips. The **round-79 DATALINK breath binding survived the move** —
     `.datalink-breath` applies only when `datalink === 'FRESH'`; verified 0
     breath elements in the DEGRADED demo seed (static, correct).
  3. **Redundant location/section headers** ("FLEET PLOT — GULF OF MEXICO",
     "PORT CALLS — 72H") gated to the Learn (L) hover layer (`learnOn`) — hidden
     by default, the map watermark + the +72H axis/chips self-identify those
     regions. The **"TREND BOARD — ranked by sustained deviation" subtitle is
     KEPT visible** (it explains the consequence sort, not a redundant locator).
  4. **Fleet chart-band maximize button** shows on HOVER only (`chartHot`) — a
     control affordance, consistent with the hover ruling (which governs data
     reveal; controls may also hide until hover so they don't sit as persistent
     chrome). Click still toggles the transient 240↔520 resize.
  5. **Zulu master clock** promoted to HERO (`--type-hero` 20, weight 600) — the
     shore-side time reference is a first-class readout, not chrome.
  6. **Port-call timeline right-edge bleed FIXED**: late-arrival chips near +72H
     were left-anchored with `minWidth:96`, overflowing the grid. Fix: when a
     chip's ETA position is within ~100px of the right edge, RIGHT-anchor it at
     its ETA so it grows leftward and stays inside the lane. Verified: 0 chips
     overflow their lane right edge.
  7. **Trip summary bar**: the two round-83 endpoint chevrons collapsed into ONE
     maximize/minimize button (same affordance as the chart expand), default
     collapsed; click reveals BOTH endpoint detail columns. **%/destination
     overlap FIXED**: near 100% progress the `%` and current-position labels are
     anchored at the marker and collided with the destination text; now when
     `frac > 0.82` the marker labels FLIP to the left of the marker. Verified at
     the seed's transit fractions 6% / 48% / 86% (95/100% don't occur in the
     fixed DEMO_EPOCH seed; 86% exercises the flip).
  8. **FOLLOW control** changed from the "⌖ FOLLOW" text button to a
     bullseye/crosshair library Glyph (neutral ink, `ink/secondary`); function +
     state unchanged (rendered only when panned off-follow, click re-centers).
  9. **Fuel-twin (VesselSynoptic) type audit** — collapsed onto the unified
     scale: tank %/gph → `--type-context` (was 11), node labels/small marks →
     `--type-micro` (was 8/9/10), RECON OK → `--type-context` (keeps reconColor).
     Off-scale sizes removed; no orphan sizes remain.
  10. **ALERTS bar tightened** (VesselInspector): section vertical padding
      16→6px, alert lines pinned to `--type-context` with lineHeight 1.45. The
      substantive `[CAUTION] …` anomaly-evidence text is KEPT — only wasted
      vertical space was removed.

- **DEV DECISION (pending Anthony) — ROUND 89: IA SYSTEM established as a live,
  single-source instrument**. A single typed source of truth — `src/ia/ia-model.ts`
  — feeds TWO consumers with NO IA content duplicated in either:
  1. the **dedicated IA page** (`/ia`, rendered by `src/ia/IASystemMap.tsx`),
     reachable from a new D-panel **"IA / SYSTEM MAP"** section and navigable back
     to the live app ("← fleet board");
  2. **Learn-mode live annotations** — `Annotated` gained an optional `node` prop;
     a bound live element surfaces that node's what/why/ruling as a static callout
     read from the same source.
  - **Four layers modeled** in the source, plus a PROCESS layer:
    - **NODES** — component/data inventory (id · display name · naming-convention
      path · type tier · what · why · rulings-with-round-refs) covering VesselTile,
      Command Gauges, Meter Strip, Fleet Health Band, Fleet Plot, Engine Twin, Fuel
      Synoptic, Voyage Bar, Global Status Cluster, Calm Sea.
    - **HIERARCHY** — the four-level Display IA Index as a renderable tree
      (System → Fleet/Vessel/Ambient views → instruments → leaf, e.g. Meter Strip
      under Vessel Tile).
    - **PERSONAS** — primary shore-side fuel-monitoring engineer + secondary
      ops-manager and duty-watch, each with goal + what-they-monitor.
    - **JOURNEYS** — the anomaly-diagnosis (Meridian) walkthrough as an ordered
      step sequence, each step referencing the node(s) involved.
    - **PROCESS (rulings-with-receipts + tested-and-killed)** — consequence sort
      over ETA, the within-tier sort bug, severity-on-strip, borderless fills,
      substantiation, the type-system collapse, the Calm Sea cuts.
  - **Why an instrument, not a document**: the IA is live, single-source, and
    inspectable — change a node's description once and both the page and the Learn
    annotations update. The IA page itself obeys the standing rulings (greyscale,
    earned color, borderless fills, unified round-86 type scale) as a worked example.
  - **Scope (this round)**: STRUCTURE + CONTENT + BINDING only. No animations,
    hover choreography, connective lines, or reveal transitions — explicitly
    DEFERRED to keep the round shippable. Purely additive: the live demo path
    (FleetView / VesselInspector / Meridian seed / sort / gauges / alerts) is
    unchanged and renders identically with Learn OFF (verified: 0 IA callouts in
    the DOM with Learn off; 7 distinct nodes bound across both pages with Learn on).
    `src/ia/` is permanent (survives the strip-before-demo of `src/learn/`).

- **DEV DECISION (pending Anthony) — ROUND 90: FleetHealthBand descriptors →
  placeholder glyphs (Learn-exposed names); thumbcard rebalanced VALUE-FIRST**.
  - **FleetHealthBand descriptors → placeholder glyphs.** Every descriptor word
    (WATCH / NOMINAL / DEGRADED / 30D FLEET MEAN / FLEET BURN / ARRIVALS 24H /
    BUNKER) is replaced by a neutral placeholder library glyph, so the band reads
    glyph + value. The names + meanings are authored in the **shared ia-model**
    (`IA_BAND_DESCRIPTORS`, round 89's single source) — NOT a separate label
    store; default mode shows the glyph alone, **Learn mode surfaces the name**
    from the model (verified: descriptor words = 0 in default; all surface in
    Learn; names grep only to `ia-model.ts`). Glyphs are greyscale/neutral; the
    census **values keep their treatment** (WATCH count stays gold when >0).
    Placeholders from the drawing queue — Anthony refines which survive as glyphs
    vs revert to labels.
  - **Thumbcard rebalanced value-first.** On the board a card is a scannable
    summary and the **deviation is the subject** (it is what the consequence sort
    ranks by) — the inverse of the inspector, where the vessel IS the subject. So
    the deviation value is the card HERO (HERO 20, tint logic unchanged — gold
    when alert-backed) and the vessel NAME is demoted from DISPLAY 24 to **PRIMARY
    16** (a label, not a headline; status tint kept).
  - **Audit follow-up (the type audit missed this):** the card name sat at
    DISPLAY 24 — inspector register — while the fleet-mean value above it was HERO
    20, so the name out-shouted the mean and the two folds competed. Demoting the
    name to 16 resolves the proportional mismatch; the card row and the upper fold
    now read at one consistent summary register (murmur-then-shout → one system).
  - **Card glyphs unified.** calendar / wave / clock were 26 / 24 / 14 (the
    calendar oversized, competing with the value); all three now share ONE size
    (18). (Glyph px sizing is a separate dimension from the type scale — no type
    orphan introduced; sizes used remain tiers 16 + 20.)
  - **Severity re-confirmed (round 66 holds):** Meridian still pops — gold name
    (now PRIMARY, still tinted) + gold +7.6% value + gold meter strip. Demoting
    the name does NOT weaken severity; the strip + value tint carry it. Data,
    sort, meter strip, expand, and alert logic are all unchanged (verify PASSED).

- **DEV DECISION (pending Anthony) — ROUND 92: Learn-mode annotations
  ALWAYS-VISIBLE → HOVER-REVEALED (the round-89-deferred hover choreography)**.
  The round-89 IA callouts were always-on, so 15 VesselTiles stacked 15
  identical cards. Now Learn mode shows NO callouts by default (clean interface +
  the mode bar); hovering an annotated element reveals ONLY that element's
  callout, and moving away hides it. One card at a time.
  - **De-duplication** falls out of hover-gating (option (a)): only the hovered
    (innermost — `stopPropagation`) wrapper anchors, so identical node types never
    show at once — you learn what a VesselTile is by hovering any ONE; the other
    14 stay quiet. Verified: hover one tile = 1 callout; hover another = still 1.
  - **One card, not two**: a node-bound element shows the IA callout and the
    round-8 docent card yields; the round-35 LayerLens hover card also yields
    (new `iaHover` context flag) while an IA callout is open — click-to-copy-path
    still works. Cards are fixed-positioned with horizontal clamp + vertical flip
    so they never run off-screen; subtle ≤100ms opacity fade (`.learn-callout`),
    disabled under `prefers-reduced-motion`.
  - **Hover-to-TEACH is scoped to Learn mode and is NOT a violation of the
    operational "hover points, click asks" ruling** (logged intentional): that
    ruling governs DATA reveals in the LIVE interface, which is unchanged (Learn
    off renders identically — verified 0 callouts in the DOM). Learn mode is a
    separate docent layer where explain-on-hover is the expected convention; the
    mode bar's "hover anything" is now literally true. Operational hover (Learn
    off) still does nothing on its own.
  - **Source unchanged**: the Learn consumer's REVEAL behavior changed only; the
    shared ia-model content + binding (round 89) are untouched this round.

- **DEV DECISION (pending Anthony) — ROUND 94: Fleet Plot + FleetHealthBand
  FLOAT on the gradient; descriptors LABELS-in-default / GLYPHS-in-expert,
  centered**.
  - **Float**: the filled panel backgrounds (`gb.box` surface-raised) behind the
    Fleet Plot (FleetMap) and the FleetHealthBand are removed — both float
    directly on the Calm Sea gradient (the gradient shows through where the fills
    were). The Fleet Plot's own navy chart-water (the nautical instrument) stays;
    only the container fill goes.
  - **Section separators = hairline dividers**: the FleetHealthBand's regions
    (census · mean+trend · burn · arrivals) are separated by the cells' thin
    vertical hairlines (`--color-line-hairline`, rgba ink 0.12). **Logged
    exception**: a STRUCTURAL section-divider hairline is distinct from a severity
    OUTLINE — outlines stay severity-reserved on interactive/status elements;
    this is a section rule. (The two sections are stacked vertically and separated
    by whitespace; no line between them — a vertical line between stacked sections
    would be nonsensical, so the vertical hairlines are the within-band region
    dividers.)
  - **Descriptors — three states (resolves the round-52 open thread where default
    absorbed glyphs and blurred the modes)**:
    - DEFAULT → TEXT LABELS (WATCH / NOMINAL / 30D FLEET MEAN / FLEET BURN /
      ARRIVALS / BUNKER), legible as before the round-90 glyph swap.
    - EXPERT (E) → GLYPHS only (the round-90 placeholders), labels hidden. Expert
      reclaims its original definition: glyphs replace labels.
    - LEARN → text labels (base, same as default) PLUS the round-92 hover IA
      callout on the band node — the "hover explanations" state, unchanged.
    Names + glyphs both come from the shared ia-model (single source).
  - **Centered in both modes**: census label/glyph + value centered within each
    cell; mean/burn/arrivals descriptors centered too (`Stat` gained a `center`
    prop; column cells get `alignItems:center`). Fixes the arbitrary-looking
    left-aligned glyphs.
  - **Rulings held**: greyscale; WATCH census count stays gold when >0 (severity
    dominates against the now-visible gradient — re-confirmed); labels use their
    existing MICRO/CONTEXT tiers (no orphan). Data, sort, and alert logic
    unchanged (verify PASSED) — this is visual treatment + a mode assignment only.

- **Calm Sea now PERSISTS in Expert mode (round-46 Expert-off REVERSED) — round
  95**: round 46 turned the ambient gradient off in Expert (decoration the
  trained eye doesn't need). Round 94 changed its status: floating the Fleet Plot
  + FleetHealthBand directly on the gradient made the background STRUCTURAL (the
  surface sections float on it), not decoration. Stripping it in Expert left the
  sections on black, which reads broken. So Calm Sea now renders in BOTH default
  and Expert. The OTHER off-ramps are unchanged: the manual `ambientSea` toggle
  still turns it off, and `prefers-reduced-motion` still freezes it to a static
  still. Expert still strips what it should — labels→glyphs, docent affordances
  off — just not the background. (Reasoning: a ruling that was right when the
  background was decoration became wrong once the background became structure;
  reversed deliberately, not drift.)

- **DEV DECISION (pending Anthony) — Status cluster type under evaluation (round
  95)**: the round-88 prominent bump to PRIMARY 16 reads too big for some eyes.
  A dev toggle ('D' panel → "status type": A primary 16 / B context 13) lets the
  two tiers be compared on pixels (FleetProvider `clusterType`, default
  **PRIMARY 16**). Both options hold the bold weight (600) and the cluster's
  centered position above the cards; CAUTION·ADVISORY stay clickable DetailChips
  and the DATALINK breath binding is intact in both. Both are existing type tiers
  (no orphan). Verdict pending Anthony's pixels; then lock one and retire the
  toggle. (Greyscale + earned color held: DATALINK degraded-blue and CAUTION gold
  unchanged.)

- **DEV DECISION (pending Anthony) — ROUND 96: CommandBand header + voyage bar
  FLOAT (backgrounds removed)**. The filled panel backgrounds (`gb.box`
  surface-raised) behind the VesselCommandBand instrument row (gauges + center
  stack) and the voyage bar below it are removed — both float directly on the
  Calm Sea gradient, extending the round-94 float treatment across the inspector.
  The gradient is now the consistent connective surface across FleetView and
  VesselInspector. The existing thin horizontal seam divider between the
  instrument row and the voyage bar (the sticky row's `boxShadow 0 1px 0
  line-strong`) is RETAINED — structural separator (same job as the round-94
  section dividers), not severity. Sticky mechanics (round 32), padding, gauges,
  mission clock, voyage progress, and the maximize button are unchanged — visual
  treatment only. Legibility holds against the subtle gradient: HERO gauge values
  + DISPLAY name + arcs crisp, dimmed context (master, place, wind/waves, voyage
  labels, gauge captions) still readable; severity dominates (gold +13.7% EFF Δ +
  amber arc unmissable); voyage bar greyscale/no-blue (round 81) intact.

- **ROUND 97: CommandBand padding fixes + SURFACE GLASS dev toggle (attempt #5)**.
  - **Padding (applied regardless of glass)**: more top air above the vessel NAME
    (sticky paddingTop 16→24), and the horizontal seam divider gets air on BOTH
    sides — paddingBottom 16→20 on the instrument row (above the line) + voyage
    paddingTop 16→20 (below the line) — so the divider stops crowding the
    wind/waves readouts.
  - **DEV DECISION (pending Anthony) — SURFACE GLASS, glass attempt #5**: a 'D'-
    panel toggle (`surfaceGlass`, default OFF = plain float) applies a bounded
    glass treatment to the floating sections (CommandBand, voyage bar, Fleet Plot,
    FleetHealthBand). HARD bounds = instrument-glass, not SaaS: near-OPAQUE fill
    (rgba 24/0.82, reads SOLID) + a VERY subtle backdrop-blur(3px) so the gradient
    diffracts through as a faint cue; NO glow, NO bright edge, NO stroke
    (borderless-fills holds). **Severity stays SHARP** — backdrop-filter blurs
    only what is BEHIND the panel, never its content (verified EFF Δ +13.7% renders
    gold rgb(227,209,65) crisp under glass). **Sticky diffraction persists on
    scroll** (verified). **Performance**: 60fps floor HELD — glass-off ≈ glass-on
    (both ~120fps on the test display, no drop). Reduced-motion: glass blurs the
    static gradient still (AmbientSea already freezes), cheap.
  - **Justification for re-attempting glass (prior attempts cut as SaaS-tells)**:
    rounds 94/96 removed the panel backgrounds, leaving sections needing a surface
    cue; sticky diffraction reinforces the bridge-window metaphor. The toggle
    exists to test whether bounded glass reads as instrument-diffraction (keep) or
    consumer-SaaS (cut). **No verdict locked — judge on pixels.**

- **ROUND 98: dropped the "TREND BOARD" label + the "FLEET" scope glyph; kept the
  sort subtitle**. Both were redundant noise (we know it's the fleet trend board).
  Removed in DEFAULT and EXPERT: the FleetView page header "TREND BOARD" text +
  its Expert `chart.trend` glyph, and the FleetHealthBand "FLEET" scope label with
  its ship glyph (the top-left mode/scope indicator — noise in Expert too). KEPT
  "ranked by sustained deviation" as a quiet SUBTITLE (CONTEXT 13, ink-muted/
  dimmed, gb.label) in both modes — it is the one line that states the
  consequence-sort thesis on screen (the demo's opening beat), so it earns its
  place. The reclaimed space reflows cleanly: the subtitle sits where the header
  was; the band's header row now carries only the range toggle, right-aligned —
  no orphan gap. Label cleanup only — the sort behavior is unchanged; the subtitle
  uses an existing tier (no orphan).

- **ROUND 99: engine-twin bottom divider removed + glass FILL improved (cleaner
  greyscale frost)**.
  - **Engine-twin bottom divider gone**: the hairline `borderTop` above the
    EngineTwinPanel sensor cluster (ROW 3) is removed — separation by spacing
    alone, consistent with the round-94/96 divider cleanup (the engine-ROW
    hairlines are the row grammar, kept).
  - **Glass fill improved WITHIN greyscale (still dev toggle, default OFF —
    verdict pending)**: the round-97 fill (rgba 24/0.82 over blur 3px) read MUDDY
    (a flat grey smear: too much opacity over too little blur). Rebalanced for
    CLEAN FROST — opacity dropped + blur raised TOGETHER (now an 0.62→0.72
    greyscale vertical gradient over blur 8px) so the wave motion is softly
    PERCEPTIBLE through the glass instead of flattened to uniform grey. The subtle
    top-less-dark → bottom-darker internal gradient gives a hint of glass depth.
    Blur kept modest (8px) for perf + subtlety.
  - **"Apple lens" / color-light diffraction explicitly REJECTED** (logged): no
    chroma, no lens/chromatic effect, no light bloom, no bright edge — that
    direction introduces unearned color/light, violating earned-color +
    substantiation. Fill quality was improved within greyscale only.
  - **Hard constraints held**: reads as a solid frosted surface; NO glow/edge/
    stroke; severity stays SHARP (EFF Δ +13.7% gold rgb(227,209,65) crisp on top —
    backdrop-filter blurs only what's behind); sticky diffraction persists on
    scroll (mechanism unchanged); **60fps floor HELD** — glass-off ~121 vs
    glass-on ~122, no drop. Reduced-motion: frost over the frozen static gradient.

- **ROUND 100: ALERT ROUTING — alerts dock to the panel that substantiates them;
  a compact GENERAL area is the fallback; the standalone ALERTS box is removed**.
  Each alert routes by its `code` to the panel that shows its evidence
  (`ALERT_TARGET` map + `alertTarget()` in `src/data/alerts.ts`) — a generalizable
  RULE, not a demo one-off. The substantiated panel renders the alert docked to
  its header (`Collapse alerts` prop → compact `[LEVEL] message`, earned color,
  context tier, visible even when the panel is collapsed). The full-width ALERTS
  box is gone; its space is reclaimed.
  - **Routing (verified):** EGT_DIVERGENCE/OIL_PRESSURE → Engine Twins;
    EFF_DELTA → efficiency; ENDURANCE/FEEDER_LOW/TANK_LOW/RECONCILIATION/
    SENSOR_DISAGREE/BUNKER_SOON → fuel (synoptic); CREW_CHANGE → crew & log;
    STALE_DATA + any unmapped code → GENERAL.
  - **Substantiation guard (logged):** an alert docks ONLY to a panel that
    genuinely shows its evidence. Datalink/staleness/weather have NO evidence
    panel → they go GENERAL; forcing them onto a loosely-related panel would imply
    a relationship the data doesn't support. The GENERAL area renders ONLY when
    there are general alerts (compact ~70px, not a big box) — no empty container.
  - **Generalized across scenarios (verified):** DEMO (EGT→twins, EFF→efficiency);
    MULTI-CASUALTY (v04 EGT→twins, v01 EFF→efficiency, v02 FEEDER→fuel — each
    vessel's alerts route independently); DATALINK BLACKOUT (STALE_DATA advisories
    → general; the synthetic scenario now raises the advisory so the general path
    is exercised); ALL NOMINAL (no alerts → zero docked alerts AND no general area,
    no empty boxes anywhere).
  - **Severity intact:** docked `[CAUTION]` keeps gold (earned color), reads
    clearly — Meridian's two alerts dock to Engine Twins + efficiency and remain
    unmissable. Type scale held (context tier); greyscale; no new boxes/strokes.

- **ROUND 101: removed the bottom divider STROKE on the glass CommandBand — glass
  edge + gap separate instead**. The instrument row carried a drawn seam at its
  base (`boxShadow 0 1px 0 line-strong`, the round-96 seam to the voyage bar). A
  drawn line at a glass edge contradicts the glass material and the borderless-
  float principle — frosted surfaces end at their edge, they don't carry a stroke.
  Removed: the instrument row is now its own floating block (full radius); a small
  GAP (marginBottom 8) separates it from the voyage bar, so the gap + glass-edge/
  diffraction do the separating, not a stroke (verified: sticky `boxShadow: none`).
  - **Scope:** this targets STRUCTURAL/decorative divider strokes at glass edges,
    NOT severity. Severity OUTLINES (status borders, gauge bands, value tints)
    remain the one earned stroke exception — untouched (gold EFF Δ + amber arc
    still sharp on the glass). The FleetHealthBand internal cell hairlines
    (`borderLeft`, round 94) are vertical REGION separators within the band, not a
    glass-edge bottom stroke — left as the round-94 structural separators. The
    inspector's other panels (Position, Engine Twins, Fuel, Crew) are filled
    `gb.box` cards, not glass; the engine-twin internal divider was already removed
    in round 99. Glass immersion preserved; borderless-float enforced.

- **ROUND 102 PART A — VESSEL MODE SET (audit, documented)**:
  - **Modes (4):** `TRANSIT`, `STATION`, `STANDBY`, `PORT` — the `Mode` type in
    `src/data/types.ts`. (No moored/anchored/off variants; PORT covers moored/
    alongside, STATION is DP/on-station, STANDBY is holding.)
  - **Single source:** each 1-min sample carries `mode` (REPORTED via the §3.4
    status feed); `derived.mode = now.mode` (latest sample, `src/data/derived.ts`).
    Every mode indicator reads this one value.
  - **Glyphs (`MODE_GLYPH`, `src/components/Glyph.tsx`):** TRANSIT → `route`,
    STATION → `crosshair`, STANDBY → `clock`, PORT → `anchor`.
  - **Indicators all AGREE (one source):** the FleetRail row glyph
    (`MODE_GLYPH[derived.mode]`), the CommandBand mode chip
    (`MODE_GLYPH[derived.mode]`), and the mission clock prefix (`now.mode` →
    T−/UNDERWAY · ON STATION · IN PORT · STANDBY) all derive from the same mode
    value. No divergence. (The voyage profile line phrases PORT as "MOORED" — a
    label wording on the same underlying mode, not a separate mode.)

- **ROUND 102 PART B — mode glyph added to the thumbcard (above the name)**:
  reuses the EXACT rail `MODE_GLYPH` map and the same single source
  (`vessel.derived.mode`), so card and rail can never disagree (verified: all 15
  seed vessels match). Treatment: ink/muted, rail scale (15px), context register —
  a quiet STATE label, greyscale (mode is state, not severity). Card vertical
  order is now: mode glyph → vessel name → calendar glyph → deviation value →
  footer (endurance / now); header top padding trimmed so the added row doesn't
  crowd. Learn/`title` exposes the mode name (matches the rail's approach). Severity
  undiluted — the glyph is neutral grey while Meridian's name + value stay gold
  (mode glyph `rgb(117,117,117)` vs gold `rgb(227,209,65)`); sort/severity/alerts
  unchanged.

- **ROUND 103: wave/endurance glyph COLLISION fixed (substantiation)**. Wave
  height (`weather.wave_height_ft`) and endurance (fuel-time hours) were both
  using `glyph.wave` — a false association Learn mode caught (two unrelated
  quantities sharing one symbol). Separated:
  - **wave height → `glyph.wave`** (the literal wave — honest; CommandBand
    wind/waves line + WeatherPanel). The round-79 weather stale-tint stays HERE
    (it's weather data) and the round-99 wave-greyed-to-match-wind holds.
  - **endurance → `glyph.fuel-drop`** (a fuel droplet; VesselTile endurance slot).
    `fuel-drop` already exists with a placeholder path (round-48 fallback) → the
    slot resolves to the placeholder until Anthony draws/scrapes the final art; not
    blocked on art. Endurance does NOT inherit the weather stale-tint (the tile
    endurance glyph has no stale logic — confirmed; inheriting it would be another
    false association, since endurance isn't weather data).
  - Grep-confirmed: no endurance slot resolves to `glyph.wave` anywhere; the two
    never share a glyph. Both greyscale/context, no severity color.
  - **ia-model updated** — new `IA_GLYPH_MEANING` (single source) gives the two
    slots distinct meanings (wave = sea state; fuel-drop = fuel endurance, not
    weather), consumed via each live element's Learn `title` so the meanings read
    distinctly. (The CommandBand endurance is a Gauge with a text label — no glyph
    — so it had no collision; the only shared-glyph site was the tile.)

- **ROUND 104: now/baseline glyph CLOCK → PULSE-LIVE (substantiation)**. The tile
  `now.glyph` (current efficiency-vs-baseline reading, paired with the 30-day
  calendar) used `glyph.clock` — a clock falsely implies time-of-day or duration,
  but the value is the LIVE current reading, not a time. Replaced with a new
  `glyph.pulse` (an ECG-like live-indicator mark; placeholder path until Anthony
  draws/scrapes `glyph.pulse.svg`, round-48 fallback — not blocked on art).
  - **Clock freed from the now slot** (grep-confirmed: the slot points at
    `glyph.pulse`). The clock is RETAINED where it's legitimately a clock — the
    STANDBY mode glyph (`MODE_GLYPH.STANDBY`) and the text mission/master clocks —
    those are untouched; this round only removed it from the misleading now slot.
  - **Calendar (30d span) + pulse (now/instant) now read as an honest timeframe
    PAIR** — the same efficiency metric over two timeframes, span vs instant. Both
    context register, greyscale, consistent scale, sitting together on the card.
  - **ia-model updated** (`IA_GLYPH_MEANING`): calendar = "30-day sustained trend
    (the span)", pulse = "current live reading, now (the instant)" — distinct, made
    explicit, consumed via Learn `title`. Only the GLYPH changed; the value's tint
    logic is separate and unchanged (no severity color on the glyph).

- **ROUND 105: sort thesis → Learn-mode docent (inline with the status bar) +
  status-bar type dropped a tier**.
  - **"ranked by sustained deviation" removed from DEFAULT** — it was a permanent
    header block for a one-line explanation. It now appears ONLY in Learn mode,
    INLINE with the global status bar below the map, as a docent layer; the text
    is single-sourced in ia-model (`IA_SORT_THESIS`, consistent with how Learn
    surfaces other meanings). Default top-fold is tighter; the FleetHealthBand owns
    the top, no orphan gap. (The sort BEHAVIOR is unchanged — this is the on-screen
    explanation, not the comparator.)
  - **Status bar type dropped one tier** — the DATALINK / LAST SYNC /
    CAUTION·ADVISORY cluster default went PRIMARY 16 → **CONTEXT 13** (the
    round-95 `clusterType` default flipped to `context`; the dev toggle remains).
    It reads as a quiet status line now; bold weight (600) kept for legibility at
    13. CAUTION·ADVISORY stays clickable + gold; DATALINK keeps its degraded-state
    blue + breath binding. No orphan (existing tier).
  - **Fleet plot position UNCHANGED** (the prior plan's reorder was scrapped) —
    only the subtitle relocation + status-bar type change happened.

- **ROUND 106: CommandBand voyage-detail CHEVRON removed → default-visible /
  expert-hidden**. The round-88 maximize/minimize toggle on the voyage bar (a)
  overlapped the destination label (layout bug — the button sat at the grid's
  top-right, crowding "Galveston, TX") and (b) gated SECONDARY CONTEXT behind a
  click (off-model — chevron-collapse affordances were removed elsewhere this
  session). Removed entirely.
  - **Gated content (reported):** the endpoint DETAIL columns — origin
    `{length_ft} ft {class}` (spec) + `{sog} kn` (speed), destination `◇ ETA` +
    `{nm} NM TO GO`. Confirmed SECONDARY CONTEXT (not severity, not a primary
    value) — the primary voyage info (origin/destination labels, progress %,
    marker, position reference) always shows. So default-visible / expert-hidden
    is correct: now shown by default (no click), hidden in EXPERT (`!expertOn`)
    for density — matching the mode model (default complete, Expert stripped).
  - **Overlap fixed:** with the chevron gone, the detail lays out inline under
    each endpoint label with clean spacing — no button crowding the destination.
  - **Scope:** the separate whole-band MINIMIZE chevron (collapses the entire
    CommandBand via `collapsedPanels`) is a different affordance — it gates the
    primary instruments, not secondary context, so it is NOT the chevron the brief
    described and is retained. Severity untouched (this is context info).

- **ROUND 108: STARTUP DEFAULTS LOCKED + dev-panel cleanup + datalink green STRUCK
  (amendment).** The app now comes up DEMO-READY on a fresh load with no manual
  setup; the dev panel shed most of its toggles and reorganized into collapsible
  sections.
  - **Locked startup defaults (FleetProvider):** SimClock LIVE + 60x ON; Surface
    Glass ON; Status type CONTEXT (13); Color B quiet (automotive OFF); Motion
    Breathe; State Marks ON; Ambient Sea ON; Auto-2x ON (legacy) — *but Expert
    forces auto-2x OFF (officer sizes) regardless*; Bearing BRG ray; Rail Mode
    mode-glyph; Density standard; Texture ON. (Live ticks still advance 1-min
    steps from the pinned DEMO_EPOCH — determinism + verify untouched.)
  - **Removed entirely (toggle + underlying option/styling):** ripple sliders;
    IKB band + IKB fill (the FleetHealthBand accent fill is gone — no IKB renders
    anywhere); water-mode selector + the ENTIRE water-styling control group (mode,
    wave amp, tex dens/bright, flow/ridge, magnify, dot size, density) + the dev
    water readout — Anthony's tuned values are BAKED as constants in `AmbientSea`
    (gradient; waveAmp 0.08, texDens 0.0, texBright 0.25, dotSize 0.5, dotSpace 120,
    mag 2.5, flow 1.0), byte-identical to the prior startup defaults (look
    unchanged); the ripple MOTION option (+ its orphaned `.probe-ripple` CSS).
  - **Removed toggle, value locked (state retained, consumed elsewhere):** surface
    glass (glass is the decided top-bar treatment, locked ON); state marks (ON);
    ambient sea (ON); status A/B (locked CONTEXT 13).
  - **Kept toggles (startup value locked, toggle still usable):** color
    (automotive A / quiet B), motion (off / breathe), density, bearing, rail mode,
    auto 2x.
  - **Dev panel → collapsible chevron sections** (minimized by default): scenario /
    ia / mode / clock / color·motion / layout. This is the DEV/SETTINGS TOOL, which
    may use chevrons/accordions — the no-chevron ruling governs the OPERATOR-FACING
    product UI only, which stays chevron-free.
  - **DATALINK — NO GREEN (amendment D, revised).** The original brief proposed
    green for a live datalink signal; the amendment STRUCK it. No green was added.
    Datalink live/degraded is carried by BREATH/motion only — FRESH breathes
    (`.datalink-breath`) + grey ink; DEGRADED/STALE goes still + advisory-blue
    (round 79). Presence is the indicator, absence is silence. No code change
    needed (datalink never used green). **Confirmed green renders NOWHERE on the
    demo path** (automated greenish-pixel scan = 0 hits). **Earned-color rule stays
    STRICT: color = severity only, no exceptions.**
    - The green token `--color-data-nominal` (#3fb950) is NOT removed: it renders
      ONLY inside the KEPT Automotive treatment (ruling 14 — green-nominal
      canonical), which is an alternate, not the demo path. In the locked default
      (quiet / automotive-off), nominal uses neutral grey — so the presentation
      build shows zero green. Ruling 14 is binding and the Automotive toggle is
      explicitly kept, so the automotive green-nominal convention is preserved
      rather than silently deviated from.
  - **Guardrails verified:** severity/gold untouched; baked water/texture identical
    to prior look; demo path comes up correct with no toggling; Expert auto-2x off.
    TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 109: CENSUS TREND — confirmed source + mode-aware labeling.**
  - **Part A — confirmed (read from source).** The census-strip trend LINE plots
    the **fleet-wide MEAN efficiency delta vs each vessel's mode baseline**
    (`fleetDailyTrend()` averages every vessel's daily `efficiency_delta` per day;
    the band draws a 7-day rolling mean of it over the toggleable `range`, default
    90d). The headline value (+0.3%) is the **30-day mean** of the same daily fleet
    delta. A **zero reference line already existed** (line ~170) plus a p10–p90
    envelope. Source: `derived.daily_delta_1y` → efficiency_delta vs mode_baseline
    (§4). This is exactly the "me-problem vs everybody-problem" read.
  - **Part B — same element, different explanation per operator expertise (the
    three-mode principle applied to one component):**
    - **Default (minimal anchor):** "0" label on the zero reference line + a span
      label (the line's window, e.g. "90D") at the chart corner. Greyscale, micro
      tier. Direction is legible (above the labeled zero = worse / over-burn). NOT a
      full chart: no Y-axis ticks, no X time ticks — still a glance strip.
    - **Expert (bare):** both labels stripped (`!expertOn`); the zero line + envelope
      stay exactly as before. The trained operator knows what the fleet-mean strip
      is (consistent with round 107's competence assumption). No label leak.
    - **Learn (full meaning):** the chart is bound to a new ia-model node
      `fleet-trend`; hover reveals the full explanation (metric, zero-read, span,
      units, the me-vs-everybody logic) from the single source.
  - **Substantiation fix:** the trend was visually unanchored (zero line present but
    unlabeled); it is now read against a *labeled* zero + an explicit span, so it
    can't mislead as a free-floating wiggle.
  - **Holds:** greyscale (zero line + labels neutral, no color); earned-color
    untouched (no green; value tint logic unchanged — value stays neutral); type
    scale at micro; no clutter in default/expert; demo path intact.
    TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 110: SCENARIOS REARCHITECTED — three selectable whole-fleet states.**
  - **Part A (audit):** a scenario library already existed; the carry-through bug's
    root cause is that overlays patched only `alerts`/`derived` while the inspector
    computes panels from raw `history.minutes` + history envelopes — so synthetic
    cautions fell back to seed telemetry and only Meridian (the seed anomaly) was
    coherent end-to-end. Vessels chosen (Anthony): S2 = Marlin Ridge (v03), S3 =
    Osprey Point (v14) — each already in the right mode with the right seed
    telemetry, minimizing the override surface and coherence risk.
  - **Part B:** `SCENARIOS` reduced to three; the D-panel scenario section is a
    labeled **1/2/3** selector (one active, default S1). Each scenario is a clean
    single-outlier board + carry-through inspector for its lone caution vessel.
    - **S1 — Meridian (mechanical, hero):** identity/unchanged. The demo path.
    - **S2 — Marlin Ridge (fuel/endurance → logistics):** engines clean, efficiency
      normal, tanks drawn down, endurance tight (52h) with **endurance = fuel ÷ burn
      coherent by construction** (recomputed from the drawn-down tanks ÷ real transit
      burn). ENDURANCE caution → fuel panel → logistics.
    - **S3 — Osprey Point (station-keeping → environment):** mode STATION, engines
      clean, sea state elevated (8 ft / 24 kn — already roughest in seed), burn
      elevated for station (118 gph), efficiency Δ +10.2% vs station baseline
      (trend/sparkline lifted to match), endurance recomputed from the raised burn.
      EFF_DELTA caution → efficiency panel → environment.
  - **THE FIX (carry-through):** scenarios now override the caution vessel's latest
    `history.minutes` sample (`setNow`: engines/tanks/weather) + the derived trend
    series, so the inspector's computed panels (engine-twin, fuel/endurance,
    efficiency, weather) read coherently — not just the summary numbers.
  - **No stale bleed:** `apply` is a pure transform over the immutable base fleet
    (clones only); switching any direction fully reloads. Verified: re-applying S1
    after S2/S3 yields byte-identical bystanders; v03 tanks return to the seed value
    (no drawdown residue). The `clean()` helper was strengthened so non-caution
    bystanders carry no lingering trend/twin-gap (e.g. Meridian shows no +7.6% / +58°F
    when it is not the active caution).
  - **Known limitation (logged, off the demo path):** a *bystander* anomaly vessel's
    deep 30D EGT-gap HISTORY chart (reads 30 days of `history.hourly`) is not
    rewritten — only v01, only as a bystander, only if clicked; its
    headline/verdict/gauges read clean. Rewriting 30d of hourly per scenario was
    disproportionate for an off-path bystander. Follow-up round if full scrub wanted.
  - **Holds:** earned color (gold caution only, NO green, no new colors); severity
    unmissable; substantiation (no impossible number combos — endurance math + weather
    coherent); consequence sort (caution #1); type scale; greyscale; presence/absence
    datalink. Demo-path safe (S1 default, unchanged hero).
    TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 111: bug fixes + density.** (a) D-key toggle restored — the round-108
  DevPanel rewrite had dropped the keydown handler (no collision with Learn's E/L).
  (b) Bearing toggle now works in FleetView too (was inspector-only — bug): the Fleet
  Plot draws a dashed BRG ray from each underway/TRANSIT vessel to its next port,
  clipped at the chart edge (same style as the inspector ray; no per-ray label —
  markers carry names; "voyage card only" = no rays). (c) Rail Mode startup default →
  Transit Stroke (toggle kept) — sets the round-108 rail default. (d) Density MINIMAL
  now meaningfully shrinks the board: grid min-column 210→150 + gap 20→10, and
  VesselTile mini steps the name + hero value down one tier and trims padding/glyph —
  more vessels per screen, standard unchanged, severity (meter strip + status tint)
  untouched. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 107: EXPERT aggressive strip (Level 1).** Rule: Expert removes what a trained
  operator already knows, keeps what the data provides.
  - **Stripped in Expert:** section headers ENTIRELY (`Label` → null — supersedes round
    44's glyph-only header; strips inner panel headers AND Collapse minimized headers,
    panels reflow up into the reclaimed space); gauge captions (already, round 44 —
    scales/range markings KEPT); verbose alert phrasing → essential (`essentialAlert()`
    keeps the value-bearing head + drops the trailing " — " advice/context prose;
    severity tag + color untouched); descriptive/context prose in the CommandBand (the
    STATION/PORT spec line, the "next call ETA" appendage, the transit position
    reference).
  - **Kept in Expert:** all values + instruments + gauge SCALES + severity (never
    stripped) + glyphs; census labels stay glyphs (round 94); Calm Sea persists (round
    95). Reflows DENSE, not Default-with-holes.
  - **Judgment call (logged):** the position panel's "X nm from {port}" Collapse summary
    is KEPT — by the governing rule a live position fix is DATA, not chrome — while the
    *redundant* copy on the CommandBand spec line is stripped (position lives in the
    position panel). Easy to strip everywhere if Anthony prefers.
  - **Default + Learn UNCHANGED.** **Level 2** (reducing gauge scales/ticks toward bare
    faces) is HELD, not built — only if L1 proves insufficient.
  - Earned color / severity / type scale / greyscale all held; demo path intact.
    TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 112: current + environmental cluster, expert/chevron cleanup, Learn
  z-index, inspector rhythm.**
  - **Current (Part A):** already a real, substantiated field (`WeatherSample.current_kn`
    /`current_dir_deg`, time-addressable noise, consumed in DP load). Elevated through
    the S3 override (Osprey Point 2.4 kn @ 18°) so wind + waves + current all corroborate
    the rough-conditions diagnosis. Flows through the round-110 scenario system with no
    stale bleed (S1→S3→S1 verified).
  - **Environmental cluster (Part B):** the command band shows wind / waves / current
    (three distinct glyphs — added `glyph.current`, a directional flow mark, distinct
    from wind + wave per glyph-honesty). DEFAULT exposed · EXPERT hidden · LEARN explains
    each via `IA_GLYPH_MEANING` (wind = air, waves = sea-surface height, current = water
    movement + set — explicit vocabulary distinction). `weather.current` disposition
    CONTEXTUAL→VISIBLE. The broken reveal chevron is removed (shown or stripped, never
    click-to-hide — same ruling as round 106). Current speed+direction = one value.
  - **Chevrons + expert headers (Part C):** killed the EfficiencyPanel reveal chevron
    (content default-show / expert-hide) and — for guardrail-11 consistency (no chevrons
    in product UI) — also the VesselSynoptic (fuel) reveal chevron. All three reveal
    chevrons across the inspector are now gone. All inspector panel header TEXT is hidden
    in Expert (all five panels route through `Label`, → null in Expert via round 107;
    reconciled, no double-impl).
  - **Learn z-index (Part D):** Learn IA/docent cards (`position:fixed`) were trapped by
    `backdrop-filter` glass panels (which are containing blocks + stacking contexts for
    fixed descendants) — the trip-summary "renders behind the panel" bug. Fixed by
    portaling the cards to `document.body` (escapes all ancestor stacking contexts);
    fixed/viewport coords keep placement. Universal — covers every section.
  - **Inspector rhythm (added):** one token `--pad-stack: 16px` governs every inter-panel
    gap (replaced scattered hardcoded `marginBottom:8`) — uniform vertical rhythm in
    Default + Expert. Spacing only.
  - **Top-edge bleed (added):** confirmed REAL but not a stacking bug — the sticky command
    band's frosted glass (~0.62–0.72 alpha) transmitted scrolled content through it. Fixed
    by making the STICKY band's fill near-opaque (0.97–0.985) while keeping the blur/radius
    glass aesthetic; non-sticky floating sections keep the lighter frost.
  - **Holds:** substantiation (current coherent, corroborates wind/waves); earned color
    (no green/new color); severity untouched + glance-readable both modes; glyph honesty;
    type scale; greyscale; no product-UI chevrons. S1 unchanged; demo path intact.
    TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 113: Fleet Health Band census — one confirmed-clear model.** Every census
  count (degraded / watch-caution / nominal / bunker flags) now ALWAYS renders its
  number, including at ZERO — a zero is a white/neutral *confirmed-clear* reading, not
  hidden. Supersedes the round-45 presence rule that hid degraded/watch at zero (the
  caution count was invisible at zero — the bug). Removed the presence filter; all tiers
  render.
  - **Earned color, preserved precisely:** `censusColor` returns neutral/white when
    `counts[cls] === 0`, and the severity color ONLY when ≥1 (watch = gold, degraded =
    red; nominal = neutral in quiet / green in automotive). The white-zero gate is
    `counts[cls] === 0` alone, so it never strips color from a genuine non-zero count —
    a real caution still reads gold. Bunker: white at zero, advisory tint only when ≥1.
  - **Default vs Expert (the round-107 strip rule):** Default shows the text label
    (DEGRADED / WATCH / NOMINAL, BUNKER FLAGS); Expert replaces the label with a glyph,
    and the NUMBER stays in both modes. Census glyphs are distinct (alert-triangle /
    gauge / vessel / tank — no collisions, glyph honesty).
  - **Note:** the literal watch = 0 case isn't reachable in the three demo scenarios
    (each is a single-outlier board with exactly one caution, round 110); the identical
    white-zero path is exercised by degraded = 0 in every scenario. Degraded was included
    in the always-show for consistency ("0 DEGRADED" = affirmative no-warnings); revert to
    presence-only is trivial if undesired.
  - Earned color / greyscale / type scale / glyph honesty / severity glance-readability
    all held. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 114: orphaned bearing, flat header strips, Expert re-audit.**
  - **Orphaned bearing:** the InspectorChart dashed BRG ray (bearing-to-next-call) is
    now TRANSIT-only — a moored/on-station/in-port vessel has no active voyage for it to
    describe (substantiation). Shows underway, hidden otherwise.
  - **Flat header/context strips:** new rule — **gradient (the sea) belongs only behind
    floating INSTRUMENT surfaces; header/CONTEXT strips are FLAT near-black.** The
    trip-summary voyage bar (a context strip) had the glass fill leaking the sea → now
    flat `--color-surface-base`. The global AppHeader (also bg-less, sea leaking) → flat
    too. Floating instruments (health band, fleet plot, sticky command band, inspector
    panels) keep their treatment.
  - **EXPERT PRINCIPLE (now the governing rule for the strip):** Expert strips
    ORIENTATION (labels / section headers / gauge captions / static spec lines — what a
    trained operator learned once and never re-reads), and KEEPS all LIVE SIGNAL (values,
    instruments, scales, severity, real-time conditions — the current state of the world
    right now). Test per element: already-known (strip) vs read-right-now (keep).
  - **Audit result + fix:** wind/waves/current VALUES were over-stripped in Expert (round
    112) — they are live signal (and the S3 diagnosis), so they now show in ALL modes
    (the cluster is glyph+value; the glyph is the orientation marker, no text label to
    strip). Full audit, each Expert strip tagged orientation / signal / restatement-of-
    kept-signal:
    - Orientation (correctly stripped): section headers, gauge captions, census + bunker
      text labels (→ glyph), vessel-class spec line.
    - Signal (kept): all gauge values + scales, severity (never stripped), tank levels,
      engine EGT/fuel, efficiency now-Δ/30d/envelope/24h, **wind/waves/current (fixed)**.
    - Restatement / secondary reference (text stripped, primary signal kept by a shown
      instrument — no signal hidden): position text (track+marker keep it), transit
      ETA/NM-TO-GO + non-transit next-call ETA (progress track/marker/% keep it),
      efficiency deep-history 90d/1y/baseline-range (historical reference; live-now kept),
      fuel capacity (static spec) + transfer status (tank levels carry the fuel signal).
    - No PRIMARY value/instrument/scale/severity/live-reading is stripped in Expert; the
      env cluster was the one genuine primary-signal hide.
  - **Flagged:** transit ETA/NM-TO-GO and fuel transfer-active are the closest borderline
    "reference vs signal" calls — kept-as-reference because the primary live state shows
    via a kept instrument; trivially restorable to Expert if Anthony rules them signal.
  - Severity never stripped; greyscale (no color added); glyph honesty; type scale;
    Default + Learn unchanged. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 115: rail mode → one permanent combined treatment.** The round-24 either/or
  experiment (mode glyph VS transit stroke) is resolved and the toggle removed. Permanent,
  baked behavior: every rail row ALWAYS shows its mode glyph (universal, from the single
  MODE_GLYPH source); TRANSIT vessels ADDITIONALLY get a subtle reinforcing accent — a thin
  2px neutral (ink/secondary) stroke in the left gutter — so underway vessels are marginally
  more glanceable. This is NOT the old full-border transit stroke (which competed with the
  selection border, the round-24 flagged collision); it's an inset accent that leaves the
  selection + severity borders untouched. Non-transit rows show the glyph only (presence
  reflects activity). Removed the D-panel Rail Mode row + the `RailMode` type / `railMode`
  state from FleetProvider (baked, like the round-108 locks). Holds: glyph honesty (mode
  from single source); greyscale (accent neutral, no color creep); severity reads cleanly
  over the accent (selection + caution tint unmuddied); type scale; consequence logic
  (transit marginally more presence). TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 116: voyage-bar ETA/NM-to-go reconciled with the round-114 signal ruling.**
  The round-114 audit ruled ETA + NM-to-go are SIGNAL (NM-to-go is the endurance-vs-
  distance figure the fuel persona reads; ETA is independent signal, not restated by the
  progress marker) — but the voyage bar still carried the round-106 `!expertOn` gate
  hiding them in Expert (decided-keep / built-strip / unreconciled). Confirmed strip-drift
  (not a seed gap): Default showed both, Expert showed neither. Fix: ETA + NM-to-go render
  in BOTH modes; Expert strips only the ORIENTATION labels, the VALUES stay — transit
  Expert shows "◇ {ETA}" + "{n} NM" (drop "ETA"/"TO GO"); non-transit keeps the next-call
  ETA value too ("· {port} ◇ {time}"). Origin spec/speed/position stay Expert-stripped
  (static spec / gauge-restatement). This makes the build obey the keep-live-signal rule
  at its most decision-relevant point. Default + Learn unchanged; severity/greyscale/type
  scale held. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 117: Learn vs IA-page conflation resolved — provenance to the builder
  surfaces, purpose to operator Learn; ia-model stays the single source.** IANode fields
  are consumer-routed into two categories: PURPOSE (what/why → operator Learn) and
  PROVENANCE (path/tier/rulings → IA page). No duplication — the two surfaces filter one
  model.
  - **LayerLens decoupled from operator Learn** → its own D-panel toggle (`layerLens`,
    default OFF, builder/handoff inspector). When off, no LAYER/TOKENS/BINDS overlay
    appears in ANY operator mode (incl. Learn); copy-to-Figma kept. The three operator
    modes stay exactly three — `layerLens` is a dev toggle, not a mode.
  - **Learn IA card → name + what + why only** (dropped path, tier, ruling — provenance,
    which the IA page already renders). Learn is purely operator-facing now.
  - **Operator-copy gaps filled:** calm-sea (no "WebGL" / no process history), voyage-bar
    (stale maximize-toggle ref → endpoint detail ETA/distance-to-go), engine-twin why
    ("causal-bucket filter" → "holds up after weather, route, and load are ruled out").
  - **Docent ANNOTATIONS pruned:** removed 13 orphaned entries whose Annotated name is no
    longer rendered (FleetTrend, AlertRail, NominalRow, VesselSitrep, VesselHeader,
    EfficiencyCurve, WeatherPanel, CrewPanel, EngineCard, TankSchematic, FlowReconciliation,
    ModeTimeline, EventLog); kept 11 live; refreshed FleetHealthBand off its stale alias.
  - Holds: single source (ia-model), three operator modes intact, Learn operator-only, IA
    page = provenance home (unchanged). TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 118: Engine-Twins hero tells the sustained-divergence story in every engine
  state.** The hero was the raw LIVE gap, which is 0°F when both mains are OFF → false
  "all clear" while the caution says +58. Fixed: the hero is now the SUSTAINED gap
  (`egt_twin_gap_f`, 24h-averaged), rendered in severity YELLOW when caution-level
  (`|gap| > EGT_GAP_CAUTION_F`) — the number the caution is about is now the loudest
  element, not the quietest. The live instantaneous gap is a DIM secondary with explicit
  timeframe ("live +61 °F · fuel +X% at matched load"), and when both mains are off it reads
  "live — · mains off" (the 0 attributed to mains-off, never the headline). The caution
  message conveys persistence — "…over twin at matched load, sustained 30d" — and the whole
  panel stays in the divergence-at-matched-load / trend register: NO "overheating" wording.
  Holds: earned color (yellow only on the sustained severity figure, no green); severity
  unmissable; substantiation (hero matches the caution; engines-off 0 ≠ resolution); Expert
  keeps the sustained value (signal). Demo path (Meridian, mains running) unchanged — still
  shows the live gap, now in the secondary, with +58 as the yellow hero.
  TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 119: EGT-gap trend chart guaranteed headroom (no top clip).** Finding: the
  GapTrend is mode-IDENTICAL (no `expertOn` branch; Default/Expert render byte-identical —
  verified) — there is no Expert-specific compression. The clip was the live 60x sim
  climbing Meridian's gap into a tight ceiling: `hi = ceil(max/10)*10` left ~0 headroom when
  the peak sat just under a ×10 tick, in BOTH modes. Fix: `hi = max(20, ceil((max+10)/10)*10)`
  — always keeps the peak ≥10°F below the upper bound, so the trend line (which is SIGNAL,
  the sustained-divergence evidence) renders fully with headroom at any data level. No data/
  line/color change; only the y-axis upper bound rounds a band higher to hold the headroom.
  Because the chart is shared, the fix applies to both modes — Default isn't regressed, it
  gains the same headroom (the intended legibility). TSC-OK · LINT-CLEAN · verify PASSED ·
  offline build OK.

- **ROUND 120: minimal presenter sim transport (reset + pause/resume) beside the master
  clock.** Replaces the "junky" full-page refresh as the way to reset drifting live data.
  A small, discreet greyscale cluster (two glyph buttons, no labels) sits LEFT of the
  top-right master clock — quiet utility that stays out of the demo's visual story and does
  not compete with the clock/instruments. **Pause/Resume** rides the existing `live` flag
  (D-panel live toggle stays in sync): pause freezes the sim clock so telemetry holds, resume
  continues; the glyph reflects state. **Reset** (`resetSim`) drops the live-advanced runtimes
  and re-snapshots the deterministic seed — identical to a fresh load but IN-PLACE: scenario,
  mode, dev settings, and the master wall clock preserved (no URL reload). This is presenter/
  dev tooling (an operator wouldn't pause a live fleet); the full D-panel sim controls (60x
  etc.) stay as-is — this is a minimal always-reachable subset. New glyphs pause/play/reset
  (neutral). No green, greyscale, earned-color held; master clock + scenario switcher
  undisturbed. Verified: pause froze 15:03Z, resume → 15:05Z, reset → 15:00Z seed + Meridian
  +58°F. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 121: efficiency envelope X-axis tightened — no dead axis space.** The
  EfficiencyCurve X-domain was built from envelope bins + the NOW point only, padded a wide
  `max(0.25, 18%)`, and excluded the optimal-speed bracket — leaving empty axis left/right and
  stranding the OPTIMAL bracket + NOW dot in the dead right region. Fix (domain calc ONLY): the
  X-domain now bounds ALL plotted X-elements (envelope, optimal bracket, NOW point) with minimal
  padding (`max(0.08, 5%)`), so no stretch of axis is empty and the elements sit within the plot,
  connected to the band. Reworked WITHIN the panel's existing visual language — styling, ticks,
  envelope fill, line weight, labels, Y-domain, and element placement are all untouched; it reads
  as the same designed panel, correctly proportioned. The change is X-only, so the NOW dot's
  vertical gap above the envelope (the +X% vs-envelope payoff, set by the separate Y-domain) is
  preserved. Earned color held (yellow only on NOW/vs-envelope; no green); data/envelope/meaning
  unchanged. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 122: Pause freezes the master Zulu clock too — total sim freeze.** The top-right
  Zulu clock was a real system wall clock (kept ticking through Pause). It is now SIMULATION
  time — driven by `simTime` — so the whole imagined world's wall clock pauses, resumes, and
  resets with the sim. Conceptually Pause stops the entire simulated world, its wall-time
  included; Resume continues from the frozen moment (never jumps to real current time); Reset
  snaps it to the seed (DEMO_EPOCH). Implemented by sourcing the clock from `simTime` (derived
  from the fleet, which already pauses on `!live` and resets via `resetSim`) — no new state.
  Reads to the minute (sim advances 1-min ticks). Verified: PAUSE froze it 10s, RESUME → next
  sim minute, RESET → 15:00Z. No data/severity/color change; greyscale; scenario switcher +
  reset undisturbed. TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.

- **ROUND 123: fuel-twin hull compaction — data fills the frame.** The synoptic hull was
  oversized illustration (a giant SUPERSTRUCTURE block + dead bow space eating the left third;
  data crammed right). Compacted to a light contextual outline hugging dense data: viewBox
  720×300 → 720×190 (~36% shorter), pointed bow + rounded stern with fore/aft + port/starboard
  preserved, SUPERSTRUCTURE reduced to a small "SUPER" marker forward (full word in a `<title>`),
  and tanks/feeders/meter/engines repositioned to fill x≈148–605 with OSV-sensible proportions
  (storage dominant, gens+mains aft). Contained to `VB`/`HULL_PATH`/`SUPER_PATH`/`GEOM` + the
  three hardcoded label positions — the renderer reads only these, so all data/labels/treatment
  are unchanged; reads as the same designed panel, correctly proportioned. REORDER HELD: the dot
  matrices stay below the schematic (the above-vs-below decision comes after seeing the compacted
  result). Information-over-decoration (hull earns only its spatial-context space); earned color
  (E2 yellow where alert-named, no green); type scale; greyscale; panel consistency.
  TSC-OK · LINT-CLEAN · verify PASSED · offline build OK.
