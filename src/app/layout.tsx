import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { FleetProvider } from '../state/FleetProvider';
import { LearnProvider } from '../learn/LearnProvider'; // LEARN MODE — strip before demo week
import { AppHeader, DevPanel } from '../components';

// Type system: DM Sans = UI, DM Mono = all data/numerals (tabular), D-DIN =
// display (round 22 swap; Bebas removed from the repo). Self-hosted woff2
// (src/fonts/, OFL license committed) via next/font/local — zero-network
// builds.
const dmSans = localFont({
  src: [
    { path: '../fonts/dm-sans-400.woff2', weight: '400' },
    { path: '../fonts/dm-sans-500.woff2', weight: '500' },
    { path: '../fonts/dm-sans-700.woff2', weight: '700' },
  ],
  variable: '--font-ui',
});
const dmMono = localFont({
  src: [
    { path: '../fonts/dm-mono-400.woff2', weight: '400' },
    { path: '../fonts/dm-mono-500.woff2', weight: '500' },
  ],
  variable: '--font-data',
});
const dDin = localFont({
  src: [
    { path: '../fonts/d-din-400.woff2', weight: '400' },
    { path: '../fonts/d-din-700.woff2', weight: '700' },
  ],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Oceanus Fleet',
  description: 'Fleet fuel-efficiency monitoring for shore-side engineers',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${dDin.variable}`}>
      <body>
        <FleetProvider>
          <LearnProvider>
            <AppHeader />
            <DevPanel />
            {children}
          </LearnProvider>
        </FleetProvider>
      </body>
    </html>
  );
}
