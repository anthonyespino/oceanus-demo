'use client';
// Environment bucket (§6). Wind and waves are VISIBLE; current/visibility/
// precip share one grouped reveal. A STALE weather stream renders greyed
// with its last-heard timestamp — a dead gauge must look dead.

import type { VesselState } from '../data/types';
import { Field } from './Field';
import { gb, fmtTime } from './gb';

export function WeatherPanel({ vessel }: { vessel: VesselState }) {
  const wx = vessel.history.minutes.at(-1)!.weather;
  const stale = vessel.derived.staleness.weather === 'STALE';

  return (
    <section style={{ ...gb.box, marginBottom: 8, ...(stale ? gb.stale : {}) }}>
      <div style={gb.label}>
        environment{stale && ` — [STALE] last received ${fmtTime(vessel.history.timestamps.weather)}`}
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Field level="vessel" field="weather.wind">
          <span>wind {wx.wind_speed_kn} kn</span>
        </Field>
        <Field level="vessel" field="weather.waves">
          <span>waves {wx.wave_height_ft} ft</span>
        </Field>
        <Field level="vessel" field="weather.current" label="current / vis / precip">
          <span>
            current {wx.current_kn} kn · visibility {wx.visibility_nm} nm · {wx.precip}
          </span>
        </Field>
        <Field level="vessel" field="wind_direction_visualization" />
      </div>
    </section>
  );
}
