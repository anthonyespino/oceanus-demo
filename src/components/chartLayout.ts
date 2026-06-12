// LAYOUT PROBE: deterministic chart label/marker layout (round 3.1 item 2).
// This is a systems decision, not a patch:
//   1. Markers within CLUSTER_RADIUS px agglomerate into one cluster marker
//      with a count chip that splays on hover (near-co-located vessels).
//   2. Remaining labels place greedily: 8 candidate anchors around each
//      marker (E, W, N, S, then diagonals with leader lines), first
//      non-colliding wins; collisions test against all marker boxes, every
//      placed label, and the chart bounds. Input order is rank order, so
//      placement is fully deterministic — same fleet, same layout.
//   3. A label that cannot place anywhere is dropped (the hover tooltip
//      still carries the name) rather than overprinting.
// FleetMap markers and InspectorChart ghosts share this module.

export interface ChartPoint {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface MarkerCluster {
  x: number;
  y: number;
  members: ChartPoint[];
}

export function clusterPoints(pts: ChartPoint[], radius = 14): MarkerCluster[] {
  const clusters: MarkerCluster[] = [];
  for (const p of pts) {
    const hit = clusters.find((c) => Math.hypot(c.x - p.x, c.y - p.y) < radius);
    if (hit) {
      hit.members.push(p);
      hit.x = hit.members.reduce((a, m) => a + m.x, 0) / hit.members.length;
      hit.y = hit.members.reduce((a, m) => a + m.y, 0) / hit.members.length;
    } else {
      clusters.push({ x: p.x, y: p.y, members: [p] });
    }
  }
  return clusters;
}

export function labelWidth(name: string, fontSize = 9): number {
  return name.length * fontSize * 0.58 + 4;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export interface PlacedLabel {
  x: number; // label rect origin
  y: number;
  w: number;
  h: number;
  leader: boolean; // draw a leader line back to the marker
}

/**
 * Greedy label placement. `anchors` are marker positions whose labels we
 * place (in order); `blocked` are additional keep-out boxes (cluster chips).
 */
export function placeLabels(
  anchors: { x: number; y: number; name: string }[],
  bounds: { w: number; h: number },
  blocked: Rect[] = [],
): (PlacedLabel | null)[] {
  const h = 10;
  // round 36: markers are directional hulls — the bow reaches ~7px from
  // center at ANY rotation, so the keep-out box and anchor offsets are
  // radial (bow-safe) rather than square-sized
  const taken: Rect[] = [
    ...anchors.map((m) => ({ x: m.x - 7, y: m.y - 7, w: 14, h: 14 })),
    ...blocked,
  ];
  return anchors.map((m) => {
    const w = labelWidth(m.name);
    const candidates: (Rect & { leader: boolean })[] = [
      { x: m.x + 9, y: m.y - 5, w, h, leader: false }, // E
      { x: m.x - 9 - w, y: m.y - 5, w, h, leader: false }, // W
      { x: m.x - w / 2, y: m.y - 20, w, h, leader: false }, // N
      { x: m.x - w / 2, y: m.y + 11, w, h, leader: false }, // S
      { x: m.x + 12, y: m.y - 20, w, h, leader: true }, // NE
      { x: m.x - 12 - w, y: m.y - 20, w, h, leader: true }, // NW
      { x: m.x + 12, y: m.y + 13, w, h, leader: true }, // SE
      { x: m.x - 12 - w, y: m.y + 13, w, h, leader: true }, // SW
    ];
    for (const c of candidates) {
      const inBounds = c.x >= 2 && c.y >= 2 && c.x + c.w <= bounds.w - 2 && c.y + c.h <= bounds.h - 2;
      if (inBounds && !taken.some((t) => intersects(c, t))) {
        taken.push(c);
        return { x: c.x, y: c.y, w: c.w, h: c.h, leader: c.leader };
      }
    }
    return null; // drop rather than overprint; tooltip still names it
  });
}
