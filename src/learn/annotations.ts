// LEARN MODE annotation copy (round 8) — public-safe, used as written.
// The only public derivative of Anthony's grounding document. This entire
// directory is stripped before demo week.

export interface Annotation {
  mark: '●' | '⚖' | '◐';
  desc: string;
  answers: string;
}

export const ANNOTATIONS: Record<string, Annotation> = {
  SystemStatusStrip: { mark: '●', desc: "Reports the system's own data health: link state, worst staleness, alert counts", answers: 'can I trust what I’m seeing?' },
  FleetTrend: { mark: '●', desc: 'Whole-fleet efficiency trajectory vs baselines, smoothed', answers: 'which direction is the fleet drifting?' },
  AlertRail: { mark: '●', desc: 'Active warnings/cautions fleet-wide, one line each, linked to vessels', answers: 'what formally wants attention?' },
  VesselCard: { mark: '●', desc: "One vessel's glanceable state: name, status, mode, trend, deviation, endurance", answers: 'is this ship fine, watched, or a problem?' },
  NominalRow: { mark: '●', desc: 'Healthy vessels compressed into one expandable line', answers: 'is everyone else okay?' },
  NauticalChart: { mark: '●', desc: 'Fleet positions on an instrument-grade chart with graticule, compass, scale, trails', answers: 'where is everyone, and is anyone somewhere unexpected?' },
  PortCallsTimeline: { mark: '●', desc: '72h arrivals board by port, with fuel-margin (BUNKER) flags', answers: 'who arrives where, and who needs fuel ordered?' },
  VesselSitrep: { mark: '●', desc: 'Two-register summary: coded line for the trained eye, plain sentence assembled from live data', answers: 'tell me this ship in one breath?' },
  VesselHeader: { mark: '●', desc: "Identity card: name, mode, relative position, next port, crew, endurance", answers: "who is this and what's its situation?" },
  EfficiencyPanel: { mark: '●', desc: "Burn vs this vessel's own normal for its current mode, with 30/90d/1y trends", answers: 'how far off normal, fairly judged, and trending which way?' },
  EfficiencyCurve: { mark: '●', desc: 'Burn-vs-speed envelope from 12mo of history with live operating point', answers: 'is right now normal for this speed?' },
  WeatherPanel: { mark: '●', desc: 'Wind and sea state, with explicit STALE handling', answers: 'does the environment explain the burn?' },
  RoutePanel: { mark: '●', desc: 'Voyage progress: last port to next port by distance covered', answers: 'is the plan being sailed?' },
  CrewPanel: { mark: '●', desc: 'Who is aboard and since when; rotation markers on trends', answers: 'did the people change when the numbers changed?' },
  EngineTwinPanel: { mark: '●', desc: 'The two propulsion engines side by side; the gap between them rendered explicitly', answers: 'are the twins still twins?' },
  EngineCard: { mark: '●', desc: 'One engine: role, running, load, fuel rate; deeper sensors on reveal', answers: "who's working, how hard, at what cost?" },
  VesselSynoptic: { mark: '⚖', desc: 'Top-down hull schematic with tanks, engines, and flow drawn in place', answers: 'where does the fuel physically live and move?' },
  TankSchematic: { mark: '⚖', desc: 'The same fuel chain as linked gauges: storage → feeder → meter → engines', answers: 'how much fuel, where, and do the measurements agree?' },
  FlowReconciliation: { mark: '●', desc: 'Cross-check between tanks, meter, and engines; disagreement shown, never hidden', answers: 'do my instruments agree with each other?' },
  ModeTimeline: { mark: '●', desc: 'The last 24h as mode segments', answers: 'what kind of day has this ship had?' },
  EventLog: { mark: '●', desc: 'Real recorded events, terminal-style, newest first', answers: 'what happened and when?' },
  Contextual: { mark: '◐', desc: 'The single reveal mechanism for detail-on-demand', answers: 'what else is here?' },
  'FleetMap markers/cluster chips': { mark: '●', desc: 'Position dots that refuse to overlap; co-located vessels group and splay', answers: 'which dot is which?' },
};
