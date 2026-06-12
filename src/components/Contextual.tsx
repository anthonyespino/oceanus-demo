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
import { useFleet } from '../state/FleetProvider';
import { RADIUS } from './probeTokens';
import { Annotated } from '../learn/Annotated'; // LEARN MODE — strip before demo week

// ROUND 20 — system rule: "hover points, click asks." All reveals are
// click-only; hover does nothing anywhere except chart-marker tooltips
// (which use the controlled `open` prop, debounced by their charts).
export function Contextual({
  label,
  children,
  open: controlledOpen,
}: {
  label: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  const [pinned, setPinned] = useState(false);
  const open = controlledOpen ?? pinned;

  return (
    <Annotated name="Contextual" inline>
    <span
      onClick={() => setPinned((p) => !p)}
      style={{ cursor: 'pointer' }}
    >
      <span style={{ borderBottom: `1px dotted ${pinned ? 'var(--color-accent-bright)' : 'var(--color-ink-muted)'}`, color: pinned ? 'var(--color-accent-bright)' : 'var(--color-ink-secondary)', fontSize: 12 }}>
        {label}
        {open ? '' : ' …'}
      </span>
      {open && (
        <span
          style={{
            display: 'inline-block',
            maxWidth: 420,
            whiteSpace: 'normal',
            verticalAlign: 'top',
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
    </Annotated>
  );
}


/**
 * ROUND 14 (⚖ verdict #14): whole-card reveal zone — replaces every
 * "details …"-style text label. The entire card is the hover/focus target;
 * Enter pins on non-link cards (inside tiles the Link keeps Enter for
 * navigation and focus alone shows the reveal). Two affordance variants
 * behind the dev panel: SILENT chevron (hand-drawn path, rotates when open)
 * or METER strip (endurance as fraction of usable-fuel range; neutral ink,
 * status color only when an endurance alert is live). Cards without meter
 * data fall back to the chevron even in meter mode.
 * Learn mode: the affordance itself carries the Contextual docent copy so
 * the teaching registers on the new trigger without shadowing card copy.
 */
export function RevealZone({
  children,
  reveal,
  meter,
}: {
  children: React.ReactNode;
  reveal: React.ReactNode;
  meter?: { frac: number; color?: string };
}) {
  const { revealStyle } = useFleet();
  const [pinned, setPinned] = useState(false);
  const open = pinned;
  const useMeter = revealStyle === 'meter' && meter;

  return (
    <div
      tabIndex={0}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, outline: 'none', cursor: 'pointer' }}
      onClick={(e) => {
        // click asks — but interactive children keep their own clicks
        if ((e.target as HTMLElement).closest('a, button')) return;
        setPinned((p) => !p);
      }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPinned(false); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !(e.target as HTMLElement).closest('a, button')) {
          e.preventDefault();
          setPinned((p) => !p);
        }
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>{children}</div>
      {open && (
        <div style={{ borderTop: '1px solid var(--color-line-hairline)', marginTop: 8, paddingTop: 8, fontSize: 12, paddingBottom: useMeter ? 6 : 0 }}>
          {reveal}
        </div>
      )}
      <Annotated name="Contextual" inline>
        {useMeter ? (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: -6, height: 3, background: 'var(--color-surface-overlay)', borderRadius: RADIUS }}>
            <div style={{ height: '100%', width: `${Math.round(Math.min(1, Math.max(0, meter!.frac)) * 100)}%`, background: meter!.color ?? 'var(--color-ink-muted)', borderRadius: RADIUS }} />
          </div>
        ) : (
          <svg width={10} height={10} viewBox="0 0 10 10"
            style={{ position: 'absolute', right: 2, bottom: 0, transform: open ? 'rotate(90deg)' : 'none' }}>
            <path d="M 3 1 L 7 5 L 3 9" fill="none" stroke="var(--color-ink-muted)" strokeWidth={1.5} />
          </svg>
        )}
      </Annotated>
    </div>
  );
}
