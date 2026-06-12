'use client';
// Live-mode control: tick on/off + speed. State lives in src/state; this is
// just buttons. Demo epoch stays pinned — "live" advances simulated minutes.

import { useFleet } from '../state/FleetProvider';
import { toggleStyle } from './probeTokens';
import { fmtTime } from './gb';

export function LiveControls() {
  const { simTime, live, speed, setLive, setSpeed } = useFleet();
  const btn = toggleStyle; // tidy round 8: one shared toggle style
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {live && <span className="live-dot" title="live ticks running" />}
      <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-data)' }}>
        sim clock {simTime ? fmtTime(simTime) : '—'}
      </span>
      <button style={btn(live)} onClick={() => setLive(!live)}>
        live: {live ? 'ON' : 'OFF'}
      </button>
      <button style={btn(speed === 1)} onClick={() => setSpeed(1)} disabled={!live}>
        1x
      </button>
      <button style={btn(speed === 60)} onClick={() => setSpeed(60)} disabled={!live}>
        60x
      </button>
    </span>
  );
}

// Round 33: the header is the wordmark only — system status dissolved into
// FleetHealthBand / VesselCommandBand header rows; sim clock + speed moved
// to the dev panel (simulator chrome, not product).
export function AppHeader() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-line-subtle)',
        padding: '6px 12px',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2 }}>
        OCEANUS FLEET
      </span>
    </header>
  );
}
