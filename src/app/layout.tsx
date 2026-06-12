import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { FleetProvider } from '../state/FleetProvider';
import { LearnProvider } from '../learn/LearnProvider'; // LEARN MODE — strip before demo week
import { AppHeader, DevPanel } from '../components';

// Type system (round 26): Barlow = UI, IBM Plex Mono = data/numerals
// (tabular), D-DIN = display. Self-hosted woff2 (src/fonts/, OFL licenses
// committed) via next/font/local — zero-network builds.
const barlow = localFont({
  src: [
    { path: '../fonts/barlow-400.woff2', weight: '400' },
    { path: '../fonts/barlow-500.woff2', weight: '500' },
    { path: '../fonts/barlow-700.woff2', weight: '700' },
  ],
  variable: '--font-ui',
});
const plexMono = localFont({
  src: [
    { path: '../fonts/ibm-plex-mono-400.woff2', weight: '400' },
    { path: '../fonts/ibm-plex-mono-500.woff2', weight: '500' },
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
    <html lang="en" className={`${barlow.variable} ${plexMono.variable} ${dDin.variable}`}>
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
