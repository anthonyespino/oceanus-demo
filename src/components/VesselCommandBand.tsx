'use client';
// ROUND 27: VesselCommandBand — VesselHeader + TelemetryBand merged (both
// die; renames recorded for barrel + Figma). ROUND 30: absorbed the voyage
// card. ROUND 32 restructure — sticky, priority fix:
//   PRIMARY ROW (the ONLY sticky element, constant height, pure CSS — no
//   stuck detection, no height swap, no re-measure, so scroll feedback
//   loops are impossible by construction):
//     [SPEED] [BURN] · NAME / master / mode chip / clock / wind·waves · [EFF Δ] [ENDURANCE]
//   SECONDARY (static flow, scrolls away naturally): facts line + the
//   voyage profile strip (automotive trip canvas).
// DEDUP LEDGER (round 30, enforced here): countdown in the clock ONLY;
// absolute ETA + Z in the profile strip ONLY; distance-to-go in the strip
// ONLY; next-port NAME as the clock subtitle ONLY; wind/waves in the band
// ONLY; master under the name ONLY (round 32 — left the facts line).
// The clock sits one type step below the name — the name is the only hero.
// The collapse chevron reduces the primary row to a name + mode + clock line.

import { useState } from 'react';
import type { VesselState, VesselSample } from '../data/types';
import { EFF_DELTA_CAUTION_PCT, BUNKER_SOON_H } from '../data/alerts';
import { PORTS, SITES, distanceNm, place } from '../data/fleet';
import { useFleet } from '../state/FleetProvider';
import { Field } from './Field';
import { Gauge } from './Gauge';
import { Glyph, MODE_GLYPH, type GlyphName } from './Glyph';
import { StateMark } from './StateMark';
import { RevealZone } from './Contextual';
import { FONT, NEUTRAL, RADIUS } from './probeTokens';
import { gb, glassFill, fmtTime } from './gb';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week
import { Annotated } from '../learn/Annotated'; // round 89: IA-node binding (voyage-bar)

function maxObservedBurn(v: VesselState): number {
  let max = 0;
  for (const s of v.history.hourly) {
    const b = s.engines.reduce((a, e) => a + e.fuel_rate_gph, 0);
    if (b > max) max = b;
  }
  return Math.max(1, Math.ceil(max / 25) * 25);
}

function modeElapsedMs(v: VesselState): number {
  const ms = v.history.minutes;
  const mode = ms[ms.length - 1].mode;
  let i = ms.length - 1;
  while (i > 0 && ms[i - 1].mode === mode) i--;
  if (i > 0) return ms[ms.length - 1].t - ms[i].t;
  // mode spans the whole minute window — extend through hourly history
  let t0 = ms[0].t;
  for (let h = v.history.hourly.length - 1; h >= 0; h--) {
    const s = v.history.hourly[h];
    if (s.t >= t0) continue;
    if (s.mode !== mode) break;
    t0 = s.t;
  }
  return ms[ms.length - 1].t - t0;
}

function hhmm(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60000));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Where the CURRENT transit run began — minute window, extended through
    hourly when the run spans >24h. Honest origin: schedule legs run
    port→site and site→port, so "last port visited" lies on return legs
    (origin would equal the destination and progress would read 100%).
    The origin label is the nearest port if the run started alongside one
    (<5 nm), else the nearest work site. */
function transitOrigin(v: VesselState): { pos: { lat: number; lon: number }; label: string; isPort: boolean } | null {
  const ms = v.history.minutes;
  if (ms[ms.length - 1].mode !== 'TRANSIT') return null;
  let i = ms.length - 1;
  while (i > 0 && ms[i - 1].mode === 'TRANSIT') i--;
  let start: VesselSample = ms[i];
  if (i === 0) {
    const t0 = ms[0].t;
    for (let h = v.history.hourly.length - 1; h >= 0; h--) {
      const s = v.history.hourly[h];
      if (s.t >= t0) continue;
      if (s.mode !== 'TRANSIT') break;
      start = s;
    }
  }
  const port = PORTS.reduce((a, b) => (distanceNm(start.position, a) < distanceNm(start.position, b) ? a : b));
  if (distanceNm(start.position, port) < 5) return { pos: start.position, label: port.name, isPort: true };
  const site = SITES.reduce((a, b) => (distanceNm(start.position, a) < distanceNm(start.position, b) ? a : b));
  return { pos: start.position, label: site.name, isPort: false };
}

const LOG_MIN = Math.log10(12);
const LOG_MAX = Math.log10(2400);

/** Round 34: weather rides the mission clock's line — glyph + value + unit,
    no labels (they self-describe at this size). */
function WxInline({ g, value, attrs, glyphColor = NEUTRAL.inkSecondary }: { g: GlyphName; value: string; attrs?: Record<string, string>; glyphColor?: string }) {
  // round 53: bumped 14→15 for legibility WITHIN the environment-context
  // register — still well below the clock (hero×0.6) and the gauges; not
  // promoted to hero (wind/waves are nominal + already feed Calm Sea).
  // round 79: glyphColor lets the WAVE glyph (a filled drawn glyph, visually
  // heavier than the stroked wind placeholder) drop to a dimmer ink so it MATCHES
  // the wind glyph's perceived weight — both read as dim context ink (color-match
  // only, size held).
  return (
    <span {...attrs} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Glyph name={g} size={15} color={glyphColor} />
      <span style={{ fontFamily: FONT.data, fontSize: 'var(--type-context)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </span>
  );
}


export function VesselCommandBand({ vessel }: { vessel: VesselState }) {
  const { collapsedPanels, togglePanel, surfaceGlass } = useFleet();
  const id = vessel.static.id;
  const min = !!collapsedPanels[`${id}:command`];
  // ROUND 88: ONE maximize/minimize control toggles BOTH endpoint detail columns
  // (was two independent chevrons, round 83). Default collapsed to the summary
  // (endpoints + progress + %); click maximize to reveal detail. Click-only.
  const [detailOpen, setDetailOpen] = useState(false);

  const d = vessel.derived;
  const now = vessel.history.minutes.at(-1)!;
  const sog = now.position.speed_over_ground_kn;
  const speedMax = Math.ceil(vessel.static.cruise_kn * 1.35);
  const endurance = Math.min(2400, Math.max(12, d.endurance_hours));
  const still = now.mode === 'PORT' && sog < 0.5;
  const effVital = still ? 'still' : d.efficiency_delta_pct > EFF_DELTA_CAUTION_PCT ? 'watch' : 'nominal';
  const endVital = still ? 'still' : d.endurance_hours < BUNKER_SOON_H ? 'watch' : 'nominal';
  const aliveVital = still ? 'still' : 'nominal';

  // mission clock (mode-aware, round 22; countdown lives HERE only). Round
  // 43: the location moved out to its own line under the mode glyph, so the
  // clock is just the time now — no port/state subtitle.
  const next = vessel.history.nextPortCalls[0];
  // ROUND 73: the clock now carries MODE (the mode glyph is removed from the
  // center stack). T− = transit countdown (lives here only); the other modes
  // gain an explicit word prefix so the clock alone reads the mode.
  const elapsedHHMM = hhmm(modeElapsedMs(vessel));
  const clock =
    now.mode === 'TRANSIT' ? (next ? `T−${hhmm(next.eta - now.t)}` : `UNDERWAY ${elapsedHHMM}`)
    : now.mode === 'STATION' ? `ON STATION ${elapsedHHMM}`
    : now.mode === 'PORT' ? `IN PORT ${elapsedHHMM}`
    : `STANDBY ${elapsedHHMM}`;

  const master = vessel.history.crew.find((c) => c.role === 'Master');
  const nearest = PORTS.reduce((a, b) => (distanceNm(now.position, a) < distanceNm(now.position, b) ? a : b));
  const nearestNm = distanceNm(now.position, nearest);
  const wx = now.weather;
  const wxStale = d.staleness.weather === 'STALE';

  // round 43: "location" couples under the mode glyph — destination in
  // transit, the moored port at PORT, the work site on station/standby
  const locationName = now.mode === 'TRANSIT'
    ? (next?.port ?? null)
    : now.mode === 'PORT'
    ? nearest.name
    : SITES.reduce((a, b) => (distanceNm(now.position, a) < distanceNm(now.position, b) ? a : b)).name;

  const chevronBtn: React.CSSProperties = {
    background: NEUTRAL.surfaceDim, border: '1px solid var(--color-line-strong)',
    borderRadius: RADIUS, padding: 2, cursor: 'pointer', color: NEUTRAL.inkSecondary, lineHeight: 0,
  };
  // round 43: mode chip strips its text label — glyph only, 1.4x, the chip
  // keeps its hairline; learn/title reveals the full mode name
  const modeChip = (
    <Field level="vessel" field="mode">
      <span {...layer('VesselCommandBand / centerStack / mode.glyph', 'boxTight chip · line/strong · glyph 1.4x, text label dropped (round 43) · learn/title = full mode name', '{derived.mode}: TRANSIT | STATION | STANDBY | PORT')} title={d.mode} style={{ ...gb.boxTight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Glyph name={MODE_GLYPH[d.mode]} size={17} />
      </span>
    </Field>
  );
  const nameStyle: React.CSSProperties = {
    fontFamily: FONT.display, fontSize: 'var(--type-display)', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1.1,
  };
  // ROUND 96: FLOAT — the panel fill (gb.box surface-raised) is removed; the
  // instrument row floats directly on the Calm Sea gradient.
  // ROUND 97: more top air above the NAME (paddingTop 24); SURFACE GLASS dev
  // toggle (glassFill spread FIRST so the radius still wins); sticky, so the
  // diffraction persists on scroll.
  // ROUND 101: the bottom seam STROKE (boxShadow 0 1px 0 line-strong) is REMOVED
  // — a drawn line at a glass edge contradicts the glass material + borderless-
  // float. The instrument row is now its own floating block (full radius); a
  // small GAP (marginBottom) separates it from the voyage bar — the gap +
  // glass-edge/diffraction do the separating, not a stroke.
  const sticky: React.CSSProperties = {
    ...(surfaceGlass ? glassFill : {}),
    padding: '24px var(--pad-card) 20px', marginBottom: 8, position: 'sticky', top: 0, zIndex: 6,
    borderRadius: RADIUS,
  };

  // collapsed: name + mode + clock, one line (still sticky, still constant)
  if (min) {
    return (
      <section style={{ ...sticky, marginBottom: 8, borderRadius: RADIUS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 'var(--pad-section)', paddingBottom: 'var(--pad-section)' }}>
        <span style={{ ...nameStyle, fontSize: 'var(--type-display)' }}>{vessel.static.name}</span>
        {modeChip}
        <span style={{ fontFamily: FONT.data, fontSize: 'var(--type-context)', fontVariantNumeric: 'tabular-nums', color: still ? '#ffffff' : NEUTRAL.ink }}>
          {locationName ? `${locationName.toUpperCase()} · ` : ''}{clock}
        </span>
        <button aria-label="expand command band" style={{ ...chevronBtn, position: 'absolute', top: 8, right: 8 }} onClick={() => togglePanel(`${id}:command`)}>
          <Glyph name="expand" size={12} />
        </button>
      </section>
    );
  }

  // voyage profile strip (round 32, replaces the round-30 route row) —
  // automotive trip canvas; absolute ETA + Z and distance-to-go live HERE
  let profile: React.ReactNode;
  const mono: React.CSSProperties = { fontFamily: FONT.data, fontSize: 'var(--type-context)' };
  // ROUND 83: ALL voyage context unified to the wind/waves register (the
  // environment-context scale) — font/data 15, dimmed, no tint/weight (reference
  // data). Endpoint labels use the same scale but ink/secondary (they're the
  // toggle + identity). Name / gauge values / mission clock are NOT touched.
  const colItem: React.CSSProperties = { fontFamily: FONT.data, fontSize: 'var(--type-context)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: NEUTRAL.inkMuted, whiteSpace: 'nowrap' };
  const endpointLabel: React.CSSProperties = { fontFamily: FONT.data, fontSize: 'var(--type-context)', color: NEUTRAL.inkSecondary, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
  // current-position reference (Venice = nearest port to where the vessel is NOW)
  const posRef = nearestNm < 3 ? `alongside ${nearest.name}` : `${nearestNm.toFixed(0)} nm from ${nearest.name}`;
  if (now.mode === 'PORT' || now.mode === 'STATION' || now.mode === 'STANDBY') {
    // honest variants — no fake progress; no route, so no endpoint columns —
    // keep a single centered context line (spec · position · speed)
    const at = now.mode === 'PORT' ? nearest.name
      : SITES.reduce((a, b) => (distanceNm(now.position, a) < distanceNm(now.position, b) ? a : b)).name;
    profile = (
      <div>
        <div style={{ ...mono, textAlign: 'center' }}>
          {now.mode === 'PORT' ? 'MOORED' : now.mode === 'STATION' ? 'ON STATION' : 'STANDBY'} — {at}
          {now.mode === 'PORT' && <StateMark port={at} />}
          {next && <span style={{ color: NEUTRAL.inkMuted }}> · next call {next.port} ETA {fmtTime(next.eta)}</span>}
        </div>
        <div style={{ ...colItem, textAlign: 'center', marginTop: 'var(--pad-section)' }}>
          {vessel.static.length_ft} ft {vessel.static.class} · {posRef} · {sog.toFixed(1)} kn
        </div>
      </div>
    );
  } else {
    const origin = transitOrigin(vessel);
    const toGoNm = next ? distanceNm(now.position, place(next.port)) : null;
    const frac = origin && next
      ? Math.min(1, Math.max(0, distanceNm(origin.pos, now.position) / Math.max(1, distanceNm(origin.pos, place(next.port)))))
      : null;
    const fracPct = frac !== null ? (frac * 100).toFixed(1) : null;
    const pctLabel = frac !== null ? `${Math.round(frac * 100)}%` : null;
    // ROUND 88: %/Venice marker labels overlap the destination column near 100%
    // progress. When the marker is in the right ~18% of the track, FLIP the labels
    // to the LEFT of the marker (translateX -100% + gap) so they never collide
    // with the destination text at any progress (tested 6/50/95/100%).
    const nearEnd = frac !== null && frac > 0.82;
    const markerLabel = (extra: React.CSSProperties): React.CSSProperties => ({
      ...colItem, position: 'absolute', left: `${fracPct}%`,
      transform: nearEnd ? 'translateX(-100%) translateX(-7px)' : 'translateX(-50%)',
      ...extra,
    });
    // ROUND 88: endpoint labels are plain (no per-label chevron); ONE maximize
    // button (above the grid) toggles BOTH detail columns. Default collapsed.
    profile = (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
          <button
            {...layer('VesselCommandBand / voyage / detail.toggle', 'single maximize/minimize — reveals/hides BOTH endpoint detail columns (origin spec/speed · dest ETA/NM-to-go) · default collapsed · click (round 88, replaces the two chevrons)', '{detailOpen} toggle')}
            onClick={() => setDetailOpen((o) => !o)} aria-expanded={detailOpen} aria-label={detailOpen ? 'hide voyage detail' : 'show voyage detail'}
            style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-line-strong)', borderRadius: 1, padding: 3, cursor: 'pointer', color: 'var(--color-ink-secondary)', lineHeight: 0 }}>
            <Glyph name={detailOpen ? 'collapse' : 'expand'} size={13} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, auto) 1fr minmax(150px, auto)', gap: 14, alignItems: 'start' }}>
          {/* ORIGIN column — plain label; detail revealed by the maximize toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, alignItems: 'flex-start' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
              <span {...layer('VesselCommandBand / profile / origin.text', 'font/data 15 · ink/secondary · endpoint label (name once)', '{transit-run start}')} style={endpointLabel}>{origin?.label ?? 'UNDERWAY'}</span>
              {origin?.isPort && <StateMark port={origin.label} />}
            </span>
            {detailOpen && (
              <>
                <span {...layer('VesselCommandBand / originCol / spec.text', 'font/data 15 · ink/muted · context (no tint)', '{static.length_ft} ft {static.class}')} style={colItem}>{vessel.static.length_ft} ft {vessel.static.class}</span>
                <span {...layer('VesselCommandBand / originCol / speed.text', 'font/data 15 · ink/muted · context', '{position.speed_over_ground_kn} kn')} style={colItem}>{sog.toFixed(1)} kn</span>
              </>
            )}
          </div>
          {/* CENTER — progress % above · track + marker (round 81) · Venice below */}
          <div style={{ position: 'relative', minWidth: 80, paddingTop: 18, paddingBottom: 18 }}>
            {pctLabel && fracPct !== null && (
              <div {...layer('VesselCommandBand / marker / progress.text', 'font/data 15 · ink/muted · progress % anchored above the marker (flips left near 100% so it never overlaps the destination, round 88) — bound to real voyage progress', '{round(frac*100)}%')} style={markerLabel({ top: 0 })}>{pctLabel}</div>
            )}
            {/* ROUND 81: greyscale progress — GREY track = remaining (ahead),
                WHITE overlay = covered (behind the marker); no blue. */}
            <div style={{ position: 'relative', height: 16 }}>
              <div {...layer('VesselCommandBand / profile / track.line', 'line/strong 2px · GREY = distance remaining (ahead of marker)', '{origin→destination, remaining}')} style={{ position: 'absolute', top: 7, left: 0, right: 0, height: 2, background: 'var(--color-line-strong)' }} />
              {frac !== null && (
                <>
                  <div {...layer('VesselCommandBand / profile / fill.line', 'ink/primary 2px · WHITE = distance covered (behind marker) — progress, not identity (round 81, blue removed)', '{distance covered fraction}')} style={{ position: 'absolute', top: 7, left: 0, width: `${fracPct}%`, height: 2, background: 'var(--color-ink-primary)' }} />
                  <div {...layer('VesselCommandBand / profile / vessel.glyph', 'glyph/vesselMarker 16px · white outline + dark halo for contrast at the white/grey boundary (round 81) · bow along the track', '{live position on track}')} style={{ position: 'absolute', top: 0, left: `calc(${fracPct}% - 8px)`, transform: 'rotate(90deg)', filter: 'drop-shadow(0 0 1.5px var(--color-surface-base)) drop-shadow(0 0 1px var(--color-surface-base))' }}>
                    <Glyph name="vesselMarker" size={16} color={NEUTRAL.ink} />
                  </div>
                </>
              )}
            </div>
            {/* current-position reference (round 82) — floats under the marker */}
            {fracPct !== null && (
              <div {...layer('VesselCommandBand / marker / position.text', 'font/data 15 · ink/muted · current-position reference (nearest port NOW) below the marker (flips left near 100%, round 88) — relative, never raw lat/lon (ruling 6)', '{nm from nearest port | alongside}')} style={markerLabel({ bottom: 0 })}>{posRef}</div>
            )}
          </div>
          {/* DESTINATION column — plain label; detail revealed by the maximize toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, alignItems: 'flex-end' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
              <span {...layer('VesselCommandBand / profile / destination.text', 'font/data 15 · ink/secondary · endpoint label (name once)', '{next_port_calls[0].port}')} style={endpointLabel}>{next?.port ?? '—'}</span>
              {next && <StateMark port={next.port} />}
            </span>
            {detailOpen && (
              <>
                {next && <span {...layer('VesselCommandBand / destCol / eta.text', 'font/data 15 · ink/muted · context (no tint) — absolute ETA + Z lives HERE', '{next_port_calls[0].eta}')} style={{ ...colItem, textAlign: 'right' }}>◇ ETA {fmtTime(next.eta)}</span>}
                {toGoNm !== null && <span {...layer('VesselCommandBand / destCol / toGo.text', 'font/data 15 · ink/muted · context · distance remaining', '{nm to destination}')} style={{ ...colItem, textAlign: 'right' }}>{toGoNm.toFixed(0)} NM TO GO</span>}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PRIMARY ROW — the only sticky element; constant height, pure CSS */}
      <section style={sticky}>
        <button aria-label="minimize command band" style={{ ...chevronBtn, position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={() => togglePanel(`${id}:command`)}>
          <Glyph name="collapse" size={12} />
        </button>
        {/* ROUND 79: the status row (CAUTION·ADVISORY + DATALINK/SYNC) moved to
            the GLOBAL top bar (AppHeader). The CommandBand header is now purely
            instruments + identity. Round-73's top alerts strip and bottom
            data-health footer are both removed. */}
        {/* round 53 / 79: three balanced masses (left cluster · center · right
            cluster), even gutters — round 79 GROWS the gauges and pulls the
            clusters inward (gap 44→30) to kill the dead air; balance preserved */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, flexWrap: 'wrap', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pad-section)' }}>
            <div style={{ display: 'contents' }} {...layer('VesselCommandBand / gaugeRail / speed.chart', 'Gauge primitive · 116px (round 79)', '{position.speed_over_ground_kn} / max {cruise×1.35}')}>
              <Gauge size={116} label="speed" value={sog} min={0} max={speedMax} display={`${sog.toFixed(1)} kn`} vital={aliveVital} />
            </div>
            <div style={{ display: 'contents' }} {...layer('VesselCommandBand / gaugeRail / burn.chart', 'Gauge primitive · 116px (round 79)', '{derived.burn_rate_gph} / max observed 1y')}>
              <Gauge size={116} label="burn" value={d.burn_rate_gph} min={0} max={maxObservedBurn(vessel)}
                display={`${Math.round(d.burn_rate_gph)} gph`} vital={aliveVital} />
            </div>
          </div>
          {/* broadcast center (round 52): full-glyph default — category words
              die, glyph prefixes carry the category; text values stay. Each
              register gets its own row with breathing room (gap 12); no line
              carries a stroke (the mode chip's box is the one allowed mode
              affordance — severity is the only other outline). */}
          <div style={{ minWidth: 200, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div {...layer('VesselCommandBand / centerStack / name.text', 'type/hero · font/display caps · ink/primary', '{vessel.static.name}')} style={nameStyle}>{vessel.static.name}</div>
            {/* round 52: master line — crew.glyph (slot, placeholder until drawn)
                + name; "master" word dropped, no box, no tooltip */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT.data, fontSize: 'var(--type-context)', color: NEUTRAL.inkSecondary }}>
              <span {...layer('VesselCommandBand / centerStack / crew.glyph', 'glyph/crew slot (placeholder until scraped) · ink/secondary — replaces the word "master"', 'crew Master')} style={{ lineHeight: 0, color: NEUTRAL.inkMuted }}><Glyph name="crew" size={13} /></span>
              <span {...layer('VesselCommandBand / centerStack / master.name.text', 'font/data 12 · ink/secondary · name as value (no label, no stroke)', '{crew Master.name}')}>{master?.name ?? '—'}</span>
            </div>
            {/* ROUND 73: mode glyph REMOVED — the mission clock carries mode
                (T− transit · ON STATION · IN PORT · STANDBY). Clock sits here,
                ABOVE the place line (round-73 order: name · master · clock ·
                place · wind/waves). Clock stays text; white when still (ruling 14). */}
            <span {...layer('VesselCommandBand / centerStack / clock.text', 'type/hero×0.6 · font/data tabular · mode-aware prefix (carries mode after the glyph removal, round 73) · white when still (ruling 14)', '{T−(eta−now) transit | ON STATION/IN PORT/STANDBY + elapsed} · countdown lives HERE only')} style={{ fontFamily: FONT.data, fontSize: 'var(--type-primary)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: still ? '#ffffff' : NEUTRAL.ink }}>
              {clock}
            </span>
            {/* round 52: place line — anchor.glyph (slot, placeholder) + place */}
            {locationName && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT.data, fontSize: 'var(--type-context)', color: NEUTRAL.inkSecondary }}>
                <span {...layer('VesselCommandBand / centerStack / anchor.glyph', 'glyph/anchor slot (placeholder until scraped) · ink/secondary — prefixes the place', 'place')} style={{ lineHeight: 0, color: NEUTRAL.inkMuted }}><Glyph name="anchor" size={13} /></span>
                <span {...layer('VesselCommandBand / centerStack / location.text', 'font/data 12 · ink/secondary · place as value', '{destination | moored port | work site}')}>{locationName.toUpperCase()}</span>
              </div>
            )}
            {/* ROUND 73: wind + waves on their OWN line BELOW the place line —
                held at context-scale (round 53), NOT promoted (they feed Calm
                Sea, they stay context). The weather-detail reveal rides this
                line now (current/visibility/precip). */}
            <RevealZone
              reveal={
                <Field level="vessel" field="weather.current" revealed>
                  <span>current {wx.current_kn} kn · visibility {wx.visibility_nm} nm · {wx.precip}</span>
                </Field>
              }
            >
              <span style={{ display: 'inline-flex', justifyContent: 'center', gap: 18, ...(wxStale ? gb.stale : {}) }} title={wxStale ? 'weather feed STALE' : undefined}>
                <Field level="vessel" field="weather.wind">
                  <WxInline g="wind" value={`${wx.wind_speed_kn} kn`} attrs={layer('VesselCommandBand / centerStack / wind.text', 'font/data 15 tabular · glyph ink/secondary · stale tint when WX stale · own line (round 73)', '{weather.wind_speed_kn} kn')} />
                </Field>
                <Field level="vessel" field="weather.waves">
                  <WxInline g="wave" value={`${wx.wave_height_ft} ft`} glyphColor={NEUTRAL.inkMuted} attrs={layer('VesselCommandBand / centerStack / waves.text', 'font/data 15 tabular · glyph ink/MUTED to match the wind glyph weight (round 79: drawn fill vs stroke) · stale tint when WX stale · own line', '{weather.wave_height_ft} ft')} />
                </Field>
              </span>
            </RevealZone>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pad-section)' }}>
            <div style={{ display: 'contents' }} {...layer('VesselCommandBand / gaugeRail / effDelta.chart', 'Gauge primitive · caution band ≥+8 (alert-backed)', '{derived.efficiency_delta_pct} vs mode baseline')}>
              <Gauge size={116} label="eff Δ" value={d.efficiency_delta_pct} min={-20} max={20}
                display={`${d.efficiency_delta_pct > 0 ? '+' : ''}${d.efficiency_delta_pct.toFixed(1)}%`} vital={effVital} minMaxLabels={['-20', '+20']}
                band={{ from: EFF_DELTA_CAUTION_PCT, to: 20, color: 'var(--color-alert-caution)' }} />
            </div>
            <div style={{ display: 'contents' }} {...layer('VesselCommandBand / gaugeRail / endurance.chart', 'Gauge primitive · log dial · caution band <72h (alert-backed)', '{derived.endurance_hours}')}>
              <Gauge size={116} label="endurance" value={Math.log10(endurance)} min={LOG_MIN} max={LOG_MAX}
                display={`${d.endurance_hours} h`} vital={endVital} minMaxLabels={['12', '2.4k']}
                band={{ from: LOG_MIN, to: Math.log10(BUNKER_SOON_H), color: 'var(--color-alert-caution)' }} />
            </div>
          </div>
        </div>
        {/* ROUND 79: the round-73 bottom data-health footer is REMOVED —
            DATALINK + LAST SYNC now live in the global top bar (AppHeader). */}
      </section>
      {/* SECONDARY — static flow, scrolls away naturally. ROUND 82: the ETA and
          spec lines are absorbed into the voyage bar's ENDPOINT-ANCHORED columns
          (origin detail left under the origin label, arrival detail right under
          the destination label, current-position reference floating with the
          marker). All reference/context: neutral, dimmed, context-scale, no
          tint/weight/alert. */}
      {/* ROUND 96: FLOAT — voyage bar panel fill removed; floats on the gradient.
          ROUND 101: the seam divider above is gone (removed on the sticky row); a
          small gap now separates the two floating blocks. Padding is just
          breathing room; glass when toggled. */}
      <section style={{ ...(surfaceGlass ? glassFill : {}), padding: 'var(--pad-card)', marginBottom: 8 }}>
        <Field level="vessel" field="next_port_calls"><Annotated name="RoutePanel" node="voyage-bar">{profile}</Annotated></Field>
        {wxStale && (
          <div style={{ ...mono, textAlign: 'center', marginTop: 'var(--pad-section)', color: 'var(--color-data-stale)' }}>
            [STALE] weather last received {fmtTime(vessel.history.timestamps.weather)}
          </div>
        )}
      </section>
    </>
  );
}
