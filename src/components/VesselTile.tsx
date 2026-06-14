'use client';
// Grid tile. ROUND 18: the board is CALM — tiles are inert to hover except
// the size control appearing (round 17). No hover reveals; detail access is
// click-only via mini → standard → expanded stepping. CONTEXTUAL fields
// (burn, next port) render inside the EXPANDED layout — the expand click IS
// the registry's one interaction. ROUND 61: the meter strip is the SOLE
// expand affordance (round-14 ⚖ #14 resolved — chevron/reveal dropped). It
// meters efficiency-deviation magnitude and tints with severity only when
// alert-backed; the severity-placement dev toggle (edge/strip/both) decides
// whether the alert color rides the status.line edge, the strip, or both.
// Status thresholds come from vesselStatus() in the data layer; this paints.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { TrendChartFill } from './TrendChartFill';
import { useContentWidth } from './NauticalChart';
import { Stat } from './Stat';
import { fmtPct } from './gb';
import { RADIUS, STATUS_COLOR, NEUTRAL, FONT, ALERT_TEXT_COLOR } from './probeTokens';
import { useState } from 'react';
import { useFleet, type ColorTreatment, type TileSize } from '../state/FleetProvider';
import { Glyph } from './Glyph';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

const SIZE_ORDER: TileSize[] = ['mini', 'standard', 'expanded'];

export function VesselTile({
  vessel,
  size,
  treatment,
  onSize,
}: {
  vessel: VesselState;
  /** round 17: resolved size (manual override or auto) — board computes it */
  size: TileSize;
  treatment: ColorTreatment;
  onSize: (s: TileSize) => void;
}) {
  const d = vessel.derived;
  const { motion, crossings } = useFleet();
  const [hot, setHot] = useState(false); // hover/focus-within → show controls
  const [sparkRef, sparkW] = useContentWidth(180); // round 39: full-width bottom spark
  const status = vesselStatus(vessel.alerts);
  const mini = size === 'mini';
  const tier = size === 'expanded' ? 2 : 1;
  const step = (dir: 1 | -1) => {
    const next = SIZE_ORDER[SIZE_ORDER.indexOf(size) + dir];
    if (next) onSize(next);
  };
  const colored = treatment === 'automotive' || status !== 'nominal';
  const alerted = vessel.alerts.length > 0;
  const active = d.mode === 'TRANSIT' || d.mode === 'STATION';
  const tileDim = !alerted && !active && status === 'nominal';
  const fullAlerts = vessel.alerts.filter((a) => a.level !== 'ADVISORY');

  // ROUND 66 — severity placement RESOLVED to STRIP fleet-wide (edge/both
  // retired). The tile carries NO severity outline: the round-37 perimeter
  // border and the round-57/63 name-divider status.line are both removed. The
  // meter strip is the primary severity carrier, with name tint + value tint
  // alongside. Nominal tiles: neutral strip, no tint, no border. The strip
  // meters efficiency-deviation magnitude (fill ∝ |Δ|, ±20% full scale) at
  // every size, tinting with status color only when alert-backed (round 61).
  const severe = status !== 'nominal';
  const devFrac = Math.min(1, Math.abs(d.efficiency_delta_pct) / 20);
  const stripFill = severe ? STATUS_COLOR[status] : NEUTRAL.inkMuted;

  return (
    <Link
      {...layer('VesselTile / bg.shape', 'surface/raised fill · BORDERLESS — no perimeter outline at all (round 66; the round-37 status border is removed, severity moves to the strip) · 45% dim when idle nominal', '{derived.mode}')}
      href={`/vessel/${vessel.static.id}`}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHot(false); }}
      onKeyDown={(e) => {
        if (e.key === '+' || e.key === '=') { e.preventDefault(); step(1); }
        if (e.key === '-') { e.preventDefault(); step(-1); }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: NEUTRAL.ink,
        border: 'none', // round 66: borderless, fill only — NO perimeter severity outline (NOT recolored to white/neutral; removed)
        borderRadius: RADIUS,
        background: NEUTRAL.surface, // body fill; header + spark bands step lighter
        padding: 0, // round 63: per-region padding so header/spark bands full-bleed
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        opacity: tileDim ? 0.45 : 1, // round 26: all idle nominal tiles recede
      }}
    >
      {motion === 'ripple' && crossings[vessel.static.id] && (
        <span key={crossings[vessel.static.id]} className="probe-ripple" style={{ borderColor: STATUS_COLOR[status] }} />
      )}
      {/* round 54: ONE state-aware resize toggle (was two buttons) — shows the
          collapse affordance when expanded, the expand affordance otherwise.
          One control, anchored top-right, no drift. Keyboard +/- keep the full
          mini↔standard↔expanded range; auto-promotion stays off (round 26). */}
      {hot && (
        <span style={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }}>
          <button
            aria-label={size === 'expanded' ? 'collapse tile' : 'expand tile'}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); step(size === 'expanded' ? -1 : 1); }}
            style={{ background: NEUTRAL.surfaceDim, border: '1px solid var(--color-line-strong)', borderRadius: RADIUS, padding: 2, cursor: 'pointer', color: NEUTRAL.inkSecondary, lineHeight: 0 }}
          >
            <Glyph name={size === 'expanded' ? 'collapse' : 'expand'} size={12} />
          </button>
        </span>
      )}
      {/* ROUND 70 — HEADER BAND REMOVED. The name sits directly on the tile's
          base fill (no grey band, no container, no stroke). The round-63 header
          fill-step read as functionless chrome and competed with the name for
          focus; severity already lives on the name/value/strip (round 66), so
          the header needs no container. Separation from the body is now SPACING
          ALONE — a generous vertical gap (header bottom-pad + body top-pad), no
          fill-step and no divider line (outlines reserved for severity). The
          tile reads as one unified surface with content floating on it. The
          SPARK fill band (round 63) is retained — it groups a distinct data
          region. Name position/size (D-DIN)/tint (gold when alerted, neutral
          nominal) unchanged. RADIUS stays 1px (round 36). */}
      <div style={{ padding: mini ? '14px 14px 18px' : '22px 14px 26px', textAlign: 'center' }}>
        <div {...layer('VesselTile / name.text', 'type/DISPLAY (var --type-display) · font/display caps 700 · status tint when alerted (earned) · sits on the tile base fill (round 70)', '{vessel.static.name}')} style={{ fontFamily: FONT.display, fontSize: 'var(--type-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: status !== 'nominal' ? STATUS_COLOR[status] : undefined }}>{vessel.static.name}</div>
      </div>
      {/* BODY — darker fill (tile base shows through); centered glyph-above-
          value at top, two-column footer pinned to the base (round 63 mock) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: mini ? '10px 14px' : '16px 14px' }}>
        {/* primary value: category glyph (calendar) centered ABOVE the value */}
        <div style={{ textAlign: 'center' }}>
          <div title="30-day trend" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: colored && status !== 'nominal' ? STATUS_COLOR[status] : NEUTRAL.ink }}>
            <span {...layer('VesselTile / trend.glyph', 'glyph/calendar (drawn) · NEUTRAL UI ink — not a status carrier (round 63) · sized to the mock · identifies the 30-day trend', '30d trend')} style={{ lineHeight: 0, color: NEUTRAL.ink }}><Glyph name="calendar" size={mini ? 20 : 26} /></span>
            <span {...layer('VesselTile / trend.value.text', 'type/HERO (var --type-hero) · font/data tabular · status tint (earned) · automotive ✓ when nominal', '{derived.trend_30d} %/30d — the primary board signal (ruling 13)')} style={{ fontFamily: FONT.data, fontSize: 'var(--type-hero)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              {fmtPct(d.trend_30d)}
              {treatment === 'automotive' && status === 'nominal' && (
                <span style={{ color: STATUS_COLOR.nominal, fontSize: 16 }}> ✓</span>
              )}
            </span>
          </div>
        </div>
        {/* round 33: the alert badge concept is retired — border + name tint
            ARE the badge; full alert lines appear only at 2x */}
        {/* expanded: the chart absorbs the void — flex-grow, plot scales */}
        {tier === 2 && (
          <div {...layer('VesselTile / body / trendChart.chart', 'ink/secondary line · zero axis', '{daily_delta_1y[-30d]}')} style={{ flex: 1, minHeight: 96, marginTop: 12 }}>
            <TrendChartFill values={d.daily_delta_1y.slice(-30).map((x) => x.delta)} />
          </div>
        )}
        {/* 2x: alerts in full text — the tile's reason for being big */}
        {tier === 2 && fullAlerts.length > 0 && (
          <div style={{ marginTop: 8, textAlign: 'left', fontFamily: FONT.data, fontSize: 'var(--type-context)', lineHeight: 1.6 }}>
            {fullAlerts.map((a, i) => (
              <div key={i} {...layer('VesselTile / alert.line', 'tag = severity color · message ink/secondary (round 33 grammar) · 2x only', '{alerts[] level + message}')} style={{ color: NEUTRAL.inkSecondary }}>
                <span style={{ color: ALERT_TEXT_COLOR[a.level] }}>[{a.level}]</span> {a.message}
              </div>
            ))}
          </div>
        )}
        {tier === 2 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 24, justifyContent: 'center', textAlign: 'left' }}>
            <Stat label="endurance" value={`${d.endurance_hours} h`} />
            <Stat label="now vs baseline" value={fmtPct(d.efficiency_delta_pct)} />
          </div>
        )}
        {tier === 2 && (
          <div style={{ marginTop: 6, textAlign: 'center', fontFamily: FONT.data, fontSize: 'var(--type-context)', color: NEUTRAL.inkSecondary }}>
            <Field level="fleet" field="burn_rate_gph" revealed>
              <span>burn {d.burn_rate_gph} gph · next {vessel.history.nextPortCalls[0]?.port ?? '—'}</span>
            </Field>
          </div>
        )}
        {/* TWO-COLUMN footer (standard only): endurance LEFT, now RIGHT — glyph
            ABOVE value, centered columns, even baseline, balanced gutters,
            pinned to the body's base (round 63, replaces the right-stacked rows) */}
        {tier === 1 && !mini && (
          <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span {...layer('VesselTile / endurance.glyph', 'glyph/wave (drawn) · NEUTRAL UI ink (round 63) · sized to the mock · identifies endurance', 'endurance')} style={{ color: NEUTRAL.ink, lineHeight: 0 }}><Glyph name="wave" size={24} /></span>
              <span {...layer('VesselTile / endurance.value.text', 'font/data 14 tabular · ink/primary · centered under its glyph (round 63)', '{derived.endurance_hours} h')} style={{ fontSize: 'var(--type-context)', fontVariantNumeric: 'tabular-nums', color: NEUTRAL.ink, fontFamily: FONT.data }}>{d.endurance_hours} h</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span {...layer('VesselTile / now.glyph', 'glyph/clock (drawn) · NEUTRAL UI ink (round 63) · sized to the mock · identifies now-vs-baseline', 'now vs mode baseline')} style={{ color: NEUTRAL.ink, lineHeight: 0 }}><Glyph name="clock" /></span>
              <span {...layer('VesselTile / now.value.text', 'font/data 14 tabular · ink/primary · centered under its glyph (round 63)', '{derived.efficiency_delta_pct} vs mode baseline')} style={{ fontSize: 'var(--type-context)', fontVariantNumeric: 'tabular-nums', color: NEUTRAL.ink, fontFamily: FONT.data }}>{fmtPct(d.efficiency_delta_pct)}</span>
            </div>
          </div>
        )}
      </div>
      {/* deviation meter strip (round 61 — behavior UNTOUCHED): sits just above
          the spark band, padded so it never reads as part of that fill band */}
      <div {...layer('VesselTile / footer / deviation.fill', 'meters |efficiency Δ| (fill ∝ magnitude, ±20% full scale) · ink/muted fill | status color only when alert-backed + placement=strip/both · surface/overlay track · sole expand affordance', '{|derived.efficiency_delta_pct|}')} style={{ padding: '0 14px 6px' }}>
        <div style={{ height: 3, background: 'var(--color-surface-overlay)', borderRadius: RADIUS }}>
          <div style={{ height: '100%', width: `${Math.round(devFrac * 100)}%`, background: stripFill, borderRadius: RADIUS }} />
        </div>
      </div>
      {/* SPARK band — its OWN lighter fill-step region, NO stroke frame (round
          63 mock item 6); the 24h signature docks full-width, every size */}
      <div style={{ background: '#2b2b2b', padding: '6px 10px' }}>
        <div ref={sparkRef} {...layer('VesselTile / spark.container', 'full card width in its own lighter fill band (#2b2b2b, no stroke frame) — the 24h signature dock (round 39 / 63 / 66)', '—')}>
          <Sparkline
            values={d.sparkline_24h} width={sparkW} height={20} framed={false}
            layerSvg={layer('VesselTile / spark.chart', 'ink/secondary 1px polyline · the 24h signature', '{derived.sparkline_24h — hourly efficiency_delta}')}
            layerBaseline={layer('VesselTile / spark.baseline.line', 'line/subtle 1px · zero axis', 'y = 0')}
          />
        </div>
      </div>
    </Link>
  );
}
