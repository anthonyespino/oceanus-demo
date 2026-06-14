'use client';
// 24h mode timeline: contiguous segments from the 1-min history, width
// proportional to duration. Round 4: segments use the color/mode/* tokens
// (muted hues) from the foundation vocabulary.

import type { Mode, VesselState } from '../data/types';
import { MODE_COLOR } from './probeTokens';
import { gb } from './gb';
import { Label } from './Glyph';

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
      <Label g="clock">mode 24h</Label>
      <div style={{ display: 'flex', width: '100%', border: '1px solid var(--color-line-subtle)', height: 28 }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            title={`${seg.mode} — ${(seg.minutes / 60).toFixed(1)} h`}
            style={{
              width: `${(seg.minutes / ms.length) * 100}%`,
              background: MODE_COLOR[seg.mode],
              borderRight: '1px solid var(--color-line-subtle)',
              overflow: 'hidden',
              fontSize: 'var(--type-micro)',
              textAlign: 'center',
              lineHeight: '28px',
              whiteSpace: 'nowrap',
            }}
          >
            {seg.minutes > 90 ? seg.mode : ''}
          </div>
        ))}
      </div>
      <div style={{ ...gb.dim, fontSize: 'var(--type-context)', marginTop: 2 }}>← 24 h ago · now →</div>
    </section>
  );
}
