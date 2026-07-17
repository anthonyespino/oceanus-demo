# Glyph import — drawn glyphs drop in here

Export each drawn glyph from Figma as an individual SVG into this folder,
named **exactly per the atlas glyph name** + `.svg`:

```
wind.svg   route.svg   anchor.svg   crosshair.svg   gauge.svg
chart.fleet.svg   chart.trend.svg   chart.efficiency.svg   delta.svg   back.svg   …
```

(The full current list of glyph names is in `docs/LAYER_ATLAS_FIGMA.md` and the
`GlyphName` union in `src/components/Glyph.tsx`.)

Export requirements so size + tint inherit cleanly:
- **24×24 artboard** (matches the placeholder viewBox).
- Strokes/fills as **`currentColor`** (the primitive sets the color), 1.5px stroke to match the set.
- No outer `<svg>` styling that hardcodes a color — the build keeps only the inner markup.

On the next `npm run build`, `scripts/glyphs.ts` reads these files into
`src/components/glyphs.generated.ts` and the `Glyph` primitive uses them in
place of the placeholder paths. **Drop-in: no name changes, no atlas
regeneration** — the names already match, so every place that renders that
glyph (tiles, rail, headers, gauges) picks it up at once. Names with no SVG
here keep their placeholder pictogram.
