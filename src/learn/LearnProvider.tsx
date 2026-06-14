'use client';
// LEARN MODE (round 8) + EXPERT MODE (round 44). ONE mode state, three
// values — default / learn / expert — so the two are mutually exclusive by
// construction (toggling one leaves the other off). L toggles learn, E
// toggles expert; each badges itself loudly so neither sneaks into a demo.
// STRIP BEFORE DEMO WEEK: delete src/learn/ and the marked imports.

import { createContext, useContext, useEffect, useState } from 'react';
import { LayerLens } from './LayerLens'; // round 35: leaf hover cards + click-copy

export type UIMode = 'default' | 'learn' | 'expert';

const LearnContext = createContext<{
  mode: UIMode;
  setMode: (m: UIMode) => void;
  learnOn: boolean;
  expertOn: boolean;
  setLearnOn: (b: boolean) => void;
  setExpertOn: (b: boolean) => void;
  /** round 35: a leaf card is showing — component docent cards yield */
  leafActive: boolean;
  setLeafActive: (b: boolean) => void;
  /** round 92: an IA-node callout is open on hover — the layer lens yields so
      exactly one Learn card shows at a time (no stacking/overlap) */
  iaHover: boolean;
  setIaHover: (b: boolean) => void;
}>({
  mode: 'default',
  setMode: () => {},
  learnOn: false,
  expertOn: false,
  setLearnOn: () => {},
  setExpertOn: () => {},
  leafActive: false,
  setLeafActive: () => {},
  iaHover: false,
  setIaHover: () => {},
});

export function useLearn() {
  return useContext(LearnContext);
}

const badge: React.CSSProperties = {
  position: 'fixed', bottom: 12, zIndex: 70,
  fontFamily: 'var(--font-data)', fontSize: 'var(--type-context)', letterSpacing: 1.5,
  color: 'var(--color-accent-bright)', border: '1px solid var(--color-accent-bright)',
  background: 'var(--color-surface-raised)', borderRadius: 1, padding: '4px 10px',
};

export function LearnProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<UIMode>('default');
  const [leafActive, setLeafActive] = useState(false);
  const [iaHover, setIaHover] = useState(false);
  const learnOn = mode === 'learn';
  const expertOn = mode === 'expert';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (e.key === 'l' || e.key === 'L') setMode((m) => (m === 'learn' ? 'default' : 'learn'));
      if (e.key === 'e' || e.key === 'E') setMode((m) => (m === 'expert' ? 'default' : 'expert'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // compat shims for the dev panel (Row expects boolean toggles)
  const setLearnOn = (b: boolean) => setMode(b ? 'learn' : 'default');
  const setExpertOn = (b: boolean) => setMode(b ? 'expert' : 'default');

  return (
    <LearnContext.Provider value={{ mode, setMode, learnOn, expertOn, setLearnOn, setExpertOn, leafActive, setLeafActive, iaHover, setIaHover }}>
      {children}
      <LayerLens />
      {learnOn && (
        <div style={{ ...badge, left: 12 }}>LEARN MODE — interactions suppressed · hover anything · L to exit</div>
      )}
      {expertOn && (
        <div style={{ ...badge, right: 12 }}>EXPERT MODE — labels hidden · E to exit</div>
      )}
    </LearnContext.Provider>
  );
}
