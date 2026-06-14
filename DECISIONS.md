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
