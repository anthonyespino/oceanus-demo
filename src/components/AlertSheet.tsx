'use client';
// ROUND 33: alert diet. SystemStatusStrip and AlertRail die (renames
// recorded for barrel + Figma). StatusHeader is the micro header row —
// [datalink] DATALINK {state} · LAST SYNC {age} · {counts in severity
// colors} — embedded by FleetHealthBand (board) and VesselCommandBand
// (inspector). The counts are the click target that summons the anchored
// alert sheet: full lines, click a line → that vessel, click-outside or
// Esc closes. Zero standing pixels when not summoned.
// Line grammar (round 33, one severity voice per line): [LEVEL] tag in
// severity color · vessel name link · message in plain ink. No per-line
// triangle glyph.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useFleet } from '../state/FleetProvider';
import { Glyph } from './Glyph';
import { ALERT_TEXT_COLOR, FONT, NEUTRAL, RADIUS } from './probeTokens';

function fmtAge(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (m < 60) return `${m}:${String(s).padStart(2, '0')} ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

/** Compact feed-age: "5H" / "45M" (round 34 inline degradation grammar). */
function fmtFeedAge(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  return h >= 1 ? `${h}H` : `${Math.max(1, Math.floor(ms / 60_000))}M`;
}

const FEED_ABBREV: Record<string, string> = {
  weather: 'WX', position: 'POS', engines: 'ENG', tanks: 'TANK',
  flow: 'FLOW', status: 'STATUS', crew: 'CREW',
};

const LEVEL_RANK: Record<string, number> = { WARNING: 0, CAUTION: 1, ADVISORY: 2 };

export function StatusHeader() {
  const { fleet, simTime } = useFleet();
  const [open, setOpen] = useState(false);
  const [allStale, setAllStale] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onDown); };
  }, [open]);

  const item: React.CSSProperties = { fontFamily: FONT.data, fontSize: 11, whiteSpace: 'nowrap' };
  if (!fleet || simTime === null) {
    return <span style={{ ...item, color: NEUTRAL.inkMuted }}>DATALINK —</span>;
  }

  // round 34: inline degradation detail (the "…" reveal died) — vessel +
  // feed + age, worst first; "+N more" expands the rest in place
  const staleEntries = fleet.flatMap((v) =>
    (Object.entries(v.derived.staleness) as [keyof typeof v.history.timestamps, string][])
      .filter(([, f]) => f === 'STALE')
      .map(([stream]) => ({
        vessel: v.static.name.toUpperCase(),
        feed: FEED_ABBREV[stream] ?? String(stream).toUpperCase(),
        age: simTime - v.history.timestamps[stream],
      })),
  ).sort((a, b) => b.age - a.age);
  const datalink = staleEntries.length === 0 ? 'FRESH' : staleEntries.length === 1 ? 'DEGRADED' : 'STALE';
  const datalinkColor = datalink === 'FRESH' ? NEUTRAL.inkSecondary : 'var(--color-alert-advisory)';
  const shownStale = allStale ? staleEntries : staleEntries.slice(0, 1);
  const oldestTs = Math.min(...fleet.flatMap((v) => Object.values(v.history.timestamps)));

  const counts = { WARNING: 0, CAUTION: 0, ADVISORY: 0 };
  for (const v of fleet) for (const a of v.alerts) counts[a.level]++;
  const countParts = (['WARNING', 'CAUTION', 'ADVISORY'] as const).filter((l) => counts[l] > 0);

  // sheet lines: severity class first, then the fleet ranking score —
  // alerts carry no onset timestamp in the model (only the event log does)
  const lines = fleet
    .flatMap((v) => v.alerts.map((a) => ({ v, a })))
    .sort((x, y) =>
      LEVEL_RANK[x.a.level] - LEVEL_RANK[y.a.level]
      || Math.abs(y.v.derived.sustained_deviation) - Math.abs(x.v.derived.sustained_deviation));

  return (
    // round 34: one flex baseline — glyphs vertically centered on the text
    <span ref={wrap} style={{ display: 'inline-flex', gap: 14, alignItems: 'center', position: 'relative', flexWrap: 'wrap' }}>
      <span style={{ ...item, color: datalinkColor, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <Glyph name="datalink" size={12} />
        <span>
          DATALINK {datalink}
          {shownStale.map((s, i) => (
            <span key={`${s.vessel}-${s.feed}-${i}`}> · {s.vessel} {s.feed} {fmtFeedAge(s.age)} STALE</span>
          ))}
        </span>
        {staleEntries.length > 1 && (
          <button
            onClick={() => setAllStale((a) => !a)}
            style={{ ...item, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: NEUTRAL.inkMuted, textDecoration: 'underline' }}
          >
            {allStale ? 'less' : `+${staleEntries.length - 1} more`}
          </button>
        )}
      </span>
      <span style={{ ...item, color: NEUTRAL.inkSecondary }}>LAST SYNC {fmtAge(simTime - oldestTs)}</span>
      {/* the counts ARE the alert surface — click summons the sheet */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="open alert sheet"
        style={{ ...item, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: NEUTRAL.inkSecondary, display: 'inline-flex', alignItems: 'center', gap: 5 }}
      >
        <Glyph name="alert-triangle" size={12} />
        <span>
          {countParts.length === 0 ? (
            <span style={{ color: NEUTRAL.inkMuted }}>NO ALERTS</span>
          ) : (
            countParts.map((l, i) => (
              <span key={l}>
                {i > 0 && ' · '}
                <span style={{ color: ALERT_TEXT_COLOR[l] }}>{counts[l]} {l}</span>
              </span>
            ))
          )}
        </span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="active alerts"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 60,
            minWidth: 440, maxWidth: 600, maxHeight: '50vh', overflowY: 'auto',
            background: NEUTRAL.surface, border: '1px solid var(--color-line-strong)',
            borderRadius: RADIUS, padding: 'var(--pad-card)',
            boxShadow: '0 12px 28px -8px rgba(0,0,0,0.65)',
          }}
        >
          {lines.length === 0 ? (
            <div style={{ ...item, color: NEUTRAL.inkMuted }}>no active alerts</div>
          ) : (
            lines.map(({ v, a }, i) => (
              <Link
                key={`${v.static.id}-${a.code}-${i}`}
                href={`/vessel/${v.static.id}`}
                onClick={() => setOpen(false)}
                style={{ display: 'block', textDecoration: 'none', fontFamily: FONT.data, fontSize: 12, lineHeight: 1.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <span style={{ color: ALERT_TEXT_COLOR[a.level] }}>[{a.level}]</span>{' '}
                <span style={{ color: 'var(--color-accent-bright)', textDecoration: 'underline' }}>{v.static.name}</span>{' '}
                <span style={{ color: NEUTRAL.inkSecondary }}>{a.message}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </span>
  );
}
