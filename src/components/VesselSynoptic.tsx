'use client';
// ROUND 7 addendum — VesselSynoptic. ⚖ verdict #11 RESOLVED round 30: this IS
// the fuel card — synoptic on top, dot-matrix tank quartet beneath (⚖ #9:
// dots won; TankSchematic, the bars variant, and the view switcher are gone).
// Top-down generic OSV: superstructure forward, working deck aft. Schematic,
// not illustrative. ALL geometry lives in GEOM + HULL_PATH below so Anthony's
// Figma hull replaces it 1:1. Hull and plumbing stay neutral ink lines;
// status color appears ONLY where status exists (degraded engine node,
// reconciliation badge). Leader-line callouts in Plex Mono: ST1/ST2, FD1/FD2,
// E1–E4 — our L1-L5 annotation language.

import type { VesselState } from '../data/types';
import { RECON_CAUTION_PCT } from '../data/alerts';
import { useContentWidth } from './NauticalChart';
import { ReconChip } from './FlowReconciliation';
import { RevealZone } from './Contextual';
import { Field } from './Field';
import { FONT, NEUTRAL, RADIUS, STATUS_COLOR } from './probeTokens';
import { gb } from './gb';
import { Label } from './Glyph';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

// Tank fill as a 5×10 dot grid, filled from the bottom (round 5 experiment,
// ⚖ #9 winner — the bars/row layout is deleted).
function DotMatrix({ pct, tint }: { pct: number; tint: string | null }) {
  const filled = Math.round(pct / 2); // 50 dots = 100%
  const rows = Array.from({ length: 5 }, (_, r) => {
    const rowFilled = Math.min(10, Math.max(0, filled - (4 - r) * 10));
    return '●'.repeat(rowFilled).padStart(10, '○').split('').reverse().join('');
  });
  return (
    <div style={{ fontFamily: FONT.data, fontSize: 10, letterSpacing: 3, lineHeight: 1.3, color: tint ?? NEUTRAL.inkSecondary }}>
      {rows.map((row, i) => (
        <div key={i}>{row}</div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- geometry --
// ViewBox 720×300, bow LEFT. Replace HULL_PATH + GEOM with Figma export later.
const VB = { w: 720, h: 300 };
const HULL_PATH =
  'M 24 150 C 40 96, 84 70, 150 64 L 600 64 C 660 70, 696 100, 698 150 ' +
  'C 696 200, 660 230, 600 236 L 150 236 C 84 230, 40 204, 24 150 Z';
const SUPER_PATH = 'M 96 92 L 220 92 Q 232 92 232 104 L 232 196 Q 232 208 220 208 L 96 208 Q 76 180 72 150 Q 76 120 96 92 Z';
const GEOM = {
  storage: [
    { id: 'ST1', x: 270, y: 84, w: 96, h: 60 },
    { id: 'ST2', x: 270, y: 156, w: 96, h: 60 },
  ],
  feeder: [
    { id: 'FD1', x: 408, y: 92, w: 56, h: 48 },
    { id: 'FD2', x: 408, y: 160, w: 56, h: 48 },
  ],
  meter: { x: 506, y: 150 },
  engines: [
    { id: 'E1', x: 596, y: 100, r: 17, role: 'MAIN' },
    { id: 'E2', x: 596, y: 200, r: 17, role: 'MAIN' },
    { id: 'E3', x: 538, y: 92, r: 12, role: 'GEN' },
    { id: 'E4', x: 538, y: 208, r: 12, role: 'GEN' },
  ],
  callouts: {
    ST1: { lx: 300, ly: 30 }, ST2: { lx: 300, ly: 274 },
    FD1: { lx: 430, ly: 30 }, FD2: { lx: 430, ly: 274 },
    E1: { lx: 640, ly: 30 }, E2: { lx: 640, ly: 274 },
    E3: { lx: 520, ly: 30 }, E4: { lx: 520, ly: 274 },
  } as Record<string, { lx: number; ly: number }>,
};

const LINE = 'var(--color-line-strong)'; // neutral plumbing
const INK2 = NEUTRAL.inkSecondary;

/** Tank tint ONLY from its own active TANK_LOW alert (round 20). */
function tankTint(v: VesselState, tankLabel: string): string | null {
  for (const a of v.alerts) {
    if (a.code === 'TANK_LOW' && a.message.startsWith(tankLabel)) {
      return a.level === 'CAUTION' ? STATUS_COLOR.watch : 'var(--color-alert-advisory)';
    }
  }
  return null;
}

/** Engines named in active CAUTION/WARNING alert messages get their tint. */
function engineTint(v: VesselState, engineId: string): string | null {
  for (const a of v.alerts) {
    if (a.message.includes(engineId)) {
      return a.level === 'WARNING' ? STATUS_COLOR.degraded : STATUS_COLOR.watch;
    }
  }
  return null;
}

export function VesselSynoptic({ vessel }: { vessel: VesselState }) {
  const [wrapRef, w] = useContentWidth(720);
  const h = (w * VB.h) / VB.w;
  const now = vessel.history.minutes.at(-1)!;
  const tanks = [...now.tanks.filter((t) => t.type === 'STORAGE'), ...now.tanks.filter((t) => t.type === 'FEEDER')];
  const tankGeo = [...GEOM.storage, ...GEOM.feeder];
  const recon = vessel.derived.reconciliation;
  const reconColor =
    recon.status === 'OK' ? INK2
    : Math.abs(recon.error_pct) > RECON_CAUTION_PCT ? STATUS_COLOR.watch
    : 'var(--color-alert-advisory)';
  const xferActive = now.tanks.some((t) => t.transfer_active);
  const mono = (size = 10): React.CSSProperties => ({ fontFamily: FONT.data, fontSize: size });

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginRight: 26 }}>
        <Label g="tank" style={{ marginBottom: 0 }}>fuel</Label>
        <ReconChip vessel={vessel} />
      </div>
      <div style={{ height: 'var(--pad-section)' }} />
      <RevealZone
        reveal={
          <span>
            <Field level="vessel" field="tank.capacity_gal" revealed>
              <span>
                capacity {tanks.map((t) => `${t.tank_id.split('-')[1]} ${t.capacity_gal.toLocaleString()}`).join(' · ')} gal
              </span>
            </Field>
            {' — '}
            <Field level="vessel" field="tank.transfer_active" revealed>
              <span>{xferActive ? 'TRANSFER ACTIVE' : 'no transfer in progress'}</span>
            </Field>
          </span>
        }
      >
      <div ref={wrapRef}>
        <svg width={w} height={h} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ display: 'block' }}>
          {/* hull + superstructure: neutral ink lines, schematic */}
          <path {...layer('VesselSynoptic / hull / hull.line', 'ink/secondary 1.5px — neutral, never status', '{HULL_PATH — Figma hull replaces 1:1}')} d={HULL_PATH} fill="none" stroke={INK2} strokeWidth={1.5} />
          <path {...layer('VesselSynoptic / hull / superstructure.shape', 'surface/overlay fill · line/strong', '{SUPER_PATH}')} d={SUPER_PATH} fill="var(--color-surface-overlay)" stroke={LINE} strokeWidth={1} />
          <text {...layer('VesselSynoptic / hull / label.text', 'font/data 9 · ink/muted', 'SUPERSTRUCTURE (static)')} x={150} y={154} textAnchor="middle" style={mono(9)} fill={NEUTRAL.inkMuted}>SUPERSTRUCTURE</text>
          <text x={36} y={150} textAnchor="middle" style={mono(8)} fill={NEUTRAL.inkMuted} transform="rotate(-90 36 150)">BOW</text>

          {/* flow paths storage→feeder→meter→engines (neutral) */}
          {[0, 1].map((i) => (
            <line key={`sf${i}`} {...layer('VesselSynoptic / flow / feedLine.line', 'line/strong 1.2px · dashed when no transfer', '{storage→feeder · tank.transfer_active}')} x1={GEOM.storage[i].x + GEOM.storage[i].w} y1={GEOM.storage[i].y + GEOM.storage[i].h / 2}
              x2={GEOM.feeder[i].x} y2={GEOM.feeder[i].y + GEOM.feeder[i].h / 2}
              stroke={LINE} strokeWidth={1.2} strokeDasharray={xferActive ? undefined : '4 3'} />
          ))}
          {[0, 1].map((i) => (
            <line key={`fm${i}`} {...layer('VesselSynoptic / flow / meterLine.line', 'line/strong 1.2px', '{feeder→flow meter}')} x1={GEOM.feeder[i].x + GEOM.feeder[i].w} y1={GEOM.feeder[i].y + GEOM.feeder[i].h / 2}
              x2={GEOM.meter.x} y2={GEOM.meter.y} stroke={LINE} strokeWidth={1.2} />
          ))}
          {GEOM.engines.map((e) => (
            <line key={`me${e.id}`} {...layer('VesselSynoptic / flow / engineLine.line', 'line/strong 1.2px', '{flow meter→engine}')} x1={GEOM.meter.x} y1={GEOM.meter.y} x2={e.x - e.r} y2={e.y}
              stroke={LINE} strokeWidth={1.2} />
          ))}
          {xferActive && (
            <text x={388} y={150} textAnchor="middle" style={mono(9)} fill={INK2}>XFER</text>
          )}

          {/* tanks (round 20): level as VERTICAL fill, bottom-up, fill/level
              token (white @ low alpha). Neutral always — tint ONLY when this
              tank's own TANK_LOW alert is active. */}
          {tankGeo.map((g, i) => {
            const t = tanks[i];
            const tint = tankTint(vessel, g.id);
            const fillH = (g.h - 4) * (t.level_pct / 100);
            return (
              <g key={g.id}>
                <rect {...layer('VesselSynoptic / tanks / tank.shape', 'surface/base · line/strong | TANK_LOW tint (own alert only, round 20)', '{tank.tank_id}')} x={g.x} y={g.y} width={g.w} height={g.h} fill="var(--color-surface-base)" stroke={tint ?? LINE} strokeWidth={tint ? 1.5 : 1} rx={RADIUS} />
                <rect {...layer('VesselSynoptic / tanks / fill.shape', 'fill/level · bottom-up vertical (round 20)', '{tank.level_pct}')} x={g.x + 2} y={g.y + 2 + (g.h - 4 - fillH)} width={g.w - 4} height={fillH}
                  fill={tint ?? 'var(--color-fill-level)'} opacity={tint ? 0.35 : 1} rx={RADIUS} />
                <text {...layer('VesselSynoptic / tanks / value.text', 'font/data 11 · ink/primary | tint', '{tank.level_pct}%')} x={g.x + g.w / 2} y={g.y + g.h / 2 + 4} textAnchor="middle" style={mono(11)} fill={tint ?? NEUTRAL.ink}>
                  {t.level_pct.toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* engine nodes: running = filled, stopped = outline; status tint
              ONLY when an alert names the engine */}
          {GEOM.engines.map((g, i) => {
            const e = now.engines[i];
            const tint = engineTint(vessel, e.engine_id);
            const stroke = tint ?? LINE;
            return (
              <g key={g.id}>
                <circle {...layer('VesselSynoptic / engines / node.shape', 'running = filled · stopped = outline · status tint only when alert names the engine', '{engine.engine_id · running}')} cx={g.x} cy={g.y} r={g.r} fill={e.running ? (tint ?? 'var(--color-surface-overlay)') : 'none'}
                  stroke={stroke} strokeWidth={tint ? 2 : 1.2} />
                <text {...layer('VesselSynoptic / engines / value.text', 'font/data 9', '{engine.load_pct}% | OFF')} x={g.x} y={g.y + 3.5} textAnchor="middle" style={mono(9)}
                  fill={e.running && tint ? '#0b0e13' : INK2}>
                  {e.running ? `${Math.round(e.load_pct)}%` : 'OFF'}
                </text>
              </g>
            );
          })}

          {/* flow meter + rate + reconciliation badge */}
          <rect {...layer('VesselSynoptic / meter / meter.shape', 'surface/overlay · line/strong · 45° diamond', 'flow meter node')} x={GEOM.meter.x - 7} y={GEOM.meter.y - 7} width={14} height={14}
            fill="var(--color-surface-overlay)" stroke={LINE} strokeWidth={1.2} transform={`rotate(45 ${GEOM.meter.x} ${GEOM.meter.y})`} />
          <text {...layer('VesselSynoptic / meter / value.text', 'font/data 11 · ink/primary', '{flow_gps × 3600} gph')} x={GEOM.meter.x} y={GEOM.meter.y + 28} textAnchor="middle" style={mono(11)} fill={NEUTRAL.ink}>
            {Math.round(now.flow_gps * 3600)} gph
          </text>
          <g {...layer('VesselSynoptic / meter / recon.chip', 'border + text = recon severity (OK ink/secondary · advisory · watch)', '{reconciliation.status · error_pct}')}>
            <rect x={GEOM.meter.x - 34} y={GEOM.meter.y - 46} width={68} height={16} rx={RADIUS}
              fill="var(--color-surface-raised)" stroke={reconColor} strokeWidth={1} />
            <text x={GEOM.meter.x} y={GEOM.meter.y - 34} textAnchor="middle" style={mono(9)} fill={reconColor}>
              RECON {recon.status}
            </text>
            <line x1={GEOM.meter.x} y1={GEOM.meter.y - 30} x2={GEOM.meter.x} y2={GEOM.meter.y - 10} stroke={reconColor} strokeWidth={0.75} />
          </g>

          {/* leader-line callouts (ST/FD/E annotation language) */}
          {[...tankGeo.map((g) => ({ id: g.id, ax: g.x + g.w / 2, ayTop: g.y, ayBot: g.y + g.h })),
            ...GEOM.engines.map((g) => ({ id: g.id, ax: g.x, ayTop: g.y - g.r, ayBot: g.y + g.r }))].map((c) => {
            const l = GEOM.callouts[c.id];
            const up = l.ly < 150; // which side of the hull the label sits on
            const anchorY = up ? c.ayTop : c.ayBot;
            return (
              <g key={`co-${c.id}`}>
                <line {...layer('VesselSynoptic / callouts / leader.line', 'line/strong 0.6px', '{node→label}')} x1={c.ax} y1={anchorY} x2={l.lx} y2={l.ly + (up ? 4 : -10)} stroke={LINE} strokeWidth={0.6} />
                <text {...layer('VesselSynoptic / callouts / label.text', 'font/data 10 · ink/secondary — ST/FD/E annotation language', '{ST1 ST2 FD1 FD2 E1–E4}')} x={l.lx} y={l.ly} textAnchor="middle" style={mono(10)} fill={INK2}>{c.id}</text>
              </g>
            );
          })}
        </svg>
        {/* round 30 composition (⚖ #11): dot-matrix tank quartet beneath the
            synoptic — ST1 ST2 FD1 FD2, % + gal under each. Round 32:
            centered, equal gutters — same width discipline as the cluster */}
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 'var(--pad-section)', justifyContent: 'center' }}>
          {tankGeo.map((g, i) => {
            const t = tanks[i];
            const tint = tankTint(vessel, g.id);
            return (
              <div key={g.id} style={{ textAlign: 'left' }}>
                <Field level="vessel" field="tank.type">
                  <div {...layer('VesselSynoptic / quartet / label.text', 'gb.label micro-caps · TANK_LOW tint (earned)', '{tank.tank_id} {tank.type}')} style={{ ...gb.label, marginBottom: 4, ...(tint ? { color: tint } : {}) }}>
                    {g.id} {t.type}
                  </div>
                </Field>
                <Field level="vessel" field="tank.level_pct">
                  <div {...layer('VesselSynoptic / quartet / fill.chart', 'dot matrix 5×10 · ink/secondary | TANK_LOW tint (⚖9: dots won)', '{tank.level_pct → filled dots}')}>
                    <DotMatrix pct={t.level_pct} tint={tint} />
                  </div>
                </Field>
                <Field level="vessel" field="tank.level_gal">
                  <div {...layer('VesselSynoptic / quartet / value.text', 'font/data 12 tabular · gal ink/secondary', '{tank.level_pct}% · {tank.level_gal} gal')} style={{ fontFamily: FONT.data, fontSize: 12, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                    {t.level_pct}% · <span style={{ color: NEUTRAL.inkSecondary }}>{t.level_gal.toLocaleString()} gal</span>
                  </div>
                </Field>
              </div>
            );
          })}
        </div>
      </div>
      </RevealZone>
    </section>
  );
}
