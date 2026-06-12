// Barrel: every component name in one place. These names are locked to
// DATA_MODEL.md §8 vocabulary; Anthony confirms or renames from Figma, so a
// rename pass should only touch this file plus mechanical references.

export { FleetView } from './FleetView';
export { FleetHealthBand } from './FleetHealthBand'; // ROUND 12: FleetTrend evolved + renamed (recorded for Figma library)
export { VesselCard } from './VesselCard';
export { VesselTile } from './VesselTile'; // LAYOUT PROBE only (branch: layout-probe)
export { FleetRail } from './FleetRail'; // LAYOUT PROBE only
export { VesselInspector } from './VesselInspector'; // LAYOUT PROBE only
export { NauticalChart } from './NauticalChart'; // LAYOUT PROBE only (chart core)
export { InspectorChart } from './InspectorChart'; // LAYOUT PROBE only
export { DataRow } from './DataRow'; // LAYOUT PROBE only (label-left / numeral-right primitive)
export { Stat } from './Stat'; // ROUND 4: instrument-stat primitive (label above numeral)
// ROUND 5 components:
export { EfficiencyCurve } from './EfficiencyCurve'; // inspector hero: burn-vs-speed envelope
export { SystemStatusStrip } from './SystemStatusStrip';
export { EventLog } from './EventLog';
export { DevPanel } from './DevPanel'; // probe toggles, press D
export { PortCallsTimeline } from './PortCallsTimeline'; // ROUND 6: 72h arrivals board (final probe component)
export { VesselSitrep } from './VesselSitrep'; // ROUND 7: reserved slot — designed in Figma, templated after
export { VoyagePanel } from './VoyagePanel'; // ROUND 21 A5: Environment+Route+Mode merged
export { Collapse } from './Collapse'; // ROUND 21 B3: collapsible panels
export { StateMark } from './StateMark'; // ROUND 21 B4: state silhouettes (trial)
export { FuelViewSwitch } from './FuelViewSwitch'; // ROUND 26: in-card fuel view switching
export { VesselSynoptic } from './VesselSynoptic'; // ROUND 7 addendum: top-down fuel synoptic (verdict 11)
export { Gauge } from './Gauge'; // ROUND 11: shared radial gauge primitive
export { TrendChartFill } from './TrendChartFill'; // ROUND 13: fill-parent tile trend chart
export { Glyph, Label } from './Glyph'; // ROUND 16: glyph contract (Figma icon library 1:1)
export { VesselCommandBand } from './VesselCommandBand'; // ROUND 27: VesselHeader + TelemetryBand merged (renames recorded for Figma)
export { InstrumentCluster } from './InstrumentCluster'; // ROUND 11: DP-console dials (verdict 13)
export { ReconChip } from './FlowReconciliation'; // ROUND 11: recon dissolved into fuel card header
export { FleetMap } from './FleetMap';
export { AlertRail } from './AlertRail';
export { VesselView } from './VesselView';
export { EfficiencyPanel } from './EfficiencyPanel';
export { EngineTwinPanel } from './EngineTwinPanel';
export { EngineCard } from './EngineCard';
export { TankSchematic } from './TankSchematic';
export { FlowReconciliation } from './FlowReconciliation';
export { WeatherPanel } from './WeatherPanel';
export { CrewPanel } from './CrewPanel';
export { RoutePanel } from './RoutePanel';
export { ModeTimeline } from './ModeTimeline';
export { Contextual } from './Contextual';
// Primitives not in the locked list (logged in PROGRESS.md):
export { Field, getDisposition } from './Field';
export { Sparkline } from './Sparkline';
export { LiveControls, AppHeader } from './LiveControls';
