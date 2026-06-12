'use client';
// ROUND 27: VesselCommandBand — VesselHeader + TelemetryBand merged into one
// instrument (both die; renames recorded for barrel + Figma). Broadcast
// symmetry:
//   [SPEED] [BURN]   ·   NAME / mode chip / MISSION CLOCK (centered)   ·   [EFF Δ] [ENDURANCE]
// Secondary facts row beneath, full width, muted. ROUND 30: the band absorbs
// the voyage card — third row = route strip + wind/waves (the card dies).
// DEDUP LEDGER (round 30, enforced here): countdown lives in the clock ONLY;
// absolute ETA + Z in the route strip ONLY; distance-to-go in the strip ONLY;
// next-port NAME as the clock subtitle ONLY; wind/waves in the band ONLY.
// The clock sits one type step below the name (≈60%) — the vessel name is
// the band's only hero. First element in the inspector, position: sticky —
// stuck collapses everything but the primary row; the collapse chevron
// reduces the band to the name + mode + clock line.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { VesselState, VesselSample } from '../data/types';
import { EFF_DELTA_CAUTION_PCT, BUNKER_SOON_H } from '../data/alerts';
import { PORTS, SITES, distanceNm, place } from '../data/fleet';
import { useFleet } from '../state/FleetProvider';
import { Field } from './Field';
import { Gauge } from './Gauge';
import { Glyph, MODE_GLYPH } from './Glyph';
import { StateMark } from './StateMark';
import { RevealZone } from './Contextual';
import { Stat } from './Stat';
import { ACCENT, FONT, NEUTRAL, RADIUS } from './probeTokens';
import { gb, fmtDay, fmtPct, fmtTime } from './gb';

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

function lastPortName(v: VesselState): string | null {
  for (let i = v.history.minutes.length - 1; i >= 0; i--) {
    const s: VesselSample = v.history.minutes[i];
    if (s.mode === 'PORT') {
      const p = PORTS.reduce((a, b) => (distanceNm(s.position, a) < distanceNm(s.position, b) ? a : b));
      return p.name;
    }
  }
  return null;
}

const LOG_MIN = Math.log10(12);
const LOG_MAX = Math.log10(2400);

export function VesselCommandBand({ vessel }: { vessel: VesselState }) {
  const { collapsedPanels, togglePanel } = useFleet();
  const id = vessel.static.id;
  const min = !!collapsedPanels[`${id}:command`];

  // stuck = the band has pinned: a 1px sentinel above it left the viewport
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [min]); // sentinel remounts when the chevron toggles the band

  const d = vessel.derived;
  const now = vessel.history.minutes.at(-1)!;
  const sog = now.position.speed_over_ground_kn;
  const speedMax = Math.ceil(vessel.static.cruise_kn * 1.35);
  const endurance = Math.min(2400, Math.max(12, d.endurance_hours));
  const still = now.mode === 'PORT' && sog < 0.5;
  const effVital = still ? 'still' : d.efficiency_delta_pct > EFF_DELTA_CAUTION_PCT ? 'watch' : 'nominal';
  const endVital = still ? 'still' : d.endurance_hours < BUNKER_SOON_H ? 'watch' : 'nominal';
  const aliveVital = still ? 'still' : 'nominal';

  // mission clock (mode-aware, round 22)
  const next = vessel.history.nextPortCalls[0];
  let clock: string;
  let context: string | null = null;
  let frac: number | null = null;
  if (now.mode === 'TRANSIT' && next) {
    clock = `T−${hhmm(next.eta - now.t)}`;
    context = next.port.replace(',', '').toUpperCase();
    const from = lastPortName(vessel);
    if (from) {
      frac = Math.min(1, Math.max(0,
        distanceNm(place(from), now.position) / Math.max(1, distanceNm(place(from), place(next.port)))));
    }
  } else {
    clock = hhmm(modeElapsedMs(vessel));
    context = now.mode === 'STATION' ? 'ON STATION' : now.mode === 'PORT' ? 'IN PORT' : 'STANDBY';
  }

  // secondary facts (the old header's, which dies)
  const master = vessel.history.crew.find((c) => c.role === 'Master');
  const nearest = PORTS.reduce((a, b) => (distanceNm(now.position, a) < distanceNm(now.position, b) ? a : b));
  const nearestNm = distanceNm(now.position, nearest);

  // round 30: route strip (the voyage card's row) — absolute ETA + Z and
  // distance-to-go live HERE only; the countdown stays in the clock
  const wx = now.weather;
  const wxStale = d.staleness.weather === 'STALE';
  const mono: React.CSSProperties = { fontFamily: FONT.data, fontSize: 11 };
  const node: React.CSSProperties = { width: 7, height: 7, background: NEUTRAL.inkSecondary, flexShrink: 0 };
  const portName: React.CSSProperties = { ...mono, minWidth: 0, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
  const calls = vessel.history.nextPortCalls;
  let routeStrip: React.ReactNode;
  if (now.mode === 'PORT') {
    routeStrip = (
      <div style={mono}>
        MOORED — {nearest.name} <StateMark port={nearest.name} />
        {next && <span style={{ color: NEUTRAL.inkMuted }}> · next call {next.port} ETA {fmtTime(next.eta)}</span>}
      </div>
    );
  } else if (now.mode === 'STATION' || now.mode === 'STANDBY') {
    const site = SITES.reduce((a, b) => (distanceNm(now.position, a) < distanceNm(now.position, b) ? a : b));
    routeStrip = (
      <div style={mono}>
        {now.mode === 'STATION' ? 'ON STATION' : 'STANDBY'} — {site.name}
        {next && <span style={{ color: NEUTRAL.inkMuted }}> · next call {next.port} ETA {fmtTime(next.eta)}</span>}
      </div>
    );
  } else {
    const from = lastPortName(vessel);
    const toGoNm = next ? distanceNm(now.position, place(next.port)) : null;
    routeStrip = (
      <div>
        {toGoNm !== null && (
          <div style={{ ...mono, fontSize: 10, color: NEUTRAL.inkMuted, textAlign: 'right', marginBottom: 4 }}>
            {toGoNm.toFixed(0)} NM TO GO{calls[1] ? ` · then ${calls[1].port}` : ''}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(56px, auto) 1fr minmax(56px, auto)', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={node} />
            <span style={{ ...portName, color: NEUTRAL.inkSecondary }}>{from ?? 'UNDERWAY >24H'}</span>
            {from && <StateMark port={from} />}
          </div>
          <div style={{ height: 6, background: NEUTRAL.surfaceDim, borderRadius: RADIUS, position: 'relative', minWidth: 60 }}>
            {frac !== null && (
              <div style={{ position: 'absolute', inset: 0, width: `${(frac * 100).toFixed(1)}%`, background: ACCENT.primary, borderRadius: RADIUS }} />
            )}
            {frac !== null && (
              <div style={{ position: 'absolute', top: -2, left: `calc(${(frac * 100).toFixed(1)}% - 5px)`, width: 10, height: 10, background: NEUTRAL.ink }} />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, justifyContent: 'flex-end' }}>
            <span style={node} />
            <span style={portName}>{next?.port ?? '—'}</span>
            {next && <StateMark port={next.port} />}
            {next && (
              <span style={{ ...mono, color: NEUTRAL.inkMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>ETA {fmtTime(next.eta)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // round 28: value-on-top makes gauges taller — stuck drops the dials one
  // step so the pinned band still reads as a single tight row
  const gz = stuck ? 80 : 96;

  const chevronBtn: React.CSSProperties = {
    background: NEUTRAL.surfaceDim, border: '1px solid var(--color-line-strong)',
    borderRadius: RADIUS, padding: 2, cursor: 'pointer', color: NEUTRAL.inkSecondary, lineHeight: 0,
  };
  const modeChip = (
    <Field level="vessel" field="mode">
      <span style={{ ...gb.boxTight, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
        <Glyph name={MODE_GLYPH[d.mode]} size={12} />{d.mode}
      </span>
    </Field>
  );
  const fleetLink = (
    <Link href="/" style={{ textDecoration: 'underline', fontSize: 12, position: 'absolute', top: 10, left: 'var(--pad-card)' }}>
      ← fleet
    </Link>
  );
  const nameStyle: React.CSSProperties = {
    fontFamily: FONT.display, fontSize: 'var(--type-hero-size)', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1.1,
  };

  // collapsed: name + mode + clock, one line
  if (min) {
    return (
      <>
      <div ref={sentinel} style={{ height: 1, marginBottom: -1 }} />
      <section style={{
        ...gb.box, marginBottom: 8, position: 'sticky', top: 0, zIndex: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        paddingTop: 'var(--pad-section)', paddingBottom: 'var(--pad-section)',
        boxShadow: stuck ? '0 8px 16px -10px rgba(0,0,0,0.6)' : undefined,
      }}>
        {fleetLink}
        <span style={{ ...nameStyle, fontSize: 18 }}>{vessel.static.name}</span>
        {modeChip}
        <span style={{ fontFamily: FONT.data, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: still ? '#ffffff' : NEUTRAL.ink }}>
          {now.mode === 'TRANSIT' ? `${clock} · ${context}` : `${context} ${clock}`}
        </span>
        <button aria-label="expand command band" style={{ ...chevronBtn, position: 'absolute', top: 8, right: 8 }} onClick={() => togglePanel(`${id}:command`)}>
          <Glyph name="expand" size={12} />
        </button>
      </section>
      </>
    );
  }

  return (
    <>
      <div ref={sentinel} style={{ height: 1, marginBottom: -1 }} />
      <section style={{
        ...gb.box, marginBottom: 8, position: 'sticky', top: 0, zIndex: 6,
        // shadow hairline when stuck — the band reads as a surface over the cards
        boxShadow: stuck ? '0 1px 0 var(--color-line-strong), 0 10px 18px -10px rgba(0,0,0,0.6)' : undefined,
      }}>
        {fleetLink}
        <button aria-label="minimize command band" style={{ ...chevronBtn, position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={() => togglePanel(`${id}:command`)}>
          <Glyph name="collapse" size={12} />
        </button>
        {/* round 28: value-on-top raises the gauge tops — clear the ← fleet
            link and the chevron before the first row of values */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pad-section)', flexWrap: 'wrap', marginTop: 14 }}>
          <Gauge size={gz} label="speed" value={sog} min={0} max={speedMax} display={`${sog.toFixed(1)} kn`} vital={aliveVital} />
          <Gauge size={gz} label="burn" value={d.burn_rate_gph} min={0} max={maxObservedBurn(vessel)}
            display={`${Math.round(d.burn_rate_gph)} gph`} vital={aliveVital} />
          {/* broadcast center: identity over the mission clock */}
          <div style={{ flex: 1, minWidth: 220, textAlign: 'center' }}>
            <div style={nameStyle}>{vessel.static.name}</div>
            <div style={{ marginTop: 4 }}>{modeChip}</div>
            {/* round 30: clock drops one type step — the name is the only hero */}
            <div style={{ marginTop: 6, fontFamily: FONT.data, fontSize: 'calc(var(--type-hero-size) * 0.6)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: still ? '#ffffff' : NEUTRAL.ink }}>
              {now.mode === 'TRANSIT' ? clock : `${context} ${clock}`}
              {now.mode === 'TRANSIT' && context && (
                <span style={{ fontSize: 12, color: NEUTRAL.inkSecondary }}> · {context}</span>
              )}
            </div>
            {/* round 30 dedup: the route-progress hairline died — progress
                lives in the route strip only */}
            <div style={{ fontFamily: FONT.data, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: NEUTRAL.inkMuted, marginTop: 6 }}>
              mission clock
            </div>
          </div>
          <Gauge size={gz} label="eff Δ" value={d.efficiency_delta_pct} min={-20} max={20}
            display={fmtPct(d.efficiency_delta_pct)} vital={effVital} minMaxLabels={['-20', '+20']}
            band={{ from: EFF_DELTA_CAUTION_PCT, to: 20, color: 'var(--color-alert-caution)' }} />
          <Gauge size={gz} label="endurance" value={Math.log10(endurance)} min={LOG_MIN} max={LOG_MAX}
            display={`${d.endurance_hours} h`} vital={endVital} minMaxLabels={['12', '2.4k']}
            band={{ from: LOG_MIN, to: Math.log10(BUNKER_SOON_H), color: 'var(--color-alert-caution)' }} />
        </div>
        {/* secondary facts — collapse when stuck: the band tightens to its
            primary row. Round 30 dedup: the "next: …" fact is gone — the
            next-port NAME lives in the clock subtitle, its ETA in the strip */}
        {!stuck && (
          <div style={{
            display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center',
            marginTop: 'var(--pad-section)', color: NEUTRAL.inkSecondary, fontFamily: FONT.data, fontSize: 12,
          }}>
            <span style={{ color: NEUTRAL.inkMuted }}>{vessel.static.length_ft} ft {vessel.static.class}</span>
            <Field level="vessel" field="position">
              <span>{nearestNm < 3 ? `alongside ${nearest.name}` : `${nearestNm.toFixed(0)} nm from ${nearest.name}`}</span>
            </Field>
            <span>{sog.toFixed(1)} kn</span>
            <span>master: {master?.name ?? '—'} (since {master ? fmtDay(master.onboard_since) : '—'})</span>
          </div>
        )}
        {/* round 30: the voyage card dissolves into the band — route strip +
            wind/waves. Also hidden when stuck. */}
        {!stuck && (
          <RevealZone
            reveal={
              <Field level="vessel" field="weather.current" revealed>
                <span>current {wx.current_kn} kn · visibility {wx.visibility_nm} nm · {wx.precip}</span>
              </Field>
            }
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginTop: 'var(--pad-section)', ...(wxStale ? gb.stale : {}) }}>
              <div style={{ flex: '1 1 360px', minWidth: 0 }}>
                <Field level="vessel" field="next_port_calls">{routeStrip}</Field>
              </div>
              <Field level="vessel" field="weather.wind">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Glyph name="wind" size={14} />
                  <Stat label="wind" value={`${wx.wind_speed_kn} kn`} size={18} />
                </span>
              </Field>
              <Field level="vessel" field="weather.waves">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Glyph name="wave" size={14} />
                  <Stat label="waves" value={`${wx.wave_height_ft} ft`} size={18} />
                </span>
              </Field>
              {wxStale && <span style={{ fontFamily: FONT.data, fontSize: 11, color: 'var(--color-data-stale)' }}>[STALE] last received {fmtTime(vessel.history.timestamps.weather)}</span>}
            </div>
          </RevealZone>
        )}
      </section>
    </>
  );
}
