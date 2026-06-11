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
import { vesselStatus, worstLevel } from '../data/alerts';
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { TrendChartFill } from './TrendChartFill';
import { DataRow } from './DataRow';
import { Stat } from './Stat';
import { fmtPct } from './gb';
import { RADIUS, STATUS_COLOR, NEUTRAL, TYPE, FONT } from './probeTokens';
import { useState } from 'react';
import { useFleet, type ColorTreatment, type TileSize } from '../state/FleetProvider';
import { Glyph, type GlyphName } from './Glyph';

const SIZE_ORDER: TileSize[] = ['mini', 'standard', 'expanded'];

const MODE_GLYPH: Record<string, GlyphName> = { TRANSIT: 'route', STATION: 'vessel', STANDBY: 'clock', PORT: 'anchor' };

const LEVEL_COLOR: Record<string, string> = {
  WARNING: 'var(--color-alert-warning)',
  CAUTION: 'var(--color-alert-caution)',
};

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
  const status = vesselStatus(vessel.alerts);
  const badge = worstLevel(vessel.alerts);
  const mini = size === 'mini';
  const tier = size === 'expanded' ? 2 : 1;
  const step = (dir: 1 | -1) => {
    const next = SIZE_ORDER[SIZE_ORDER.indexOf(size) + dir];
    if (next) onSize(next);
  };
  const colored = treatment === 'automotive' || status !== 'nominal';
  const statusColor = colored ? STATUS_COLOR[status] : NEUTRAL.border;
  const dotColor = colored ? STATUS_COLOR[status] : NEUTRAL.inkMuted;
  const fullAlerts = vessel.alerts.filter((a) => a.level !== 'ADVISORY');
  const now = vessel.history.minutes.at(-1)!;
  const fuelFrac = now.tanks.reduce((a, t) => a + t.level_gal, 0) / now.tanks.reduce((a, t) => a + t.capacity_gal, 0);
  const enduranceAlert = vessel.alerts.find((a) => a.code === 'ENDURANCE' || a.code === 'BUNKER_SOON');
  const meterColor = enduranceAlert
    ? enduranceAlert.level === 'CAUTION' ? 'var(--color-alert-caution)' : 'var(--color-alert-advisory)'
    : undefined;

  return (
    <Link
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
        border: `1px solid ${colored ? statusColor : 'var(--color-line-hairline)'}`,
        borderTop: `3px solid ${statusColor}`,
        borderRadius: RADIUS,
        background: NEUTRAL.surface,
        padding: 'var(--pad-card)',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
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
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: dotColor, marginBottom: 8 }} />
        <div style={{ ...TYPE.name, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vessel.static.name}</div>
        <div style={{ marginTop: 6, display: 'inline-block', color: colored && status !== 'nominal' ? STATUS_COLOR[status] : NEUTRAL.ink }}>
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
          <span style={{ ...TYPE.micro, border: `1px solid ${NEUTRAL.border}`, borderRadius: RADIUS, padding: '1px 8px', color: NEUTRAL.inkSecondary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Glyph name={MODE_GLYPH[d.mode]} size={11} />{d.mode}
          </span>
        </div>
      </div>
      {/* mini keeps severity visible: badge never hides at any size */}
      {mini && badge && (
        <div style={{ marginTop: 6, textAlign: 'center', fontFamily: FONT.data, fontSize: 11, color: LEVEL_COLOR[badge] ?? NEUTRAL.inkSecondary }}>
          [{badge}]
        </div>
      )}
      {/* expanded: the chart absorbs the void — flex-grow, plot scales */}
      {tier === 2 && (
        <div style={{ flex: 1, minHeight: 96, marginTop: 10 }}>
          <TrendChartFill values={d.daily_delta_1y.slice(-30).map((x) => x.delta)} />
        </div>
      )}
      {/* 2x: alerts in full text — the tile's reason for being big */}
      {tier === 2 && fullAlerts.length > 0 && (
        <div style={{ marginTop: 8, textAlign: 'left', fontFamily: FONT.data, fontSize: 11, lineHeight: 1.6 }}>
          {fullAlerts.map((a, i) => (
            <div key={i} style={{ color: LEVEL_COLOR[a.level] ?? NEUTRAL.inkSecondary }}>
              [{a.level}] {a.message}
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
      {tier === 1 && !mini && (
        <div style={{ marginTop: 10, textAlign: 'left' }}>
          <DataRow label="endurance" value={`${d.endurance_hours} h`} />
          <DataRow label="now" value={fmtPct(d.efficiency_delta_pct)} />
          {badge && <DataRow label="alert" value={`[${badge}]`} />}
          <div style={{ marginTop: 6, textAlign: 'center' }}>
            <Sparkline values={d.daily_delta_1y.slice(-90).map((x) => x.delta)} width={120} height={20} />
          </div>
        </div>
      )}
      {/* round 18: passive endurance strip (meter variant) — indicator only,
          not a trigger */}
      {revealStyle === 'meter' && (
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <div style={{ height: 3, background: 'var(--color-surface-overlay)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${Math.round(fuelFrac * 100)}%`, background: meterColor ?? 'var(--color-ink-muted)', borderRadius: 2 }} />
          </div>
        </div>
      )}
    </Link>
  );
}
