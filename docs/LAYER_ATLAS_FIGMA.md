# LAYER ATLAS — FIGMA CHEAT SHEET

**Auto-generated — do not edit.** The "what can I name today" reference while
sketching. Name a Figma layer to match a path below and `scrape {frame}` binds
it automatically. Unnamed layers are ignored; unrecognized names are noted, not
applied. Convention: `Component / region(camelCase) / role.kind` — name the layer
`region / role.kind` inside a frame named for the component (or use the full path).

## AppHeader

  Region: clock
    • master.clock.text  → global UTC/Zulu wall clock (system time) · font/data tabular · neutral ink · distinct from the per-vessel mission clock · system UTC now

## CrewLogPanel

  Region: header
    • header.glyph  → section header · crew glyph · glyph-only in expert mode · CREW & LOG
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
  Region: header
    • header.glyph  → section header · chart.efficiency (curve motif) · glyph-only in expert mode · EFFICIENCY · {mode}
  Region: heroRow
    • baselineDelta.text  → Stat: micro-caps label · type/hero numeral tabular · {derived.efficiency_delta_pct} vs mode_baseline — mode-wide comparison
    • trend30.text  → Stat: micro-caps label · type/hero numeral tabular · {derived.trend_30d} %/30d — the primary fleet signal (ruling 13)

## EngineTwinPanel

  Region: gapTrend
    • area.chart  → fill/level area · ink/secondary line · zero line · y floors ±20°F (calm-not-empty) · {daily mean E2−E1 EGT, 30d, both running} — the "three weeks early" graphic
  Region: header
    • header.glyph  → section header · engine glyph · glyph-only in expert mode · ENGINE TWINS
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
  Region: header
    • header.glyph  → section header · vessel glyph · glyph-only in expert mode · FLEET
  Region: mean
    • trend.chart  → ink/secondary line · surface/overlay p10–p90 band · zero line — census and mean never separate (component rule) · {rolling-mean daily fleet delta over range} + {p10/p90 envelope}
    • value.text  → type/hero · font/data tabular · ink/primary (IKB fill behind dev toggle) · {30d fleet mean delta %}

## FleetMap

  Region: header
    • header.glyph  → section header · chart.fleet (scatter motif) · glyph-only in expert mode · FLEET PLOT — GULF OF MEXICO

## FleetRail

  Region: nav
    • back.glyph  → back link · glyph-only in expert mode · → /
  Region: row
    • dot.status  → status color | ink/muted nominal (treatment B) · {vesselStatus(alerts)}
    • mode.glyph  → MODE_GLYPH · ink/muted · learn/title = full mode name (round 43) · {derived.mode}: TRANSIT | STATION | STANDBY | PORT
    • name.text  → font/ui 13 · status tint when alerted · 45% dim idle nominal (round 24 layers) · {vessel.static.name}

## FleetView

  Region: chartBand
    • maximize.glyph  → transient resize — grows the chart band, tiles hold + reflow down (one-elastic-element) · not persisted · {chartMax} toggle
  Region: header
    • header.glyph  → page header · chart.trend (sorted-bars motif) · glyph-only in expert mode · TREND BOARD — RANKED BY SUSTAINED DEVIATION

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
    • label.text  → font/data 9 caps letterspaced · ink/muted · hidden in expert mode · {label}
  Region: readout
    • value.text  → font/data tabular · type/hero×k · earned color (ruling 14) · {display ?? round(value)+unit}

## InspectorChart

  Region: header
    • header.glyph  → section header · route glyph · glyph-only in expert mode · POSITION

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

## PortCallsTimeline

  Region: header
    • header.glyph  → section header · anchor glyph · glyph-only in expert mode · PORT CALLS — 72H

## SettingsSheet

  Region: mode
    • mode.chip  → mode chip · default / learn (L) / expert (E) · mutually exclusive · {ui mode}
  Region: scenario
    • scenario.chip  → scenario library chip · accent when active · synthetic overlay (demo = base seed) · {scenario id} → applies overlay
  Region: sheet
    • settings.sheet  → gear-summoned settings sheet · SCENARIO / MODE / DEV sections · —

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
    • anchor.glyph  → glyph/anchor slot (placeholder until scraped) · ink/secondary — prefixes the place · place
    • clock.text  → type/hero×0.6 · font/data tabular · mode-aware prefix (carries mode after the glyph removal, round 73) · white when still (ruling 14) · {T−(eta−now) transit | ON STATION/IN PORT/STANDBY + elapsed} · countdown lives HERE only
    • crew.glyph  → glyph/crew slot (placeholder until scraped) · ink/secondary — replaces the word "master" · crew Master
    • location.text  → font/data 12 · ink/secondary · place as value · {destination | moored port | work site}
    • master.name.text  → font/data 12 · ink/secondary · name as value (no label, no stroke) · {crew Master.name}
    • mode.glyph  → boxTight chip · line/strong · glyph 1.4x, text label dropped (round 43) · learn/title = full mode name · {derived.mode}: TRANSIT | STATION | STANDBY | PORT
    • name.text  → type/hero · font/display caps · ink/primary · {vessel.static.name}
    • waves.text  → font/data 15 tabular · glyph ink/MUTED to match the wind glyph weight (round 79: drawn fill vs stroke) · stale tint when WX stale · own line · {weather.wave_height_ft} ft
    • wind.text  → font/data 15 tabular · glyph ink/secondary · stale tint when WX stale · own line (round 73) · {weather.wind_speed_kn} kn
  Region: factsLine
    • class.text  → font/data 12 · ink/muted · {static.length_ft} ft {static.class}
    • position.text  → font/data 12 · ink/secondary — relative reference, never raw lat/lon (ruling 6) · {nm from nearest port | alongside}
    • speed.text  → font/data 12 · ink/secondary · {position.speed_over_ground_kn} kn
  Region: gaugeRail
    • burn.chart  → Gauge primitive · 116px (round 79) · {derived.burn_rate_gph} / max observed 1y
    • effDelta.chart  → Gauge primitive · caution band ≥+8 (alert-backed) · {derived.efficiency_delta_pct} vs mode baseline
    • endurance.chart  → Gauge primitive · log dial · caution band <72h (alert-backed) · {derived.endurance_hours}
    • speed.chart  → Gauge primitive · 116px (round 79) · {position.speed_over_ground_kn} / max {cruise×1.35}
  Region: profile
    • destination.text  → font/data 11 · ink/primary · {next_port_calls[0].port}
    • eta.text  → font/data 11 · ink/muted · {next_port_calls[0].eta} — absolute ETA + Z lives HERE only
    • fill.line  → accent/primary 2px — interaction/identity voice, never severity · {distance covered fraction}
    • origin.text  → font/data 11 · ink/secondary · {transit-run start: nearest port <5nm | nearest site}
    • toGo.text  → font/data 10 · ink/muted · right-aligned · {pct covered} · {nm to destination} — distance-to-go lives HERE only
    • track.line  → surface/overlay 2px · {origin→destination}
    • vessel.glyph  → glyph/vesselMarker 16px · ink/primary — bow along the track (round 36) · {live position on track}

## VesselInspector

  Region: alerts
    • header.glyph  → section header · alert-triangle glyph · glyph-only in expert mode · ALERTS

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
  Region: header
    • header.glyph  → section header · tank glyph · glyph-only in expert mode · FUEL
  Region: hull
    • hull.line  → ink/secondary 1.5px — neutral, never status · {HULL_PATH — Figma hull replaces 1:1}
    • label.text  → font/data 9 · ink/muted · SUPERSTRUCTURE (static)
    • superstructure.shape  → surface/overlay fill · line/strong · {SUPER_PATH}
  Region: meter
    • meter.shape  → surface/overlay · line/strong · 45° diamond · flow meter node
    • recon.chip  → border + text = recon severity (OK ink/secondary · advisory · watch) · {reconciliation.status · error_pct}
    • value.text  → font/data 11 · ink/primary · {flow_gps × 3600} gph
  Region: tanks
    • FD1.gal.value.text  → font/data 12 tabular · ink/secondary · right-aligned subcolumn · {FD1 level_gal} gal
    • FD1.pct.value.text  → font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint · {FD1 level_pct}%
    • FD2.gal.value.text  → font/data 12 tabular · ink/secondary · right-aligned subcolumn · {FD2 level_gal} gal
    • FD2.pct.value.text  → font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint · {FD2 level_pct}%
    • fill.chart  → dot matrix 5×10 · ink/secondary | TANK_LOW tint (⚖9: dots won) · {tank.level_pct → filled dots}
    • fill.shape  → fill/level · bottom-up vertical (round 20) · {tank.level_pct}
    • label.text  → gb.label micro-caps · TANK_LOW tint (earned) · {tank.tank_id} {tank.type}
    • ST1.gal.value.text  → font/data 12 tabular · ink/secondary · right-aligned subcolumn · {ST1 level_gal} gal
    • ST1.pct.value.text  → font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint · {ST1 level_pct}%
    • ST2.gal.value.text  → font/data 12 tabular · ink/secondary · right-aligned subcolumn · {ST2 level_gal} gal
    • ST2.pct.value.text  → font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint · {ST2 level_pct}%
    • tank.shape  → surface/base · line/strong | TANK_LOW tint (own alert only, round 20) · {tank.tank_id}
    • value.text  → font/data 11 · ink/primary | tint · {tank.level_pct}%

## VesselTile

  Region: (root)
    • alert.line  → tag = severity color · message ink/secondary (round 33 grammar) · 2x only · {alerts[] level + message}
    • bg.shape  → surface/raised fill · BORDERLESS — no perimeter outline at all (round 66; the round-37 status border is removed, severity moves to the strip) · 45% dim when idle nominal · {derived.mode}
  Region: body
    • trendChart.chart  → ink/secondary line · zero axis · {daily_delta_1y[-30d]}
  Region: (root)
    • endurance.glyph  → glyph/wave (drawn) · NEUTRAL UI ink (round 63) · sized to the mock · identifies endurance · endurance
    • endurance.value.text  → font/data 14 tabular · ink/primary · centered under its glyph (round 63) · {derived.endurance_hours} h
  Region: footer
    • deviation.fill  → meters |efficiency Δ| (fill ∝ magnitude, ±20% full scale) · ink/muted fill | status color only when alert-backed + placement=strip/both · surface/overlay track · sole expand affordance · {|derived.efficiency_delta_pct|}
  Region: (root)
    • name.text  → type/name · font/display caps · status tint when alerted (earned) · sits on the tile base fill, separated by spacing alone (round 70, header band removed) · {vessel.static.name}
    • now.glyph  → glyph/clock (drawn) · NEUTRAL UI ink (round 63) · sized to the mock · identifies now-vs-baseline · now vs mode baseline
    • now.value.text  → font/data 14 tabular · ink/primary · centered under its glyph (round 63) · {derived.efficiency_delta_pct} vs mode baseline
    • spark.baseline.line  → line/subtle 1px · zero axis · y = 0
    • spark.chart  → ink/secondary 1px polyline · the 24h signature · {derived.sparkline_24h — hourly efficiency_delta}
    • spark.container  → full card width in its own lighter fill band (#2b2b2b, no stroke frame) — the 24h signature dock (round 39 / 63 / 66) · —
    • trend.glyph  → glyph/calendar (drawn) · NEUTRAL UI ink — not a status carrier (round 63) · sized to the mock · identifies the 30-day trend · 30d trend
    • trend.value.text  → type/hero · font/data tabular · status tint (earned) · automotive ✓ when nominal · {derived.trend_30d} %/30d — the primary board signal (ruling 13)

## Glyph library (icon components)

  Name a Figma frame for the matching path; `scrape glyphs` pulls + normalizes it.
  ✓ = a drawn SVG is already in docs/glyphs-import/ (else placeholder pictogram).

    · glyph/vessel  → vessel.svg
    · glyph/engine  → engine.svg
    · glyph/tank  → tank.svg
    · glyph/fuel-drop  → fuel-drop.svg
    · glyph/wind  → wind.svg
    ✓ glyph/wave  → wave.svg
    · glyph/anchor  → anchor.svg
    · glyph/route  → route.svg
    · glyph/crew  → crew.svg
    ✓ glyph/clock  → clock.svg
    · glyph/alert-triangle  → alert-triangle.svg
    · glyph/datalink  → datalink.svg
    · glyph/gauge  → gauge.svg
    · glyph/chart  → chart.svg
    · glyph/expand  → expand.svg
    · glyph/collapse  → collapse.svg
    · glyph/crosshair  → crosshair.svg
    · glyph/dots  → dots.svg
    · glyph/vesselMarker  → vesselMarker.svg
    · glyph/delta  → delta.svg
    · glyph/chart.fleet  → chart.fleet.svg
    · glyph/chart.trend  → chart.trend.svg
    · glyph/chart.efficiency  → chart.efficiency.svg
    · glyph/back  → back.svg
    ✓ glyph/calendar  → calendar.svg

*138 leaves · 20 components · 25 glyphs (3 drawn) · generated 2026-06-13T23:45:26.917Z*
