'use client';
// LEARN MODE wrapper: zero-cost passthrough when learn is off; when on, the
// wrapped component gets a hover outline (accent/bright) and a docent card
// (exact barrel name, disposition mark, description, "answers:" line).
// Cards position fixed with viewport clamping — they never clip at edges.
// Clicks are suppressed in capture phase; innermost hovered wrapper wins.

import { useState } from 'react';
import { useLearn } from './LearnProvider';
import { ANNOTATIONS } from './annotations';
import { IA_NODES, TIER_LABEL, type IANodeId } from '../ia/ia-model'; // round 89: shared IA source

const CARD_W = 330;
const CARD_H = 112; // estimate for clamping

// ROUND 89 — Learn-mode IA binding (consumer #2 of ia-model). When an
// annotated element declares a `node`, a SIMPLE STATIC callout surfaces that
// node's what/why/ruling, read live from the shared source (NOT hardcoded
// here). Structure only this round — no hover choreography, no animated
// reveal, no connective lines (explicitly deferred). Zero cost when learn off.
function IANodeCallout({ id }: { id: IANodeId }) {
  const node = IA_NODES[id];
  return (
    <div
      data-ia-node={id}
      style={{
        position: 'absolute', top: 0, left: 0, zIndex: 64, maxWidth: 260, pointerEvents: 'none',
        background: 'var(--color-surface-overlay)', border: '1px solid var(--color-accent-bright)',
        borderRadius: 1, padding: '6px 8px',
        fontFamily: 'var(--font-data)', fontSize: 'var(--type-micro)', lineHeight: 1.45,
      }}
    >
      <div style={{ color: 'var(--color-accent-bright)', letterSpacing: 1 }}>
        IA · {node.name} <span style={{ color: 'var(--color-ink-muted)' }}>· {node.path}</span>
      </div>
      <div style={{ color: 'var(--color-ink-muted)', letterSpacing: 0.5, marginTop: 1 }}>{TIER_LABEL[node.tier]}</div>
      <div style={{ color: 'var(--color-ink-primary)', marginTop: 3 }}><span style={{ color: 'var(--color-ink-muted)' }}>what · </span>{node.what}</div>
      <div style={{ color: 'var(--color-ink-secondary)', marginTop: 2 }}><span style={{ color: 'var(--color-ink-muted)' }}>why · </span>{node.why}</div>
      {node.rulings[0] && (
        <div style={{ color: 'var(--color-ink-muted)', marginTop: 2 }}>
          <span style={{ color: 'var(--color-ink-secondary)' }}>ruling · </span>
          {node.rulings[0].round != null ? `R${node.rulings[0].round} — ` : ''}{node.rulings[0].text}
        </div>
      )}
    </div>
  );
}

export function Annotated({
  name,
  node,
  children,
  inline = false,
}: {
  name: string;
  /** round 89: bind this live element to an IA node id (shared ia-model) */
  node?: IANodeId;
  children: React.ReactNode;
  inline?: boolean;
}) {
  const { learnOn, leafActive } = useLearn();
  const [anchor, setAnchor] = useState<{ top: number; left: number; bottom: number } | null>(null);
  if (!learnOn) return <>{children}</>;
  const a = ANNOTATIONS[name];

  let card: React.ReactNode = null;
  // round 35: innermost wins — a leaf layer card suppresses the docent card
  if (anchor && a && !leafActive && typeof window !== 'undefined') {
    const left = Math.min(Math.max(anchor.left, 8), window.innerWidth - CARD_W - 8);
    const below = anchor.bottom + 8 + CARD_H < window.innerHeight;
    const top = below ? anchor.bottom + 8 : Math.max(8, anchor.top - CARD_H - 8);
    card = (
      <div
        style={{
          position: 'fixed',
          left,
          top,
          width: CARD_W,
          zIndex: 65,
          pointerEvents: 'none',
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-accent-bright)',
          borderRadius: 1, // RADIUS token value
          padding: '10px 12px',
          fontFamily: 'var(--font-data)',
          fontSize: 'var(--type-context)',
          lineHeight: 1.5,
        }}
      >
        <div style={{ color: 'var(--color-accent-bright)', letterSpacing: 1 }}>
          {a.mark} {name}
        </div>
        <div style={{ color: 'var(--color-ink-primary)', marginTop: 4 }}>{a.desc}</div>
        <div style={{ color: 'var(--color-ink-secondary)', marginTop: 4 }}>
          <span style={{ color: 'var(--color-ink-muted)' }}>answers:</span> {a.answers}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: inline ? 'inline-block' : 'block',
        position: 'relative',
        outline: anchor ? '1px solid var(--color-accent-bright)' : undefined,
        outlineOffset: 1,
        cursor: 'help',
      }}
      onMouseOver={(e) => {
        e.stopPropagation(); // innermost annotated component wins
        const r = e.currentTarget.getBoundingClientRect();
        setAnchor({ top: r.top, left: r.left, bottom: r.bottom });
      }}
      onMouseOut={(e) => {
        e.stopPropagation();
        setAnchor(null);
      }}
      onClickCapture={(e) => {
        e.preventDefault(); // normal interactions suppressed in learn mode
        e.stopPropagation();
      }}
    >
      {children}
      {/* round 89: static IA-node callout — proves the live element ↔ ia-model
          binding; content read from the shared source, always-on in learn mode */}
      {node && <IANodeCallout id={node} />}
      {card}
    </div>
  );
}
