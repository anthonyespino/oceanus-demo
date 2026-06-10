'use client';
// 24h mode timeline: contiguous segments from the 1-min history, width
// proportional to duration. Grey shades only — mode color-coding is a Figma
// decision; shades here just make the segmentation perceivable.

import type { Mode, VesselState } from '../data/types';
import { gb } from './gb';

const SHADE: Record<Mode, string> = {
  PORT: '#f5f5f5',
  STANDBY: '#e6e6e6',
  STATION: '#d6d6d6',
  TRANSIT: '#c2c2c2',
};

export function ModeTimeline({ vessel }: { vessel: VesselState }) {
  const ms = vessel.history.minutes;
  const segments: { mode: Mode; minutes: number }[] = [];
  for (const s of ms) {
    const last = segments[segments.length - 1];
    if (last && last.mode === s.mode) last.minutes++;
    else segments.push({ mode: s.mode, minutes: 1 });
  }

  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>mode — last 24 h</div>
      <div style={{ display: 'flex', width: '100%', border: '1px solid #999', height: 28 }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            title={`${seg.mode} — ${(seg.minutes / 60).toFixed(1)} h`}
            style={{
              width: `${(seg.minutes / ms.length) * 100}%`,
              background: SHADE[seg.mode],
              borderRight: '1px solid #999',
              overflow: 'hidden',
              fontSize: 10,
              textAlign: 'center',
              lineHeight: '28px',
              whiteSpace: 'nowrap',
            }}
          >
            {seg.minutes > 90 ? seg.mode : ''}
          </div>
        ))}
      </div>
      <div style={{ ...gb.dim, fontSize: 11, marginTop: 2 }}>← 24 h ago · now →</div>
    </section>
  );
}
