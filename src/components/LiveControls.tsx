'use client';
// Live-mode control: tick on/off + speed. State lives in src/state; this is
// just buttons. Demo epoch stays pinned — "live" advances simulated minutes.

import { useFleet } from '../state/FleetProvider';
import { SystemStatusStrip } from './SystemStatusStrip';
import { fmtTime } from './gb';

export function LiveControls() {
  const { simTime, live, speed, setLive, setSpeed } = useFleet();
  const btn = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? 'var(--color-accent-bright)' : 'var(--color-line-strong)'}`,
    background: active ? 'var(--color-accent-wash)' : 'var(--color-surface-raised)',
    color: 'var(--color-ink-primary)',
    padding: '2px 8px',
    fontSize: 12,
    cursor: 'pointer',
  });
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

export function AppHeader() {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        borderBottom: '1px solid var(--color-line-subtle)',
        padding: '6px 12px',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2 }}>
        OCEANUS FLEET{' '}
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-ink-muted)', letterSpacing: 0.5 }}>
          design probe — press D for toggles
        </span>
      </span>
      <span style={{ display: 'inline-flex', gap: 18, alignItems: 'center' }}>
        <SystemStatusStrip />
        <LiveControls />
      </span>
    </header>
  );
}
