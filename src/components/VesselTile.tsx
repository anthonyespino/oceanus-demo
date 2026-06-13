'use client';
// Grid tile. ROUND 18: the board is CALM — tiles are inert to hover except
// the size control appearing (round 17). No hover reveals; detail access is
// click-only via mini → standard → expanded stepping. CONTEXTUAL fields
// (burn, next port) render inside the EXPANDED layout — the expand click IS
// the registry's one interaction. The round 14 meter affordance survives as
// a passive endurance strip (no trigger). Status thresholds come from
// vesselStatus() in the data layer; this file only paints.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { TrendChartFill } from './TrendChartFill';
import { useContentWidth } from './NauticalChart';
import { Stat } from './Stat';
import { fmtPct } from './gb';
import { RADIUS, STATUS_COLOR, NEUTRAL, TYPE, FONT, ALERT_TEXT_COLOR } from './probeTokens';
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
  const { motion, crossings, revealStyle } = useFleet();
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
  const dotColor = colored ? STATUS_COLOR[status] : NEUTRAL.inkMuted;
  // Round 26: ONE border voice — rail grammar. Round 37 (fills, not
  // fences): the nominal hairline DIES — tiles are filled surfaces, and an
  // outline on the board now means severity, nothing else.
  const alerted = vessel.alerts.length > 0;
  const active = d.mode === 'TRANSIT' || d.mode === 'STATION';
  const borderColor = status !== 'nominal' ? STATUS_COLOR[status] : 'transparent';
  const tileDim = !alerted && !active && status === 'nominal';
  const fullAlerts = vessel.alerts.filter((a) => a.level !== 'ADVISORY');

  const now = vessel.history.minutes.at(-1)!;
  const fuelFrac = now.tanks.reduce((a, t) => a + t.level_gal, 0) / now.tanks.reduce((a, t) => a + t.capacity_gal, 0);
  const enduranceAlert = vessel.alerts.find((a) => a.code === 'ENDURANCE' || a.code === 'BUNKER_SOON');
  const meterColor = enduranceAlert
    ? enduranceAlert.level === 'CAUTION' ? 'var(--color-alert-caution)' : 'var(--color-alert-advisory)'
    : undefined;

  return (
    <Link
      {...layer('VesselTile / bg.shape', 'surface/raised fill · NO border at rest (round 37); status border ONLY for watch/degraded · 45% dim when idle nominal', '{vesselStatus(alerts)} drives border tint · {derived.mode}')}
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
        border: `1px solid ${borderColor}`,
        borderRadius: RADIUS,
        background: NEUTRAL.surface,
        padding: 'var(--pad-card)',
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
      {/* header block: fixed. Round 47: trend is glyph + value (the "30D
          TREND" text label dropped, matching the round-39 endurance/now
          treatment — glyph carries identity, title teaches it). */}
      {/* round 57: status.dot → status.line (Figma source of truth). Severity
          as an integrated edge line under the name — annunciator-strip read,
          unifying the status border and indicator into one gesture. Mode chip
          dropped from the tile (no mode.glyph here anymore). trend/now/
          endurance slots wired to their library glyphs (calendar/clock/wave),
          rendering placeholder until the drawn SVGs import. */}
      <div style={{ textAlign: 'center' }}>
        <div {...layer('VesselTile / name.text', 'type/name · font/display caps · status tint when alerted (earned)', '{vessel.static.name}')} style={{ ...TYPE.name, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: status !== 'nominal' ? STATUS_COLOR[status] : undefined }}>{vessel.static.name}</div>
        <div {...layer('VesselTile / status.line', 'severity as an integrated edge line · status color | ink/muted nominal (treatment B) — the in-card status indicator (round 57, replaces the dot)', '{vesselStatus(alerts)}')} style={{ height: 2, width: '100%', background: dotColor, margin: '8px 0' }} />
        <div title="30-day trend" style={{ marginTop: 6, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: colored && status !== 'nominal' ? STATUS_COLOR[status] : NEUTRAL.ink }}>
          <span {...layer('VesselTile / trend.glyph', 'slot → glyph/calendar (placeholder until SVG import) · ink/muted · identifies the 30-day trend', '30d trend')} style={{ lineHeight: 0, color: NEUTRAL.inkMuted }}><Glyph name="calendar" size={14} /></span>
          <span {...layer('VesselTile / trend.value.text', 'type/hero · font/data tabular · status tint (earned) · automotive ✓ when nominal', '{derived.trend_30d} %/30d — the primary board signal (ruling 13)')} style={{ fontFamily: FONT.data, fontSize: mini ? 24 : 'var(--type-hero-size)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {fmtPct(d.trend_30d)}
            {treatment === 'automotive' && status === 'nominal' && (
              <span style={{ color: STATUS_COLOR.nominal, fontSize: 16 }}> ✓</span>
            )}
          </span>
        </div>
      </div>
      {/* round 33: the alert badge concept is retired — border + dot + name
          tint ARE the badge; full alert lines appear only at 2x */}
      {/* expanded: the chart absorbs the void — flex-grow, plot scales */}
      {tier === 2 && (
        <div {...layer('VesselTile / body / trendChart.chart', 'ink/secondary line · zero axis', '{daily_delta_1y[-30d]}')} style={{ flex: 1, minHeight: 96, marginTop: 10 }}>
          <TrendChartFill values={d.daily_delta_1y.slice(-30).map((x) => x.delta)} />
        </div>
      )}
      {/* 2x: alerts in full text — the tile's reason for being big */}
      {tier === 2 && fullAlerts.length > 0 && (
        <div style={{ marginTop: 8, textAlign: 'left', fontFamily: FONT.data, fontSize: 11, lineHeight: 1.6 }}>
          {/* round 33 grammar: one severity voice per line — the tag */}
          {fullAlerts.map((a, i) => (
            <div key={i} {...layer('VesselTile / alert.line', 'tag = severity color · message ink/secondary (round 33 grammar) · 2x only', '{alerts[] level + message}')} style={{ color: NEUTRAL.inkSecondary }}>
              <span style={{ color: ALERT_TEXT_COLOR[a.level] }}>[{a.level}]</span> {a.message}
            </div>
          ))}
        </div>
      )}
      {tier === 2 && (
        <div style={{ marginTop: 10, display: 'flex', gap: 24, justifyContent: 'center', textAlign: 'left' }}>
          <Stat label="endurance" value={`${d.endurance_hours} h`} />
          <Stat label="now vs baseline" value={fmtPct(d.efficiency_delta_pct)} />
        </div>
      )}
      {tier === 2 && (
        <div style={{ marginTop: 6, textAlign: 'center', fontFamily: FONT.data, fontSize: 11, color: NEUTRAL.inkSecondary }}>
          <Field level="fleet" field="burn_rate_gph" revealed>
            <span>burn {d.burn_rate_gph} gph · next {vessel.history.nextPortCalls[0]?.port ?? '—'}</span>
          </Field>
        </div>
      )}
      {/* round 39 label diet: glyph + numeral, fixed glyph column so the
          numerals align down the board */}
      {tier === 1 && !mini && (
        <div style={{ marginTop: 10, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span {...layer('VesselTile / endurance.glyph', 'slot → glyph/wave (placeholder until SVG import) · 13px · ink/muted · identifies endurance', 'endurance')} style={{ width: 16, flexShrink: 0, color: NEUTRAL.inkMuted, lineHeight: 0 }}><Glyph name="wave" size={13} /></span>
            <span {...layer('VesselTile / endurance.value.text', 'font/data 12 tabular · right-aligned', '{derived.endurance_hours} h')} style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: NEUTRAL.ink, fontFamily: FONT.data }}>{d.endurance_hours} h</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 2 }}>
            <span {...layer('VesselTile / now.glyph', 'slot → glyph/clock (placeholder until SVG import) · 13px · ink/muted · identifies now-vs-baseline', 'now vs mode baseline')} style={{ width: 16, flexShrink: 0, color: NEUTRAL.inkMuted, lineHeight: 0 }}><Glyph name="clock" size={13} /></span>
            <span {...layer('VesselTile / now.value.text', 'font/data 12 tabular · right-aligned', '{derived.efficiency_delta_pct} vs mode baseline')} style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: NEUTRAL.ink, fontFamily: FONT.data }}>{fmtPct(d.efficiency_delta_pct)}</span>
          </div>
        </div>
      )}
      {/* round 39: the 24h signature docks at the bottom edge — full card
          width, fixed height, every size; the 2x trend chart stays the
          elastic element */}
      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        {/* round 18: passive endurance strip (meter variant) — indicator
            only, not a trigger */}
        {revealStyle === 'meter' && (
          <div {...layer('VesselTile / footer / fuel.fill', 'ink/muted fill | alert color when endurance-backed · surface/overlay track', '{Σ tank level / Σ capacity}')} style={{ paddingBottom: 6 }}>
            <div style={{ height: 3, background: 'var(--color-surface-overlay)', borderRadius: RADIUS }}>
              <div style={{ height: '100%', width: `${Math.round(fuelFrac * 100)}%`, background: meterColor ?? 'var(--color-ink-muted)', borderRadius: RADIUS }} />
            </div>
          </div>
        )}
        <div ref={sparkRef} {...layer('VesselTile / spark.container', 'full card width, fixed height, every size — the 24h signature dock (round 39)', '—')}>
          <Sparkline
            values={d.sparkline_24h} width={sparkW} height={20}
            layerSvg={layer('VesselTile / spark.chart', 'ink/secondary 1px polyline · the 24h signature', '{derived.sparkline_24h — hourly efficiency_delta}')}
            layerBaseline={layer('VesselTile / spark.baseline.line', 'line/subtle 1px · zero axis', 'y = 0')}
          />
        </div>
      </div>
    </Link>
  );
}
