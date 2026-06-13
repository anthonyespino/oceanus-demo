# Figma MCP Bridge — Sketchpad → Probe (one-way)

Round 40. Connects the Figma Dev Mode MCP server to Claude Code so the probe
can read Anthony's Sketchpad file and translate named layers into the
layout-probe build. **The bridge is one-way: Figma → code. Claude Code never
writes back to the Figma file.** The probe is a rendered preview; the file
stays Anthony's.

## Connection (verified 2026-06-13)

The official Figma MCP server is already connected through Claude and
**authenticates via OAuth on Anthony's own Figma account** (`whoami` →
Anthony Espino, pro/expert seat). The MCP tools take a `fileKey` and `nodeId`
directly — they read any file Anthony's account can open.

**No personal access token is stored.** The round-40 brief proposed a
PAT-in-`.env` flow; we deliberately do **not** use it:

1. Auth already works via the MCP server's OAuth — a PAT adds nothing.
2. This repo is **public**. A Figma token in the working tree is a standing
   secret-leak risk (one stray `git add -f` and it's on GitHub). The project
   rule is no secrets in this repo; the bridge honors it.

`.env*` is gitignored regardless, as defense in depth, but there is nothing to
put in it for Figma.

The only input the bridge needs is the **file key**, which is not a secret —
it's the `:fileKey` segment of the file URL:
`figma.com/design/:fileKey/:fileName?node-id=:nodeId`. Anthony pastes the
Sketchpad URL (or just the key) when he wants a scrape.

## The atlas, three ways

`scripts/atlas.ts` (npm `prebuild` hook — regenerates every build, can't drift):

- `docs/LAYER_ATLAS.md` — full per-component tree with tokens + bindings (the
  learn-mode reference).
- `docs/LAYER_ATLAS_FIGMA.md` — the **cheat sheet**: component → region → leaf,
  formatted as `role.kind → tokens · {binding}`. Anthony's "what can I name
  today" reference while sketching.
- `docs/atlas.json` — machine-readable index the scrape matches layer names
  against (path, component, region, leaf, tokens, binds, source file).

## Ad-hoc scrape workflow

Anthony sketches loosely, **names only what matters** (the top frame + the
leaves he changed — anything unnamed is ignored), then pings:

> `scrape {frame name}`

Claude Code then:

1. Reads that frame's layer tree via the MCP server
   (`get_metadata` for structure → `get_design_context` for the leaves that
   changed). Needs the file key (see above).
2. Matches each **named** layer against `docs/atlas.json`:
   - exact path match, or `region / role.kind` inside a component-named frame.
3. Reports back, **without applying**:
   - **Recognized + changed** — which bound leaves moved, and what changed
     (token, position, text string), as a proposed translation diff.
   - **Recognized + unchanged** — matched the current build, no action.
   - **Unrecognized** — named layers with no atlas binding: listed as
     "noted, no binding yet." These never block.
4. Anthony approves the diff; Claude Code applies it to the layout-probe build,
   re-verifies, and pushes. Unrecognized layers stay noted until a binding
   exists for them.

### Naming for a clean scrape

Match the cheat sheet. Inside a frame named for the component (e.g.
`FleetHealthBand`), name a layer `census / nominal.text` or the full
`FleetHealthBand / census / nominal.text`. Tokens and text are read from the
layer itself — the name only has to map it to a binding.

## Scope guardrails

- **Read-only.** Tools used: `get_metadata`, `get_design_context`,
  `get_screenshot`, `whoami`. Never `create_*`, `use_figma`, or any write tool
  against Anthony's file.
- **Approval-gated.** A scrape proposes a diff; it does not self-apply.
- **Probe-only.** Translations land on `layout-probe`, never `main`.
