'use client';
// Operations bucket (§6): upcoming port calls. Heading display is UNDEFINED.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { gb, fmtTime } from './gb';

export function RoutePanel({ vessel }: { vessel: VesselState }) {
  return (
    <section style={{ ...gb.box, marginBottom: 8 }}>
      <div style={gb.label}>route & ports</div>
      <Field level="vessel" field="next_port_calls">
        {vessel.history.nextPortCalls.length === 0 ? (
          <div style={gb.dim}>no scheduled port calls in horizon</div>
        ) : (
          vessel.history.nextPortCalls.map((p, i) => (
            <div key={i}>
              {i === 0 ? 'next' : 'then'}: {p.port} — ETA {fmtTime(p.eta)}
            </div>
          ))
        )}
      </Field>
      <div style={{ marginTop: 4 }}>
        <Field level="vessel" field="heading_deg" />
      </div>
    </section>
  );
}
