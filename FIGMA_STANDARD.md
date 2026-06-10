# Figma File Standard — Oceanus Fleet Interface
### Anthony Espino · Structure, naming, and MCP-legibility rubric · v1

Three audiences, one standard:
1. **Me** — build fast without inventing names mid-flow
2. **The panel** — the layer tree itself demonstrates systems thinking when screen-shared
3. **Claude Code via Figma MCP** — structured reads map 1:1 onto the React codebase

Governing rule: **Figma is the design expression of the same system the code implements.** Same component names, same prop names, same token names. If a name exists in two places, it is the same name.

---

## 1. Page Structure

```
00 · Cover            — title, role framing, date, file standards legend (§7)
01 · Foundations      — color, type, spacing, elevation tokens as published styles/variables
02 · Components       — every component, organized by section per the React barrel
03 · Views            — FleetView and VesselView compositions (the deliverable renders)
04 · Demo Flow        — the §9 anomaly walk laid out as a sequence (presentation aid)
99 · Sandbox          — explorations, rejected directions (kept: shows process, clearly quarantined)
```

Numbered prefixes force order; the panel reads the file top-to-bottom like a document.

---

## 2. Component Naming

- **PascalCase, matching `src/components/index.ts` exactly, character for character:**
  `FleetView, VesselCard, FleetMap, AlertRail, VesselView, VesselHeader, EfficiencyPanel, EngineTwinPanel, EngineCard, TankSchematic, FlowReconciliation, WeatherPanel, CrewPanel, RoutePanel, ModeTimeline, Contextual`
- Sub-components that exist only inside a parent use a slash namespace: `VesselCard/Sparkline`, `TankSchematic/TankCell`. Slash groups them in the asset panel and signals containment.
- Rename rule: a rename happens in BOTH places in the same sitting (Figma + barrel file via Claude Code), or it doesn't happen. No drift, ever.

## 3. Variant & Property Naming = React Props

Variant properties are camelCase and match component props exactly:

```
VesselCard:   alert = none | advisory | caution | warning
              mode  = transit | station | standby | port
              compressed = true | false
EngineCard:   role = main | gen
              running = true | false
              revealed = true | false        ← Contextual state
Field:        disposition = visible | contextual | undefined
ModeTimeline: (single variant; data-driven)
```

- Boolean props are real Figma boolean properties, not "Yes/No" text variants.
- State that exists in code exists as a variant in Figma (alert levels, reveal states, stale). If the code can render it, the file can show it.
- Text layers that bind to data are named for the data field they carry: `{efficiency_delta}`, `{vessel_name}`, `{endurance_hours}` — curly braces flag "this is data, not copy." MCP reads these names; Claude Code maps them to registry fields with zero guessing.

## 4. Layer Naming Inside Components

- No default names survive. "Frame 427" or "Rectangle 12" anywhere in 01-04 is a defect.
- Structural layers: lowercase kebab slots — `header`, `body`, `meta`, `alert-strip`, `trend-block`. These describe role, not appearance ("amber-bar" is wrong; "alert-strip" is right — color is a token's job).
- Every container is Auto Layout. No absolutely-positioned children outside FleetMap's marker field. Auto Layout IS the flexbox the React build uses; matching structure means matching behavior.
- Decorative vector work gets flattened and named (`glyph-anchor`, `texture-grid`), never left as 30 loose paths.

## 5. Token Naming (Figma Variables ↔ Tailwind config)

One vocabulary, defined in Figma Variables, mirrored in `tailwind.config`:

```
color/surface/base · color/surface/raised · color/surface/overlay
color/ink/primary · color/ink/secondary · color/ink/muted
color/alert/warning · color/alert/caution · color/alert/advisory
color/mode/transit · color/mode/station · color/mode/standby · color/mode/port
color/data/nominal · color/data/stale
type/display · type/heading · type/label · type/data · type/micro
space/1..space/8 (4px base grid)
```

- Semantic only. No `color/yellow-500` at usage level — raw values live one layer down, referenced by semantic tokens.
- `type/data` is the numeric telemetry style (tabular figures ON — non-negotiable for streaming numbers that shouldn't jitter).
- No raw hex on any layer in 02-04. Every fill/stroke/text style references a variable. (This is also the single biggest MCP-legibility win: Claude Code reads variable names, not mystery hex.)

## 6. MCP-Legibility Checklist (run before each Claude Code styling session)

- [ ] All components published / up to date, no unsaved overrides on canvas instances
- [ ] No detached instances inside 03 Views (detach = invisible to the component graph)
- [ ] No layer named Frame*/Group*/Rectangle* in pages 01-04
- [ ] All colors/typography via variables & styles (zero raw hex audit)
- [ ] Variant property names spot-checked against the React barrel & props
- [ ] Views in 03 assembled ONLY from 02 components (no one-off local elements)

## 7. The Legend (what the panel sees)

On `00 · Cover`, one frame titled **File Standards** summarizing this document in ~8 lines:
naming = code names · variants = props · tokens = semantic, mirrored in Tailwind ·
data-bound text in {braces} · auto layout everywhere · sandbox quarantined.

Presentation line that goes with it: *"The file is structured so my design system and the codebase are the same system described twice — my AI pair-programmer reads this file through Figma's MCP server and maps it onto React with no interpretation step."* That sentence, to a panel of engineers who've never worked with a designer, is the whole pitch.

---

## Setup note: Figma MCP in Claude Code

The Dev Mode MCP server runs from the Figma desktop app (enable it in Figma's preferences), and Claude Code connects to it as a local MCP server. Exact config flags change; have Claude Code pull the current setup steps from Figma's official MCP docs at session start rather than trusting memory. Verify the connection by having Claude Code read back the component list from 02 and diff it against the barrel file — that diff check is also your ongoing drift alarm.
