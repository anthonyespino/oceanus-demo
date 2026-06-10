// Minimal data inspection page — unstyled tables so Anthony can eyeball the
// generated data in a browser. Deliberately NOT the dashboard; no styling, no
// components. The real UI starts in a later session from the Figma names.

import { getFleet } from '../../data/fleetState';
import { DISPOSITIONS } from '../../data/dispositions';
import { worstLevel } from '../../data/alerts';

export const dynamic = 'force-dynamic';

const td = { border: '1px solid #999', padding: '2px 6px' } as const;

function fmtPct(x: number): string {
  return `${x > 0 ? '+' : ''}${x.toFixed(1)}%`;
}
function fmtDay(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

export default function InspectPage() {
  const fleet = [...getFleet()].sort(
    (a, b) => Math.abs(b.derived.efficiency_delta_pct) - Math.abs(a.derived.efficiency_delta_pct),
  );
  const now = fleet[0].history.minutes[fleet[0].history.minutes.length - 1].t;

  return (
    <main style={{ fontFamily: 'monospace', padding: 16 }}>
      <h1>Oceanus data inspection — {new Date(now).toISOString()}</h1>

      <h2>Fleet (ranked by |efficiency_delta|)</h2>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['vessel', 'mode', 'eff_delta', 'trend_30d', 'burn gph', 'endurance h', 'recon', 'worst alert', 'position', 'sparkline 24h'].map((h) => (
              <th key={h} style={td}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fleet.map((v) => {
            const d = v.derived;
            const pos = v.history.minutes[v.history.minutes.length - 1].position;
            return (
              <tr key={v.static.id}>
                <td style={td}>{v.static.name}</td>
                <td style={td}>{d.mode}</td>
                <td style={td}>{fmtPct(d.efficiency_delta_pct)}</td>
                <td style={td}>{fmtPct(d.trend_30d)}</td>
                <td style={td}>{d.burn_rate_gph}</td>
                <td style={td}>{d.endurance_hours}</td>
                <td style={td}>{d.reconciliation.status}</td>
                <td style={td}>{worstLevel(v.alerts) ?? '—'}</td>
                <td style={td}>{pos.lat.toFixed(2)}, {pos.lon.toFixed(2)} @ {pos.speed_over_ground_kn} kn</td>
                <td style={td}>{d.sparkline_24h.map((x) => x.toFixed(0)).join(' ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {fleet.map((v) => {
        const s = v.history.minutes[v.history.minutes.length - 1];
        const d = v.derived;
        return (
          <section key={v.static.id}>
            <h2>
              {v.static.name} — {v.static.length_ft} ft {v.static.class}, {d.mode}, delta {fmtPct(d.efficiency_delta_pct)} (baseline {d.baseline_value} {d.baseline_metric})
            </h2>
            <p>
              alerts: {v.alerts.map((a) => `${a.level}:${a.code} (${a.message})`).join('; ') || 'none'}
              <br />
              reconciliation: {d.reconciliation.status} {fmtPct(d.reconciliation.error_pct)} over {d.reconciliation.window_h}h · EGT twin gap {d.egt_twin_gap_f}°F · trends 30d {fmtPct(d.trend_30d)} / 90d {fmtPct(d.trend_90d)}
              <br />
              staleness: {Object.entries(d.staleness).map(([k, f]) => `${k}:${f}`).join(' ')}
              <br />
              next ports: {v.history.nextPortCalls.map((p) => `${p.port} ETA ${fmtDay(p.eta)}`).join('; ') || '—'}
            </p>
            <table style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['engine', 'role', 'running', 'load %', 'rpm', 'fuel gph', 'EGT °F', 'coolant °F', 'oil psi', 'oil °F', 'hours'].map((h) => (
                    <th key={h} style={td}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.engines.map((e) => (
                  <tr key={e.engine_id}>
                    <td style={td}>{e.engine_id}</td>
                    <td style={td}>{e.role}</td>
                    <td style={td}>{e.running ? 'yes' : 'no'}</td>
                    <td style={td}>{e.load_pct}</td>
                    <td style={td}>{e.rpm}</td>
                    <td style={td}>{e.fuel_rate_gph}</td>
                    <td style={td}>{e.exhaust_gas_temp_f}</td>
                    <td style={td}>{e.coolant_temp_f}</td>
                    <td style={td}>{e.oil_pressure_psi}</td>
                    <td style={td}>{e.oil_temp_f}</td>
                    <td style={td}>{e.running_hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table style={{ borderCollapse: 'collapse', marginTop: 4 }}>
              <tbody>
                <tr>
                  {s.tanks.map((t) => (
                    <td key={t.tank_id} style={td}>
                      {t.tank_id} {t.type}: {t.level_gal}/{t.capacity_gal} gal ({t.level_pct}%){t.transfer_active ? ' XFER' : ''}
                    </td>
                  ))}
                  <td style={td}>flow {s.flow_gps} gps</td>
                </tr>
                <tr>
                  <td style={td} colSpan={3}>
                    wx: wind {s.weather.wind_speed_kn} kn @ {s.weather.wind_dir_deg}° · waves {s.weather.wave_height_ft} ft · current {s.weather.current_kn} kn · vis {s.weather.visibility_nm} nm · {s.weather.precip}
                  </td>
                  <td style={td} colSpan={2}>
                    crew: {v.history.crew.map((c) => `${c.role} ${c.name} (since ${fmtDay(c.onboard_since)})`).join('; ')}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        );
      })}

      <h2>Data Disposition Registry</h2>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['level', 'field', 'disposition', 'note'].map((h) => (
              <th key={h} style={td}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DISPOSITIONS.map((d) => (
            <tr key={`${d.level}:${d.field}`}>
              <td style={td}>{d.level}</td>
              <td style={td}>{d.field}</td>
              <td style={td}>{d.disposition}</td>
              <td style={td}>{d.note ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
