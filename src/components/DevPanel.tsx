'use client';
// ROUND 5: probe toggles behind the bottom-right gear (also "D").
// ROUND 45: restructured into a settings SHEET with three sections —
// SCENARIO (the scenario library), MODE (default/learn/expert), DEV (sim
// clock + the verdict toggles). Cleaner than the flat panel-of-toggles.

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
      <span style={{ fontSize: 'var(--type-micro)', textTransform: 'uppercase', letterSpacing: 1, color: NEUTRAL.inkMuted, width: 80 }}>{label}</span>
      {options.map((o) => (
        <button key={o.text} onClick={() => onPick(o.v)} style={toggleStyle(o.v === value)}>{o.text}</button>
      ))}
    </div>
  );
}

// ROUND 74: live numeric slider for pixel-level tuning on the running build.
function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <span style={{ fontSize: 'var(--type-micro)', textTransform: 'uppercase', letterSpacing: 1, color: NEUTRAL.inkMuted, width: 80 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: 'var(--color-accent-bright)' }} />
      <span style={{ fontSize: 'var(--type-micro)', fontFamily: 'var(--font-data)', color: NEUTRAL.inkSecondary, width: 32, textAlign: 'right' }}>{value.toFixed(2)}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 'var(--type-micro)', letterSpacing: 1.4, textTransform: 'uppercase', color: NEUTRAL.inkMuted, marginBottom: 6, borderTop: '1px solid var(--color-line-subtle)', paddingTop: 8 }}>{title}</div>
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
          color: NEUTRAL.inkSecondary, fontSize: 'var(--type-context)', cursor: 'pointer',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 'var(--type-micro)', letterSpacing: 1.2, textTransform: 'uppercase', color: NEUTRAL.inkMuted, marginBottom: 4 }}>
        <span>settings (D or ⚙)</span>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: NEUTRAL.inkSecondary, cursor: 'pointer', fontSize: 'var(--type-context)' }}>✕</button>
      </div>

      <Section title="scenario">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              {...layer('SettingsSheet / scenario / scenario.chip', 'scenario library chip · accent when active · synthetic overlay (demo = base seed)', '{scenario id} → applies overlay')}
              onClick={() => f.setScenario(s.id)}
              style={{ ...toggleStyle(f.scenario === s.id), fontSize: 'var(--type-micro)' }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="ia / system map">
        {/* round 89: entry to the dedicated IA page (consumer #1 of ia-model) */}
        <Link
          href="/ia"
          {...layer('SettingsSheet / ia / ia.link', 'IA system map link · opens the shared ia-model as a navigable page', '→ /ia')}
          style={{
            display: 'inline-block', fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)',
            color: NEUTRAL.inkSecondary, textDecoration: 'none',
            border: `1px solid ${NEUTRAL.border}`, borderRadius: RADIUS, padding: '4px 10px',
          }}
        >
          open system map →
        </Link>
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
        <Row label="status type" value={f.clusterType} onPick={f.setClusterType}
          options={[{ v: 'primary' as const, text: 'A primary 16' }, { v: 'context' as const, text: 'B context 13' }]} />
        <Row label="surface glass" value={f.surfaceGlass} onPick={f.setSurfaceGlass}
          options={[{ v: false, text: 'off (float)' }, { v: true, text: 'on (glass)' }]} />
        <Row label="density" value={f.density} onPick={f.setDensity}
          options={[{ v: 'minimal' as const, text: 'minimal' }, { v: 'standard' as const, text: 'standard' }]} />
        <Row label="color" value={f.treatment} onPick={f.setTreatment}
          options={[{ v: 'automotive' as const, text: 'A automotive' }, { v: 'dark-cockpit' as const, text: 'B quiet (default)' }]} />
        <Row label="motion" value={f.motion} onPick={f.setMotion}
          options={[{ v: 'off' as const, text: 'off' }, { v: 'ripple' as const, text: 'ripple' }, { v: 'breathe' as const, text: 'breathe' }]} />
        <Row label="ikb band" value={f.ikbBand} onPick={f.setIkbBand}
          options={[{ v: false, text: 'off' }, { v: true, text: 'IKB fill' }]} />
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
        <Row label="water mode" value={f.waterMode} onPick={f.setWaterMode}
          options={[{ v: 'gradient' as const, text: 'gradient' }, { v: 'particle' as const, text: 'particle' }, { v: 'matrix' as const, text: 'dot flow' }]} />
        <Row label="texture" value={f.shimmer} onPick={f.setShimmer}
          options={[{ v: true, text: 'on (default)' }, { v: false, text: 'off' }]} />
        {/* round 74: live Calm Sea tuning — turn these knobs on the running build */}
        <Slider label="wave amp" value={f.waveAmp} min={0.05} max={0.7} step={0.01} onChange={f.setWaveAmp} />
        <Slider label="tex dens" value={f.texDens} min={0} max={1} step={0.05} onChange={f.setTexDens} />
        <Slider label="tex bright" value={f.texBright} min={0} max={0.25} step={0.01} onChange={f.setTexBright} />
        {/* round 77: dot-flow field — density, size, ridge flow, magnification */}
        <Slider label="density" value={f.dotSpace} min={24} max={120} step={1} onChange={f.setDotSpace} />
        <Slider label="dot size" value={f.dotSize} min={0.5} max={6} step={0.1} onChange={f.setDotSize} />
        <Slider label="flow/ridge" value={f.flow} min={0} max={1} step={0.02} onChange={f.setFlow} />
        <Slider label="magnify" value={f.mag} min={0} max={2.5} step={0.05} onChange={f.setMag} />
        {/* round 50: water readout — scope + the amplitude/frequency inputs
            feeding the shader (dev only; no on-screen label in default mode) */}
        <div style={{ fontSize: 'var(--type-micro)', fontFamily: 'var(--font-data)', color: NEUTRAL.inkMuted, marginBottom: 6, marginLeft: 86 }}>
          water · {water.scope}{scope === 'vessel' ? ` ${vesselId}` : ''} · amp {water.amp.toFixed(2)} · freq {water.freq.toFixed(2)}
        </div>
      </Section>
    </div>
  );
}
