// ROUND 89 — IA SYSTEM: the single shared data source.
//
// This is the ONE typed structure that both IA consumers read from:
//   1. the dedicated IA page  (src/app/ia/page.tsx → src/ia/IASystemMap.tsx)
//   2. Learn-mode live annotations (src/learn/Annotated.tsx, node-bound)
// No IA content is duplicated in either consumer — change a description HERE
// and both surfaces update. This file is permanent (NOT in src/learn/, so it
// survives the strip-before-demo of the Learn layer; the IA page is a real
// feature, Learn is the second consumer that happens to be dev-only).
//
// Four layers are modeled: NODES · HIERARCHY · PERSONAS · JOURNEYS, plus the
// PROCESS layer (rulings-with-receipts + tested-and-killed). Structure only
// this round — no behavior, no animation (deferred, round 89 scope guard).

// ─── type tiers (round 86 unified scale, single source in globals.css) ───────
export type IATier = 'display' | 'hero' | 'primary' | 'context' | 'micro';

export const TIER_LABEL: Record<IATier, string> = {
  display: 'DISPLAY · 24 / D-DIN 700',
  hero: 'HERO · 20 / Plex 500',
  primary: 'PRIMARY · 16',
  context: 'CONTEXT · 13',
  micro: 'MICRO · 10',
};

// ─── LAYER 1 · NODES (the component / data inventory) ────────────────────────
export type IANodeId =
  | 'vessel-tile'
  | 'command-gauges'
  | 'meter-strip'
  | 'fleet-health-band'
  | 'fleet-trend'
  | 'fleet-plot'
  | 'engine-twin'
  | 'fuel-synoptic'
  | 'voyage-bar'
  | 'status-cluster'
  | 'calm-sea';

export interface IARuling {
  round?: number; // round reference where one exists
  text: string;
}

export interface IANode {
  id: IANodeId;
  name: string; // human display name
  path: string; // naming-convention path (Figma / layer atlas)
  tier: IATier; // the headline type tier this node uses
  what: string; // what it is
  why: string; // why it exists
  rulings: IARuling[]; // the ruling(s) that produced it
}

export const IA_NODES: Record<IANodeId, IANode> = {
  'vessel-tile': {
    id: 'vessel-tile',
    name: 'Vessel Tile',
    path: 'VesselTile',
    tier: 'display',
    what: "A single vessel at a glance: name, status dot, mode glyph, 30d trend, sustained deviation, endurance, 24h signature.",
    why: 'The fleet board is fifteen of these. The operator scans tiles, not tables — one tile answers "is this ship fine, watched, or a problem?" at a glance.',
    rulings: [
      { round: 63, text: 'Layout matched to Figma; name in D-DIN display tier.' },
      { round: 66, text: 'Severity resolved to the meter strip — card border + name divider removed.' },
      { round: 70, text: 'Header band removed — separation by whitespace, not a fill-step or divider (outlines stay severity-reserved).' },
    ],
  },
  'command-gauges': {
    id: 'command-gauges',
    name: 'Command Gauges',
    path: 'VesselCommandBand / gaugeRail',
    tier: 'hero',
    what: 'Four analog gauges flanking the vessel identity: SPEED + BURN (left), EFF Δ + ENDURANCE (right). Caution bands are alert-backed.',
    why: 'The vessel header is an instrument panel. Gauges read posture pre-attentively; the caution arc only colors when an alert threshold is actually crossed.',
    rulings: [
      { round: 73, text: 'Gauges flank the center identity stack directly — instruments, not a label list.' },
      { round: 79, text: 'Gauges grown and clusters pulled inward to kill dead air; balance preserved.' },
    ],
  },
  'meter-strip': {
    id: 'meter-strip',
    name: 'Meter Strip',
    path: 'VesselTile / meter.strip',
    tier: 'context',
    what: 'The severity voice on a vessel tile: a single strip carrying the status color, plus the deviation value tint.',
    why: 'Severity needs exactly one home per surface. The strip is unmissable without bordering the whole card (which would read as chrome and compete with the name).',
    rulings: [
      { round: 66, text: 'Severity resolved to the STRIP — drop the card border and the name divider.' },
      { round: 37, text: 'Outlines reserved for severity; fills, not fences.' },
    ],
  },
  'fleet-health-band': {
    id: 'fleet-health-band',
    name: 'Fleet Health Band',
    path: 'FleetHealthBand',
    tier: 'hero',
    what: 'Whole-fleet summary strip: watch count, nominal count, 30d fleet-mean deviation, fleet burn, arrivals-24h, bunker flags.',
    why: 'Before reading any one ship, the operator wants the fleet in one line: which way is it drifting, and how many ships want attention?',
    rulings: [
      { round: 33, text: 'The standing ALERTS card is gone — the band’s count header summons the alert sheet on demand.' },
    ],
  },
  'fleet-trend': {
    id: 'fleet-trend',
    name: 'Fleet-Mean Trend',
    path: 'FleetHealthBand / mean / trend.chart',
    tier: 'context',
    what: "Fleet-wide MEAN efficiency delta vs each vessel's mode baseline — every vessel's daily efficiency_delta averaged across the fleet, drawn as a 7-day rolling mean over the selected span (default 90d; toggle 30d/90d/1y). Units: % deviation. The shaded band is the p10–p90 envelope; the headline value beside it is the 30-day mean.",
    why: "Read against ZERO: zero = the fleet burning as expected; ABOVE zero = collectively over-burning (up is worse). It is the me-problem-vs-everybody-problem check — a flat fleet mean with one tile spiking means isolate that vessel; the whole line drifting up means a fleet-wide cause (weather, fuel batch, policy), not one ship.",
    rulings: [
      { round: 109, text: 'Anchored to a zero reference line + span label so the line can never read as an unanchored wiggle (substantiation). Minimal in default, bare in Expert (operator competence), full meaning here in Learn.' },
    ],
  },
  'fleet-plot': {
    id: 'fleet-plot',
    name: 'Fleet Plot',
    path: 'FleetMap / NauticalChart',
    tier: 'context',
    what: 'Instrument-grade chart of fleet positions: graticule, compass, scale bar, non-overlapping position dots, FOLLOW + pan/zoom.',
    why: 'Position answers "is anyone somewhere unexpected?" The chart is honest — no invented coastline at the zoomed extent (better none than a fake one).',
    rulings: [
      { round: 84, text: 'Coastline omitted where the coarse LAND polygon would render a fake wedge in open water (substantiation).' },
      { round: 87, text: 'History track solid; forward projection dim + fading, only where speed/heading justify it.' },
      { round: 88, text: 'FOLLOW control is a bullseye/crosshair glyph; shows only when panned off-follow.' },
    ],
  },
  'engine-twin': {
    id: 'engine-twin',
    name: 'Engine Twin',
    path: 'EngineTwinPanel',
    tier: 'context',
    what: 'The two propulsion engines side by side, with the gap between them (EGT °F, fuel Δ at matched load) drawn explicitly.',
    why: 'The whole anomaly story lives here: twins should track. A sustained EGT/fuel divergence at matched load is the engine signature that survives the causal-bucket filter.',
    rulings: [
      { round: 3, text: 'EGT_DIVERGENCE interpolates the actual diverging engine_id — never hardcode "Engine 2".' },
      { round: 10, text: '30d daily-mean EGT overlay per engine — Engine 2 visibly climbs while Engine 1 stays flat.' },
    ],
  },
  'fuel-synoptic': {
    id: 'fuel-synoptic',
    name: 'Fuel Synoptic',
    path: 'VesselSynoptic',
    tier: 'context',
    what: 'Top-down hull schematic: storage → feeder → meter → engines drawn in place, with tank %, flow gph, and the RECON cross-check.',
    why: 'It answers where the fuel physically lives and moves, and whether the instruments agree. Disagreement (reconciliation) is shown, never hidden.',
    rulings: [
      { round: 89, text: 'Type audit — collapsed onto the unified scale (tank %/gph → context, node labels → micro). No orphan sizes.' },
    ],
  },
  'voyage-bar': {
    id: 'voyage-bar',
    name: 'Voyage Bar',
    path: 'VesselCommandBand / voyage',
    tier: 'context',
    what: 'Greyscale trip canvas: origin → destination, a marker at live progress %, current-position reference, and detail columns on a maximize toggle.',
    why: 'Progress against the plan, honestly: grey ahead, white covered, no fake forecast. Origin is the transit-run start, not "last port" (which would read 100%).',
    rulings: [
      { round: 81, text: 'Greyscale progress — WHITE covered / GREY remaining; blue removed.' },
      { round: 88, text: 'One maximize/minimize toggle (was two chevrons); marker labels flip left near 100% so they never overlap the destination.' },
    ],
  },
  'status-cluster': {
    id: 'status-cluster',
    name: 'Global Status Cluster',
    path: 'StatusHeader',
    tier: 'primary',
    what: 'The system’s own data health + consequence summary: DATALINK state, worst staleness (LAST SYNC), and CAUTION·ADVISORY counts.',
    why: 'Before trusting any datum, the operator must trust the link. "Can I trust what I’m seeing?" is a first-class question, so it earns a prominent, centered home.',
    rulings: [
      { round: 79, text: 'DATALINK breath animation breathes only when the link is LIVE; static when DEGRADED (the demo seed).' },
      { round: 89, text: 'Relocated centered below the fleet plot, above the thumbcards, promoted to PRIMARY; CAUTION·ADVISORY stay clickable.' },
    ],
  },
  'calm-sea': {
    id: 'calm-sea',
    name: 'Calm Sea',
    path: 'AmbientSea',
    tier: 'micro',
    what: 'A restrained WebGL ambient field behind the dashboard — a slow gradient with optional faint texture; persists across routes.',
    why: 'Presence without distraction: the sea is context, not a readout. Every form that read as a literal object (fish, birds, matrix rain) was cut.',
    rulings: [
      { round: 67, text: 'Smooth gradient, grain dropped.' },
      { round: 77, text: 'Particle/dot forms that read as fish or birds were cut; the mark was rebuilt to read as water.' },
      { round: 80, text: 'Defaults persisted: gradient mode, gentle amplitude, low texture brightness.' },
    ],
  },
};

// ─── BAND DESCRIPTORS (round 90) ─────────────────────────────────────────────
// The FleetHealthBand's small descriptor words (WATCH / NOMINAL / 30D FLEET
// MEAN / FLEET BURN / ARRIVALS 24H / BUNKER) become placeholder GLYPHS. Their
// names + meanings are authored HERE — the same single source the IA page and
// Learn annotations read. The band reads glyph + value by default; Learn mode
// surfaces the name from this map (no separate label store). `glyph` is a
// type-only reference to the library; Anthony refines which survive as glyphs.
import type { GlyphName } from '../components/Glyph';

export interface IADescriptor {
  id: string;
  glyph: GlyphName; // placeholder library glyph (greyscale/neutral)
  name: string; // the descriptor word shown in Learn mode
  meaning: string; // the full meaning (single source for tooltips / IA page)
}

export const IA_BAND_DESCRIPTORS: Record<string, IADescriptor> = {
  degraded: { id: 'degraded', glyph: 'alert-triangle', name: 'DEGRADED', meaning: 'vessels at worst severity (WARNING+).' },
  watch: { id: 'watch', glyph: 'gauge', name: 'WATCH', meaning: 'vessels in caution or worse — wants attention.' },
  nominal: { id: 'nominal', glyph: 'vessel', name: 'NOMINAL', meaning: 'vessels reading healthy; the affirmative all-clear.' },
  'fleet-mean': { id: 'fleet-mean', glyph: 'calendar', name: '30D FLEET MEAN', meaning: 'fleet-wide efficiency deviation, 30-day mean — never shown without the census beside it.' },
  'fleet-burn': { id: 'fleet-burn', glyph: 'fuel-drop', name: 'FLEET BURN', meaning: 'live total fuel burn across the fleet, gph.' },
  arrivals: { id: 'arrivals', glyph: 'anchor', name: 'ARRIVALS 24H', meaning: 'port calls scheduled in the next 24 hours.' },
  bunker: { id: 'bunker', glyph: 'tank', name: 'BUNKER', meaning: 'calls flagged to order fuel — endurance margin tight at ETA.' },
};

export function getBandDescriptor(id: string): IADescriptor | undefined {
  return IA_BAND_DESCRIPTORS[id];
}

// ROUND 105: the consequence-sort thesis is a Learn-layer DOCENT explanation, not
// permanent default chrome. It lives here (single source) and is surfaced inline
// with the global status bar ONLY in Learn mode (default stays clean). Same
// sort/receipt as IA_PROCESS['consequence-sort'], stated as a one-line docent.
export const IA_SORT_THESIS = 'ranked by sustained deviation — fleet ordered by consequence, not arrival';

// ROUND 103: distinct glyph meanings — Learn caught wave + endurance SHARING
// glyph.wave (a false association / substantiation violation). The two slots now
// depict different quantities and read distinctly from this single source:
//   · wave      = sea state (weather wave height)
//   · fuel-drop = fuel endurance (hours of fuel-time remaining) — NOT weather
// Consumed by the live elements' Learn `title` so the card/CommandBand expose the
// honest meaning per glyph.
export const IA_GLYPH_MEANING: Partial<Record<GlyphName, string>> = {
  // ROUND 112: the environmental cluster is three DIFFERENT things — make the
  // vocabulary distinction explicit (a real confusion): WIND moves air, WAVES are
  // the sea's surface height, CURRENT moves the water itself (and pushes the hull,
  // so the DP system burns to hold station against it).
  wind: 'Wind — air speed over the deck (kn). Not the water.',
  wave: 'Sea state — wave height, the height of the sea surface (ft).',
  current: 'Current — the water itself moving past the hull (speed kn + set direction). Drives station-keeping burn.',
  'fuel-drop': 'Fuel endurance — hours of fuel-time remaining (not weather).',
  // ROUND 104: calendar + pulse are a SPAN/INSTANT pair on the tile — the same
  // efficiency metric over two timeframes. The clock (time-of-day) was misleading
  // for a live reading; pulse depicts the current/live value honestly.
  calendar: 'Efficiency — 30-day sustained trend (the span).',
  pulse: 'Efficiency — current live reading, now (the instant).',
};

// ─── LAYER 2 · HIERARCHY (the Display Information Architecture Index) ─────────
export interface IAHierarchyNode {
  label: string;
  level: number; // 1..4
  node?: IANodeId; // links into IA_NODES when this is a real instrument
  detail?: string;
  children?: IAHierarchyNode[];
}

export const IA_HIERARCHY: IAHierarchyNode = {
  label: 'Oceanus Fleet (system)',
  level: 1,
  detail: 'Fleet fuel-efficiency monitoring for shore-side engineers.',
  children: [
    {
      label: 'Fleet View — the board (route /)',
      level: 2,
      detail: 'Level 1 disposition: the glanceable whole-fleet surface.',
      children: [
        { label: 'Fleet Health Band', level: 3, node: 'fleet-health-band' },
        { label: 'Fleet Plot', level: 3, node: 'fleet-plot' },
        { label: 'Global Status Cluster', level: 3, node: 'status-cluster' },
        {
          label: 'Vessel Tile (× fleet)',
          level: 3,
          node: 'vessel-tile',
          children: [{ label: 'Meter Strip', level: 4, node: 'meter-strip' }],
        },
      ],
    },
    {
      label: 'Vessel View — the inspector (route /vessel/[id])',
      level: 2,
      detail: 'Level 2 disposition: one vessel in depth, detail one interaction away.',
      children: [
        {
          label: 'Command Band',
          level: 3,
          detail: 'Sticky identity + instruments.',
          children: [
            { label: 'Command Gauges', level: 4, node: 'command-gauges' },
            { label: 'Voyage Bar', level: 4, node: 'voyage-bar' },
          ],
        },
        { label: 'Position Chart (Fleet Plot primitive)', level: 3, node: 'fleet-plot' },
        { label: 'Engine Twin', level: 3, node: 'engine-twin' },
        { label: 'Fuel Synoptic', level: 3, node: 'fuel-synoptic' },
      ],
    },
    {
      label: 'Ambient (cross-cutting)',
      level: 2,
      detail: 'Persists behind both views.',
      children: [{ label: 'Calm Sea', level: 3, node: 'calm-sea' }],
    },
  ],
};

// ─── LAYER 3 · PERSONAS ──────────────────────────────────────────────────────
export interface IAPersona {
  id: string;
  name: string;
  primary: boolean;
  goal: string;
  monitors: string[];
}

export const IA_PERSONAS: IAPersona[] = [
  {
    id: 'fuel-engineer',
    name: 'Shore-side fuel-monitoring engineer',
    primary: true,
    goal: 'Catch fuel-efficiency anomalies across the fleet before they cost bunker or become failures, and judge each ship fairly against its own normal.',
    monitors: ['per-vessel deviation vs mode baseline', 'engine-twin EGT / fuel divergence', 'fuel reconciliation', 'endurance vs next-port reserve'],
  },
  {
    id: 'ops-manager',
    name: 'Fleet operations manager',
    primary: false,
    goal: 'Keep the whole fleet in view and triage what wants attention first; coordinate port calls and bunkering.',
    monitors: ['fleet-mean trajectory', 'watch / alert counts', 'port-call timeline + bunker flags', 'arrivals 24h'],
  },
  {
    id: 'duty-watch',
    name: 'Duty watch-stander',
    primary: false,
    goal: 'Trust the data feed and escalate genuine alerts without chasing stale or noisy readings.',
    monitors: ['DATALINK state + staleness', 'active warnings / cautions', 'which datum is STALE'],
  },
];

// ─── LAYER 4 · JOURNEYS ──────────────────────────────────────────────────────
export interface IAJourneyStep {
  n: number;
  action: string;
  nodes: IANodeId[];
}
export interface IAJourney {
  id: string;
  title: string;
  persona: string; // persona id
  outcome: string;
  steps: IAJourneyStep[];
}

export const IA_JOURNEYS: IAJourney[] = [
  {
    id: 'anomaly-diagnosis',
    title: 'Anomaly diagnosis — the Meridian walkthrough',
    persona: 'fuel-engineer',
    outcome: 'Verdict: engine-side EGT divergence, not weather / loading / hull / speed. Bunker margin intact; flag for maintenance.',
    steps: [
      { n: 1, action: 'Open the fleet board. The consequence sort ranks the worst sustained deviation first — Meridian sits at the top, not because it arrives soonest but because it is the problem.', nodes: ['fleet-health-band', 'vessel-tile'] },
      { n: 2, action: 'Read Meridian’s tile: +14% sustained, the meter strip carrying caution, the 24h signature climbing.', nodes: ['vessel-tile', 'meter-strip'] },
      { n: 3, action: 'Open the vessel. Command gauges show EFF Δ in the caution band; the status cluster confirms the link is trustworthy enough to act on.', nodes: ['command-gauges', 'status-cluster'] },
      { n: 4, action: 'Drop into the engine twins. The two engines should track; Engine 2’s EGT has diverged and held for weeks at matched load.', nodes: ['engine-twin'] },
      { n: 5, action: 'Read the causal buckets clean: weather is nominal, loading normal, hull/speed in envelope — only the engine signature survives.', nodes: ['engine-twin', 'fuel-synoptic'] },
      { n: 6, action: 'Cross-check fuel reconciliation and endurance: instruments agree, bunker margin intact. Verdict is engine-side; flag for maintenance.', nodes: ['fuel-synoptic', 'voyage-bar'] },
    ],
  },
];

// ─── PROCESS LAYER · rulings-with-receipts + tested-and-killed ────────────────
export interface IARulingReceipt {
  id: string;
  title: string;
  decision: string; // what was ruled
  receipt: string; // the evidence that earns it
  killed?: string; // what was tested and cut
  rounds?: number[];
}

export const IA_PROCESS: IARulingReceipt[] = [
  {
    id: 'consequence-sort',
    title: 'Consequence sort over ETA',
    decision: 'Rank the board by consequence: alerted ships pinned top, then by absolute sustained deviation; idle dimmed. Magnitude is the consequence (+3% and −3% both warrant a look); sign is the diagnosis.',
    receipt: 'Meridian surfaces top because it is the problem. ETA, alphabetical, and data-order were all rejected as sort keys — the deck is banked by consequence, not arrival.',
    killed: 'ETA / alphabetical / data-order sort keys.',
    rounds: [71, 72],
  },
  {
    id: 'sort-bug',
    title: 'The sort bug (within-tier tiebreaker)',
    decision: 'Within a tier, sort by the SAME |trend_30d| the tile shows the operator — not by a hidden weighted score.',
    receipt: 'The round-21 comparator pinned the right tiers but broke the within-tier order by ranking on a HIDDEN sustained_deviation score that diverged from the displayed deviation, so the rendered order didn’t match what the operator read. Re-keyed to the visible value; the hidden field is retired as the sort key (still computed, unused).',
    rounds: [71, 72],
  },
  {
    id: 'severity-on-strip',
    title: 'Severity on the strip',
    decision: 'Severity gets exactly one home per surface — the meter strip plus the name/value tint — never a card border.',
    receipt: 'A bordered card read as functionless chrome and competed with the name for focus; the strip is unmissable without fencing the whole tile.',
    killed: 'Card border + name divider (round 63 → removed round 66/70).',
    rounds: [66, 70],
  },
  {
    id: 'borderless-fills',
    title: 'Fills, not fences',
    decision: 'Section cards are FILLED surfaces with no stroke; outlines survive only for selection, severity, and hairline dividers.',
    receipt: 'Borders everywhere turned the dashboard into a grid of boxes; filled surfaces group content without caging it, and reserve the outline as a severity signal.',
    killed: 'Fence-style bordered cards.',
    rounds: [37],
  },
  {
    id: 'substantiation',
    title: 'Substantiation — no fake data',
    decision: 'Draw only what the data justifies: omit the coastline where the polygon is fake, project a track forward only where speed/heading support it.',
    receipt: 'The coarse LAND polygon rendered a sharp wedge in open water at the inspector zoom — better no coastline than a false one. A holding vessel (≈ 0 kn) draws NO forward projection; a transiting one does.',
    killed: 'Fake coastline wedge; confident forward line for a stationary vessel.',
    rounds: [84, 87],
  },
  {
    id: 'type-collapse',
    title: 'The type-system collapse',
    decision: 'One unified five-tier scale (DISPLAY / HERO / PRIMARY / CONTEXT / MICRO) as CSS custom properties — a single source of truth. No orphan sizes.',
    receipt: 'Ad-hoc font sizes had accreted across components; an audit collapsed them to five tiers in globals.css and deleted the old probeTokens TYPE object. Every later round reuses a tier rather than inventing one.',
    killed: 'Scattered orphan font sizes; the probeTokens TYPE object.',
    rounds: [85, 86],
  },
  {
    id: 'water-cuts',
    title: 'The Calm Sea cuts',
    decision: 'The ambient sea is restrained context — a slow gradient with optional faint texture. Anything that reads as a literal object is cut.',
    receipt: 'Iterations that rendered as grain, fish, birds, or matrix rain all pulled the eye away from the data. The sea must say "water, calmly" and nothing more.',
    killed: 'Grain; particle/dot forms reading as fish/birds; dot-matrix rain.',
    rounds: [67, 74, 75, 76, 77],
  },
];

// ─── accessors (both consumers read through the model, never hardcode) ────────
export function getIANode(id: IANodeId): IANode {
  return IA_NODES[id];
}
