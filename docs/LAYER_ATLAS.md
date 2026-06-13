# LAYER ATLAS

**Auto-generated on every build from the `layer()` instrumentation — do not edit.**
Per component: the layer tree with tokens + bindings, exactly as the learn-mode
hover cards report. Naming: `Component / region(camelCase) / role.kind`;
kinds: text · line · shape · chart · glyph · chip · status. Click any element
in learn mode (L) to copy its layer path for the Figma layer-name field.

## CrewLogPanel

*source: src/components/CrewLogPanel.tsx*

- `header / header.glyph`
  - TOKENS — section header · crew glyph · glyph-only in expert mode
  - BINDS — CREW & LOG
- `log / entry.text`
  - TOKENS — font/data 12 terminal grammar · alert lines tint by level (advisory muted, A6)
  - BINDS — {stamp · type · text} newest first
- `log / filter.chip`
  - TOKENS — chip — accent when active (interaction voice)
  - BINDS — {event type visibility toggle}
- `log / modeStrip.chart`
  - TOKENS — MODE_COLOR segments · line/subtle dividers — recent memory, same family as the log (round 30)
  - BINDS — {24h minute modes → segments}
- `roster / name.text`
  - TOKENS — font/ui 13
  - BINDS — {crew.name}
- `roster / role.text`
  - TOKENS — font/ui 13
  - BINDS — {crew.role}
- `roster / since.text`
  - TOKENS — font/data 12 · ink/muted — collapses to one footer when whole crew rotated together (round 19)
  - BINDS — {crew.onboard_since shared date + days}

## EfficiencyCurve

*source: src/components/EfficiencyCurve.tsx*

- `plot / delta.text`
  - TOKENS — font/data 10 · status tint (earned) — labeled: speed-specific, distinct from vs-baseline
  - BINDS — {live gal/nm / envelope median − 1} vs envelope
- `plot / drop.line`
  - TOKENS — ink/muted dashed — degradation as geometry
  - BINDS — {live point → envelope median at same speed}
- `plot / envelope.shape`
  - TOKENS — surface/overlay fill — 12-mo IQR band
  - BINDS — {transit envelope p25→p75 by speed bin}
- `plot / median.line`
  - TOKENS — ink/secondary 1.25px
  - BINDS — {envelope median by speed bin}
- `plot / now.dot`
  - TOKENS — accent ring (identity) · status fill when watch/degraded (status outranks accent)
  - BINDS — {live gal/nm @ speed_over_ground}

## EfficiencyPanel

*source: src/components/EfficiencyPanel.tsx*

- `charts / envelope.chart`
  - TOKENS — IQR band surface/overlay · median ink/secondary · live point accent ring
  - BINDS — {1y transit envelope: gal/nm vs kn} — speed-specific comparison
- `charts / trend30.chart`
  - TOKENS — ink/secondary line · zero axis · fills cell
  - BINDS — {daily_delta_1y[-30d]}
- `footer / baseline.text`
  - TOKENS — font/data 12 · ink/secondary
  - BINDS — {derived.baseline_value} {baseline_metric}
- `footer / spark24.chart`
  - TOKENS — ink/secondary 1px · line/subtle frame
  - BINDS — {derived.sparkline_24h — hourly efficiency_delta}
- `header / header.glyph`
  - TOKENS — section header · chart.efficiency (curve motif) · glyph-only in expert mode
  - BINDS — EFFICIENCY · {mode}
- `heroRow / baselineDelta.text`
  - TOKENS — Stat: micro-caps label · type/hero numeral tabular
  - BINDS — {derived.efficiency_delta_pct} vs mode_baseline — mode-wide comparison
- `heroRow / trend30.text`
  - TOKENS — Stat: micro-caps label · type/hero numeral tabular
  - BINDS — {derived.trend_30d} %/30d — the primary fleet signal (ruling 13)

## EngineTwinPanel

*source: src/components/EngineTwinPanel.tsx*

- `gapTrend / area.chart`
  - TOKENS — fill/level area · ink/secondary line · zero line · y floors ±20°F (calm-not-empty)
  - BINDS — {daily mean E2−E1 EGT, 30d, both running} — the "three weeks early" graphic
- `header / header.glyph`
  - TOKENS — section header · engine glyph · glyph-only in expert mode
  - BINDS — ENGINE TWINS
- `rows / engine.text`
  - TOKENS — font/data 12 · id+role ink/muted left · state tabular right · hairline divider
  - BINDS — {id role · RUNNING load% fuel gph | OFF} — state/load/fuel live HERE only
- `verdict / avg.text`
  - TOKENS — font/data 11 · ink/secondary
  - BINDS — {derived.egt_twin_gap_f} — 24h avg at matched load
- `verdict / fuelDelta.text`
  - TOKENS — font/data 14
  - BINDS — {E2.fuel_rate / E1.fuel_rate − 1} at matched load
- `verdict / gap.text`
  - TOKENS — type/hero · font/data tabular — largest type in the section
  - BINDS — {E2.egt − E1.egt} now, both running
- `verdict / label.text`
  - TOKENS — gb.label micro-caps · ink/muted
  - BINDS — E2 VS E1 EGT (static)

## FleetHealthBand

*source: src/components/FleetHealthBand.tsx*

- `arrivals / bunker.text`
  - TOKENS — font/data 11 · advisory tint when >0, else ink/muted (advisory is informational, not severity)
  - BINDS — {# bunker-flagged calls in next 24h}
- `arrivals / value.text`
  - TOKENS — type/hero · font/data tabular · ink/primary · links to #port-calls
  - BINDS — {# port calls in next 24h}
- `burn / spark.chart`
  - TOKENS — ink/secondary 1px · auto-ranged (never approaches 0)
  - BINDS — {fleet total burn, 24h hourly}
- `burn / value.text`
  - TOKENS — type/hero · font/data tabular · ink/primary · gph (blue is water-only, never here)
  - BINDS — {sum of live fleet burn} gph
- `census / degraded.status`
  - TOKENS — STATUS_COLOR.degraded (red) · count · click filters board
  - BINDS — {# vessels degraded}
- `census / nominal.status`
  - TOKENS — green (automotive) | ink/secondary (quiet) · count · click filters board
  - BINDS — {# vessels nominal}
- `census / watch.status`
  - TOKENS — STATUS_COLOR.watch (amber) · count · click filters board
  - BINDS — {# vessels watch}
- `header / header.glyph`
  - TOKENS — section header · vessel glyph · glyph-only in expert mode
  - BINDS — FLEET
- `mean / trend.chart`
  - TOKENS — ink/secondary line · surface/overlay p10–p90 band · zero line — census and mean never separate (component rule)
  - BINDS — {rolling-mean daily fleet delta over range} + {p10/p90 envelope}
- `mean / value.text`
  - TOKENS — type/hero · font/data tabular · ink/primary (IKB fill behind dev toggle)
  - BINDS — {30d fleet mean delta %}

## FleetMap

*source: src/components/FleetMap.tsx*

- `header / header.glyph`
  - TOKENS — section header · chart.fleet (scatter motif) · glyph-only in expert mode
  - BINDS — FLEET PLOT — GULF OF MEXICO

## FleetRail

*source: src/components/FleetRail.tsx*

- `nav / back.glyph`
  - TOKENS — back link · glyph-only in expert mode
  - BINDS — → /
- `row / dot.status`
  - TOKENS — status color | ink/muted nominal (treatment B)
  - BINDS — {vesselStatus(alerts)}
- `row / mode.glyph`
  - TOKENS — MODE_GLYPH · ink/muted · learn/title = full mode name (round 43)
  - BINDS — {derived.mode}: TRANSIT | STATION | STANDBY | PORT
- `row / name.text`
  - TOKENS — font/ui 13 · status tint when alerted · 45% dim idle nominal (round 24 layers)
  - BINDS — {vessel.static.name}

## FleetView

*source: src/components/FleetView.tsx*

- `chartBand / maximize.glyph`
  - TOKENS — transient resize — grows the chart band, tiles hold + reflow down (one-elastic-element) · not persisted
  - BINDS — {chartMax} toggle
- `header / header.glyph`
  - TOKENS — page header · chart.trend (sorted-bars motif) · glyph-only in expert mode
  - BINDS — TREND BOARD — RANKED BY SUSTAINED DEVIATION

## Gauge

*source: src/components/Gauge.tsx*

- `dial / arc.line`
  - TOKENS — line/strong · 2.5×k
  - BINDS — {min→max, 270° sweep}
- `dial / band.line`
  - TOKENS — alert color — alert-backed ONLY (ruling 11)
  - BINDS — {band.from→band.to}
- `dial / hub.dot`
  - TOKENS — ink/primary
  - BINDS — —
- `dial / limit.line`
  - TOKENS — ink/secondary · neutral tick (ruling 11)
  - BINDS — {displayLimits[]}
- `dial / maxLabel.text`
  - TOKENS — font/data micro · ink/muted
  - BINDS — {minMaxLabels?.[1] ?? max}
- `dial / minLabel.text`
  - TOKENS — font/data micro · ink/muted
  - BINDS — {minMaxLabels?.[0] ?? min}
- `dial / needle.line`
  - TOKENS — ink/primary — ALWAYS (round 19, amends ruling 14)
  - BINDS — {value→angle(min,max)}
- `dial / tick.line`
  - TOKENS — ink/muted · 1px
  - BINDS — {25 / 50 / 75 %}
- `label / label.text`
  - TOKENS — font/data 9 caps letterspaced · ink/muted · hidden in expert mode
  - BINDS — {label}
- `readout / value.text`
  - TOKENS — font/data tabular · type/hero×k · earned color (ruling 14)
  - BINDS — {display ?? round(value)+unit}

## InspectorChart

*source: src/components/InspectorChart.tsx*

- `header / header.glyph`
  - TOKENS — section header · route glyph · glyph-only in expert mode
  - BINDS — POSITION

## InstrumentCluster

*source: src/components/InstrumentCluster.tsx*

- `cell / trace.chart`
  - TOKENS — fill/level area · ink/muted line · gauge-cell width · dims with dormant dial
  - BINDS — {selected engine sensor, 24h minutes → ~96 pts}
- `selector / engine.chip`
  - TOKENS — toggleStyle — accent when active (interaction voice)
  - BINDS — {engine index → cluster binding}

## NauticalChart

*source: src/components/NauticalChart.tsx*

- `base / land.shape`
  - TOKENS — chart/land fill · hairline coastline — ONE polygon shared with the generator + verify (round 23)
  - BINDS — {LAND polygon from src/data/coast.ts}
- `base / seaLabel.text`
  - TOKENS — font/ui letterspaced · near-water contrast — furniture, not data
  - BINDS — GULF OF MEXICO (static)
- `base / water.shape`
  - TOKENS — chart/water #0d1924 — the ONLY navy (round 23)
  - BINDS — {chart frame}
- `furniture / compass.glyph`
  - TOKENS — chart ink · ring + needle + N
  - BINDS — north-up (static)
- `furniture / scale.line`
  - TOKENS — chart ink · end + mid ticks
  - BINDS — {bar length adapts: 10–200 nm at mid-latitude}
- `graticule / meridian.line`
  - TOKENS — grid faint 0.5px · frame ticks · 9px labels
  - BINDS — {longitude grid at adaptive step}
- `graticule / parallel.line`
  - TOKENS — grid faint 0.5px · frame ticks · 9px labels
  - BINDS — {latitude grid at adaptive step}

## PortCallsTimeline

*source: src/components/PortCallsTimeline.tsx*

- `header / header.glyph`
  - TOKENS — section header · anchor glyph · glyph-only in expert mode
  - BINDS — PORT CALLS — 72H

## SettingsSheet

*source: src/components/DevPanel.tsx*

- `mode / mode.chip`
  - TOKENS — mode chip · default / learn (L) / expert (E) · mutually exclusive
  - BINDS — {ui mode}
- `scenario / scenario.chip`
  - TOKENS — scenario library chip · accent when active · synthetic overlay (demo = base seed)
  - BINDS — {scenario id} → applies overlay
- `sheet / settings.sheet`
  - TOKENS — gear-summoned settings sheet · SCENARIO / MODE / DEV sections
  - BINDS — —

## StatusHeader

*source: src/components/AlertSheet.tsx*

- `alerts / alertcount.chip`
  - TOKENS — counts in severity colors · click → alert sheet (round 33)
  - BINDS — {fleet alert counts by level}
- `alerts / line.text`
  - TOKENS — round-33 grammar: [LEVEL] tag = the one severity color · name accent link · message ink/secondary
  - BINDS — {alert.level · vessel.name → /vessel/id · alert.message}
- `datalink / datalink.chip`
  - TOKENS — font/data 11 · ink/secondary | advisory when degraded · click → stale-feed breakdown
  - BINDS — {stale stream census → FRESH | DEGRADED | STALE}
- `sync / lastsync.chip`
  - TOKENS — font/data 11 · ink/secondary · click → per-vessel sync ages
  - BINDS — {simTime − oldest stream timestamp}

## VesselCommandBand

*source: src/components/VesselCommandBand.tsx*

- `centerStack / anchor.glyph`
  - TOKENS — glyph/anchor slot (placeholder until scraped) · ink/secondary — prefixes the place
  - BINDS — place
- `centerStack / clock.text`
  - TOKENS — type/hero×0.6 · font/data tabular · mode-aware prefix (carries mode after the glyph removal, round 73) · white when still (ruling 14)
  - BINDS — {T−(eta−now) transit | ON STATION/IN PORT/STANDBY + elapsed} · countdown lives HERE only
- `centerStack / crew.glyph`
  - TOKENS — glyph/crew slot (placeholder until scraped) · ink/secondary — replaces the word "master"
  - BINDS — crew Master
- `centerStack / location.text`
  - TOKENS — font/data 12 · ink/secondary · place as value
  - BINDS — {destination | moored port | work site}
- `centerStack / master.name.text`
  - TOKENS — font/data 12 · ink/secondary · name as value (no label, no stroke)
  - BINDS — {crew Master.name}
- `centerStack / mode.glyph`
  - TOKENS — boxTight chip · line/strong · glyph 1.4x, text label dropped (round 43) · learn/title = full mode name
  - BINDS — {derived.mode}: TRANSIT | STATION | STANDBY | PORT
- `centerStack / name.text`
  - TOKENS — type/hero · font/display caps · ink/primary
  - BINDS — {vessel.static.name}
- `centerStack / waves.text`
  - TOKENS — font/data 15 tabular · glyph ink/secondary · stale tint when WX stale · own line (round 73)
  - BINDS — {weather.wave_height_ft} ft
- `centerStack / wind.text`
  - TOKENS — font/data 15 tabular · glyph ink/secondary · stale tint when WX stale · own line (round 73)
  - BINDS — {weather.wind_speed_kn} kn
- `factsLine / class.text`
  - TOKENS — font/data 12 · ink/muted
  - BINDS — {static.length_ft} ft {static.class}
- `factsLine / position.text`
  - TOKENS — font/data 12 · ink/secondary — relative reference, never raw lat/lon (ruling 6)
  - BINDS — {nm from nearest port | alongside}
- `factsLine / speed.text`
  - TOKENS — font/data 12 · ink/secondary
  - BINDS — {position.speed_over_ground_kn} kn
- `gaugeRail / burn.chart`
  - TOKENS — Gauge primitive · 96px
  - BINDS — {derived.burn_rate_gph} / max observed 1y
- `gaugeRail / effDelta.chart`
  - TOKENS — Gauge primitive · caution band ≥+8 (alert-backed)
  - BINDS — {derived.efficiency_delta_pct} vs mode baseline
- `gaugeRail / endurance.chart`
  - TOKENS — Gauge primitive · log dial · caution band <72h (alert-backed)
  - BINDS — {derived.endurance_hours}
- `gaugeRail / speed.chart`
  - TOKENS — Gauge primitive · 96px
  - BINDS — {position.speed_over_ground_kn} / max {cruise×1.35}
- `profile / destination.text`
  - TOKENS — font/data 11 · ink/primary
  - BINDS — {next_port_calls[0].port}
- `profile / eta.text`
  - TOKENS — font/data 11 · ink/muted
  - BINDS — {next_port_calls[0].eta} — absolute ETA + Z lives HERE only
- `profile / fill.line`
  - TOKENS — accent/primary 2px — interaction/identity voice, never severity
  - BINDS — {distance covered fraction}
- `profile / origin.text`
  - TOKENS — font/data 11 · ink/secondary
  - BINDS — {transit-run start: nearest port <5nm | nearest site}
- `profile / toGo.text`
  - TOKENS — font/data 10 · ink/muted · right-aligned
  - BINDS — {pct covered} · {nm to destination} — distance-to-go lives HERE only
- `profile / track.line`
  - TOKENS — surface/overlay 2px
  - BINDS — {origin→destination}
- `profile / vessel.glyph`
  - TOKENS — glyph/vesselMarker 16px · ink/primary — bow along the track (round 36)
  - BINDS — {live position on track}

## VesselInspector

*source: src/components/VesselInspector.tsx*

- `alerts / header.glyph`
  - TOKENS — section header · alert-triangle glyph · glyph-only in expert mode
  - BINDS — ALERTS

## VesselSynoptic

*source: src/components/VesselSynoptic.tsx*

- `callouts / label.text`
  - TOKENS — font/data 10 · ink/secondary — ST/FD/E annotation language
  - BINDS — {ST1 ST2 FD1 FD2 E1–E4}
- `callouts / leader.line`
  - TOKENS — line/strong 0.6px
  - BINDS — {node→label}
- `engines / node.shape`
  - TOKENS — running = filled · stopped = outline · status tint only when alert names the engine
  - BINDS — {engine.engine_id · running}
- `engines / value.text`
  - TOKENS — font/data 9
  - BINDS — {engine.load_pct}% | OFF
- `flow / engineLine.line`
  - TOKENS — line/strong 1.2px
  - BINDS — {flow meter→engine}
- `flow / feedLine.line`
  - TOKENS — line/strong 1.2px · dashed when no transfer
  - BINDS — {storage→feeder · tank.transfer_active}
- `flow / meterLine.line`
  - TOKENS — line/strong 1.2px
  - BINDS — {feeder→flow meter}
- `header / header.glyph`
  - TOKENS — section header · tank glyph · glyph-only in expert mode
  - BINDS — FUEL
- `hull / hull.line`
  - TOKENS — ink/secondary 1.5px — neutral, never status
  - BINDS — {HULL_PATH — Figma hull replaces 1:1}
- `hull / label.text`
  - TOKENS — font/data 9 · ink/muted
  - BINDS — SUPERSTRUCTURE (static)
- `hull / superstructure.shape`
  - TOKENS — surface/overlay fill · line/strong
  - BINDS — {SUPER_PATH}
- `meter / meter.shape`
  - TOKENS — surface/overlay · line/strong · 45° diamond
  - BINDS — flow meter node
- `meter / recon.chip`
  - TOKENS — border + text = recon severity (OK ink/secondary · advisory · watch)
  - BINDS — {reconciliation.status · error_pct}
- `meter / value.text`
  - TOKENS — font/data 11 · ink/primary
  - BINDS — {flow_gps × 3600} gph
- `tanks / FD1.gal.value.text`
  - TOKENS — font/data 12 tabular · ink/secondary · right-aligned subcolumn
  - BINDS — {FD1 level_gal} gal
- `tanks / FD1.pct.value.text`
  - TOKENS — font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint
  - BINDS — {FD1 level_pct}%
- `tanks / FD2.gal.value.text`
  - TOKENS — font/data 12 tabular · ink/secondary · right-aligned subcolumn
  - BINDS — {FD2 level_gal} gal
- `tanks / FD2.pct.value.text`
  - TOKENS — font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint
  - BINDS — {FD2 level_pct}%
- `tanks / fill.chart`
  - TOKENS — dot matrix 5×10 · ink/secondary | TANK_LOW tint (⚖9: dots won)
  - BINDS — {tank.level_pct → filled dots}
- `tanks / fill.shape`
  - TOKENS — fill/level · bottom-up vertical (round 20)
  - BINDS — {tank.level_pct}
- `tanks / label.text`
  - TOKENS — gb.label micro-caps · TANK_LOW tint (earned)
  - BINDS — {tank.tank_id} {tank.type}
- `tanks / ST1.gal.value.text`
  - TOKENS — font/data 12 tabular · ink/secondary · right-aligned subcolumn
  - BINDS — {ST1 level_gal} gal
- `tanks / ST1.pct.value.text`
  - TOKENS — font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint
  - BINDS — {ST1 level_pct}%
- `tanks / ST2.gal.value.text`
  - TOKENS — font/data 12 tabular · ink/secondary · right-aligned subcolumn
  - BINDS — {ST2 level_gal} gal
- `tanks / ST2.pct.value.text`
  - TOKENS — font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint
  - BINDS — {ST2 level_pct}%
- `tanks / tank.shape`
  - TOKENS — surface/base · line/strong | TANK_LOW tint (own alert only, round 20)
  - BINDS — {tank.tank_id}
- `tanks / value.text`
  - TOKENS — font/data 11 · ink/primary | tint
  - BINDS — {tank.level_pct}%

## VesselTile

*source: src/components/VesselTile.tsx*

- `alert.line`
  - TOKENS — tag = severity color · message ink/secondary (round 33 grammar) · 2x only
  - BINDS — {alerts[] level + message}
- `bg.shape`
  - TOKENS — surface/raised fill · BORDERLESS — no perimeter outline at all (round 66; the round-37 status border is removed, severity moves to the strip) · 45% dim when idle nominal
  - BINDS — {derived.mode}
- `body / trendChart.chart`
  - TOKENS — ink/secondary line · zero axis
  - BINDS — {daily_delta_1y[-30d]}
- `endurance.glyph`
  - TOKENS — glyph/wave (drawn) · NEUTRAL UI ink (round 63) · sized to the mock · identifies endurance
  - BINDS — endurance
- `endurance.value.text`
  - TOKENS — font/data 14 tabular · ink/primary · centered under its glyph (round 63)
  - BINDS — {derived.endurance_hours} h
- `footer / deviation.fill`
  - TOKENS — meters |efficiency Δ| (fill ∝ magnitude, ±20% full scale) · ink/muted fill | status color only when alert-backed + placement=strip/both · surface/overlay track · sole expand affordance
  - BINDS — {|derived.efficiency_delta_pct|}
- `name.text`
  - TOKENS — type/name · font/display caps · status tint when alerted (earned) · sits on the tile base fill, separated by spacing alone (round 70, header band removed)
  - BINDS — {vessel.static.name}
- `now.glyph`
  - TOKENS — glyph/clock (drawn) · NEUTRAL UI ink (round 63) · sized to the mock · identifies now-vs-baseline
  - BINDS — now vs mode baseline
- `now.value.text`
  - TOKENS — font/data 14 tabular · ink/primary · centered under its glyph (round 63)
  - BINDS — {derived.efficiency_delta_pct} vs mode baseline
- `spark.baseline.line`
  - TOKENS — line/subtle 1px · zero axis
  - BINDS — y = 0
- `spark.chart`
  - TOKENS — ink/secondary 1px polyline · the 24h signature
  - BINDS — {derived.sparkline_24h — hourly efficiency_delta}
- `spark.container`
  - TOKENS — full card width in its own lighter fill band (#2b2b2b, no stroke frame) — the 24h signature dock (round 39 / 63 / 66)
  - BINDS — —
- `trend.glyph`
  - TOKENS — glyph/calendar (drawn) · NEUTRAL UI ink — not a status carrier (round 63) · sized to the mock · identifies the 30-day trend
  - BINDS — 30d trend
- `trend.value.text`
  - TOKENS — type/hero · font/data tabular · status tint (earned) · automotive ✓ when nominal
  - BINDS — {derived.trend_30d} %/30d — the primary board signal (ruling 13)

*137 instrumented leaves · 19 components · generated 2026-06-13T22:05:00.968Z*
