'use client';
// Registry router: components declare WHICH field they're rendering; the
// disposition registry decides IF and HOW it renders.
//   VISIBLE    → children render in place
//   CONTEXTUAL → children render behind the shared <Contextual> reveal
//   HIDDEN     → renders nothing
//   UNDEFINED  → literal grey placeholder so Anthony sees the pending decision

import { DISPOSITIONS, type DispositionEntry, type UiLevel } from '../data/dispositions';
import { Contextual } from './Contextual';

export function getDisposition(level: UiLevel, field: string): DispositionEntry | undefined {
  return DISPOSITIONS.find((d) => d.level === level && d.field === field);
}

export function Field({
  level,
  field,
  label,
  children,
  revealed = false,
}: {
  level: UiLevel;
  field: string;
  label?: string; // Contextual reveal label; defaults to the field name
  children?: React.ReactNode;
  /** true when already inside a RevealZone's reveal block (round 14) —
      CONTEXTUAL renders plain; the zone provides the one interaction */
  revealed?: boolean;
}) {
  const d = getDisposition(level, field);
  // Round 9: unresolved/unregistered fields simply don't render — they are
  // tracked in the registry and PROGRESS.md, not in the interface.
  if (!d) return null;
  switch (d.disposition) {
    case 'HIDDEN':
      return null;
    case 'UNDEFINED':
      return null;
    case 'CONTEXTUAL':
      if (revealed) return <>{children}</>;
      return <Contextual label={label ?? d.field}>{children}</Contextual>;
    case 'VISIBLE':
      return <>{children}</>;
  }
}
