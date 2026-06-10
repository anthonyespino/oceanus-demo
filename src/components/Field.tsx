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
}: {
  level: UiLevel;
  field: string;
  label?: string; // Contextual reveal label; defaults to the field name
  children?: React.ReactNode;
}) {
  const d = getDisposition(level, field);
  // Unregistered = unclassified: surface loudly rather than guessing.
  if (!d) return <UndefinedField field={`${field} (NOT IN REGISTRY)`} />;
  switch (d.disposition) {
    case 'HIDDEN':
      return null;
    case 'UNDEFINED':
      return <UndefinedField field={d.field} note={d.note} />;
    case 'CONTEXTUAL':
      return <Contextual label={label ?? d.field}>{children}</Contextual>;
    case 'VISIBLE':
      return <>{children}</>;
  }
}

export function UndefinedField({ field, note }: { field: string; note?: string }) {
  return (
    <span
      title={note}
      style={{
        display: 'inline-block',
        background: '#e0e0e0',
        border: '1px dashed #999',
        color: '#555',
        padding: '2px 6px',
        fontSize: 11,
      }}
    >
      UNDEFINED: {field}
    </span>
  );
}
