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
import { Glyph, type GlyphName } from './Glyph';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

const SIZE_ORDER: TileSize[] = ['mini', 'standard', 'expanded'];

const MODE_GLYPH: Record<string, GlyphName> = { TRANSIT: 'route', STATION: 'vessel', STANDBY: 'clock', PORT: 'anchor' };



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
      {...layer('VesselTile / frame / border.status', 'hairline | status border when alerted · 45% dim when idle nominal (round 26 grammar)', '{vesselStatus(alerts)} · {derived.mode}')}
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
      {/* round 17: size control — one click, instant, no navigation */}
      {hot && (
        <span style={{ position: 'absolute', top: 4, right: 4, display: 'inline-flex', gap: 2, zIndex: 2 }}>
          {size !== 'mini' && (
            <button
              aria-label="collapse tile"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); step(-1); }}
              style={{ background: NEUTRAL.surfaceDim, border: '1px solid var(--color-line-strong)', borderRadius: RADIUS, padding: 2, cursor: 'pointer', color: NEUTRAL.inkSecondary, lineHeight: 0 }}
            >
              <Glyph name="collapse" size={12} />
            </button>
          )}
          {size !== 'expanded' && (
            <button
              aria-label="expand tile"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); step(1); }}
              style={{ background: NEUTRAL.surfaceDim, border: '1px solid var(--color-line-strong)', borderRadius: RADIUS, padding: 2, cursor: 'pointer', color: NEUTRAL.inkSecondary, lineHeight: 0 }}
            >
              <Glyph name="expand" size={12} />
            </button>
          )}
        </span>
      )}
      {/* header block: fixed */}
      <div style={{ textAlign: 'center' }}>
        <span {...layer('VesselTile / header / dot.status', 'status color | ink/muted when nominal (treatment B)', '{vesselStatus(alerts)}')} style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: dotColor, marginBottom: 8 }} />
        <div {...layer('VesselTile / header / name.text', 'type/name · font/display caps · status tint when alerted (earned)', '{vessel.static.name}')} style={{ ...TYPE.name, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: status !== 'nominal' ? STATUS_COLOR[status] : undefined }}>{vessel.static.name}</div>
        <div {...layer('VesselTile / header / trend.text', 'type/hero · font/data tabular · status tint (earned)', '{derived.trend_30d} %/30d')} style={{ marginTop: 6, display: 'inline-block', color: colored && status !== 'nominal' ? STATUS_COLOR[status] : NEUTRAL.ink }}>
          <Stat label="30d trend" value={
            <>
              {fmtPct(d.trend_30d)}
              {treatment === 'automotive' && status === 'nominal' && (
                <span style={{ color: STATUS_COLOR.nominal, fontSize: 16 }}> ✓</span>
              )}
            </>
          } size={mini ? 24 : 'var(--type-hero-size)'} />
        </div>
        <div style={{ marginTop: 6 }}>
          <span {...layer('VesselTile / header / mode.glyph', 'line/strong chip · glyph 1.4x, text label dropped (round 43) · learn/title = full mode name', '{derived.mode}: TRANSIT | STATION | STANDBY | PORT')} title={d.mode} style={{ border: `1px solid ${NEUTRAL.border}`, borderRadius: RADIUS, padding: '3px 6px', color: NEUTRAL.inkSecondary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}>
            <Glyph name={MODE_GLYPH[d.mode]} size={15} />
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
            <div key={i} {...layer('VesselTile / body / alert.text', 'tag = severity color · message ink/secondary (round 33 grammar)', '{alerts[] level + message}')} style={{ color: NEUTRAL.inkSecondary }}>
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
          <div {...layer('VesselTile / body / endurance.glyph', 'glyph/fuel-drop 13px ink/muted left · numeral tabular right (label died round 39)', '{derived.endurance_hours} h')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 16, flexShrink: 0, color: NEUTRAL.inkMuted, lineHeight: 0 }}><Glyph name="fuel-drop" size={13} /></span>
            <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: NEUTRAL.ink, fontFamily: FONT.data }}>{d.endurance_hours} h</span>
          </div>
          <div {...layer('VesselTile / body / delta.glyph', 'glyph/delta 13px ink/muted left · numeral tabular right (label died round 39)', '{derived.efficiency_delta_pct} vs mode baseline')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 2 }}>
            <span style={{ width: 16, flexShrink: 0, color: NEUTRAL.inkMuted, lineHeight: 0 }}><Glyph name="delta" size={13} /></span>
            <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: NEUTRAL.ink, fontFamily: FONT.data }}>{fmtPct(d.efficiency_delta_pct)}</span>
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
        <div ref={sparkRef} {...layer('VesselTile / footer / spark24.chart', 'ink/secondary 1px · zero axis · full card width, fixed 20px — the 24h signature (round 39)', '{derived.sparkline_24h — hourly efficiency_delta}')}>
          <Sparkline values={d.sparkline_24h} width={sparkW} height={20} />
        </div>
      </div>
    </Link>
  );
}
