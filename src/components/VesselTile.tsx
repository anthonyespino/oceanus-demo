'use client';
// LAYOUT PROBE (branch-only): grid tile replacing the VesselCard row.
// Hierarchy: NAME primary, one hero metric (30d trend + sustained deviation),
// mode chip, status dot. Two densities; two status-color treatments.
// Status level comes from vesselStatus() in the data layer — the thresholds
// are the alert constants, this file only paints.

import Link from 'next/link';
import type { VesselState } from '../data/types';
import { vesselStatus, worstLevel } from '../data/alerts';
import { Field } from './Field';
import { Sparkline } from './Sparkline';
import { DataRow } from './DataRow';
import { fmtPct } from './gb';
import { RADIUS, STATUS_COLOR, NEUTRAL, TYPE } from './probeTokens';
import { useFleet, type ColorTreatment, type TileDensity } from '../state/FleetProvider';

export function VesselTile({
  vessel,
  density,
  treatment,
}: {
  vessel: VesselState;
  density: TileDensity;
  treatment: ColorTreatment;
}) {
  const d = vessel.derived;
  const { motion, crossings } = useFleet();
  const status = vesselStatus(vessel.alerts);
  const badge = worstLevel(vessel.alerts);
  // Discrete tiers (round 3): 1x nominal, 2x watch/degraded — promotion uses
  // the SAME vesselStatus() as color and badges; no separate thresholds.
  const tier = status === 'nominal' ? 1 : 2;

  // Dark cockpit: nominal stays neutral; color only on watch/degraded.
  // Automotive: every tile carries its status color, including green.
  const colored = treatment === 'automotive' || status !== 'nominal';
  const statusColor = colored ? STATUS_COLOR[status] : NEUTRAL.border;
  const dotColor = colored ? STATUS_COLOR[status] : NEUTRAL.inkMuted;

  return (
    <Link
      href={`/vessel/${vessel.static.id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: NEUTRAL.ink,
        border: `1px solid ${statusColor}`,
        borderTop: `3px solid ${statusColor}`,
        borderRadius: RADIUS,
        background: NEUTRAL.surface,
        padding: '16px 14px',
        textAlign: 'center', // alignment probe: see PROGRESS.md findings
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* motion variant (a): one-time ripple on live-mode threshold-cross;
          keyed by crossing time so it fires once, steady after */}
      {motion === 'ripple' && crossings[vessel.static.id] && (
        <span
          key={crossings[vessel.static.id]}
          className="probe-ripple"
          style={{ borderColor: STATUS_COLOR[status] }}
        />
      )}
      {/* status dot — geometric slot, no icons */}
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dotColor,
          marginBottom: 8,
        }}
      />
      <div style={TYPE.name}>{vessel.static.name}</div>
      {/* hero metric: 30d trend direction + sustained deviation */}
      <div style={{ ...TYPE.hero, marginTop: 4, color: colored && status !== 'nominal' ? STATUS_COLOR[status] : NEUTRAL.ink }}>
        30d {fmtPct(d.trend_30d)} · sd {fmtPct(d.sustained_deviation)}
        {/* Green experiment (round 2, Anthony's call on record): treatment A
            marks nominal with a green ✓ glyph; numerals stay ink so the
            tabular column doesn't go chromatic. Treatment B unchanged. */}
        {treatment === 'automotive' && status === 'nominal' && (
          <span style={{ color: STATUS_COLOR.nominal }}> ✓</span>
        )}
      </div>
      <div style={{ marginTop: 6 }}>
        <span
          style={{
            ...TYPE.micro,
            border: `1px solid ${NEUTRAL.border}`,
            borderRadius: RADIUS,
            padding: '1px 8px',
            color: NEUTRAL.inkSecondary,
          }}
        >
          {d.mode}
        </span>
      </div>
      {/* 2x tiles spend the extra room on the 30d trend chart with baseline
          (the Sparkline's zero line IS the mode-baseline reference). */}
      {tier === 2 && (
        <div style={{ marginTop: 12 }}>
          <Sparkline values={d.daily_delta_1y.slice(-30).map((x) => x.delta)} width={320} height={72} />
          <div style={TYPE.micro}>30d efficiency delta vs mode baseline (zero line)</div>
        </div>
      )}
      {density === 'standard' && (
        <div style={{ marginTop: 10, textAlign: 'left' }}>
          {/* data cluster: labels left-ranged, numerals right-ranged (item 6) */}
          <DataRow label="endurance" value={`${d.endurance_hours} h`} />
          <DataRow label="now" value={fmtPct(d.efficiency_delta_pct)} />
          {badge && <DataRow label="alert" value={`[${badge}]`} />}
          {tier === 1 && (
            <div style={{ marginTop: 6, textAlign: 'center' }}>
              <Sparkline values={d.daily_delta_1y.slice(-90).map((x) => x.delta)} width={120} height={20} />
            </div>
          )}
          <div style={{ ...TYPE.micro, marginTop: 6 }} onClick={(e) => e.preventDefault()}>
            <Field level="fleet" field="burn_rate_gph" label="details">
              <span>
                burn {d.burn_rate_gph} gph · next {vessel.history.nextPortCalls[0]?.port ?? '—'}
              </span>
            </Field>
          </div>
        </div>
      )}
    </Link>
  );
}
