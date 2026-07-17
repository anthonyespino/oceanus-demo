'use client';
// ROUND 43: DetailChip — the chip affordance pattern as a system primitive.
// A 1px hairline rectangle whose content is a click/tap target that opens a
// popover ANCHORED TO THE CHIP (never a center modal), with the detail
// surface inside. Esc / click-outside dismisses. Only use where genuine
// drillable detail exists — never as decorative affordance.

import { useEffect, useRef, useState } from 'react';
import { gb } from './gb';
import { NEUTRAL, RADIUS } from './probeTokens';

export function DetailChip({
  label,
  children,
  popover,
  align = 'left',
  attrs,
}: {
  label: string; // aria + dismissable dialog label
  children: React.ReactNode; // the chip's visible trigger content
  popover: React.ReactNode; // the detail surface
  align?: 'left' | 'right'; // which edge the popover hangs from
  attrs?: Record<string, string>; // layer() instrumentation
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onDown); };
  }, [open]);

  return (
    <span ref={wrap} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        {...attrs}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        style={{
          ...gb.boxTight,
          background: open ? NEUTRAL.surfaceDim : 'transparent',
          color: 'inherit',
          font: 'inherit',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          lineHeight: 1,
        }}
      >
        {children}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={label}
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, zIndex: 60,
            minWidth: 280, maxWidth: 560, maxHeight: '50vh', overflowY: 'auto',
            background: NEUTRAL.surface, border: '1px solid var(--color-line-strong)',
            borderRadius: RADIUS, padding: 'var(--pad-card)',
            boxShadow: '0 12px 28px -8px rgba(0,0,0,0.65)',
          }}
        >
          {popover}
        </div>
      )}
    </span>
  );
}
