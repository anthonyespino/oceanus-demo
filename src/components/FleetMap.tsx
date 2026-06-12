'use client';
// LAYOUT PROBE round 3.1: fleet chart with measured content-box sizing (no
// overflow past the card stroke), deterministic label collision handling
// (greedy 8-anchor placement + cluster chips, see chartLayout.ts), and full
// marker affordances: ≥24px invisible hit areas, hover/focus ring + tooltip
// through the Contextual primitive, click/Enter expands the inspector.

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VesselState } from '../data/types';
import { vesselStatus, worstLevel } from '../data/alerts';
import { useFleet, type ColorTreatment } from '../state/FleetProvider';
import { NauticalChart, useContentWidth, usePanZoom, FollowChip, type ChartFrame } from './NauticalChart';
import { clusterPoints, placeLabels, labelWidth } from './chartLayout';
import { MarkerTooltip, ClusterSplay } from './ChartOverlays';
import { STATUS_COLOR, RADIUS } from './probeTokens';
import { gb, fmtPct } from './gb';
import { Label } from './Glyph';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

function fitFleetFrame(fleet: VesselState[]): ChartFrame {
  const pts = fleet.map((v) => v.history.minutes.at(-1)!.position);
  let latMin = Math.min(...pts.map((p) => p.lat)) - 0.45;
  let latMax = Math.max(...pts.map((p) => p.lat)) + 0.45;
  let lonMin = Math.min(...pts.map((p) => p.lon)) - 0.7;
  let lonMax = Math.max(...pts.map((p) => p.lon)) + 1.2;
  if (latMax - latMin < 2) { const c = (latMax + latMin) / 2; latMin = c - 1; latMax = c + 1; }
  if (lonMax - lonMin < 4) { const c = (lonMax + lonMin) / 2; lonMin = c - 2; lonMax = c + 2; }
  return { latMin, latMax, lonMin, lonMax };
}

export function FleetMap({
  fleet,
  treatment,
  width = 880,
  height = 470,
}: {
  fleet: VesselState[];
  treatment: ColorTreatment;
  width?: number;
  height?: number;
}) {
  const router = useRouter();
  const { motion } = useFleet();
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

  // round 21 B2: follow here = fit-to-fleet; pan/zoom disengage it
  const { frame, following, follow, handlers, wheelRef } = usePanZoom(fitFleetFrame(fleet), w, height);
  const px = (lon: number) => ((lon - frame.lonMin) / (frame.lonMax - frame.lonMin)) * w;
  const py = (lat: number) => ((frame.latMax - lat) / (frame.latMax - frame.latMin)) * height;

  const byId = new Map(fleet.map((v) => [v.static.id, v]));
  const pts = fleet.map((v) => {
    const p = v.history.minutes.at(-1)!.position;
    return { id: v.static.id, name: v.static.name, x: px(p.lon), y: py(p.lat) };
  });
  const clusters = clusterPoints(pts, 14);
  const singles = clusters.filter((c) => c.members.length === 1).map((c) => c.members[0]);
  const multis = clusters.filter((c) => c.members.length > 1);
  const chipBoxes = multis.map((c) => ({ x: c.x - 6, y: c.y - 8, w: labelWidth(`${c.members.length} ▾`) + 14, h: 16 }));
  const labels = placeLabels(singles, { w, h: height }, chipBoxes);

  const markerFill = (v: VesselState) => {
    const status = vesselStatus(v.alerts);
    return treatment === 'automotive' || status !== 'nominal' ? STATUS_COLOR[status] : '#a3a3a3';
  };
  const go = (id: string) => router.push(`/vessel/${id}`);
  const hovered = hoverId ? byId.get(hoverId) : null;
  const hoveredPt = hoverId ? pts.find((p) => p.id === hoverId) : null;

  return (
    <section style={{ ...gb.box, marginBottom: 8, borderRadius: RADIUS }}>
      <Label g="vessel">fleet plot — gulf of mexico</Label>
      <Annotated name="FleetMap markers/cluster chips">
      <div ref={wrapRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <div ref={wheelRef} {...handlers} style={{ cursor: following ? 'default' : 'grab' }}>
        <NauticalChart frame={frame} width={w} height={height}>
          {() => (
            <>
              {/* 24h route trails: thin neutral grey, fading tail (round 4) —
                  four opacity segments, oldest faintest; status color stays
                  on markers ONLY */}
              {fleet.map((v) => {
                const trail = v.history.minutes.filter((_, i) => i % 20 === 0).map((s) => s.position);
                const seg = Math.ceil(trail.length / 4);
                return [0, 1, 2, 3].map((k) => {
                  const part = trail.slice(k * seg, (k + 1) * seg + 1);
                  if (part.length < 2) return null;
                  return (
                    <polyline
                      key={`${v.static.id}-t${k}`}
                      points={part.map((p) => `${px(p.lon).toFixed(1)},${py(p.lat).toFixed(1)}`).join(' ')}
                      fill="none" stroke="#909090" strokeWidth={0.75}
                      opacity={[0.07, 0.13, 0.2, 0.3][k]}
                    />
                  );
                });
              })}
              {/* placed labels + leader lines (collision-managed) */}
              {singles.map((m, i) => {
                const l = labels[i];
                if (!l) return null;
                return (
                  <g key={`lbl-${m.id}`}>
                    {l.leader && (
                      <line x1={m.x} y1={m.y} x2={l.x + (l.x > m.x ? 0 : l.w)} y2={l.y + 5}
                        stroke="#4f4f4f" strokeWidth={0.5} />
                    )}
                    <text x={l.x} y={l.y + 8} fontSize={9} fill="#909090">{m.name}</text>
                  </g>
                );
              })}
              {/* single markers with hit areas, ring, keyboard access */}
              {singles.map((m) => {
                const v = byId.get(m.id)!;
                const breathe = motion === 'breathe' && worstLevel(v.alerts) === 'WARNING';
                return (
                  <g key={m.id} className={breathe ? 'probe-breathe' : undefined} tabIndex={0}
                    style={{ cursor: 'pointer', outline: 'none' }}
                    onMouseEnter={() => hoverSoon(m.id)} onMouseLeave={hoverEnd}
                    onFocus={() => setHoverId(m.id)} onBlur={() => setHoverId(null)}
                    onClick={() => go(m.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go(m.id)}>
                    <rect x={m.x - 14} y={m.y - 14} width={28} height={28} fill="transparent" />
                    {hoverId === m.id && <circle cx={m.x} cy={m.y} r={9} fill="none" stroke="var(--color-accent-bright)" strokeWidth={1.5} />}
                    <rect x={m.x - 3.5} y={m.y - 3.5} width={7} height={7} fill={markerFill(v)} stroke="#141414" strokeWidth={0.75} />
                  </g>
                );
              })}
              {/* cluster chips: count + splay on hover/enter */}
              {multis.map((c, i) => (
                <g key={`cl-${i}`} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}
                  onMouseEnter={() => setSplay(i)} onFocus={() => setSplay(i)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSplay(splay === i ? null : i)}>
                  <rect x={c.x - 14} y={c.y - 14} width={28} height={28} fill="transparent" />
                  <rect x={c.x - 4.5} y={c.y - 4.5} width={9} height={9} fill="#909090" stroke="#141414" strokeWidth={0.75} />
                  <text x={c.x + 8} y={c.y + 4} fontSize={10} fill="#a3a3a3">{c.members.length} ▾</text>
                </g>
              ))}
            </>
          )}
        </NauticalChart>
        {hovered && hoveredPt && (
          <MarkerTooltip x={hoveredPt.x} y={hoveredPt.y} label={hovered.static.name}>
            {hovered.derived.mode} · 30d {fmtPct(hovered.derived.trend_30d)}
            {worstLevel(hovered.alerts) ? ` · [${worstLevel(hovered.alerts)}]` : ''}
          </MarkerTooltip>
        )}
        {splay !== null && multis[splay] && (
          <ClusterSplay x={multis[splay].x} y={multis[splay].y} onClose={() => setSplay(null)}
            members={multis[splay].members.map((m) => ({
              id: m.id, name: m.name, dotColor: markerFill(byId.get(m.id)!),
            }))} />
        )}
        </div>
        {!following && <FollowChip onClick={follow} />}
      </div>
      </Annotated>
    </section>
  );
}
