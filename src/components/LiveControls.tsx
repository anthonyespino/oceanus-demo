'use client';
// Live-mode control: tick on/off + speed. State lives in src/state; this is
// just buttons. Demo epoch stays pinned — "live" advances simulated minutes.

import { useFleet } from '../state/FleetProvider';
import { fmtTime } from './gb';

export function LiveControls() {
  const { simTime, live, speed, setLive, setSpeed } = useFleet();
  const btn = (active: boolean): React.CSSProperties => ({
    border: '1px solid #999',
    background: active ? '#ddd' : '#fff',
    padding: '2px 8px',
    fontSize: 12,
    cursor: 'pointer',
  });
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#777' }}>
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

export function AppHeader() {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #999',
        padding: '6px 12px',
      }}
    >
      <span>
        <strong>OCEANUS FLEET</strong>{' '}
        <span style={{ fontSize: 11, color: '#777' }}>greybox wireframe — not a design</span>
      </span>
      <LiveControls />
    </header>
  );
}
