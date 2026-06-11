'use client';
// ROUND 5 hygiene: every probe toggle consolidated into one keypress-hidden
// panel — press "d" (outside inputs) to show/hide. Active states use accent
// (interaction), per the accent usage rules.

import { useEffect, useState } from 'react';
import { useFleet } from '../state/FleetProvider';
import { useLearn } from '../learn/LearnProvider'; // LEARN MODE — strip before demo week
import { NEUTRAL, RADIUS, toggleStyle } from './probeTokens';

function Row<T extends string | boolean>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: { v: T; text: string }[];
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: NEUTRAL.inkMuted, width: 80 }}>
        {label}
      </span>
      {options.map((o) => {
        const active = o.v === value;
        return (
          <button
            key={o.text}
            onClick={() => onPick(o.v)}
            style={toggleStyle(active)}
          >
            {o.text}
          </button>
        );
      })}
    </div>
  );
}

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const f = useFleet();
  const { learnOn, setLearnOn } = useLearn();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (e.key === 'd' || e.key === 'D') setOpen((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="probe toggles"
        style={{
          position: 'fixed', top: 8, right: 8, zIndex: 50,
          width: 30, height: 30, borderRadius: RADIUS,
          border: `1px solid ${NEUTRAL.border}`, background: NEUTRAL.surfaceDim,
          color: NEUTRAL.inkSecondary, fontSize: 14, cursor: 'pointer',
        }}
      >
        ⚙
      </button>
    );
  }
  return (
    <div
      style={{
        position: 'fixed',
        top: 44,
        right: 12,
        zIndex: 50,
        background: NEUTRAL.surfaceDim,
        border: `1px solid ${NEUTRAL.border}`,
        borderRadius: RADIUS,
        padding: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: NEUTRAL.inkMuted, marginBottom: 8 }}>
        <span>probe toggles (D or ⚙)</span>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: NEUTRAL.inkSecondary, cursor: 'pointer', fontSize: 12 }}>✕</button>
      </div>
      <Row label="density" value={f.density} onPick={f.setDensity}
        options={[{ v: 'minimal' as const, text: 'minimal' }, { v: 'standard' as const, text: 'standard' }]} />
      <Row label="color" value={f.treatment} onPick={f.setTreatment}
        options={[{ v: 'automotive' as const, text: 'A automotive' }, { v: 'dark-cockpit' as const, text: 'B dark cockpit' }]} />
      <Row label="motion" value={f.motion} onPick={f.setMotion}
        options={[{ v: 'off' as const, text: 'off' }, { v: 'ripple' as const, text: 'ripple' }, { v: 'breathe' as const, text: 'breathe' }]} />
      <Row label="layout" value={f.layoutVariant} onPick={f.setLayoutVariant}
        options={[{ v: 'board-first' as const, text: 'a board first' }, { v: 'chart-band' as const, text: 'b chart band' }]} />
      <Row label="ikb band" value={f.ikbBand} onPick={f.setIkbBand}
        options={[{ v: false, text: 'off' }, { v: true, text: 'IKB fill' }]} />
      <Row label="learn" value={learnOn} onPick={setLearnOn}
        options={[{ v: false, text: 'off' }, { v: true, text: 'LEARN MODE (L)' }]} />
      <Row label="fuel view" value={f.tankStyle} onPick={f.setTankStyle}
        options={[{ v: 'bars' as const, text: 'rows' }, { v: 'dots' as const, text: 'dot matrix' }, { v: 'synoptic' as const, text: 'synoptic ⚖️11' }]} />
    </div>
  );
}
