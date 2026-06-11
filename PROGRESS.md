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
