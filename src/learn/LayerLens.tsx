'use client';
// LEARN MODE v2 (round 35): the layer lens. In learn mode, hovering any
// element with a data-layer attribute shows LAYER / TOKENS / BINDS for the
// innermost instrumented ancestor (leaf beats region beats component — the
// component-level docent card yields via leafActive). Clicking copies the
// layer path to the clipboard for pasting into Figma's layer name field.
// STRIP BEFORE DEMO WEEK with src/learn/.

import { useEffect, useState } from 'react';
import { useLearn } from './LearnProvider';
import { useFleet } from '../state/FleetProvider'; // round 117: lens gated by its own dev toggle, not operator Learn

const CARD_W = 360;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback for denied clipboard permission
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function LayerLens() {
  // ROUND 117: the layer lens is a BUILDER/handoff provenance inspector, not an
  // operator feature. It is gated by its own D-panel toggle (`layerLens`), fully
  // decoupled from operator Learn — when the toggle is OFF, no LAYER/TOKENS/BINDS
  // overlay appears in ANY operator mode (including Learn). (Still coordinates with
  // the Learn IA card via iaHover/leafActive when a builder happens to run both.)
  const { setLeafActive, iaHover } = useLearn();
  const { layerLens } = useFleet();
  const [info, setInfo] = useState<{ path: string; tokens: string | null; binds: string | null; x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!layerLens) return;
    const over = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const el = t?.closest?.('[data-layer]') as Element | null;
      if (!el) { setInfo(null); setLeafActive(false); return; }
      const r = el.getBoundingClientRect();
      setInfo({
        path: el.getAttribute('data-layer')!,
        tokens: el.getAttribute('data-layer-tokens'),
        binds: el.getAttribute('data-layer-binds'),
        x: Math.min(Math.max(r.left, 8), window.innerWidth - CARD_W - 8),
        y: r.bottom,
      });
      setLeafActive(true);
    };
    const click = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const el = t?.closest?.('[data-layer]') as Element | null;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      const path = el.getAttribute('data-layer')!;
      void copyText(path).then((ok) => setToast(ok ? `copied — ${path}` : `COPY FAILED — ${path}`));
    };
    document.addEventListener('mouseover', over, true);
    document.addEventListener('click', click, true);
    return () => {
      document.removeEventListener('mouseover', over, true);
      document.removeEventListener('click', click, true);
      setInfo(null);
      setLeafActive(false);
    };
  }, [layerLens, setLeafActive]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  if (!layerLens) return null;
  const row = (k: string, v: string) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <span style={{ color: 'var(--color-ink-muted)', width: 52, flexShrink: 0, letterSpacing: 1 }}>{k}</span>
      <span style={{ color: 'var(--color-ink-primary)', minWidth: 0, overflowWrap: 'anywhere' }}>{v}</span>
    </div>
  );
  return (
    <>
      {/* round 92: yield to an open IA-node callout so exactly one Learn card
          shows at a time (click-to-copy still works regardless) */}
      {info && !iaHover && (
        <div style={{
          position: 'fixed', left: info.x, top: Math.min(info.y + 8, window.innerHeight - 110), width: CARD_W,
          zIndex: 66, pointerEvents: 'none',
          background: 'var(--color-surface-overlay)', border: '1px solid var(--color-accent-bright)',
          borderRadius: 1, padding: '8px 10px', // RADIUS token value
          fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)', lineHeight: 1.6,
        }}>
          {row('LAYER', info.path)}
          {info.tokens && row('TOKENS', info.tokens)}
          {info.binds && row('BINDS', info.binds)}
          <div style={{ color: 'var(--color-ink-muted)', marginTop: 2, fontSize: 'var(--type-micro)' }}>click — copy layer path</div>
        </div>
      )}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 48, left: '50%', transform: 'translateX(-50%)',
          zIndex: 71, background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-accent-bright)', borderRadius: 1, padding: '6px 14px', // RADIUS token value
          fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)', color: 'var(--color-ink-primary)',
          maxWidth: '70vw', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
