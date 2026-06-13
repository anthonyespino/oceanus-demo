'use client';
// Live-mode control: tick on/off + speed. State lives in src/state; this is
// just buttons. Demo epoch stays pinned — "live" advances simulated minutes.

import { useEffect, useState } from 'react';
import { useFleet } from '../state/FleetProvider';
import { toggleStyle } from './probeTokens';
import { fmtTime } from './gb';
import { StatusHeader } from './AlertSheet';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

const pad = (n: number) => String(n).padStart(2, '0');

// ROUND 79: the GLOBAL master clock — a real UTC/Zulu wall clock (system time),
// top-right on every page. DISTINCT from the per-vessel mission clock (T−/ON
// STATION/IN PORT) in the CommandBand. Client-only + mounted-gated so SSR doesn't
// hydration-mismatch on the ticking time.
function MasterClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // mount-time tick (client only — avoids SSR hydration mismatch on the time)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const z = now
    ? `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}Z`
    : '————-——-—— ——:——:——Z';
  return (
    <span
      {...layer('AppHeader / clock / master.clock.text', 'global UTC/Zulu wall clock (system time) · font/data tabular · neutral ink · distinct from the per-vessel mission clock', 'system UTC now')}
      title="global UTC (Zulu) — system wall clock"
      style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--color-ink-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
    >
      {z}
    </span>
  );
}

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

// ROUND 79: the header is the GLOBAL STATUS BAR (all pages, app-level). Three
// masses: wordmark + DATALINK/LAST SYNC (data-health) on the LEFT, CAUTION ·
// ADVISORY counts (consequence, clickable) CENTER, the global UTC master clock
// RIGHT. This supersedes the round-73 split (data-health was an ambient footer
// in the CommandBand) and the per-page status strips — one system-state line
// above all vessel content. (Round 33 had dissolved status into per-page header
// rows; round 79 re-consolidates it globally.)
export function AppHeader() {
  return (
    <header
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 16,
        borderBottom: '1px solid var(--color-line-subtle)',
        padding: '6px 12px',
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, whiteSpace: 'nowrap' }}>
          OCEANUS FLEET
        </span>
        <StatusHeader parts="health" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <StatusHeader parts="alerts" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <MasterClock />
      </div>
    </header>
  );
}
