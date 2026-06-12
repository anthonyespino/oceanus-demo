'use client';
// LAYOUT PROBE round 3.1: zoomed inspector chart — focus vessel + 24h trail +
// next port, ghost fleet dimmed but never removed. Sizing is content-box
// measured (no overflow past the card stroke); ghosts share the same
// deterministic cluster logic as the fleet chart; every ghost has a ≥24px hit
// area, hover tooltip, and click-through to its inspector.

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { place, distanceNm } from '../data/fleet';
import { useFleet, type ColorTreatment } from '../state/FleetProvider';
import { NauticalChart, useContentWidth, usePanZoom, FollowChip, CHART_INK, type ChartFrame } from './NauticalChart';
import { clusterPoints } from './chartLayout';
import { MarkerTooltip, ClusterSplay } from './ChartOverlays';
import { STATUS_COLOR, RADIUS } from './probeTokens';
import { gb } from './gb';
import { Label } from './Glyph';

// Round 15: frame to content — focus vessel + 24h trail + the nearest few
// ghosts at a sensible radius (~60-90 nm). The next port deliberately does
// NOT drive the frame (it could be 200 nm out and buy half a screen of
// empty water); the bearing line still exits toward it.
function focusFrame(vessel: VesselState, fleet: VesselState[]): ChartFrame {
  const pts = vessel.history.minutes
    .filter((_, i) => i % 15 === 0)
    .map((s) => ({ lat: s.position.lat, lon: s.position.lon }));
  const here = vessel.history.minutes.at(-1)!.position;
  const ghosts = fleet
    .filter((v) => v.static.id !== vessel.static.id)
    .map((v) => v.history.minutes.at(-1)!.position)
    .map((p) => ({ p, d: distanceNm(here, p) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .filter((g) => g.d < 120)
    .map((g) => g.p);
  pts.push(...ghosts);
  let latMin = Math.min(...pts.map((p) => p.lat));
  let latMax = Math.max(...pts.map((p) => p.lat));
  let lonMin = Math.min(...pts.map((p) => p.lon));
  let lonMax = Math.max(...pts.map((p) => p.lon));
  const padLat = Math.max(0.2, (latMax - latMin) * 0.15);
  const padLon = Math.max(0.3, (lonMax - lonMin) * 0.15);
  latMin -= padLat; latMax += padLat; lonMin -= padLon; lonMax += padLon;
  // clamp spans: ~60 nm radius floor, ~90 nm ceiling (1° lat = 60 nm)
  const clamp = (min: number, max: number, lo: number, hi: number): [number, number] => {
    const span = Math.min(hi, Math.max(lo, max - min));
    const c = (max + min) / 2;
    return [c - span / 2, c + span / 2];
  };
  [latMin, latMax] = clamp(latMin, latMax, 1.6, 3.0);
  [lonMin, lonMax] = clamp(lonMin, lonMax, 2.2, 3.8);
  return { latMin, latMax, lonMin, lonMax };
}

export function InspectorChart({
  vessel,
  fleet,
  treatment,
  width = 480,
  height = 300,
}: {
  vessel: VesselState;
  fleet: VesselState[];
  treatment: ColorTreatment;
  width?: number;
  height?: number;
}) {
  const router = useRouter();
  const { bearingLine } = useFleet();
  const [wrapRef, w] = useContentWidth(width);
  const [hoverId, setHoverId] = useState<string | null>(null);
  // round 18: tooltips are the legitimate hover use, but debounced so a
  // cursor sweep doesn't strobe them
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverSoon = (id: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoverId(id), 150);
  };
  const hoverEnd = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverId(null);
  };
  const [splay, setSplay] = useState<number | null>(null);

  // round 21 B2: follow (auto-recenter on the focus vessel) + pan + zoom
  const { frame, following, follow, handlers, wheelRef } = usePanZoom(focusFrame(vessel, fleet), w, height);
  const px = (lon: number) => ((lon - frame.lonMin) / (frame.lonMax - frame.lonMin)) * w;
  const py = (lat: number) => ((frame.latMax - lat) / (frame.latMax - frame.latMin)) * height;

  const pos = vessel.history.minutes.at(-1)!.position;
  const trail = vessel.history.minutes.filter((_, i) => i % 15 === 0).map((s) => s.position);
  const next = vessel.history.nextPortCalls[0];
  const nextPlace = next ? place(next.port) : null;
  const status = vesselStatus(vessel.alerts);
  const focusFill = treatment === 'automotive' || status !== 'nominal' ? STATUS_COLOR[status] : '#d0d0d0';

  const ghosts = fleet
    .filter((v) => v.static.id !== vessel.static.id)
    .map((v) => {
      const p = v.history.minutes.at(-1)!.position;
      return { id: v.static.id, name: v.static.name, x: px(p.lon), y: py(p.lat) };
    })
    .filter((g) => g.x >= 0 && g.x <= w && g.y >= 0 && g.y <= height);
  const ghostClusters = clusterPoints(ghosts, 10);
  const hoveredGhost = hoverId ? ghosts.find((g) => g.id === hoverId) : null;

  const body = (
      <div ref={wrapRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <div ref={wheelRef} {...handlers} style={{ cursor: following ? 'default' : 'grab' }}>
        <NauticalChart frame={frame} width={w} height={height}>
          {() => (
            <>
              {ghostClusters.map((c, i) =>
                c.members.length === 1 ? (
                  <g key={c.members[0].id} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}
                    onMouseEnter={() => hoverSoon(c.members[0].id)} onMouseLeave={hoverEnd}
                    onFocus={() => setHoverId(c.members[0].id)} onBlur={() => setHoverId(null)}
                    onClick={() => router.push(`/vessel/${c.members[0].id}`)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.push(`/vessel/${c.members[0].id}`)}>
                    <rect x={c.x - 12} y={c.y - 12} width={24} height={24} fill="transparent" />
                    {hoverId === c.members[0].id && <circle cx={c.x} cy={c.y} r={7} fill="none" stroke="var(--color-accent-bright)" strokeWidth={1} />}
                    <circle cx={c.x} cy={c.y} r={3} fill="#616161" opacity={0.7} />
                  </g>
                ) : (
                  <g key={`gc-${i}`} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}
                    onMouseEnter={() => setSplay(i)} onFocus={() => setSplay(i)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSplay(splay === i ? null : i)}>
                    <rect x={c.x - 12} y={c.y - 12} width={24} height={24} fill="transparent" />
                    <circle cx={c.x} cy={c.y} r={4.5} fill="#616161" opacity={0.85} />
                    <text x={c.x + 7} y={c.y + 3} fontSize={9} fill="#7a7a7a">{c.members.length} ▾</text>
                  </g>
                ),
              )}
              <polyline
                points={trail.map((p) => `${px(p.lon).toFixed(1)},${py(p.lat).toFixed(1)}`).join(' ')}
                fill="none" stroke="#7a7a7a" strokeWidth={1} strokeDasharray="3 3" />
              {/* round 23: NOT a route — a dashed bearing ray, clipped at the
                  chart edge, labeled BRG; the voyage card carries the real
                  destination. Behind the dev toggle (Anthony judges). */}
              {bearingLine && nextPlace && (() => {
                const x0 = px(pos.lon);
                const y0 = py(pos.lat);
                const dx = px(nextPlace.lon) - x0;
                const dy = py(nextPlace.lat) - y0;
                if (dx === 0 && dy === 0) return null;
                let tEdge = Infinity;
                if (dx > 0) tEdge = Math.min(tEdge, (w - x0) / dx);
                if (dx < 0) tEdge = Math.min(tEdge, -x0 / dx);
                if (dy > 0) tEdge = Math.min(tEdge, (height - y0) / dy);
                if (dy < 0) tEdge = Math.min(tEdge, -y0 / dy);
                const t1 = Math.min(1, tEdge); // stop at the port if in frame
                const lx = x0 + dx * t1 * 0.82;
                const ly = y0 + dy * t1 * 0.82;
                return (
                  <g>
                    <line x1={x0} y1={y0} x2={x0 + dx * t1} y2={y0 + dy * t1}
                      stroke="#5e5e5e" strokeWidth={0.75} strokeDasharray="6 4" />
                    <text x={lx} y={ly - 5} fontSize={9} fill={CHART_INK} textAnchor="middle">
                      BRG {next!.port.replace(',', '').toUpperCase()}
                    </text>
                    {1 <= tEdge && (
                      <rect x={px(nextPlace.lon) - 4} y={py(nextPlace.lat) - 4} width={8} height={8}
                        fill="none" stroke={CHART_INK} strokeWidth={1.5} />
                    )}
                  </g>
                );
              })()}
              <rect x={px(pos.lon) - 4.5} y={py(pos.lat) - 4.5} width={9} height={9}
                fill={focusFill} stroke="#141414" strokeWidth={1} />
              <text x={px(pos.lon) + 9} y={py(pos.lat) + 4} fontSize={11} fontWeight={700} fill="var(--color-ink-primary)">
                {vessel.static.name}
              </text>
            </>
          )}
        </NauticalChart>
        {hoveredGhost && (
          <MarkerTooltip x={hoveredGhost.x} y={hoveredGhost.y} label={hoveredGhost.name}>
            open inspector
          </MarkerTooltip>
        )}
        {splay !== null && ghostClusters[splay] && (
          <ClusterSplay x={ghostClusters[splay].x} y={ghostClusters[splay].y} onClose={() => setSplay(null)}
            members={ghostClusters[splay].members.map((m) => ({ id: m.id, name: m.name, dotColor: '#616161' }))} />
        )}
        </div>
        {!following && <FollowChip onClick={follow} />}
      </div>
  );
  return (
    <section style={{ ...gb.box, marginBottom: 8, borderRadius: RADIUS }}>
      <Label g="route">position</Label>
      {body}
    </section>
  );
}
