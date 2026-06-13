# LAYER ATLAS

**Auto-generated on every build from the `layer()` instrumentation — do not edit.**
Per component: the layer tree with tokens + bindings, exactly as the learn-mode
hover cards report. Naming: `Component / region(camelCase) / role.kind`;
kinds: text · line · shape · chart · glyph · chip · status. Click any element
in learn mode (L) to copy its layer path for the Figma layer-name field.

## CrewLogPanel

*source: src/components/CrewLogPanel.tsx*

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
- `mean / trend.chart`
  - TOKENS — ink/secondary line · surface/overlay p10–p90 band · zero line — census and mean never separate (component rule)
  - BINDS — {rolling-mean daily fleet delta over range} + {p10/p90 envelope}
- `mean / value.text`
  - TOKENS — type/hero · font/data tabular · ink/primary (IKB fill behind dev toggle)
  - BINDS — {30d fleet mean delta %}

## FleetRail

*source: src/components/FleetRail.tsx*

- `row / dot.status`
  - TOKENS — status color | ink/muted nominal (treatment B)
  - BINDS — {vesselStatus(alerts)}
- `row / mode.glyph`
  - TOKENS — MODE_GLYPH · ink/muted · learn/title = full mode name (round 43)
  - BINDS — {derived.mode}: TRANSIT | STATION | STANDBY | PORT
- `row / name.text`
  - TOKENS — font/ui 13 · status tint when alerted · 45% dim idle nominal (round 24 layers)
  - BINDS — {vessel.static.name}

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
  - TOKENS — font/data 9 caps letterspaced · ink/muted
  - BINDS — {label}
- `readout / value.text`
  - TOKENS — font/data tabular · type/hero×k · earned color (ruling 14)
  - BINDS — {display ?? round(value)+unit}

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

- `centerStack / clock.text`
  - TOKENS — type/hero×0.6 · font/data tabular · white when still (ruling 14)
  - BINDS — {T−(eta−now) in transit | elapsed} · countdown lives HERE only
- `centerStack / location.text`
  - TOKENS — font/data 12 · ink/secondary · coupled under the mode glyph (round 43)
  - BINDS — {destination | moored port | work site}
- `centerStack / master.name.text`
  - TOKENS — font/data 12 · ink/secondary — names who you are calling; prefix dropped (round 43), role in learn/title
  - BINDS — master · {crew Master.name}
- `centerStack / mode.glyph`
  - TOKENS — boxTight chip · line/strong · glyph 1.4x, text label dropped (round 43) · learn/title = full mode name
  - BINDS — {derived.mode}: TRANSIT | STATION | STANDBY | PORT
- `centerStack / name.text`
  - TOKENS — type/hero · font/display caps · ink/primary
  - BINDS — {vessel.static.name}
- `centerStack / waves.text`
  - TOKENS — font/data 14 tabular · glyph ink/secondary · stale tint when WX stale
  - BINDS — {weather.wave_height_ft} ft
- `centerStack / wind.text`
  - TOKENS — font/data 14 tabular · glyph ink/secondary · stale tint when WX stale
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
- `quartet / fill.chart`
  - TOKENS — dot matrix 5×10 · ink/secondary | TANK_LOW tint (⚖9: dots won)
  - BINDS — {tank.level_pct → filled dots}
- `quartet / label.text`
  - TOKENS — gb.label micro-caps · TANK_LOW tint (earned)
  - BINDS — {tank.tank_id} {tank.type}
- `quartet / value.text`
  - TOKENS — font/data 12 tabular · gal ink/secondary
  - BINDS — {tank.level_pct}% · {tank.level_gal} gal
- `tanks / fill.shape`
  - TOKENS — fill/level · bottom-up vertical (round 20)
  - BINDS — {tank.level_pct}
- `tanks / tank.shape`
  - TOKENS — surface/base · line/strong | TANK_LOW tint (own alert only, round 20)
  - BINDS — {tank.tank_id}
- `tanks / value.text`
  - TOKENS — font/data 11 · ink/primary | tint
  - BINDS — {tank.level_pct}%

## VesselTile

*source: src/components/VesselTile.tsx*

- `body / alert.text`
  - TOKENS — tag = severity color · message ink/secondary (round 33 grammar)
  - BINDS — {alerts[] level + message}
- `body / delta.glyph`
  - TOKENS — glyph/delta 13px ink/muted left · numeral tabular right (label died round 39)
  - BINDS — {derived.efficiency_delta_pct} vs mode baseline
- `body / endurance.glyph`
  - TOKENS — glyph/fuel-drop 13px ink/muted left · numeral tabular right (label died round 39)
  - BINDS — {derived.endurance_hours} h
- `body / trendChart.chart`
  - TOKENS — ink/secondary line · zero axis
  - BINDS — {daily_delta_1y[-30d]}
- `footer / fuel.fill`
  - TOKENS — ink/muted fill | alert color when endurance-backed · surface/overlay track
  - BINDS — {Σ tank level / Σ capacity}
- `footer / spark24.chart`
  - TOKENS — ink/secondary 1px · zero axis · full card width, fixed 20px — the 24h signature (round 39)
  - BINDS — {derived.sparkline_24h — hourly efficiency_delta}
- `frame / border.status`
  - TOKENS — hairline | status border when alerted · 45% dim when idle nominal (round 26 grammar)
  - BINDS — {vesselStatus(alerts)} · {derived.mode}
- `header / dot.status`
  - TOKENS — status color | ink/muted when nominal (treatment B)
  - BINDS — {vesselStatus(alerts)}
- `header / mode.glyph`
  - TOKENS — line/strong chip · glyph 1.4x, text label dropped (round 43) · learn/title = full mode name
  - BINDS — {derived.mode}: TRANSIT | STATION | STANDBY | PORT
- `header / name.text`
  - TOKENS — type/name · font/display caps · status tint when alerted (earned)
  - BINDS — {vessel.static.name}
- `header / trend.text`
  - TOKENS — type/hero · font/data tabular · status tint (earned)
  - BINDS — {derived.trend_30d} %/30d

*109 instrumented leaves · 13 components · generated 2026-06-13T17:19:43.367Z*
