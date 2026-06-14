// ROUND 89 — IA PAGE renderer (consumer #1 of the shared ia-model). Static +
// structural this round: Hierarchy · Personas · Journeys · Process/Rulings,
// every word rendered from src/ia/ia-model.ts (no IA content hardcoded here).
// Uses the unified type scale (round 86) + standing rulings (greyscale, earned
// color, borderless fills) — the page is itself an example of the discipline.

import Link from 'next/link';
import { gb } from '../components/gb';
import {
  IA_HIERARCHY, IA_NODES, IA_PERSONAS, IA_JOURNEYS, IA_PROCESS,
  TIER_LABEL, type IAHierarchyNode, type IANodeId,
} from './ia-model';

const FONT_UI = 'var(--font-ui)';
const FONT_DATA = 'var(--font-data)';
const FONT_DISPLAY = 'var(--font-display)';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ ...gb.label, fontSize: 'var(--type-primary)', color: 'var(--color-ink-secondary)', letterSpacing: 1.4, marginBottom: 12 }}>
      {children}
    </h2>
  );
}

// ── HIERARCHY (the four-level Display IA Index) — recursive tree ──────────────
function HierarchyRow({ n }: { n: IAHierarchyNode }) {
  const node = n.node ? IA_NODES[n.node] : null;
  return (
    <li style={{ marginBottom: 6 }}>
      <span style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-context)', color: 'var(--color-ink-primary)' }}>{n.label}</span>
      {node && (
        <span style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)', marginLeft: 8 }}>
          {node.path} · {TIER_LABEL[node.tier].split(' · ')[0]}
        </span>
      )}
      {n.detail && (
        <div style={{ fontFamily: FONT_UI, fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)', marginTop: 1 }}>{n.detail}</div>
      )}
      {n.children && (
        <ul style={{ listStyle: 'none', margin: '6px 0 0', paddingLeft: 18, borderLeft: '1px solid var(--color-line-subtle)' }}>
          {n.children.map((c, i) => <HierarchyRow key={i} n={c} />)}
        </ul>
      )}
    </li>
  );
}

// ── NODE card (inventory detail, referenced by hierarchy + journeys) ──────────
function NodeCard({ id }: { id: IANodeId }) {
  const node = IA_NODES[id];
  return (
    <div style={{ ...gb.box, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--type-primary)', fontWeight: 700, color: 'var(--color-ink-primary)' }}>{node.name}</span>
        <span style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)' }}>{node.path}</span>
      </div>
      <div style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)', letterSpacing: 1, margin: '2px 0 8px' }}>{TIER_LABEL[node.tier]}</div>
      <div style={{ fontSize: 'var(--type-context)', color: 'var(--color-ink-secondary)', lineHeight: 1.5 }}>
        <span style={{ color: 'var(--color-ink-muted)' }}>what · </span>{node.what}
      </div>
      <div style={{ fontSize: 'var(--type-context)', color: 'var(--color-ink-secondary)', lineHeight: 1.5, marginTop: 4 }}>
        <span style={{ color: 'var(--color-ink-muted)' }}>why · </span>{node.why}
      </div>
      <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
        {node.rulings.map((r, i) => (
          <li key={i} style={{ fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)', marginBottom: 2 }}>
            {r.round != null && <span style={{ color: 'var(--color-ink-secondary)' }}>R{r.round} · </span>}{r.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function IASystemMap() {
  return (
    <main className="selectable" style={{ maxWidth: 980, margin: '0 auto', padding: '28px 20px 80px', position: 'relative', zIndex: 1 }}>
      <Link href="/" style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-context)', color: 'var(--color-ink-secondary)', textDecoration: 'underline' }}>
        ← fleet board
      </Link>

      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--type-display)', fontWeight: 700, letterSpacing: 1, margin: '14px 0 4px' }}>
        IA / SYSTEM MAP
      </h1>
      <p style={{ fontSize: 'var(--type-context)', color: 'var(--color-ink-muted)', maxWidth: 640, lineHeight: 1.5, marginBottom: 28 }}>
        The information architecture as a live instrument, not a static document. Hierarchy, personas, journeys, and
        process all render from one shared source — the same source Learn mode reads when it annotates a live element.
      </p>

      {/* HIERARCHY */}
      <section style={{ marginBottom: 36 }}>
        <SectionTitle>Hierarchy — the four-level Display IA Index</SectionTitle>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          <HierarchyRow n={IA_HIERARCHY} />
        </ul>
      </section>

      {/* NODE INVENTORY */}
      <section style={{ marginBottom: 36 }}>
        <SectionTitle>Node inventory — what / why / ruling</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {(Object.keys(IA_NODES) as IANodeId[]).map((id) => <NodeCard key={id} id={id} />)}
        </div>
      </section>

      {/* PERSONAS */}
      <section style={{ marginBottom: 36 }}>
        <SectionTitle>Personas</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {IA_PERSONAS.map((p) => (
            <div key={p.id} style={{ ...gb.box, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--type-primary)', fontWeight: 700 }}>{p.name}</span>
                {p.primary && <span style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-micro)', color: 'var(--color-accent-bright)', letterSpacing: 1 }}>PRIMARY</span>}
              </div>
              <div style={{ fontSize: 'var(--type-context)', color: 'var(--color-ink-secondary)', lineHeight: 1.5, margin: '6px 0 8px' }}>{p.goal}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {p.monitors.map((m, i) => (
                  <li key={i} style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)', marginBottom: 2 }}>· {m}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* JOURNEYS */}
      <section style={{ marginBottom: 36 }}>
        <SectionTitle>Journeys</SectionTitle>
        {IA_JOURNEYS.map((j) => (
          <div key={j.id} style={{ ...gb.box, padding: 16, marginBottom: 14 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--type-primary)', fontWeight: 700, marginBottom: 8 }}>{j.title}</div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, counterReset: 'step' }}>
              {j.steps.map((s) => (
                <li key={s.n} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-hero)', color: 'var(--color-ink-muted)', minWidth: 26, textAlign: 'right' }}>{s.n}</span>
                  <div>
                    <div style={{ fontSize: 'var(--type-context)', color: 'var(--color-ink-secondary)', lineHeight: 1.5 }}>{s.action}</div>
                    <div style={{ marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {s.nodes.map((nid) => (
                        <span key={nid} style={{ ...gb.boxTight, fontFamily: FONT_DATA, fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)' }}>{IA_NODES[nid].name}</span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-context)', color: 'var(--color-ink-primary)', marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--color-line-subtle)' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>outcome · </span>{j.outcome}
            </div>
          </div>
        ))}
      </section>

      {/* PROCESS / RULINGS — receipts + tested-and-killed */}
      <section>
        <SectionTitle>Process — rulings with receipts</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {IA_PROCESS.map((r) => (
            <div key={r.id} style={{ ...gb.box, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 'var(--type-primary)', fontWeight: 700 }}>{r.title}</span>
                {r.rounds && <span style={{ fontFamily: FONT_DATA, fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)' }}>R{r.rounds.join('·')}</span>}
              </div>
              <div style={{ fontSize: 'var(--type-context)', color: 'var(--color-ink-secondary)', lineHeight: 1.5, marginTop: 6 }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>ruling · </span>{r.decision}
              </div>
              <div style={{ fontSize: 'var(--type-context)', color: 'var(--color-ink-secondary)', lineHeight: 1.5, marginTop: 4 }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>receipt · </span>{r.receipt}
              </div>
              {r.killed && (
                <div style={{ fontSize: 'var(--type-micro)', color: 'var(--color-ink-muted)', marginTop: 6 }}>
                  <span style={{ color: 'var(--color-alert-advisory, var(--color-ink-secondary))' }}>killed · </span>{r.killed}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
