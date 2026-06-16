'use client';
// LEARN MODE wrapper: zero-cost passthrough when learn is off; when on, the
// wrapped component gets a hover outline (accent/bright) and ONE docent card.
// Cards position fixed with viewport clamping — they never clip at edges.
// Clicks are suppressed in capture phase; innermost hovered wrapper wins.
//
// ROUND 92 — HOVER-GATED REVEAL. The round-89 IA callout was always-visible,
// so 15 VesselTiles stacked 15 identical cards. Now NOTHING shows by default:
// hovering an annotated element reveals ONLY that element's callout, and moving
// away hides it. Because only the hovered (innermost) wrapper anchors, callouts
// can never stack or collide, and identical node types de-dupe naturally (you
// learn what a VesselTile is by hovering any one — the other 14 stay quiet).
//
// Hover-to-TEACH is scoped to this docent layer and is NOT a violation of the
// operational "hover points, click asks" ruling: that ruling governs DATA
// reveals in the live interface (Learn off), which is unchanged. Learn mode is
// a separate teaching layer where explain-on-hover is the expected convention.

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLearn } from './LearnProvider';
import { ANNOTATIONS } from './annotations';
import { IA_NODES, type IANodeId } from '../ia/ia-model'; // round 89: shared IA source

type Anchor = { top: number; left: number; bottom: number };

const DOCENT_W = 330;
const DOCENT_H = 112; // estimate for clamping
const IA_W = 300;
const IA_H = 130; // round 117: name + what + why only (no tier/ruling) — shorter card

// Fixed placement near the anchor: clamp horizontally so it never runs
// off-screen, and flip above the element when there isn't room below.
function place(anchor: Anchor, w: number, h: number): { left: number; top: number } {
  const left = Math.min(Math.max(anchor.left, 8), window.innerWidth - w - 8);
  const below = anchor.bottom + 8 + h < window.innerHeight;
  const top = below ? anchor.bottom + 8 : Math.max(8, anchor.top - h - 8);
  return { left, top };
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
  const { learnOn, leafActive, setIaHover } = useLearn();
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  if (!learnOn) return <>{children}</>;
  const a = ANNOTATIONS[name];
  const ready = anchor && typeof window !== 'undefined';

  // ROUND 92: the IA callout is HOVER-REVEALED (was always-on, round 89) and
  // reads unchanged from the shared ia-model. When a node is bound it is the
  // single card for this element — the round-8 docent card yields to it.
  let iaCard: React.ReactNode = null;
  if (ready && node) {
    const n = IA_NODES[node];
    const { left, top } = place(anchor, IA_W, IA_H);
    iaCard = (
      <div
        className="learn-callout"
        data-ia-node={node}
        style={{
          position: 'fixed', left, top, width: IA_W, zIndex: 66, pointerEvents: 'none',
          background: 'var(--color-surface-overlay)', border: '1px solid var(--color-accent-bright)',
          borderRadius: 1, padding: '8px 10px',
          fontFamily: 'var(--font-data)', fontSize: 'var(--type-micro)', lineHeight: 1.5,
        }}
      >
        {/* ROUND 117: operator Learn card = name + what + why ONLY. Provenance —
            path, tier, ruling — is builder content and lives on the IA page (which
            already renders it). Learn is operator-facing: what it is, why it's here,
            what decision it supports — plain language, no code/hierarchy/ruling. */}
        <div style={{ color: 'var(--color-accent-bright)', letterSpacing: 1 }}>{n.name}</div>
        <div style={{ color: 'var(--color-ink-primary)', marginTop: 3 }}><span style={{ color: 'var(--color-ink-muted)' }}>what · </span>{n.what}</div>
        <div style={{ color: 'var(--color-ink-secondary)', marginTop: 2 }}><span style={{ color: 'var(--color-ink-muted)' }}>why · </span>{n.why}</div>
      </div>
    );
  }

  // round 35: innermost wins — a leaf layer card suppresses the docent card.
  // round 92: a node-bound element shows the IA card instead (no double card).
  let docent: React.ReactNode = null;
  if (ready && a && !leafActive && !node) {
    const { left, top } = place(anchor, DOCENT_W, DOCENT_H);
    docent = (
      <div
        className="learn-callout"
        style={{
          position: 'fixed', left, top, width: DOCENT_W, zIndex: 65, pointerEvents: 'none',
          background: 'var(--color-surface-overlay)', border: '1px solid var(--color-accent-bright)',
          borderRadius: 1, padding: '10px 12px',
          fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)', lineHeight: 1.5,
        }}
      >
        <div style={{ color: 'var(--color-accent-bright)', letterSpacing: 1 }}>{a.mark} {name}</div>
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
        if (node) setIaHover(true); // round 92: the layer lens yields to this card
      }}
      onMouseOut={(e) => {
        e.stopPropagation();
        setAnchor(null);
        if (node) setIaHover(false);
      }}
      onClickCapture={(e) => {
        e.preventDefault(); // normal interactions suppressed in learn mode
        e.stopPropagation();
      }}
    >
      {children}
      {/* ROUND 112: the docent/IA card is position:fixed, but a fixed element is
          trapped (re-based + stacked, sometimes clipped) by any ancestor that is a
          containing block for fixed descendants — notably the round-97/108 glass
          panels (backdrop-filter) and any transform/filter ancestor. That was the
          trip-summary "Learn renders behind the panel" bug. Portaling the card to
          document.body escapes every ancestor stacking context/containing block, so
          it layers above ALL content consistently. Fixed coords are viewport-based
          (from getBoundingClientRect), so placement is unchanged by the portal. */}
      {(iaCard || docent) && typeof document !== 'undefined' &&
        createPortal(<>{iaCard}{docent}</>, document.body)}
    </div>
  );
}
