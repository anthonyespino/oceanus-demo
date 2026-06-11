'use client';
// One engine — ROUND 21 A4 (resolves verdict 13: gauges win): state, load,
// fuel ONLY. Per-engine text sensor rows are DELETED; deep sensors live in
// the gauge cluster below the twin row. One panel, one grammar.

import type { EngineSample } from '../data/types';
import { DataRow } from './DataRow';
import { Label } from './Glyph';
import { gb } from './gb';

export function EngineCard({ engine, title }: { engine: EngineSample; title: string }) {
  return (
    <div style={{ ...gb.box, minWidth: 170 }}>
      <Label g="engine">{title} ({engine.role})</Label>
      <div style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: engine.running ? 'var(--color-ink-primary)' : 'var(--color-ink-muted)' }}>
        {engine.running ? 'RUNNING' : 'STOPPED'}
      </div>
      <DataRow label="load" value={`${engine.load_pct}%`} />
      <DataRow label="" value={`${engine.fuel_rate_gph} gph`} />
    </div>
  );
}
