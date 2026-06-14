'use client';
// Interaction state only: live-tick on/off, tick speed, sim clock, and the
// current fleet snapshot those ticks produce. No data logic (generation and
// derivation live in src/data), no rendering beyond providing context.
//
// The fleet generates client-side in an effect: the full deterministic
// history (~140k samples) is far too large to serialize over SSR, and the
// demo epoch is pinned, so the browser regenerates the identical world.

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { advanceFleet, getFleet } from '../data/fleetState';
import { vesselStatus, type StatusLevel } from '../data/alerts';
import type { VesselState } from '../data/types';
import { scenarioById } from './scenarios';

export type TickSpeed = 1 | 60;
// Layout-probe toggles (branch-only): tile density, status-color treatment,
// motion variant (addendum item 7 — one item max, both testable).
export type TileDensity = 'minimal' | 'standard';
export type ColorTreatment = 'automotive' | 'dark-cockpit';
export type MotionVariant = 'off' | 'ripple' | 'breathe';
// round 68: LayoutVariant retired — chart-band is the sole FleetView layout
// (board-first removed); the chart band gains a transient maximize control.
// round 61: ⚖14 resolved — the meter strip is the sole expand affordance.
// round 66: the severity-placement experiment is RESOLVED to STRIP fleet-wide
// (edge/both retired, toggle removed). Severity now lives on the strip + name
// tint + value tint; the tile carries no severity outline at all.
export type RailMode = 'glyph' | 'stroke'; // round 24 rail mode-indicator experiment
// round 75/76: Calm Sea rendering treatments — gradient (round 67/74), particle
// field (round 75), dot matrix (round 76); all greyscale, selectable for compare.
export type WaterMode = 'gradient' | 'particle' | 'matrix';
export type TileSize = 'mini' | 'standard' | 'expanded'; // round 17 manual sizing
// round 95: status-cluster type-size under evaluation — PRIMARY 16 vs CONTEXT 13
export type ClusterType = 'primary' | 'context';

interface FleetContextValue {
  fleet: VesselState[] | null; // null while generating
  simTime: number | null; // epoch ms of the latest sample
  live: boolean;
  speed: TickSpeed;
  setLive: (on: boolean) => void;
  setSpeed: (s: TickSpeed) => void;
  density: TileDensity;
  setDensity: (d: TileDensity) => void;
  treatment: ColorTreatment;
  setTreatment: (t: ColorTreatment) => void;
  motion: MotionVariant;
  setMotion: (m: MotionVariant) => void;
  ikbBand: boolean; // round 5: the one large IKB fill moment, behind a toggle
  setIkbBand: (b: boolean) => void;
  bearingLine: boolean; // round 23: dashed BRG ray vs voyage-card-only
  setBearingLine: (b: boolean) => void;
  railMode: RailMode; // round 24: rail mode indicator variant
  setRailMode: (r: RailMode) => void;
  autoPromote: boolean; // round 26: auto-2x disabled by default, flag kept
  setAutoPromote: (b: boolean) => void;
  stateMarks: boolean; // round 21 B4: state silhouettes beside port names
  setStateMarks: (b: boolean) => void;
  /** round 21 B3: collapsed panel keys (`vesselId:panelId`), session-scoped */
  collapsedPanels: Record<string, boolean>;
  togglePanel: (key: string) => void;
  scenario: string; // round 45: scenario library — synthetic overlay id ('demo' = base seed)
  setScenario: (id: string) => void;
  ambientSea: boolean; // round 46: Calm Sea ambient wave (default on)
  setAmbientSea: (b: boolean) => void;
  shimmer: boolean; // round 72/74: fine texture toggle (round 74: default ON)
  setShimmer: (b: boolean) => void;
  // round 74: live Calm Sea dev sliders — wave amplitude/contrast + texture density/brightness
  waveAmp: number; setWaveAmp: (n: number) => void;
  texDens: number; setTexDens: (n: number) => void;
  texBright: number; setTexBright: (n: number) => void;
  // round 75/76: Calm Sea rendering treatment selector (gradient | particle | matrix)
  waterMode: WaterMode; setWaterMode: (m: WaterMode) => void;
  // round 76/77: dot-flow field controls (radius + density + magnification + ridge flow)
  dotSize: number; setDotSize: (n: number) => void;
  dotSpace: number; setDotSpace: (n: number) => void;
  mag: number; setMag: (n: number) => void;
  flow: number; setFlow: (n: number) => void;
  // round 95: global status-cluster type-size toggle (PRIMARY 16 vs CONTEXT 13),
  // default PRIMARY — pending Anthony's pixel verdict
  clusterType: ClusterType; setClusterType: (t: ClusterType) => void;
  censusFilter: StatusLevel | null; // round 12: band census → tile highlight
  setCensusFilter: (s: StatusLevel | null) => void;
  /** round 17: manual per-tile size — persists and overrides auto-promotion
      in BOTH directions; the engineer outranks the layout */
  tileSizes: Record<string, TileSize>;
  setTileSize: (id: string, size: TileSize) => void;
  /** vessel id → epoch ms of its last status threshold-cross during live mode */
  crossings: Record<string, number>;
}

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [fleet, setFleet] = useState<VesselState[] | null>(null);
  const [live, setLive] = useState(false);
  const [speed, setSpeed] = useState<TickSpeed>(60);
  const [density, setDensity] = useState<TileDensity>('standard');
  // Round 44: startup defaults set from Anthony's dev-panel screenshot.
  // COLOR → quiet (dark-cockpit): this supersedes round 38's automotive
  // default as the boot treatment; automotive stays available behind the
  // toggle. (The "dies at token lock" framing no longer applies — quiet is
  // now the chosen look.)
  const [treatment, setTreatment] = useState<ColorTreatment>('dark-cockpit');
  const [motion, setMotion] = useState<MotionVariant>('off');
  const [ikbBand, setIkbBand] = useState(false);
  const [bearingLine, setBearingLine] = useState(false); // round 44: voyage card only
  const [railMode, setRailMode] = useState<RailMode>('glyph');
  const [autoPromote, setAutoPromote] = useState(false);
  const [stateMarks, setStateMarks] = useState(true); // round 44: state marks on
  const [collapsedPanels, setCollapsedPanels] = useState<Record<string, boolean>>({});
  const togglePanel = (key: string) => setCollapsedPanels((m) => ({ ...m, [key]: !m[key] }));
  const [scenario, setScenario] = useState('demo');
  const [ambientSea, setAmbientSea] = useState(true); // round 46: default on
  // ROUND 80: persisted water defaults — Anthony's tuned values, applied on every
  // fresh page load (FleetProvider sits above the router, so FleetView and
  // VesselInspector both initialize here; no page loads at different settings).
  // The round-50 dataset binding (amp/freq from fleet/vessel delta) still
  // modulates ON TOP of these — these are the baseline it modulates from, not a
  // freeze.
  const [shimmer, setShimmer] = useState(true); // TEXTURE: on
  const [waveAmp, setWaveAmp] = useState(0.08); // WAVE AMP
  const [texDens, setTexDens] = useState(0.0); // TEX DENS
  const [texBright, setTexBright] = useState(0.25); // TEX BRIGHT
  const [waterMode, setWaterMode] = useState<WaterMode>('gradient'); // WATER MODE: gradient
  const [dotSize, setDotSize] = useState(0.5); // DOT SIZE
  const [dotSpace, setDotSpace] = useState(120); // DENSITY
  const [mag, setMag] = useState(2.5); // MAGNIFY
  const [flow, setFlow] = useState(1.0); // FLOW/RIDGE
  const [clusterType, setClusterType] = useState<ClusterType>('primary'); // round 95: default PRIMARY 16
  const [censusFilter, setCensusFilter] = useState<StatusLevel | null>(null);
  const [tileSizes, setTileSizes] = useState<Record<string, TileSize>>({});
  const setTileSize = (id: string, size: TileSize) => setTileSizes((m) => ({ ...m, [id]: size }));;
  const [crossings, setCrossings] = useState<Record<string, number>>({});
  const prevStatus = useRef<Map<string, string>>(new Map());
  const generating = useRef(false);

  useEffect(() => {
    if (generating.current) return; // strict-mode double mount
    generating.current = true;
    // Yield one frame so "Generating…" paints before the ~2s synchronous build.
    const id = setTimeout(() => setFleet(getFleet()), 30);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!live || !fleet) return;
    // 1x: one 1-min tick per real minute; 60x: one tick per second.
    const interval = setInterval(() => {
      const next = advanceFleet(1);
      // Threshold-cross detection for the ripple variant: a crossing is a
      // change in vesselStatus (same constants as alerts/color/tiers).
      const fired: Record<string, number> = {};
      for (const v of next) {
        const s = vesselStatus(v.alerts);
        const prev = prevStatus.current.get(v.static.id);
        if (prev !== undefined && prev !== s) fired[v.static.id] = Date.now();
        prevStatus.current.set(v.static.id, s);
      }
      if (Object.keys(fired).length) setCrossings((c) => ({ ...c, ...fired }));
      setFleet(next);
    }, speed === 60 ? 1000 : 60_000);
    return () => clearInterval(interval);
  }, [live, speed, fleet !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  const simTime = fleet ? fleet[0].history.minutes[fleet[0].history.minutes.length - 1].t : null;
  // ROUND 45 scenario library: synthetic overlays so performative states can
  // be designed/rehearsed against real pixels. Never the demo path; demo seed
  // and generated telemetry untouched — only alert/derived/staleness/mode on
  // clones. 'demo' = identity (the canonical Meridian story).
  const active = scenarioById(scenario);
  const viewFleet = fleet ? active.apply(fleet) : fleet;

  return (
    <FleetContext.Provider
      value={{
        fleet: viewFleet, simTime, live, speed, setLive, setSpeed,
        density, setDensity, treatment, setTreatment,
        motion, setMotion, crossings,
        ikbBand, setIkbBand,
        stateMarks, setStateMarks,
        bearingLine, setBearingLine, railMode, setRailMode, autoPromote, setAutoPromote,
        collapsedPanels, togglePanel, scenario, setScenario, ambientSea, setAmbientSea, shimmer, setShimmer,
        waveAmp, setWaveAmp, texDens, setTexDens, texBright, setTexBright,
        waterMode, setWaterMode, dotSize, setDotSize, dotSpace, setDotSpace, mag, setMag, flow, setFlow,
        clusterType, setClusterType,
        censusFilter, setCensusFilter,
        tileSizes, setTileSize,
      }}
    >
      {children}
      {active.synthetic && (
        <div style={{
          position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 70,
          fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)', letterSpacing: 1.5,
          color: 'var(--color-alert-caution)', border: '1px solid var(--color-alert-caution)',
          background: 'var(--color-surface-raised)', borderRadius: 1, padding: '4px 10px', // RADIUS token value (state layer)
        }}>
          SCENARIO: {active.label} — synthetic, not the demo path
        </div>
      )}
    </FleetContext.Provider>
  );
}

export function useFleet(): FleetContextValue {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet outside FleetProvider');
  return ctx;
}
