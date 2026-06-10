// Burn-vs-speed envelope (round 5, EfficiencyCurve). Built strictly from the
// vessel's own 1y TRANSIT history — median gal/nm per 0.5 kn speed bin with
// an IQR band as the expected envelope. The live operating point's vertical
// displacement from the median curve is the degradation signal; verify
// asserts it ≈ efficiency_delta for the anomaly vessel.

import type { VesselHistory, VesselSample } from './types';

export interface EnvelopeBin {
  speed: number; // bin center, kn
  median: number; // gal/nm
  p25: number;
  p75: number;
  n: number;
}

export interface Envelope {
  bins: EnvelopeBin[];
  transitHours: number;
  /** speed band minimizing gal/nm (within 5% of the minimum median) */
  optimal: { lo: number; hi: number } | null;
}

/** Below this many transit hours the envelope renders as insufficient. */
export const MIN_TRANSIT_HOURS = 150;
const MIN_BIN_SAMPLES = 6;

function burnGph(s: VesselSample): number {
  return s.engines.reduce((a, e) => a + e.fuel_rate_gph, 0);
}

function quantile(sorted: number[], q: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
}

export function transitEnvelope(history: VesselHistory): Envelope {
  const samples = history.hourly.filter((s) => s.mode === 'TRANSIT' && s.position.speed_over_ground_kn > 2);
  const byBin = new Map<number, number[]>();
  for (const s of samples) {
    const sog = s.position.speed_over_ground_kn;
    const bin = Math.round(sog * 2) / 2;
    let arr = byBin.get(bin);
    if (!arr) byBin.set(bin, (arr = []));
    arr.push(burnGph(s) / sog);
  }
  const bins: EnvelopeBin[] = [...byBin.entries()]
    .filter(([, arr]) => arr.length >= MIN_BIN_SAMPLES)
    .sort((a, b) => a[0] - b[0])
    .map(([speed, arr]) => {
      const sorted = [...arr].sort((x, y) => x - y);
      return {
        speed,
        median: quantile(sorted, 0.5),
        p25: quantile(sorted, 0.25),
        p75: quantile(sorted, 0.75),
        n: arr.length,
      };
    });

  let optimal: Envelope['optimal'] = null;
  if (bins.length >= 3) {
    const minMedian = Math.min(...bins.map((b) => b.median));
    const good = bins.filter((b) => b.median <= minMedian * 1.05).map((b) => b.speed);
    optimal = { lo: Math.min(...good) - 0.25, hi: Math.max(...good) + 0.25 };
  }
  return { bins, transitHours: samples.length, optimal };
}

/** Current operating point: 15-min mean of speed and gal/nm, TRANSIT only. */
export function liveOperatingPoint(history: VesselHistory): { speed: number; galNm: number } | null {
  const recent = history.minutes.slice(-15).filter((s) => s.mode === 'TRANSIT' && s.position.speed_over_ground_kn > 2);
  if (recent.length < 5) return null;
  const speed = recent.reduce((a, s) => a + s.position.speed_over_ground_kn, 0) / recent.length;
  const galNm = recent.reduce((a, s) => a + burnGph(s) / s.position.speed_over_ground_kn, 0) / recent.length;
  return { speed, galNm };
}

/** Median curve value at an arbitrary speed (linear between bin centers). */
export function envelopeMedianAt(env: Envelope, speed: number): number | null {
  const { bins } = env;
  if (bins.length === 0) return null;
  if (speed <= bins[0].speed) return bins[0].median;
  if (speed >= bins[bins.length - 1].speed) return bins[bins.length - 1].median;
  for (let i = 1; i < bins.length; i++) {
    if (speed <= bins[i].speed) {
      const a = bins[i - 1];
      const b = bins[i];
      const f = (speed - a.speed) / (b.speed - a.speed);
      return a.median + (b.median - a.median) * f;
    }
  }
  return null;
}

/** Vertical displacement of the live point above/below its own envelope, %. */
export function envelopeDeltaPct(history: VesselHistory): number | null {
  const env = transitEnvelope(history);
  const pt = liveOperatingPoint(history);
  if (!pt) return null;
  const median = envelopeMedianAt(env, pt.speed);
  if (median === null || median <= 0) return null;
  return (pt.galNm / median - 1) * 100;
}
