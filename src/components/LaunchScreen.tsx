'use client';
// ROUND 137: startup launch screen — the ONLY place the full centered Oceanus mark appears.
// Shows ONCE on initial app mount: it lives in the persistent root layout, so client navigations
// (FleetView ↔ VesselInspector) and scenario switches (D-panel / FleetProvider state) — none of
// which remount the layout — can't re-trigger it. The board renders + runs UNDERNEATH from first
// paint; the veil is a full-viewport cover over the app base, so the board is already live when it
// clears (no second load, and the solid cover means no flash of the loading/empty state).
//
// ROUND 139: the mark FILLS like a glass of water while loading. The Oceanus mark is used as a
// static CSS MASK; behind it sits a dim "empty glass" fill, and a solid-white block that rises from
// translateY(100%) (below, empty) to translateY(0) (covering, full) — the mask clips it to the mark
// shape, so the white fills bottom-to-top. The rising block uses TRANSFORM (compositor-accelerated)
// NOT clip-path: clip-path transitions run on the main thread, which is slammed during the splash
// (WebGL sea + fleet gen + hydration), so a clip-path fill stalled to ~empty; a transform animates
// on the compositor thread, smooth under that load. It is a TIMED decorative fill synced to the
// splash (~1.5s), not bound to real load progress (the board is live in ~30ms underneath). Mark
// scaled down (round 139 max 190 → 140 max 150 → 142 max 120).
//
// ROUND 143: the whole VISUAL sequence is now pure CSS @keyframes (globals.css), running from FIRST
// PAINT (SSR) — NOT a JS rAF/state trigger. The earlier JS trigger got starved by the splash's busy
// main thread (rAF fired late), so the transform snapped to full instead of rising — you'd see a
// static grey mark, then it opened, never the fill. CSS transform/opacity animations run on the
// compositor thread regardless of main-thread load, so the fill reliably rises on startup. Sequence
// (~2.4s): veil covers solid → the mark fills bottom-up (1.5s) → holds → veil fades out (opacity,
// drops pointer-events) → JS unmounts the already-faded node (~2.7s). prefers-reduced-motion: no
// fill/fade — the mark shows solid (full), then cuts (~0.7s). CSS failsafe (round 141) still hides
// the veil at 4s if JS never unmounts.

import { useEffect, useState } from 'react';

// oceanus.logo.svg — single path, viewBox 0 0 100 101 (docs/glyphs-import).
const LOGO_PATH =
  'M11.9638 12.1161L0 24.2333V62.1603V100.088L37.2611 100.012C57.7542 99.9698 75.2566 99.6031 76.1542 99.1963C77.0517 98.7894 82.6458 93.4259 88.5847 87.277L99.3834 76.0987L99.676 39.9527C99.837 20.0732 99.7184 2.95043 99.4117 1.90385C98.8938 0.138165 96.1316 0 61.3911 0H23.9276L11.9638 12.1161ZM52.5594 19.8545C52.9184 24.1931 53.7453 29.575 54.3969 31.815L55.5828 35.8893L59.4046 34.2922C61.5065 33.4143 64.4906 31.7008 66.0365 30.4845C68.133 28.8363 69.21 28.5763 70.2772 29.463C71.4272 30.4171 70.9692 31.7258 67.948 36.1177C65.8799 39.1248 64.1871 42.0447 64.1871 42.6061C64.1871 44.4566 71.2977 46.6444 79.8292 47.4169C86.7113 48.0402 88.1615 48.4917 87.8863 49.9267C87.6317 51.2572 85.693 51.8425 79.7878 52.3712C75.5177 52.7531 70.2424 53.6539 68.0633 54.373C63.4353 55.9004 63.5343 57.6106 68.6552 64.6451C70.98 67.8381 71.4642 69.2677 70.5808 70.3316C69.6343 71.4718 68.5105 71.1421 64.891 68.6628C62.4094 66.9634 59.3034 65.2358 57.9881 64.8246C55.8841 64.1664 55.4457 64.6375 54.3371 68.7552C53.6441 71.3293 52.7618 76.6111 52.3767 80.4928C51.8686 85.6071 51.2137 87.6393 49.9963 87.8721C48.6538 88.13 48.0707 86.2424 47.0872 78.4486C45.5032 65.8962 44.4838 63.8727 40.5097 65.3838C38.8778 66.005 35.9992 67.6902 34.1116 69.1295C31.1895 71.3575 30.49 71.5153 29.3912 70.1913C28.3642 68.9543 28.6601 67.9023 30.8381 65.0465C32.3438 63.0731 34.0725 60.152 34.6795 58.556C35.6956 55.883 35.5085 55.5588 32.3057 54.4339C30.3942 53.7627 25.0362 52.9174 20.3984 52.5562C13.4184 52.0111 11.9671 51.577 11.9671 50.0333C11.9671 48.5298 13.3901 48.025 19.3105 47.4266C29.4869 46.3975 34.8133 44.6775 34.8133 42.4201C34.8133 41.4083 33.3751 38.4394 31.6181 35.8218C29.2334 32.272 27.9529 30.9741 28.8298 29.9177C29.7915 28.7591 31.0916 28.5099 32.5211 29.7632C33.4828 30.6064 36.3321 32.3329 38.8539 33.6003L43.4383 35.9056L44.647 33.6449C45.3128 32.4025 46.4084 27.0162 47.0829 21.6757C48.0685 13.8644 48.6592 11.9671 50.1073 11.9671C51.5553 11.9671 52.0329 13.5065 52.5594 19.8545Z';

// the mark as an alpha mask (white = visible) — clips the dim base + the rising white block.
const MASK_URL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 101"><path fill-rule="evenodd" clip-rule="evenodd" fill="#fff" d="${LOGO_PATH}"/></svg>`,
)}")`;

const MASK: React.CSSProperties = {
  WebkitMaskImage: MASK_URL, maskImage: MASK_URL,
  WebkitMaskSize: 'contain', maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center', maskPosition: 'center',
};

export function LaunchScreen() {
  const [shown, setShown] = useState(true);

  // The VISUAL sequence is pure CSS (globals.css `.launch-veil` / `.launch-fill`), running from
  // first paint (SSR) on the compositor thread — so the water-fill + fade are immune to the heavy
  // splash main-thread load (WebGL + fleet gen + hydration), which previously starved the JS-driven
  // trigger and made the fill snap instead of rise. JS only UNMOUNTS the (already CSS-faded) veil
  // after the sequence; reduced-motion cuts early.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setShown(false), reduced ? 700 : 2700);
    return () => clearTimeout(t);
  }, []);

  if (!shown) return null;
  return (
    <div
      className="launch-veil"
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        // ROUND 144: hex FALLBACK so the veil is dark from FIRST PAINT even before globals.css/@theme
        // loads (cold cache). Without it, the unresolved var → transparent bg → the browser's grey
        // showed through for the ~1s the CSS took to apply on a cold load ("grey screen till it opens").
        background: 'var(--color-surface-base, #101010)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* the mark, as a mask. The dim background = empty glass; the rising white block = water. */}
      <div
        role="img"
        aria-label="Oceanus"
        style={{
          position: 'relative', overflow: 'hidden',
          width: '11vw', maxWidth: 120, aspectRatio: '100 / 101',
          background: 'rgba(255,255,255,0.16)',
          ...MASK,
        }}
      >
        {/* ROUND 144: inline transform:translateY(100%) = the EMPTY base, so before globals.css's
            launch-water keyframe applies (cold cache) the block sits below the mark (empty glass)
            rather than defaulting to full white; the keyframe then overrides it to rise + hold full. */}
        <div className="launch-fill" style={{ position: 'absolute', inset: 0, background: '#ffffff', transform: 'translateY(100%)', willChange: 'transform' }} />
      </div>
    </div>
  );
}
