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
import { useLearn } from '../learn/LearnProvider'; // round 112: default-show / expert-hide (no chevron)
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
    <div style={{ fontFamily: FONT.data, fontSize: 'var(--type-micro)', letterSpacing: 3, lineHeight: 1.3, color: tint ?? NEUTRAL.inkSecondary }}>
      {rows.map((row, i) => (
        <div key={i}>{row}</div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- geometry --
// ROUND 123: HULL COMPACTED. The old 720×300 hull was mostly illustration — a giant
// SUPERSTRUCTURE block + dead bow space ate the left third while the data crammed into
// the right two-thirds. Now the hull is a LIGHT contextual outline hugging dense data:
// a minimal pointed bow (left), a small superstructure marker forward, then the tanks /
// feeders / meter / engines filling x≈148–605, aft engines at the stern. Vertical span
// cut 300→190 (~36% shorter). Fore→aft = left→right, port = top, starboard = bottom —
// OSV proportions kept (storage tanks dominant; superstructure a small forward block).
// Replace HULL_PATH + GEOM with Figma export later; the renderer reads only these.
const VB = { w: 720, h: 190 };
const HULL_PATH =
  'M 22 92 C 38 54, 66 34, 100 30 L 600 30 C 638 34, 660 58, 662 92 ' +
  'C 660 126, 638 150, 600 154 L 100 154 C 66 150, 38 130, 22 92 Z';
const SUPER_PATH = 'M 84 58 L 122 58 Q 130 58 130 66 L 130 118 Q 130 126 122 126 L 84 126 Q 72 92 84 58 Z';
const GEOM = {
  storage: [
    { id: 'ST1', x: 148, y: 34, w: 136, h: 50 },
    { id: 'ST2', x: 148, y: 106, w: 136, h: 50 },
  ],
  feeder: [
    { id: 'FD1', x: 300, y: 38, w: 76, h: 46 },
    { id: 'FD2', x: 300, y: 106, w: 76, h: 46 },
  ],
  meter: { x: 432, y: 92 },
  engines: [
    { id: 'E1', x: 588, y: 60, r: 17, role: 'MAIN' },
    { id: 'E2', x: 588, y: 124, r: 17, role: 'MAIN' },
    { id: 'E3', x: 500, y: 54, r: 12, role: 'GEN' },
    { id: 'E4', x: 500, y: 130, r: 12, role: 'GEN' },
  ],
  callouts: {
    ST1: { lx: 216, ly: 16 }, ST2: { lx: 216, ly: 176 },
    FD1: { lx: 338, ly: 16 }, FD2: { lx: 338, ly: 176 },
    E1: { lx: 626, ly: 16 }, E2: { lx: 626, ly: 176 },
    E3: { lx: 500, ly: 16 }, E4: { lx: 500, ly: 176 },
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

// Round 42: per-tank value leaves as static literals so the atlas enumerates
// each (a templated path wouldn't be captured). Named per the brief's
// `tanks / {ID}.{pct|gal}.value.text`; the component stays VesselSynoptic to
// match the barrel — the fuel card's frame in Figma can carry the same paths.
// (Anthony's brief shorthand "FuelCard" → flag if the component should rename.)
const TANK_LEAF: Record<string, { pct: Record<string, string>; gal: Record<string, string> }> = {
  ST1: { pct: layer('VesselSynoptic / tanks / ST1.pct.value.text', 'font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint', '{ST1 level_pct}%'), gal: layer('VesselSynoptic / tanks / ST1.gal.value.text', 'font/data 12 tabular · ink/secondary · right-aligned subcolumn', '{ST1 level_gal} gal') },
  ST2: { pct: layer('VesselSynoptic / tanks / ST2.pct.value.text', 'font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint', '{ST2 level_pct}%'), gal: layer('VesselSynoptic / tanks / ST2.gal.value.text', 'font/data 12 tabular · ink/secondary · right-aligned subcolumn', '{ST2 level_gal} gal') },
  FD1: { pct: layer('VesselSynoptic / tanks / FD1.pct.value.text', 'font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint', '{FD1 level_pct}%'), gal: layer('VesselSynoptic / tanks / FD1.gal.value.text', 'font/data 12 tabular · ink/secondary · right-aligned subcolumn', '{FD1 level_gal} gal') },
  FD2: { pct: layer('VesselSynoptic / tanks / FD2.pct.value.text', 'font/data 12 tabular · right-aligned subcolumn · TANK_LOW tint', '{FD2 level_pct}%'), gal: layer('VesselSynoptic / tanks / FD2.gal.value.text', 'font/data 12 tabular · ink/secondary · right-aligned subcolumn', '{FD2 level_gal} gal') },
};
// fixed cell + subcolumn widths — sized from the worst case "100.0% · 99,999
// gal" at this scale so cells never resize to their content
const TANK_PCT_W = 52;
const TANK_GAL_W = 84;
const TANK_CELL_W = TANK_PCT_W + TANK_GAL_W + 16; // + separator/padding

export function VesselSynoptic({ vessel }: { vessel: VesselState }) {
  const [wrapRef, w] = useContentWidth(720);
  const h = (w * VB.h) / VB.w;
  const now = vessel.history.minutes.at(-1)!;
  const tanks = [...now.tanks.filter((t) => t.type === 'STORAGE'), ...now.tanks.filter((t) => t.type === 'FEEDER')];
  const tankGeo = [...GEOM.storage, ...GEOM.feeder];
  const recon = vessel.derived.reconciliation;
  const { expertOn } = useLearn(); // round 112: default-show / expert-hide
  const reconColor =
    recon.status === 'OK' ? INK2
    : Math.abs(recon.error_pct) > RECON_CAUTION_PCT ? STATUS_COLOR.watch
    : 'var(--color-alert-advisory)';
  const xferActive = now.tanks.some((t) => t.transfer_active);
  // ROUND 88: fuel-twin type normalized to the unified scale — sizes are CSS
  // tokens, no orphans. Data readouts (tank %, gph, RECON) → context; schematic
  // labels/annotations (ST1/FD1/E1, SUPERSTRUCTURE/BOW/XFER, engine load%) → micro.
  const mono = (size: string = 'var(--type-micro)'): React.CSSProperties => ({ fontFamily: FONT.data, fontSize: size });

  return (
    // round 37: header row floats above the fill
    <div style={{ marginBottom: 'var(--pad-stack)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginRight: 26, marginBottom: 4 }}>
        <Label g="tank" headerAttrs={layer('VesselSynoptic / header / header.glyph', 'section header · tank glyph · glyph-only in expert mode', 'FUEL')} style={{ marginBottom: 0 }}>fuel</Label>
        <ReconChip vessel={vessel} />
      </div>
      <section style={gb.box}>
      <div ref={wrapRef}>
        <svg width={w} height={h} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ display: 'block' }}>
          {/* hull + superstructure: neutral ink lines, schematic */}
          <path {...layer('VesselSynoptic / hull / hull.line', 'ink/secondary 1.5px — neutral, never status', '{HULL_PATH — Figma hull replaces 1:1}')} d={HULL_PATH} fill="none" stroke={INK2} strokeWidth={1.5} />
          <path {...layer('VesselSynoptic / hull / superstructure.shape', 'surface/overlay fill · line/strong', '{SUPER_PATH}')} d={SUPER_PATH} fill="var(--color-surface-overlay)" stroke={LINE} strokeWidth={1} />
          {/* ROUND 123: superstructure reduced to a small forward marker — it's crew
              quarters, not fuel data, so it earns only an orientation tag, not a third
              of the frame. <title> carries the full word. */}
          <text {...layer('VesselSynoptic / hull / label.text', 'font/data 9 · ink/muted · small superstructure marker (round 123)', 'SUPER (superstructure marker)')} x={101} y={95} textAnchor="middle" style={mono('var(--type-micro)')} fill={NEUTRAL.inkMuted}>
            <title>SUPERSTRUCTURE</title>SUPER
          </text>
          <text x={26} y={92} textAnchor="middle" style={mono('var(--type-micro)')} fill={NEUTRAL.inkMuted} transform="rotate(-90 26 92)">BOW</text>

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
            <text x={292} y={88} textAnchor="middle" style={mono('var(--type-micro)')} fill={INK2}>XFER</text>
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
                <text {...layer('VesselSynoptic / tanks / value.text', 'font/data 11 · ink/primary | tint', '{tank.level_pct}%')} x={g.x + g.w / 2} y={g.y + g.h / 2 + 4} textAnchor="middle" style={mono('var(--type-context)')} fill={tint ?? NEUTRAL.ink}>
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
                <text {...layer('VesselSynoptic / engines / value.text', 'font/data 9', '{engine.load_pct}% | OFF')} x={g.x} y={g.y + 3.5} textAnchor="middle" style={mono('var(--type-micro)')}
                  fill={e.running && tint ? '#0b0e13' : INK2}>
                  {e.running ? `${Math.round(e.load_pct)}%` : 'OFF'}
                </text>
              </g>
            );
          })}

          {/* flow meter + rate + reconciliation badge */}
          <rect {...layer('VesselSynoptic / meter / meter.shape', 'surface/overlay · line/strong · 45° diamond', 'flow meter node')} x={GEOM.meter.x - 7} y={GEOM.meter.y - 7} width={14} height={14}
            fill="var(--color-surface-overlay)" stroke={LINE} strokeWidth={1.2} transform={`rotate(45 ${GEOM.meter.x} ${GEOM.meter.y})`} />
          <text {...layer('VesselSynoptic / meter / value.text', 'font/data 11 · ink/primary', '{flow_gps × 3600} gph')} x={GEOM.meter.x} y={GEOM.meter.y + 28} textAnchor="middle" style={mono('var(--type-context)')} fill={NEUTRAL.ink}>
            {Math.round(now.flow_gps * 3600)} gph
          </text>
          <g {...layer('VesselSynoptic / meter / recon.chip', 'border + text = recon severity (OK ink/secondary · advisory · watch)', '{reconciliation.status · error_pct}')}>
            <rect x={GEOM.meter.x - 34} y={GEOM.meter.y - 46} width={68} height={16} rx={RADIUS}
              fill="var(--color-surface-raised)" stroke={reconColor} strokeWidth={1} />
            <text x={GEOM.meter.x} y={GEOM.meter.y - 34} textAnchor="middle" style={mono('var(--type-context)')} fill={reconColor}>
              RECON {recon.status}
            </text>
            <line x1={GEOM.meter.x} y1={GEOM.meter.y - 30} x2={GEOM.meter.x} y2={GEOM.meter.y - 10} stroke={reconColor} strokeWidth={0.75} />
          </g>

          {/* leader-line callouts (ST/FD/E annotation language) */}
          {[...tankGeo.map((g) => ({ id: g.id, ax: g.x + g.w / 2, ayTop: g.y, ayBot: g.y + g.h })),
            ...GEOM.engines.map((g) => ({ id: g.id, ax: g.x, ayTop: g.y - g.r, ayBot: g.y + g.r }))].map((c) => {
            const l = GEOM.callouts[c.id];
            const up = l.ly < VB.h / 2; // round 123: which side of the hull the label sits on (centerline follows VB)
            const anchorY = up ? c.ayTop : c.ayBot;
            return (
              <g key={`co-${c.id}`}>
                <line {...layer('VesselSynoptic / callouts / leader.line', 'line/strong 0.6px', '{node→label}')} x1={c.ax} y1={anchorY} x2={l.lx} y2={l.ly + (up ? 4 : -10)} stroke={LINE} strokeWidth={0.6} />
                <text {...layer('VesselSynoptic / callouts / label.text', 'font/data 10 · ink/secondary — ST/FD/E annotation language', '{ST1 ST2 FD1 FD2 E1–E4}')} x={l.lx} y={l.ly} textAnchor="middle" style={mono('var(--type-micro)')} fill={INK2}>{c.id}</text>
              </g>
            );
          })}
        </svg>
        {/* round 42: fixed 4-column grid — equal cell widths from the worst
            case, cells never resize. Dot matrix top-aligned at a fixed origin;
            value row pinned to the bottom, pct and gal in separate fixed
            right-aligned subcolumns so the · separator and the digits/commas
            stack vertically across all four tanks (no jitter on value change). */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(4, ${TANK_CELL_W}px)`, gap: 24, justifyContent: 'center', marginTop: 'var(--pad-section)' }}>
          {tankGeo.map((g, i) => {
            const t = tanks[i];
            const tint = tankTint(vessel, g.id);
            return (
              <div key={g.id} style={{ display: 'flex', flexDirection: 'column', minHeight: 132 }}>
                <Field level="vessel" field="tank.type">
                  <div {...layer('VesselSynoptic / tanks / label.text', 'gb.label micro-caps · TANK_LOW tint (earned)', '{tank.tank_id} {tank.type}')} style={{ ...gb.label, marginBottom: 4, ...(tint ? { color: tint } : {}) }}>
                    {g.id} {t.type}
                  </div>
                </Field>
                {/* dot matrix — fixed grid origin (top) */}
                <Field level="vessel" field="tank.level_pct">
                  <div {...layer('VesselSynoptic / tanks / fill.chart', 'dot matrix 5×10 · ink/secondary | TANK_LOW tint (⚖9: dots won)', '{tank.level_pct → filled dots}')}>
                    <DotMatrix pct={t.level_pct} tint={tint} />
                  </div>
                </Field>
                {/* value row — pinned to the bottom; pct · gal in fixed subcolumns */}
                <div style={{ marginTop: 'auto', paddingTop: 6, display: 'grid', gridTemplateColumns: `${TANK_PCT_W}px 12px ${TANK_GAL_W}px`, alignItems: 'baseline', fontFamily: FONT.data, fontSize: 'var(--type-context)', fontVariantNumeric: 'tabular-nums' }}>
                  <span {...TANK_LEAF[g.id].pct} style={{ textAlign: 'right', color: tint ?? NEUTRAL.ink }}>{t.level_pct}%</span>
                  <span style={{ textAlign: 'center', color: NEUTRAL.inkMuted }}>·</span>
                  <Field level="vessel" field="tank.level_gal">
                    <span {...TANK_LEAF[g.id].gal} style={{ textAlign: 'right', color: NEUTRAL.inkSecondary, display: 'block' }}>
                      {t.level_gal.toLocaleString()}<span style={{ color: NEUTRAL.inkMuted }}> gal</span>
                    </span>
                  </Field>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* ROUND 112: reveal CHEVRON removed (guardrail 11 — no chevrons in product
          UI; same family as the wind/waves + efficiency chevrons this round). Tank
          capacity + transfer status are shown by DEFAULT, stripped in EXPERT. */}
      {!expertOn && (
        <div style={{ borderTop: '1px solid var(--color-line-hairline)', marginTop: 8, paddingTop: 8, fontSize: 'var(--type-context)', color: NEUTRAL.inkSecondary }}>
          <Field level="vessel" field="tank.capacity_gal" revealed>
            <span>capacity {tanks.map((t) => `${t.tank_id.split('-')[1]} ${t.capacity_gal.toLocaleString()}`).join(' · ')} gal</span>
          </Field>
          {' — '}
          <Field level="vessel" field="tank.transfer_active" revealed>
            <span>{xferActive ? 'TRANSFER ACTIVE' : 'no transfer in progress'}</span>
          </Field>
        </div>
      )}
      </section>
    </div>
  );
}
