'use client';
// THE single shared reveal primitive. Every CONTEXTUAL field in the app goes
// through this component, so when Anthony decides how reveals should feel
// (hover vs click vs expand, timing, affordance), it changes here — one file.
//
// Greybox interaction decision (Anthony may overrule):
//   - hover reveals immediately, mouse-out hides
//   - click pins the reveal open (trackpad/demo safety); click again unpins
//   - affordance: dotted underline on the label, "…" suffix

import { useState } from 'react';

// `open` (controlled) lets non-HTML hover sources — SVG chart markers — drive
// the same reveal: the policy still lives in this one file.
export function Contextual({
  label,
  children,
  open: controlledOpen,
}: {
  label: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = controlledOpen ?? (hover || pinned);

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setPinned((p) => !p)}
      style={{ cursor: 'default' }}
    >
      <span style={{ borderBottom: `1px dotted ${pinned ? 'var(--color-accent-bright)' : 'var(--color-ink-muted)'}`, color: pinned ? 'var(--color-accent-bright)' : 'var(--color-ink-secondary)', fontSize: 12 }}>
        {label}
        {open ? '' : ' …'}
      </span>
      {open && (
        <span
          style={{
            display: 'inline-block',
            border: `1px solid ${pinned ? 'var(--color-accent-bright)' : 'var(--color-line-strong)'}`,
            background: 'var(--color-surface-overlay)',
            padding: '2px 6px',
            marginLeft: 6,
            fontSize: 12,
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
}
