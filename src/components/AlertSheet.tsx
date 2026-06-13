'use client';
// ROUND 33: alert diet. SystemStatusStrip and AlertRail die. StatusHeader is
// the micro status row, embedded by FleetHealthBand (board) and
// VesselCommandBand (inspector).
// ROUND 43: the three status items become DetailChips (the chip affordance
// pattern) — each a 1px hairline chip whose click opens a popover anchored to
// the chip, Esc / click-outside dismisses:
//   DATALINK {state} → per-vessel stale-feed breakdown
//   LAST SYNC {age}  → per-vessel sync ages
//   {alert counts}   → the alert sheet (lines, click → vessel)
// Line grammar (round 33): [LEVEL] tag in severity color · vessel name link ·
// message in plain ink.

import Link from 'next/link';
import { useFleet } from '../state/FleetProvider';
import { Glyph } from './Glyph';
import { DetailChip } from './DetailChip';
import { ALERT_TEXT_COLOR, FONT, NEUTRAL } from './probeTokens';
import { layer } from '../learn/layer'; // LEARN MODE — strip before demo week

function fmtAge(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (m < 60) return `${m}:${String(s).padStart(2, '0')} ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

const FEED_ABBREV: Record<string, string> = {
  weather: 'WX', position: 'POS', engines: 'ENG', tanks: 'TANK',
  flow: 'FLOW', status: 'STATUS', crew: 'CREW',
};

const LEVEL_RANK: Record<string, number> = { WARNING: 0, CAUTION: 1, ADVISORY: 2 };
const item: React.CSSProperties = { fontFamily: FONT.data, fontSize: 11, whiteSpace: 'nowrap' };
const popRow: React.CSSProperties = { fontFamily: FONT.data, fontSize: 12, lineHeight: 1.8, display: 'flex', justifyContent: 'space-between', gap: 16 };

export function StatusHeader() {
  const { fleet, simTime } = useFleet();
  if (!fleet || simTime === null) {
    return <span style={{ ...item, color: NEUTRAL.inkMuted }}>DATALINK —</span>;
  }

  // per-vessel stale feeds (the DATALINK popover's content)
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
  const oldestTs = Math.min(...fleet.flatMap((v) => Object.values(v.history.timestamps)));

  // per-vessel sync ages (the LAST SYNC popover's content)
  const syncAges = fleet
    .map((v) => ({ name: v.static.name, age: simTime - Math.min(...Object.values(v.history.timestamps)) }))
    .sort((a, b) => b.age - a.age);

  const counts = { WARNING: 0, CAUTION: 0, ADVISORY: 0 };
  for (const v of fleet) for (const a of v.alerts) counts[a.level]++;
  const countParts = (['WARNING', 'CAUTION', 'ADVISORY'] as const).filter((l) => counts[l] > 0);

  // alert lines: severity class first, then the fleet ranking score (alerts
  // carry no onset timestamp in the model — only the event log does)
  const lines = fleet
    .flatMap((v) => v.alerts.map((a) => ({ v, a })))
    .sort((x, y) =>
      LEVEL_RANK[x.a.level] - LEVEL_RANK[y.a.level]
      || Math.abs(y.v.derived.sustained_deviation) - Math.abs(x.v.derived.sustained_deviation));

  return (
    <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* DATALINK chip → per-vessel stale-feed breakdown */}
      <DetailChip
        label="datalink detail"
        align="left"
        attrs={layer('StatusHeader / datalink / datalink.chip', 'font/data 11 · ink/secondary | advisory when degraded · click → stale-feed breakdown', '{stale stream census → FRESH | DEGRADED | STALE}')}
        popover={
          <div>
            <div style={{ ...item, color: NEUTRAL.inkMuted, marginBottom: 6 }}>DATALINK · {datalink}</div>
            {staleEntries.length === 0 ? (
              <div style={{ ...popRow, color: NEUTRAL.inkSecondary }}>all streams fresh</div>
            ) : (
              staleEntries.map((s, i) => (
                <div key={`${s.vessel}-${s.feed}-${i}`} style={{ ...popRow, color: 'var(--color-alert-advisory)' }}>
                  <span>{s.vessel} · {s.feed}</span><span>{fmtFeedAge(s.age)} STALE</span>
                </div>
              ))
            )}
          </div>
        }
      >
        <span style={{ ...item, color: datalinkColor, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Glyph name="datalink" size={12} />DATALINK {datalink}
        </span>
      </DetailChip>

      {/* LAST SYNC chip → per-vessel sync ages */}
      <DetailChip
        label="last sync detail"
        align="left"
        attrs={layer('StatusHeader / sync / lastsync.chip', 'font/data 11 · ink/secondary · click → per-vessel sync ages', '{simTime − oldest stream timestamp}')}
        popover={
          <div>
            <div style={{ ...item, color: NEUTRAL.inkMuted, marginBottom: 6 }}>LAST SYNC · per vessel</div>
            {syncAges.map((s) => (
              <div key={s.name} style={{ ...popRow, color: NEUTRAL.inkSecondary }}>
                <span>{s.name}</span><span>{fmtAge(s.age)}</span>
              </div>
            ))}
          </div>
        }
      >
        <span style={{ ...item, color: NEUTRAL.inkSecondary }}>LAST SYNC {fmtAge(simTime - oldestTs)}</span>
      </DetailChip>

      {/* alert-count chip → the round-33 alert sheet */}
      <DetailChip
        label="active alerts"
        align="right"
        attrs={layer('StatusHeader / alerts / alertcount.chip', 'counts in severity colors · click → alert sheet (round 33)', '{fleet alert counts by level}')}
        popover={
          <div style={{ minWidth: 400 }}>
            {lines.length === 0 ? (
              <div style={{ ...item, color: NEUTRAL.inkMuted }}>no active alerts</div>
            ) : (
              lines.map(({ v, a }, i) => (
                <Link
                  key={`${v.static.id}-${a.code}-${i}`}
                  {...layer('StatusHeader / alerts / line.text', 'round-33 grammar: [LEVEL] tag = the one severity color · name accent link · message ink/secondary', '{alert.level · vessel.name → /vessel/id · alert.message}')}
                  href={`/vessel/${v.static.id}`}
                  style={{ display: 'block', textDecoration: 'none', fontFamily: FONT.data, fontSize: 12, lineHeight: 1.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <span style={{ color: ALERT_TEXT_COLOR[a.level] }}>[{a.level}]</span>{' '}
                  <span style={{ color: 'var(--color-accent-bright)', textDecoration: 'underline' }}>{v.static.name}</span>{' '}
                  <span style={{ color: NEUTRAL.inkSecondary }}>{a.message}</span>
                </Link>
              ))
            )}
          </div>
        }
      >
        <span style={{ ...item, color: NEUTRAL.inkSecondary, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Glyph name="alert-triangle" size={12} />
          {countParts.length === 0 ? (
            <span style={{ color: NEUTRAL.inkMuted }}>NO ALERTS</span>
          ) : (
            countParts.map((l, i) => (
              <span key={l}>{i > 0 && ' · '}<span style={{ color: ALERT_TEXT_COLOR[l] }}>{counts[l]} {l}</span></span>
            ))
          )}
        </span>
      </DetailChip>
    </span>
  );
}

/** Compact feed-age: "5H" / "45M". */
function fmtFeedAge(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  return h >= 1 ? `${h}H` : `${Math.max(1, Math.floor(ms / 60_000))}M`;
}
