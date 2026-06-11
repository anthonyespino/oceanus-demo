'use client';
// LEARN MODE (round 8): docent overlay provider. Toggled by "L" or the dev
// panel; badges itself loudly on screen so it can never sneak into a demo.
// STRIP BEFORE DEMO WEEK: delete src/learn/ and the <Annotated>/useLearn
// imports — nothing else depends on this directory.

import { createContext, useContext, useEffect, useState } from 'react';

const LearnContext = createContext<{ learnOn: boolean; setLearnOn: (b: boolean) => void }>({
  learnOn: false,
  setLearnOn: () => {},
});

export function useLearn() {
  return useContext(LearnContext);
}

export function LearnProvider({ children }: { children: React.ReactNode }) {
  const [learnOn, setLearnOn] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (e.key === 'l' || e.key === 'L') setLearnOn((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <LearnContext.Provider value={{ learnOn, setLearnOn }}>
      {children}
      {learnOn && (
        <div
          style={{
            position: 'fixed',
            bottom: 12,
            left: 12,
            zIndex: 70,
            fontFamily: 'var(--font-data)',
            fontSize: 11,
            letterSpacing: 1.5,
            color: 'var(--color-accent-bright)',
            border: '1px solid var(--color-accent-bright)',
            background: 'var(--color-surface-raised)',
            borderRadius: 6,
            padding: '4px 10px',
          }}
        >
          LEARN MODE — interactions suppressed · hover anything · L to exit
        </div>
      )}
    </LearnContext.Provider>
  );
}
