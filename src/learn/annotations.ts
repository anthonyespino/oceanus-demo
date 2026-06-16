// LEARN MODE annotation copy (round 8) — public-safe, used as written.
// The only public derivative of Anthony's grounding document. This entire
// directory is stripped before demo week.

export interface Annotation {
  mark: '●' | '⚖' | '◐';
  desc: string;
  answers: string;
}

// ROUND 117 audit: pruned 13 ORPHANED entries whose Annotated name is no longer
// rendered anywhere (components removed / renamed / merged across the rebuild) —
// they pointed at dead elements. Removed: FleetTrend (→ FleetHealthBand), AlertRail,
// NominalRow, VesselSitrep, VesselHeader (→ command band), EfficiencyCurve (no longer
// Annotated), WeatherPanel (→ command-band weather), CrewPanel (→ CrewLogPanel),
// EngineCard (died round 31), TankSchematic (→ VesselSynoptic), FlowReconciliation
// (no longer Annotated), ModeTimeline + EventLog (merged into crew & log). Every entry
// below maps to a live `<Annotated name=…>`. Operator-facing copy only — no provenance.
export const ANNOTATIONS: Record<string, Annotation> = {
  SystemStatusStrip: { mark: '●', desc: "Reports the system's own data health: link state, worst staleness, alert counts", answers: 'can I trust what I’m seeing?' },
  // round 117: refreshed off the stale round-12 "trend" alias — the band is now the
  // whole-fleet summary line (census + mean + burn + arrivals/bunker).
  FleetHealthBand: { mark: '●', desc: 'Whole-fleet summary in one line: watch/nominal counts, 30-day mean deviation, fleet burn, arrivals and bunker flags', answers: 'which direction is the fleet drifting, and how many ships want attention?' },
  VesselCard: { mark: '●', desc: "One vessel's glanceable state: name, status, mode, trend, deviation, endurance", answers: 'is this ship fine, watched, or a problem?' },
  NauticalChart: { mark: '●', desc: 'Fleet positions on an instrument-grade chart with graticule, compass, scale, trails', answers: 'where is everyone, and is anyone somewhere unexpected?' },
  PortCallsTimeline: { mark: '●', desc: '72h arrivals board by port, with fuel-margin (BUNKER) flags', answers: 'who arrives where, and who needs fuel ordered?' },
  EfficiencyPanel: { mark: '●', desc: "Burn vs this vessel's own normal for its current mode, with 30/90d/1y trends", answers: 'how far off normal, fairly judged, and trending which way?' },
  RoutePanel: { mark: '●', desc: 'Voyage progress: origin to next port by distance covered', answers: 'is the plan being sailed?' },
  EngineTwinPanel: { mark: '●', desc: 'The two propulsion engines side by side; the gap between them rendered explicitly', answers: 'are the twins still twins?' },
  VesselSynoptic: { mark: '⚖', desc: 'Top-down hull schematic with tanks, engines, and flow drawn in place', answers: 'where does the fuel physically live and move?' },
  Contextual: { mark: '◐', desc: 'The single reveal mechanism for detail-on-demand', answers: 'what else is here?' },
  'FleetMap markers/cluster chips': { mark: '●', desc: 'Position dots that refuse to overlap; co-located vessels group and splay', answers: 'which dot is which?' },
};
