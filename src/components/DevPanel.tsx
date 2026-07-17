'use client';
// ROUND 5: probe toggles behind the bottom-right gear (also "D").
// ROUND 45: restructured into a settings SHEET with sections.
// ROUND 108: startup defaults are now LOCKED in FleetProvider (the app comes up
// demo-ready), so the panel shed most of its toggles. What remains is grouped
// into CHEVRON-COLLAPSIBLE sections (minimized by default) so the tool stays
// navigable. NOTE: chevrons here are fine — this is the dev/settings TOOL, not
// the operator-facing product UI (the no-chevron ruling governs the product only).
// Removed this round: ripple sliders, surface-glass toggle, IKB band/fill,
// state-marks toggle, ambient-sea toggle, the entire water/water-styling group
// (mode + all sliders, values baked into AmbientSea), and the status A/B toggle.
// Kept toggles: color (automotive), motion, density, bearing, rail mode, auto 2x.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFleet } from '../state/FleetProvider';
import { useLearn } from '../learn/LearnProvider'; // LEARN/EXPERT MODE — strip before demo week
import { SCENARIOS } from '../state/scenarios';
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

// ROUND 108: collapsible section — chevron header, minimized by default, expands
// on click. Dev-tool affordance only (the product UI stays chevron-free).
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%', textAlign: 'left',
          background: 'none', border: 'none', cursor: 'pointer',
          borderTop: '1px solid var(--color-line-subtle)', paddingTop: 8, paddingBottom: 0,
          fontSize: 'var(--type-micro)', letterSpacing: 1.4, textTransform: 'uppercase', color: NEUTRAL.inkMuted,
        }}
      >
        <span style={{ width: 8, display: 'inline-block' }}>{open ? '▾' : '▸'}</span>
        {title}
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const f = useFleet();
  const { mode, setMode } = useLearn();

  // ROUND 111: restore the D-key toggle (the round-108 panel rewrite dropped it).
  // No collision with Learn's E/L (LearnProvider owns those); typing in an input
  // never triggers it.
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
      data-devpanel="" /* ROUND 133: the layer lens skips this subtree so its own off-toggle (and every D-panel control) stays clickable */
      {...layer('SettingsSheet / sheet / settings.sheet', 'gear-summoned settings sheet · collapsible sections (round 108)', '—')}
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
        {/* ROUND 110: three selectable whole-fleet states (1 / 2 / 3), one active
            at a time, default Scenario 1 (Meridian). Switching fully reloads the
            board + inspector for the active scenario (no stale bleed). */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              {...layer('SettingsSheet / scenario / scenario.chip', 'scenario selector · 1/2/3 whole-fleet state · accent when active · default S1 (Meridian, base seed); S2/S3 synthetic', '{scenario id} → reloads fleet + inspector')}
              onClick={() => f.setScenario(s.id)}
              style={{ ...toggleStyle(f.scenario === s.id), fontSize: 'var(--type-micro)', textAlign: 'left' }}
            >
              {i + 1} · {s.label}
            </button>
          ))}
        </div>
        {/* ROUND 131: synthetic-scenario marker lives HERE (presenter/dev surface) only — neutral
            ink, never the yellow severity color, and never on the main view. */}
        {SCENARIOS.find((s) => s.id === f.scenario)?.synthetic && (
          <div style={{ fontSize: 'var(--type-micro)', letterSpacing: 1, color: 'var(--color-ink-muted)', marginTop: 4 }}>
            synthetic — not the demo path
          </div>
        )}
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
        {/* ROUND 117: the layer lens (LAYER/TOKENS/BINDS hover + copy-to-Figma) is a
            BUILDER provenance inspector — its own toggle, decoupled from operator Learn.
            Off by default; when off it never appears in any operator mode. */}
        <div style={{ marginTop: 8 }}>
          <Row label="layer lens" value={f.layerLens} onPick={f.setLayerLens}
            options={[{ v: false, text: 'off' }, { v: true, text: 'on (builder)' }]} />
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

      <Section title="clock">
        <LiveControls />
      </Section>

      <Section title="color / motion">
        <Row label="color" value={f.treatment} onPick={f.setTreatment}
          options={[{ v: 'automotive' as const, text: 'A automotive' }, { v: 'dark-cockpit' as const, text: 'B quiet (default)' }]} />
        <Row label="motion" value={f.motion} onPick={f.setMotion}
          options={[{ v: 'off' as const, text: 'off' }, { v: 'breathe' as const, text: 'breathe (default)' }]} />
      </Section>

      <Section title="layout">
        <Row label="density" value={f.density} onPick={f.setDensity}
          options={[{ v: 'minimal' as const, text: 'minimal' }, { v: 'standard' as const, text: 'standard' }]} />
        <Row label="bearing" value={f.bearingLine} onPick={f.setBearingLine}
          options={[{ v: true, text: 'BRG ray' }, { v: false, text: 'voyage card only' }]} />
        {/* round 115: rail mode toggle removed — combined treatment (glyph + transit accent) is permanent */}
        <Row label="auto 2x" value={f.autoPromote} onPick={f.setAutoPromote}
          options={[{ v: false, text: 'off (officer sizes)' }, { v: true, text: 'on (legacy)' }]} />
      </Section>
    </div>
  );
}
