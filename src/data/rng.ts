// Deterministic random utilities. Single global seed; every consumer derives
// an independent stream from a string key so generation order never matters.

/** Single seed constant — same seed → identical fleet and timeline (spec §11). */
export const SEED = 20260618;

/**
 * Fixed "now" for the demo. Wall-clock now would shift the timeline every run
 * and break repeatability; live mode advances 1-min ticks from this epoch.
 */
export const DEMO_EPOCH = Date.UTC(2026, 5, 18, 15, 0, 0); // 2026-06-18T15:00Z

export const HOUR_MS = 3_600_000;
export const MIN_MS = 60_000;
export const DAY_MS = 24 * HOUR_MS;

/** FNV-1a string hash, folded with the global seed. */
export function hashKey(key: string): number {
  let h = 0x811c9dc5 ^ SEED;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function scramble(x: number): number {
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return (x ^ (x >>> 16)) >>> 0;
}

/** Sequential PRNG (mulberry32) over a derived stream. */
export class Rng {
  private s: number;
  constructor(streamKey: string) {
    this.s = hashKey(streamKey);
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  int(a: number, b: number): number {
    return Math.floor(this.range(a, b + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }
  /** Approx standard normal (sum of 4 uniforms, good enough for sensor noise). */
  gauss(): number {
    return (this.next() + this.next() + this.next() + this.next() - 2) * 1.732;
  }
}

/** Deterministic value in [-1, 1] at integer lattice point i of a stream. */
function lattice(key: number, i: number): number {
  return (scramble(key ^ Math.imul(i + 0x9e3779b9, 2654435761)) / 4294967296) * 2 - 1;
}

/**
 * Smooth 1-D value noise in [-1, 1], addressable by absolute time — no
 * integration state, so hourly and 1-min passes sample the same field.
 * `periodMs` sets how fast it wanders.
 */
export function smoothNoise(streamKey: string, tMs: number, periodMs: number): number {
  const key = hashKey(streamKey);
  const x = tMs / periodMs;
  const i = Math.floor(x);
  const f = x - i;
  const u = (1 - Math.cos(f * Math.PI)) / 2;
  return lattice(key, i) * (1 - u) + lattice(key, i + 1) * u;
}

/** Two octaves of smoothNoise for a more natural wander. */
export function smoothNoise2(streamKey: string, tMs: number, periodMs: number): number {
  return 0.7 * smoothNoise(streamKey, tMs, periodMs) + 0.3 * smoothNoise(streamKey + '#2', tMs, periodMs / 3.7);
}
