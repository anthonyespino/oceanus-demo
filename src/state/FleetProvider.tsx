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
import { vesselStatus } from '../data/alerts';
import type { Alert } from '../data/types';
import type { VesselState } from '../data/types';

export type TickSpeed = 1 | 60;
// Layout-probe toggles (branch-only): tile density, status-color treatment,
// motion variant (addendum item 7 — one item max, both testable).
export type TileDensity = 'minimal' | 'standard';
export type ColorTreatment = 'automotive' | 'dark-cockpit';
export type MotionVariant = 'off' | 'ripple' | 'breathe';
// (a) board-first: trend board top, large chart below; (b) chart-band:
// shallow full-width chart strip on top, board directly below.
export type LayoutVariant = 'board-first' | 'chart-band';
export type TankStyle = 'bars' | 'dots' | 'synoptic'; // round 5 dots + round 7 synoptic experiments
export type SensorStyle = 'rows' | 'gauges'; // round 11 instrument cluster experiment

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
  layoutVariant: LayoutVariant;
  setLayoutVariant: (l: LayoutVariant) => void;
  ikbBand: boolean; // round 5: the one large IKB fill moment, behind a toggle
  setIkbBand: (b: boolean) => void;
  tankStyle: TankStyle;
  setTankStyle: (t: TankStyle) => void;
  sensorStyle: SensorStyle;
  setSensorStyle: (s: SensorStyle) => void;
  stress: boolean; // round 11: synthetic crowded-board scenario (badged STRESS)
  setStress: (b: boolean) => void;
  /** vessel id → epoch ms of its last status threshold-cross during live mode */
  crossings: Record<string, number>;
}

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [fleet, setFleet] = useState<VesselState[] | null>(null);
  const [live, setLive] = useState(false);
  const [speed, setSpeed] = useState<TickSpeed>(60);
  const [density, setDensity] = useState<TileDensity>('standard');
  const [treatment, setTreatment] = useState<ColorTreatment>('dark-cockpit');
  const [motion, setMotion] = useState<MotionVariant>('off');
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>('board-first');
  const [ikbBand, setIkbBand] = useState(false);
  const [tankStyle, setTankStyle] = useState<TankStyle>('synoptic') // default flipped for Anthony's phone review (verdict 11); rows/dots in dev panel
  const [sensorStyle, setSensorStyle] = useState<SensorStyle>('rows');
  const [stress, setStress] = useState(false);;
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
  // STRESS scenario (round 11): synthetic overrides so the crowded-board case
  // can be designed against real pixels. Never the demo path; demo seed and
  // generated data untouched — only alert/derived fields on clones.
  const viewFleet = fleet && stress ? applyStress(fleet) : fleet;

  return (
    <FleetContext.Provider
      value={{
        fleet: viewFleet, simTime, live, speed, setLive, setSpeed,
        density, setDensity, treatment, setTreatment,
        motion, setMotion, crossings,
        layoutVariant, setLayoutVariant,
        ikbBand, setIkbBand, tankStyle, setTankStyle,
        sensorStyle, setSensorStyle, stress, setStress,
      }}
    >
      {children}
      {stress && (
        <div style={{
          position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 70,
          fontFamily: 'var(--font-data)', fontSize: 11, letterSpacing: 1.5,
          color: 'var(--color-alert-caution)', border: '1px solid var(--color-alert-caution)',
          background: 'var(--color-surface-raised)', borderRadius: 6, padding: '4px 10px',
        }}>
          STRESS SCENARIO — synthetic, not the demo path
        </div>
      )}
    </FleetContext.Provider>
  );
}

const STRESS_MODS: Record<string, { alerts: Alert[]; sd: number; trend: number; delta: number }> = {
  v02: { alerts: [{ level: 'WARNING', code: 'FEEDER_LOW', message: 'Feeder tanks 8% underway' }], sd: 7.4, trend: 9.2, delta: 12.8 },
  v05: { alerts: [{ level: 'CAUTION', code: 'EFF_DELTA', message: 'Efficiency +9.6% vs mode baseline, sustained 7d' }], sd: 4.8, trend: 6.1, delta: 9.6 },
  v08: { alerts: [{ level: 'CAUTION', code: 'EGT_DIVERGENCE', message: 'v08-E1 EGT +44°F over twin at matched load' }], sd: 3.2, trend: 4.4, delta: 7.1 },
};

function applyStress(fleet: VesselState[]): VesselState[] {
  return fleet.map((v) => {
    const m = STRESS_MODS[v.static.id];
    if (!m) return v;
    return {
      ...v,
      alerts: [...v.alerts, ...m.alerts],
      derived: { ...v.derived, sustained_deviation: m.sd, trend_30d: m.trend, efficiency_delta_pct: m.delta },
    };
  });
}

export function useFleet(): FleetContextValue {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet outside FleetProvider');
  return ctx;
}
