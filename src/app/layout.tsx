import type { Metadata } from 'next';
import { DM_Sans, DM_Mono, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { FleetProvider } from '../state/FleetProvider';
import { LearnProvider } from '../learn/LearnProvider'; // LEARN MODE — strip before demo week
import { AppHeader, DevPanel } from '../components';

// Round 4 type system: DM Sans = UI, DM Mono = all data/numerals (tabular),
// Bebas Neue = display (vessel names, fleet band numeral).
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-ui' });
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-data' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Oceanus Fleet',
  description: 'Fleet fuel-efficiency monitoring for shore-side engineers',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${bebas.variable}`}>
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
