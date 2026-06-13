# LAYER ATLAS — FIGMA CHEAT SHEET

**Auto-generated — do not edit.** The "what can I name today" reference while
sketching. Name a Figma layer to match a path below and `scrape {frame}` binds
it automatically. Unnamed layers are ignored; unrecognized names are noted, not
applied. Convention: `Component / region(camelCase) / role.kind` — name the layer
`region / role.kind` inside a frame named for the component (or use the full path).

## CrewLogPanel

  Region: log
    • entry.text  → font/data 12 terminal grammar · alert lines tint by level (advisory muted, A6) · {stamp · type · text} newest first
    • filter.chip  → chip — accent when active (interaction voice) · {event type visibility toggle}
    • modeStrip.chart  → MODE_COLOR segments · line/subtle dividers — recent memory, same family as the log (round 30) · {24h minute modes → segments}
  Region: roster
    • name.text  → font/ui 13 · {crew.name}
    • role.text  → font/ui 13 · {crew.role}
    • since.text  → font/data 12 · ink/muted — collapses to one footer when whole crew rotated together (round 19) · {crew.onboard_since shared date + days}

## EfficiencyCurve

  Region: plot
    • delta.text  → font/data 10 · status tint (earned) — labeled: speed-specific, distinct from vs-baseline · {live gal/nm / envelope median − 1} vs envelope
    • drop.line  → ink/muted dashed — degradation as geometry · {live point → envelope median at same speed}
    • envelope.shape  → surface/overlay fill — 12-mo IQR band · {transit envelope p25→p75 by speed bin}
    • median.line  → ink/secondary 1.25px · {envelope median by speed bin}
    • now.dot  → accent ring (identity) · status fill when watch/degraded (status outranks accent) · {live gal/nm @ speed_over_ground}

## EfficiencyPanel

  Region: charts
    • envelope.chart  → IQR band surface/overlay · median ink/secondary · live point accent ring · {1y transit envelope: gal/nm vs kn} — speed-specific comparison
    • trend30.chart  → ink/secondary line · zero axis · fills cell · {daily_delta_1y[-30d]}
  Region: footer
    • baseline.text  → font/data 12 · ink/secondary · {derived.baseline_value} {baseline_metric}
    • spark24.chart  → ink/secondary 1px · line/subtle frame · {derived.sparkline_24h — hourly efficiency_delta}
  Region: heroRow
    • baselineDelta.text  → Stat: micro-caps label · type/hero numeral tabular · {derived.efficiency_delta_pct} vs mode_baseline — mode-wide comparison
    • trend30.text  → Stat: micro-caps label · type/hero numeral tabular · {derived.trend_30d} %/30d — the primary fleet signal (ruling 13)

## EngineTwinPanel

  Region: gapTrend
    • area.chart  → fill/level area · ink/secondary line · zero line · y floors ±20°F (calm-not-empty) · {daily mean E2−E1 EGT, 30d, both running} — the "three weeks early" graphic
  Region: rows
    • engine.text  → font/data 12 · id+role ink/muted left · state tabular right · hairline divider · {id role · RUNNING load% fuel gph | OFF} — state/load/fuel live HERE only
  Region: verdict
    • avg.text  → font/data 11 · ink/secondary · {derived.egt_twin_gap_f} — 24h avg at matched load
    • fuelDelta.text  → font/data 14 · {E2.fuel_rate / E1.fuel_rate − 1} at matched load
    • gap.text  → type/hero · font/data tabular — largest type in the section · {E2.egt − E1.egt} now, both running
    • label.text  → gb.label micro-caps · ink/muted · E2 VS E1 EGT (static)

## FleetHealthBand

  Region: arrivals
    • bunker.text  → font/data 11 · advisory tint when >0, else ink/muted (advisory is informational, not severity) · {# bunker-flagged calls in next 24h}
    • value.text  → type/hero · font/data tabular · ink/primary · links to #port-calls · {# port calls in next 24h}
  Region: burn
    • spark.chart  → ink/secondary 1px · auto-ranged (never approaches 0) · {fleet total burn, 24h hourly}
    • value.text  → type/hero · font/data tabular · ink/primary · gph (blue is water-only, never here) · {sum of live fleet burn} gph
  Region: census
    • degraded.status  → STATUS_COLOR.degraded (red) · count · click filters board · {# vessels degraded}
    • nominal.status  → green (automotive) | ink/secondary (quiet) · count · click filters board · {# vessels nominal}
    • watch.status  → STATUS_COLOR.watch (amber) · count · click filters board · {# vessels watch}
  Region: mean
    • trend.chart  → ink/secondary line · surface/overlay p10–p90 band · zero line — census and mean never separate (component rule) · {rolling-mean daily fleet delta over range} + {p10/p90 envelope}
    • value.text  → type/hero · font/data tabular · ink/primary (IKB fill behind dev toggle) · {30d fleet mean delta %}

## FleetRail

  Region: row
    • dot.status  → status color | ink/muted nominal (treatment B) · {vesselStatus(alerts)}
    • mode.glyph  → MODE_GLYPH · ink/muted · learn/title = full mode name (round 43) · {derived.mode}: TRANSIT | STATION | STANDBY | PORT
    • name.text  → font/ui 13 · status tint when alerted · 45% dim idle nominal (round 24 layers) · {vessel.static.name}

## Gauge

  Region: dial
    • arc.line  → line/strong · 2.5×k · {min→max, 270° sweep}
    • band.line  → alert color — alert-backed ONLY (ruling 11) · {band.from→band.to}
    • hub.dot  → ink/primary · —
    • limit.line  → ink/secondary · neutral tick (ruling 11) · {displayLimits[]}
    • maxLabel.text  → font/data micro · ink/muted · {minMaxLabels?.[1] ?? max}
    • minLabel.text  → font/data micro · ink/muted · {minMaxLabels?.[0] ?? min}
    • needle.line  → ink/primary — ALWAYS (round 19, amends ruling 14) · {value→angle(min,max)}
    • tick.line  → ink/muted · 1px · {25 / 50 / 75 %}
  Region: label
    • label.text  → font/data 9 caps letterspaced · ink/muted · {label}
  Region: readout
    • value.text  → font/data tabular · type/hero×k · earned color (ruling 14) · {display ?? round(value)+unit}

## InstrumentCluster

  Region: cell
    • trace.chart  → fill/level area · ink/muted line · gauge-cell width · dims with dormant dial · {selected engine sensor, 24h minutes → ~96 pts}
  Region: selector
    • engine.chip  → toggleStyle — accent when active (interaction voice) · {engine index → cluster binding}

## NauticalChart

  Region: base
    • land.shape  → chart/land fill · hairline coastline — ONE polygon shared with the generator + verify (round 23) · {LAND polygon from src/data/coast.ts}
    • seaLabel.text  → font/ui letterspaced · near-water contrast — furniture, not data · GULF OF MEXICO (static)
    • water.shape  → chart/water #0d1924 — the ONLY navy (round 23) · {chart frame}
  Region: furniture
    • compass.glyph  → chart ink · ring + needle + N · north-up (static)
    • scale.line  → chart ink · end + mid ticks · {bar length adapts: 10–200 nm at mid-latitude}
  Region: graticule
    • meridian.line  → grid faint 0.5px · frame ticks · 9px labels · {longitude grid at adaptive step}
    • parallel.line  → grid faint 0.5px · frame ticks · 9px labels · {latitude grid at adaptive step}

## StatusHeader

  Region: alerts
    • alertcount.chip  → counts in severity colors · click → alert sheet (round 33) · {fleet alert counts by level}
    • line.text  → round-33 grammar: [LEVEL] tag = the one severity color · name accent link · message ink/secondary · {alert.level · vessel.name → /vessel/id · alert.message}
  Region: datalink
    • datalink.chip  → font/data 11 · ink/secondary | advisory when degraded · click → stale-feed breakdown · {stale stream census → FRESH | DEGRADED | STALE}
  Region: sync
    • lastsync.chip  → font/data 11 · ink/secondary · click → per-vessel sync ages · {simTime − oldest stream timestamp}

## VesselCommandBand

  Region: centerStack
    • clock.text  → type/hero×0.6 · font/data tabular · white when still (ruling 14) · {T−(eta−now) in transit | elapsed} · countdown lives HERE only
    • location.text  → font/data 12 · ink/secondary · coupled under the mode glyph (round 43) · {destination | moored port | work site}
    • master.name.text  → font/data 12 · ink/secondary — names who you are calling; prefix dropped (round 43), role in learn/title · master · {crew Master.name}
    • mode.glyph  → boxTight chip · line/strong · glyph 1.4x, text label dropped (round 43) · learn/title = full mode name · {derived.mode}: TRANSIT | STATION | STANDBY | PORT
    • name.text  → type/hero · font/display caps · ink/primary · {vessel.static.name}
    • waves.text  → font/data 14 tabular · glyph ink/secondary · stale tint when WX stale · {weather.wave_height_ft} ft
    • wind.text  → font/data 14 tabular · glyph ink/secondary · stale tint when WX stale · {weather.wind_speed_kn} kn
  Region: factsLine
    • class.text  → font/data 12 · ink/muted · {static.length_ft} ft {static.class}
    • position.text  → font/data 12 · ink/secondary — relative reference, never raw lat/lon (ruling 6) · {nm from nearest port | alongside}
    • speed.text  → font/data 12 · ink/secondary · {position.speed_over_ground_kn} kn
  Region: gaugeRail
    • burn.chart  → Gauge primitive · 96px · {derived.burn_rate_gph} / max observed 1y
    • effDelta.chart  → Gauge primitive · caution band ≥+8 (alert-backed) · {derived.efficiency_delta_pct} vs mode baseline
    • endurance.chart  → Gauge primitive · log dial · caution band <72h (alert-backed) · {derived.endurance_hours}
    • speed.chart  → Gauge primitive · 96px · {position.speed_over_ground_kn} / max {cruise×1.35}
  Region: profile
    • destination.text  → font/data 11 · ink/primary · {next_port_calls[0].port}
    • eta.text  → font/data 11 · ink/muted · {next_port_calls[0].eta} — absolute ETA + Z lives HERE only
    • fill.line  → accent/primary 2px — interaction/identity voice, never severity · {distance covered fraction}
    • origin.text  → font/data 11 · ink/secondary · {transit-run start: nearest port <5nm | nearest site}
    • toGo.text  → font/data 10 · ink/muted · right-aligned · {pct covered} · {nm to destination} — distance-to-go lives HERE only
    • track.line  → surface/overlay 2px · {origin→destination}
    • vessel.glyph  → glyph/vesselMarker 16px · ink/primary — bow along the track (round 36) · {live position on track}

## VesselSynoptic

  Region: callouts
    • label.text  → font/data 10 · ink/secondary — ST/FD/E annotation language · {ST1 ST2 FD1 FD2 E1–E4}
    • leader.line  → line/strong 0.6px · {node→label}
  Region: engines
    • node.shape  → running = filled · stopped = outline · status tint only when alert names the engine · {engine.engine_id · running}
    • value.text  → font/data 9 · {engine.load_pct}% | OFF
  Region: flow
    • engineLine.line  → line/strong 1.2px · {flow meter→engine}
    • feedLine.line  → line/strong 1.2px · dashed when no transfer · {storage→feeder · tank.transfer_active}
    • meterLine.line  → line/strong 1.2px · {feeder→flow meter}
  Region: hull
    • hull.line  → ink/secondary 1.5px — neutral, never status · {HULL_PATH — Figma hull replaces 1:1}
    • label.text  → font/data 9 · ink/muted · SUPERSTRUCTURE (static)
    • superstructure.shape  → surface/overlay fill · line/strong · {SUPER_PATH}
  Region: meter
    • meter.shape  → surface/overlay · line/strong · 45° diamond · flow meter node
    • recon.chip  → border + text = recon severity (OK ink/secondary · advisory · watch) · {reconciliation.status · error_pct}
    • value.text  → font/data 11 · ink/primary · {flow_gps × 3600} gph
  Region: quartet
    • fill.chart  → dot matrix 5×10 · ink/secondary | TANK_LOW tint (⚖9: dots won) · {tank.level_pct → filled dots}
    • label.text  → gb.label micro-caps · TANK_LOW tint (earned) · {tank.tank_id} {tank.type}
    • value.text  → font/data 12 tabular · gal ink/secondary · {tank.level_pct}% · {tank.level_gal} gal
  Region: tanks
    • fill.shape  → fill/level · bottom-up vertical (round 20) · {tank.level_pct}
    • tank.shape  → surface/base · line/strong | TANK_LOW tint (own alert only, round 20) · {tank.tank_id}
    • value.text  → font/data 11 · ink/primary | tint · {tank.level_pct}%

## VesselTile

  Region: body
    • alert.text  → tag = severity color · message ink/secondary (round 33 grammar) · {alerts[] level + message}
    • delta.glyph  → glyph/delta 13px ink/muted left · numeral tabular right (label died round 39) · {derived.efficiency_delta_pct} vs mode baseline
    • endurance.glyph  → glyph/fuel-drop 13px ink/muted left · numeral tabular right (label died round 39) · {derived.endurance_hours} h
    • trendChart.chart  → ink/secondary line · zero axis · {daily_delta_1y[-30d]}
  Region: footer
    • fuel.fill  → ink/muted fill | alert color when endurance-backed · surface/overlay track · {Σ tank level / Σ capacity}
    • spark24.chart  → ink/secondary 1px · zero axis · full card width, fixed 20px — the 24h signature (round 39) · {derived.sparkline_24h — hourly efficiency_delta}
  Region: frame
    • border.status  → hairline | status border when alerted · 45% dim when idle nominal (round 26 grammar) · {vesselStatus(alerts)} · {derived.mode}
  Region: header
    • dot.status  → status color | ink/muted when nominal (treatment B) · {vesselStatus(alerts)}
    • mode.glyph  → line/strong chip · glyph 1.4x, text label dropped (round 43) · learn/title = full mode name · {derived.mode}: TRANSIT | STATION | STANDBY | PORT
    • name.text  → type/name · font/display caps · status tint when alerted (earned) · {vessel.static.name}
    • trend.text  → type/hero · font/data tabular · status tint (earned) · {derived.trend_30d} %/30d

*109 leaves · 13 components · generated 2026-06-13T17:19:43.368Z*
