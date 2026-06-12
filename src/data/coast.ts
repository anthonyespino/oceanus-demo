// ROUND 23: the ONE coastline polygon — shared by the charts (rendering),
// the schedule builder (land avoidance), and verify (no-trail-on-land).
// Approximate Gulf coast, [lon, lat]; closure corners far outside any frame.

export type LatLon = { lat: number; lon: number };

export const COAST: [number, number][] = [
  [-97.55, 25.5], [-97.3, 26.3], [-97.25, 27.0], [-97.3, 27.8], [-96.9, 28.15],
  [-96.2, 28.6], [-95.3, 28.95], [-94.7, 29.35], [-93.8, 29.7], [-92.8, 29.55],
  [-91.8, 29.5], [-91.2, 29.25], [-90.4, 29.05], [-89.9, 29.25], [-89.55, 29.3],
  [-89.2, 29.12], [-88.95, 28.95], [-89.25, 29.35], [-89.45, 29.75], [-89.35, 30.05],
  [-88.95, 30.35], [-88.5, 30.32], [-88.05, 30.55], [-87.55, 30.28], [-86.8, 30.4],
];
export const LAND: [number, number][] = [[-100, 24.5], ...COAST, [-85.5, 30.45], [-85.5, 33], [-100, 33]];

/** Ray-cast point-in-polygon in lon/lat space. */
export function pointInLand(lat: number, lon: number): boolean {
  let inside = false;
  for (let i = 0, j = LAND.length - 1; i < LAND.length; j = i++) {
    const [xi, yi] = LAND[i];
    const [xj, yj] = LAND[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Deterministic offshore push: fixed direction priority (the Gulf is south
// of the coast), fixed step — same seed, same fix.
const PUSH_DIRS: [number, number][] = [
  [0, -1], [0.5, -1], [-0.5, -1], [1, -0.4], [-1, -0.4], [1, 0], [-1, 0], [0, 1],
];
export function pushOffshore(p: LatLon, marginDeg = 0.08): LatLon {
  for (let step = 0.04; step <= 1.6; step += 0.04) {
    for (const [dx, dy] of PUSH_DIRS) {
      const lat = p.lat + dy * (step + marginDeg);
      const lon = p.lon + dx * (step + marginDeg);
      if (!pointInLand(lat, lon)) return { lat, lon };
    }
  }
  return p; // unreachable for sane inputs
}

const NEAR_ENDPOINT_DEG = 0.07; // ≈4 nm — port approaches are exempt

/**
 * Land avoidance: sample each segment at fine resolution; each violating RUN
 * (contiguous land samples) gets its midpoint pushed offshore and inserted
 * as a waypoint; repeat until clean (bounded iterations — long crossings
 * like the Mississippi birdfoot need several cuts). Endpoints (ports) and
 * their approaches are exempt — moored is allowed to touch the coast.
 */
const SAMPLE_DEG = 0.01;
export function avoidLand(path: LatLon[], marginDeg = 0.16): LatLon[] {
  // coarse pass, then a fine pass to catch shallow vertex grazes
  return avoidPass(avoidPass(path, marginDeg, SAMPLE_DEG), marginDeg * 1.4, 0.004);
}

function avoidPass(path: LatLon[], marginDeg: number, sampleDeg: number): LatLon[] {
  const pts = [...path];
  const start = pts[0];
  const end = pts[pts.length - 1];
  const nearEndpoint = (p: LatLon) =>
    Math.hypot(p.lat - start.lat, p.lon - start.lon) < NEAR_ENDPOINT_DEG ||
    Math.hypot(p.lat - end.lat, p.lon - end.lon) < NEAR_ENDPOINT_DEG;

  for (let iter = 0; iter < 40; iter++) {
    let fixed = false;
    outer: for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const span = Math.hypot(b.lat - a.lat, b.lon - a.lon);
      const n = Math.max(2, Math.ceil(span / sampleDeg));
      let runStart = -1;
      for (let k = 1; k <= n; k++) {
        const s = { lat: a.lat + ((b.lat - a.lat) * k) / n, lon: a.lon + ((b.lon - a.lon) * k) / n };
        const bad = k < n && !nearEndpoint(s) && pointInLand(s.lat, s.lon);
        if (bad && runStart < 0) runStart = k;
        if (!bad && runStart >= 0) {
          // cut the run at its midpoint
          const mid = (runStart + k - 1) / 2 / n;
          const m = { lat: a.lat + (b.lat - a.lat) * mid, lon: a.lon + (b.lon - a.lon) * mid };
          pts.splice(i + 1, 0, pushOffshore(m, marginDeg));
          fixed = true;
          break outer;
        }
      }
    }
    if (!fixed) return pts;
  }
  return pts;
}

/** Path length in nm (haversine-lite via the fleet helper shape). */
export function pathLengthNm(path: LatLon[], dist: (a: LatLon, b: LatLon) => number): number {
  let nm = 0;
  for (let i = 0; i < path.length - 1; i++) nm += dist(path[i], path[i + 1]);
  return nm;
}
