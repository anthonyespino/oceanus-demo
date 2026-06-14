'use client';
// Live-mode control: tick on/off + speed. State lives in src/state; this is
// just buttons. Demo epoch stays pinned — "live" advances simulated minutes.

import { useEffect, useState } from 'react';
import { useFleet } from '../state/FleetProvider';
import { toggleStyle } from './probeTokens';
import { fmtTime } from './gb';
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
  // ROUND 91: date + time split into two type weights — the TIME is the hero,
  // the DATE is a quiet subordinate prefix (smaller tier + lighter weight/ink),
  // so the long date string stops fighting the time for attention.
  const dateStr = now
    ? `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`
    : '————-——-——';
  const timeStr = now
    ? `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}Z`
    : '——:——:——Z';
  return (
    <span
      {...layer('AppHeader / clock / master.clock.text', 'global UTC/Zulu wall clock (system time) · font/data tabular · DATE subordinate (context, lighter) + TIME hero (round 91) · distinct from the per-vessel mission clock', 'system UTC now')}
      title="global UTC (Zulu) — system wall clock"
      style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
    >
      {/* DATE — subordinate prefix: smaller tier + lighter weight + dimmer ink */}
      <span style={{ fontSize: 'var(--type-context)', fontWeight: 400, color: 'var(--color-ink-muted)' }}>{dateStr}</span>
      {/* TIME — the hero: stays on the HERO tier, bold, brighter ink */}
      <span style={{ fontSize: 'var(--type-hero)', fontWeight: 600, color: 'var(--color-ink-secondary)' }}>{timeStr}</span>
    </span>
  );
}

export function LiveControls() {
  const { simTime, live, speed, setLive, setSpeed } = useFleet();
  const btn = toggleStyle; // tidy round 8: one shared toggle style
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {live && <span className="live-dot" title="live ticks running" />}
      <span style={{ fontSize: 'var(--type-context)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-data)' }}>
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

// ROUND 88: the global bar is now just WORDMARK (left, primary tier — pulled back
// from the round-86 display size) and the Zulu MASTER CLOCK (right, promoted to
// hero + bold). The status cluster (DATALINK/SYNC + CAUTION·ADVISORY) moved DOWN
// to FleetView, centered below the fleet-plot map and above the thumbcards
// (round 88 item 2); the DATALINK breath binding rides along with StatusHeader.
export function AppHeader() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        borderBottom: '1px solid var(--color-line-subtle)',
        padding: '6px 12px',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--type-primary)', fontWeight: 700, letterSpacing: 2, whiteSpace: 'nowrap' }}>
        OCEANUS FLEET
      </span>
      <MasterClock />
    </header>
  );
}
