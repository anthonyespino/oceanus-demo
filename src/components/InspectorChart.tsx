'use client';
// LAYOUT PROBE round 3.1: zoomed inspector chart — focus vessel + 24h trail +
// next port, ghost fleet dimmed but never removed. Sizing is content-box
// measured (no overflow past the card stroke); ghosts share the same
// deterministic cluster logic as the fleet chart; every ghost has a ≥24px hit
// area, hover tooltip, and click-through to its inspector.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VesselState } from '../data/types';
import { vesselStatus } from '../data/alerts';
import { place } from '../data/fleet';
import type { ColorTreatment } from '../state/FleetProvider';
import { NauticalChart, useContentWidth, CHART_INK, type ChartFrame } from './NauticalChart';
import { clusterPoints } from './chartLayout';
import { MarkerTooltip, ClusterSplay } from './ChartOverlays';
import { STATUS_COLOR, RADIUS } from './probeTokens';
import { gb } from './gb';

function focusFrame(vessel: VesselState): ChartFrame {
  const pts = vessel.history.minutes
    .filter((_, i) => i % 15 === 0)
    .map((s) => ({ lat: s.position.lat, lon: s.position.lon }));
  const next = vessel.history.nextPortCalls[0];
  if (next) pts.push(place(next.port));
  let latMin = Math.min(...pts.map((p) => p.lat));
  let latMax = Math.max(...pts.map((p) => p.lat));
  let lonMin = Math.min(...pts.map((p) => p.lon));
  let lonMax = Math.max(...pts.map((p) => p.lon));
  const padLat = Math.max(0.25, (latMax - latMin) * 0.2);
  const padLon = Math.max(0.4, (lonMax - lonMin) * 0.2);
  latMin -= padLat; latMax += padLat; lonMin -= padLon; lonMax += padLon;
  const minLat = 1.3; const minLon = 2.6;
  if (latMax - latMin < minLat) { const c = (latMax + latMin) / 2; latMin = c - minLat / 2; latMax = c + minLat / 2; }
  if (lonMax - lonMin < minLon) { const c = (lonMax + lonMin) / 2; lonMin = c - minLon / 2; lonMax = c + minLon / 2; }
  return { latMin, latMax, lonMin, lonMax };
}

export function InspectorChart({
  vessel,
  fleet,
  treatment,
  width = 480,
  height = 300,
  ambient = false, // round 7: render frameless as the inspector's backdrop
}: {
  vessel: VesselState;
  fleet: VesselState[];
  treatment: ColorTreatment;
  width?: number;
  height?: number;
  ambient?: boolean;
}) {
  const router = useRouter();
  const [wrapRef, w] = useContentWidth(width);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [splay, setSplay] = useState<number | null>(null);

  const frame = focusFrame(vessel);
  const px = (lon: number) => ((lon - frame.lonMin) / (frame.lonMax - frame.lonMin)) * w;
  const py = (lat: number) => ((frame.latMax - lat) / (frame.latMax - frame.latMin)) * height;

  const pos = vessel.history.minutes.at(-1)!.position;
  const trail = vessel.history.minutes.filter((_, i) => i % 15 === 0).map((s) => s.position);
  const next = vessel.history.nextPortCalls[0];
  const nextPlace = next ? place(next.port) : null;
  const status = vesselStatus(vessel.alerts);
  const focusFill = treatment === 'automotive' || status !== 'nominal' ? STATUS_COLOR[status] : '#c8d0d9';

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
      <div ref={wrapRef} style={{ position: 'relative', overflow: 'hidden', height: ambient ? height : undefined }}>
        <NauticalChart frame={frame} width={w} height={height}>
          {() => (
            <>
              {ghostClusters.map((c, i) =>
                c.members.length === 1 ? (
                  <g key={c.members[0].id} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}
                    onMouseEnter={() => setHoverId(c.members[0].id)} onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(c.members[0].id)} onBlur={() => setHoverId(null)}
                    onClick={() => router.push(`/vessel/${c.members[0].id}`)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.push(`/vessel/${c.members[0].id}`)}>
                    <rect x={c.x - 12} y={c.y - 12} width={24} height={24} fill="transparent" />
                    {hoverId === c.members[0].id && <circle cx={c.x} cy={c.y} r={7} fill="none" stroke="var(--color-accent-bright)" strokeWidth={1} />}
                    <circle cx={c.x} cy={c.y} r={3} fill="#5b646e" opacity={0.7} />
                  </g>
                ) : (
                  <g key={`gc-${i}`} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}
                    onMouseEnter={() => setSplay(i)} onFocus={() => setSplay(i)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSplay(splay === i ? null : i)}>
                    <rect x={c.x - 12} y={c.y - 12} width={24} height={24} fill="transparent" />
                    <circle cx={c.x} cy={c.y} r={4.5} fill="#5b646e" opacity={0.85} />
                    <text x={c.x + 7} y={c.y + 3} fontSize={9} fill="#727b86">{c.members.length} ▾</text>
                  </g>
                ),
              )}
              <polyline
                points={trail.map((p) => `${px(p.lon).toFixed(1)},${py(p.lat).toFixed(1)}`).join(' ')}
                fill="none" stroke="#727b86" strokeWidth={1} strokeDasharray="3 3" />
              {nextPlace && (
                <g>
                  <line x1={px(pos.lon)} y1={py(pos.lat)} x2={px(nextPlace.lon)} y2={py(nextPlace.lat)}
                    stroke="#59626c" strokeWidth={0.75} strokeDasharray="6 4" />
                  <rect x={px(nextPlace.lon) - 4} y={py(nextPlace.lat) - 4} width={8} height={8}
                    fill="none" stroke="var(--color-accent-bright)" strokeWidth={1.5} />
                  <text x={px(nextPlace.lon) + 8} y={py(nextPlace.lat) + 4} fontSize={10} fill={CHART_INK}>
                    {next!.port}
                  </text>
                </g>
              )}
              <rect x={px(pos.lon) - 4.5} y={py(pos.lat) - 4.5} width={9} height={9}
                fill={focusFill} stroke="#1c1c1c" strokeWidth={1} />
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
            members={ghostClusters[splay].members.map((m) => ({ id: m.id, name: m.name, dotColor: '#5b646e' }))} />
        )}
      </div>
  );
  if (ambient) return body;
  return (
    <section style={{ ...gb.box, marginBottom: 8, borderRadius: RADIUS }}>
      <div style={gb.label}>position — 24 h trail, next port (probe)</div>
      {body}
    </section>
  );
}
