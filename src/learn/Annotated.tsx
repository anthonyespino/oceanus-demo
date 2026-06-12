'use client';
// LEARN MODE wrapper: zero-cost passthrough when learn is off; when on, the
// wrapped component gets a hover outline (accent/bright) and a docent card
// (exact barrel name, disposition mark, description, "answers:" line).
// Cards position fixed with viewport clamping — they never clip at edges.
// Clicks are suppressed in capture phase; innermost hovered wrapper wins.

import { useState } from 'react';
import { useLearn } from './LearnProvider';
import { ANNOTATIONS } from './annotations';

const CARD_W = 330;
const CARD_H = 112; // estimate for clamping

export function Annotated({
  name,
  children,
  inline = false,
}: {
  name: string;
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
          borderRadius: 6,
          padding: '10px 12px',
          fontFamily: 'var(--font-data)',
          fontSize: 12,
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
      {card}
    </div>
  );
}
