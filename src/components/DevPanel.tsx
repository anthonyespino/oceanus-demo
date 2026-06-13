'use client';
// ROUND 5: probe toggles behind the bottom-right gear (also "D").
// ROUND 45: restructured into a settings SHEET with three sections —
// SCENARIO (the scenario library), MODE (default/learn/expert), DEV (sim
// clock + the verdict toggles). Cleaner than the flat panel-of-toggles.

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useFleet } from '../state/FleetProvider';
import { useLearn } from '../learn/LearnProvider'; // LEARN/EXPERT MODE — strip before demo week
import { SCENARIOS } from '../state/scenarios';
import { waterScope, waterInputs } from './ambientReadout';
import { LiveControls } from './LiveControls';
import { NEUTRAL, RADIUS, toggleStyle } from './probeTokens';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

function Row<T extends string | boolean>({ label, options, value, onPick }: {
  label: string; options: { v: T; text: string }[]; value: T; onPick: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: NEUTRAL.inkMuted, width: 80 }}>{label}</span>
      {options.map((o) => (
        <button key={o.text} onClick={() => onPick(o.v)} style={toggleStyle(o.v === value)}>{o.text}</button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: NEUTRAL.inkMuted, marginBottom: 6, borderTop: '1px solid var(--color-line-subtle)', paddingTop: 8 }}>{title}</div>
      {children}
    </div>
  );
}

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const f = useFleet();
  const { mode, setMode } = useLearn();
  const pathname = usePathname();
  const { scope, vesselId } = waterScope(pathname);
  const water = waterInputs(f.fleet ?? null, scope, vesselId); // round 50 dev readout

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
        aria-label="settings"
        style={{
          position: 'fixed', bottom: 12, right: 12, zIndex: 50,
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
      {...layer('SettingsSheet / sheet / settings.sheet', 'gear-summoned settings sheet · SCENARIO / MODE / DEV sections', '—')}
      style={{
        position: 'fixed', top: 44, right: 12, zIndex: 50, width: 320,
        maxHeight: 'calc(100vh - 60px)', overflowY: 'auto',
        background: NEUTRAL.surfaceDim, border: `1px solid ${NEUTRAL.border}`,
        borderRadius: RADIUS, padding: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: NEUTRAL.inkMuted, marginBottom: 4 }}>
        <span>settings (D or ⚙)</span>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: NEUTRAL.inkSecondary, cursor: 'pointer', fontSize: 12 }}>✕</button>
      </div>

      <Section title="scenario">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              {...layer('SettingsSheet / scenario / scenario.chip', 'scenario library chip · accent when active · synthetic overlay (demo = base seed)', '{scenario id} → applies overlay')}
              onClick={() => f.setScenario(s.id)}
              style={{ ...toggleStyle(f.scenario === s.id), fontSize: 10 }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="mode">
        <div style={{ display: 'inline-flex', gap: 4 }}>
          {(['default', 'learn', 'expert'] as const).map((m) => (
            <button
              key={m}
              {...layer('SettingsSheet / mode / mode.chip', 'mode chip · default / learn (L) / expert (E) · mutually exclusive', '{ui mode}')}
              onClick={() => setMode(m)}
              style={toggleStyle(mode === m)}
            >
              {m === 'learn' ? 'learn (L)' : m === 'expert' ? 'expert (E)' : 'default'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="dev">
        <div style={{ marginBottom: 8 }}><LiveControls /></div>
        <Row label="density" value={f.density} onPick={f.setDensity}
          options={[{ v: 'minimal' as const, text: 'minimal' }, { v: 'standard' as const, text: 'standard' }]} />
        <Row label="color" value={f.treatment} onPick={f.setTreatment}
          options={[{ v: 'automotive' as const, text: 'A automotive' }, { v: 'dark-cockpit' as const, text: 'B quiet (default)' }]} />
        <Row label="motion" value={f.motion} onPick={f.setMotion}
          options={[{ v: 'off' as const, text: 'off' }, { v: 'ripple' as const, text: 'ripple' }, { v: 'breathe' as const, text: 'breathe' }]} />
        <Row label="layout" value={f.layoutVariant} onPick={f.setLayoutVariant}
          options={[{ v: 'board-first' as const, text: 'a board first' }, { v: 'chart-band' as const, text: 'b chart band' }]} />
        <Row label="ikb band" value={f.ikbBand} onPick={f.setIkbBand}
          options={[{ v: false, text: 'off' }, { v: true, text: 'IKB fill' }]} />
        <Row label="chart pos" value={f.chartTop} onPick={f.setChartTop}
          options={[{ v: false, text: 'below board' }, { v: true, text: 'top' }]} />
        <Row label="state marks" value={f.stateMarks} onPick={f.setStateMarks}
          options={[{ v: false, text: 'off' }, { v: true, text: 'on' }]} />
        <Row label="bearing" value={f.bearingLine} onPick={f.setBearingLine}
          options={[{ v: true, text: 'BRG ray' }, { v: false, text: 'voyage card only' }]} />
        <Row label="rail mode" value={f.railMode} onPick={f.setRailMode}
          options={[{ v: 'glyph' as const, text: 'mode glyph' }, { v: 'stroke' as const, text: 'transit stroke' }]} />
        <Row label="auto 2x" value={f.autoPromote} onPick={f.setAutoPromote}
          options={[{ v: false, text: 'off (officer sizes)' }, { v: true, text: 'on (legacy)' }]} />
        <Row label="ambient sea" value={f.ambientSea} onPick={f.setAmbientSea}
          options={[{ v: true, text: 'on' }, { v: false, text: 'off' }]} />
        {/* round 50: water readout — scope + the amplitude/frequency inputs
            feeding the shader (dev only; no on-screen label in default mode) */}
        <div style={{ fontSize: 10, fontFamily: 'var(--font-data)', color: NEUTRAL.inkMuted, marginBottom: 6, marginLeft: 86 }}>
          water · {water.scope}{scope === 'vessel' ? ` ${vesselId}` : ''} · amp {water.amp.toFixed(2)} · freq {water.freq.toFixed(2)}
        </div>
      </Section>
    </div>
  );
}
