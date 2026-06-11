'use client';
// Grid tile. ROUND 13 restructure: a true vertical flex column filling its
// grid cell — header fixed, the 30d chart flex-grows into whatever space has
// nothing else to say (round 3.3 rule; the round 7 grammar pass regressed
// this by growing the cell around a fixed-px chart), alerts in FULL TEXT on
// 2x (they are the tile's reason for being big), footer stats, details link
// pinned bottom-left across sizes. Status thresholds all come from
// vesselStatus() in the data layer; this file only paints.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { vesselStatus, worstLevel } from '../data/alerts';
import { Field } from './Field';
import { RevealZone } from './Contextual';
import { Sparkline } from './Sparkline';
import { TrendChartFill } from './TrendChartFill';
import { DataRow } from './DataRow';
import { Stat } from './Stat';
import { fmtPct } from './gb';
import { RADIUS, STATUS_COLOR, NEUTRAL, TYPE, FONT } from './probeTokens';
import { useFleet, type ColorTreatment, type TileDensity } from '../state/FleetProvider';

const LEVEL_COLOR: Record<string, string> = {
  WARNING: 'var(--color-alert-warning)',
  CAUTION: 'var(--color-alert-caution)',
};

export function VesselTile({
  vessel,
  density,
  treatment,
  promoted,
}: {
  vessel: VesselState;
  density: TileDensity;
  treatment: ColorTreatment;
  /** board-controlled 2x promotion (round 11 cap); defaults to status */
  promoted?: boolean;
}) {
  const d = vessel.derived;
  const { motion, crossings } = useFleet();
  const status = vesselStatus(vessel.alerts);
  const badge = worstLevel(vessel.alerts);
  const tier = (promoted ?? status !== 'nominal') ? 2 : 1;
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
      <RevealZone
        meter={{ frac: fuelFrac, color: meterColor }}
        reveal={
          <Field level="fleet" field="burn_rate_gph" revealed>
            <span>burn {d.burn_rate_gph} gph · next {vessel.history.nextPortCalls[0]?.port ?? '—'}</span>
          </Field>
        }
      >
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
          } size={density === 'minimal' ? 24 : 'var(--type-hero-size)'} />
        </div>
        <div style={{ marginTop: 6 }}>
          <span style={{ ...TYPE.micro, border: `1px solid ${NEUTRAL.border}`, borderRadius: RADIUS, padding: '1px 8px', color: NEUTRAL.inkSecondary }}>
            {d.mode}
          </span>
        </div>
      </div>
      {/* 2x: the chart absorbs the void — flex-grow, plot scales to its box */}
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
      {tier === 2 && density === 'standard' && (
        <div style={{ marginTop: 10, display: 'flex', gap: 24, justifyContent: 'center', textAlign: 'left' }}>
          <Stat label="endurance" value={`${d.endurance_hours} h`} />
          <Stat label="now vs baseline" value={fmtPct(d.efficiency_delta_pct)} />
        </div>
      )}
      {tier === 1 && density === 'standard' && (
        <div style={{ marginTop: 10, textAlign: 'left' }}>
          <DataRow label="endurance" value={`${d.endurance_hours} h`} />
          <DataRow label="now" value={fmtPct(d.efficiency_delta_pct)} />
          {badge && <DataRow label="alert" value={`[${badge}]`} />}
          <div style={{ marginTop: 6, textAlign: 'center' }}>
            <Sparkline values={d.daily_delta_1y.slice(-90).map((x) => x.delta)} width={120} height={20} />
          </div>
        </div>
      )}
      </RevealZone>
    </Link>
  );
}
