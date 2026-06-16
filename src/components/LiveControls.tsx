'use client';
// Live-mode control: tick on/off + speed. State lives in src/state; this is
// just buttons. Demo epoch stays pinned — "live" advances simulated minutes.

import { useFleet } from '../state/FleetProvider';
import { toggleStyle, NEUTRAL } from './probeTokens';
import { fmtTime } from './gb';
import { Glyph } from './Glyph';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

// ROUND 120: minimal presenter SIM TRANSPORT, parked beside the master clock —
// Pause/Resume (freeze/continue the sim clock so telemetry holds still) + Reset
// (snap the sim + all derived data back to the seed state, no page reload). Quiet
// greyscale utility: it must NOT compete with the clock or any instrument, and it
// stays out of the demo's visual story. Pause/Resume rides the existing `live` flag
// (so the D-panel live toggle stays in sync); the glyph reflects state (pause when
// running, play when paused). Neutral ink only — no severity color, no green. This is
// presenter/dev tooling (an operator wouldn't pause a live fleet), kept always-reachable.
function SimTransport() {
  const { live, setLive, resetSim } = useFleet();
  const btn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0,
    display: 'inline-flex', color: NEUTRAL.inkMuted,
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <button
        {...layer('AppHeader / transport / pause.glyph', 'presenter sim transport · pause/resume (rides {live}) · neutral utility · reflects state (pause glyph running, play glyph paused)', '{live} → freeze/continue sim clock')}
        aria-label={live ? 'pause sim clock' : 'resume sim clock'}
        title={live ? 'pause sim clock' : 'resume sim clock'}
        onClick={() => setLive(!live)}
        style={{ ...btn, color: live ? NEUTRAL.inkMuted : NEUTRAL.inkSecondary }}
      >
        <Glyph name={live ? 'pause' : 'play'} size={14} />
      </button>
      <button
        {...layer('AppHeader / transport / reset.glyph', 'presenter sim transport · reset to seed state (no page reload; scenario/mode preserved) · neutral utility', '→ resetSim()')}
        aria-label="reset sim to seed state"
        title="reset to seed state"
        onClick={resetSim}
        style={btn}
      >
        <Glyph name="reset" size={14} />
      </button>
    </span>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

// ROUND 79 / ROUND 122: the GLOBAL master clock — a UTC/Zulu clock top-right on every
// page. ROUND 122: it is now SIMULATION time, not real wall-time — driven by `simTime`
// (the sim's "now"), so the whole imagined world's wall clock pauses, resumes, and
// resets WITH the sim. Pause halts everything including this clock; resume continues
// from the frozen moment (never jumps to real current time); reset snaps it to the seed
// (DEMO_EPOCH). simTime advances in 1-min ticks, so the clock reads to the minute. Still
// distinct from the per-vessel mission clock (T−/ON STATION/IN PORT) in the CommandBand.
function MasterClock() {
  const { simTime } = useFleet();
  const t = simTime != null ? new Date(simTime) : null;
  // ROUND 91: date + time split into two type weights — the TIME is the hero,
  // the DATE is a quiet subordinate prefix (smaller tier + lighter weight/ink).
  const dateStr = t
    ? `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
    : '————-——-——';
  const timeStr = t
    ? `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}Z`
    : '——:——Z';
  return (
    <span
      {...layer('AppHeader / clock / master.clock.text', 'UTC/Zulu SIM clock (round 122: simulation time, not system time) · font/data tabular · DATE subordinate (context, lighter) + TIME hero (round 91) · pauses/resumes/resets with the sim · distinct from the per-vessel mission clock', '{simTime} — sim now')}
      title="simulation clock (Zulu) — pauses / resumes / resets with the sim"
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
        // ROUND 114: the global header is a header strip → FLAT near-black, not the
        // sea gradient (gradient = floating instrument surfaces only).
        background: 'var(--color-surface-base)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--type-primary)', fontWeight: 700, letterSpacing: 2, whiteSpace: 'nowrap' }}>
        OCEANUS FLEET
      </span>
      {/* ROUND 120: transport sits LEFT of the clock so the master clock stays rightmost
          + undisturbed; quiet greyscale, reads as utility not a product feature. */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
        <SimTransport />
        <MasterClock />
      </span>
    </header>
  );
}
