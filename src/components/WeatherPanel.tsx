'use client';
// Environment bucket (§6). Wind and waves are VISIBLE; current/visibility/
// precip share one grouped reveal. A STALE weather stream renders greyed
// with its last-heard timestamp — a dead gauge must look dead.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { RevealZone } from './Contextual';
import { Stat } from './Stat';
import { gb, fmtTime } from './gb';
import { Glyph } from './Glyph';

export function WeatherPanel({ vessel }: { vessel: VesselState }) {
  const wx = vessel.history.minutes.at(-1)!.weather;
  const stale = vessel.derived.staleness.weather === 'STALE';

  return (
    <section style={{ ...gb.box, padding: 'var(--pad-section) var(--pad-card)', marginBottom: 8, ...(stale ? gb.stale : {}) }}>
      <RevealZone
        reveal={
          <Field level="vessel" field="weather.current" revealed>
            <span>current {wx.current_kn} kn · visibility {wx.visibility_nm} nm · {wx.precip}</span>
          </Field>
        }
      >
      <div style={gb.label}>
        environment{stale && ` — [STALE] last received ${fmtTime(vessel.history.timestamps.weather)}`}
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <Field level="vessel" field="weather.wind">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Glyph name="wind" size={16} />
            <Stat label="wind" value={`${wx.wind_speed_kn} kn`} size={22} />
          </span>
        </Field>
        <Field level="vessel" field="weather.waves">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Glyph name="wave" size={16} />
            <Stat label="waves" value={`${wx.wave_height_ft} ft`} size={22} />
          </span>
        </Field>
      </div>
      </RevealZone>
    </section>
  );
}
