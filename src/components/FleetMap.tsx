'use client';
// LAYOUT PROBE round 3.1: fleet chart with measured content-box sizing (no
// overflow past the card stroke), deterministic label collision handling
// (greedy 8-anchor placement + cluster chips, see chartLayout.ts), and full
// marker affordances: ≥24px invisible hit areas, hover/focus ring + tooltip
// through the Contextual primitive, click/Enter expands the inspector.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VesselState } from '../data/types';
import { vesselStatus, worstLevel } from '../data/alerts';
import { useFleet, type ColorTreatment } from '../state/FleetProvider';
import { NauticalChart, useContentWidth, CHART_INK, type ChartFrame } from './NauticalChart';
import { clusterPoints, placeLabels, labelWidth } from './chartLayout';
import { MarkerTooltip, ClusterSplay } from './ChartOverlays';
import { STATUS_COLOR, RADIUS } from './probeTokens';
import { gb, fmtPct } from './gb';

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
  const [splay, setSplay] = useState<number | null>(null);

  const frame = fitFleetFrame(fleet);
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
    return treatment === 'automotive' || status !== 'nominal' ? STATUS_COLOR[status] : '#d6d6d6';
  };
  const go = (id: string) => router.push(`/vessel/${id}`);
  const hovered = hoverId ? byId.get(hoverId) : null;
  const hoveredPt = hoverId ? pts.find((p) => p.id === hoverId) : null;

  return (
    <section style={{ ...gb.box, marginBottom: 8, borderRadius: RADIUS }}>
      <div style={gb.label}>fleet plot — gulf of mexico (fit-to-fleet viewport, probe)</div>
      <div ref={wrapRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <NauticalChart frame={frame} width={w} height={height}>
          {() => (
            <>
              {/* placed labels + leader lines (collision-managed) */}
              {singles.map((m, i) => {
                const l = labels[i];
                if (!l) return null;
                return (
                  <g key={`lbl-${m.id}`}>
                    {l.leader && (
                      <line x1={m.x} y1={m.y} x2={l.x + (l.x > m.x ? 0 : l.w)} y2={l.y + 5}
                        stroke="#8a8a8a" strokeWidth={0.5} />
                    )}
                    <text x={l.x} y={l.y + 8} fontSize={9} fill="#d6d6d6">{m.name}</text>
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
                    onMouseEnter={() => setHoverId(m.id)} onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(m.id)} onBlur={() => setHoverId(null)}
                    onClick={() => go(m.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go(m.id)}>
                    <rect x={m.x - 14} y={m.y - 14} width={28} height={28} fill="transparent" />
                    {hoverId === m.id && <circle cx={m.x} cy={m.y} r={9} fill="none" stroke={CHART_INK} strokeWidth={1.5} />}
                    <rect x={m.x - 3.5} y={m.y - 3.5} width={7} height={7} fill={markerFill(v)} stroke="#1c1c1c" strokeWidth={0.75} />
                  </g>
                );
              })}
              {/* cluster chips: count + splay on hover/enter */}
              {multis.map((c, i) => (
                <g key={`cl-${i}`} tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}
                  onMouseEnter={() => setSplay(i)} onFocus={() => setSplay(i)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSplay(splay === i ? null : i)}>
                  <rect x={c.x - 14} y={c.y - 14} width={28} height={28} fill="transparent" />
                  <rect x={c.x - 4.5} y={c.y - 4.5} width={9} height={9} fill="#d6d6d6" stroke="#1c1c1c" strokeWidth={0.75} />
                  <text x={c.x + 8} y={c.y + 4} fontSize={10} fill="#e8e8e8">{c.members.length} ▾</text>
                </g>
              ))}
            </>
          )}
        </NauticalChart>
        {hovered && hoveredPt && (
          <MarkerTooltip x={hoveredPt.x} y={hoveredPt.y} label={hovered.static.name}>
            {hovered.derived.mode} · sd {fmtPct(hovered.derived.sustained_deviation)}
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
    </section>
  );
}
