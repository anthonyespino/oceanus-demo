import type { Metadata } from 'next';
import './globals.css';
import { FleetProvider } from '../state/FleetProvider';
import { AppHeader } from '../components';

export const metadata: Metadata = {
  title: 'Oceanus Fleet — greybox',
  description: 'Greybox wireframe: information architecture prototype, not a design',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <FleetProvider>
          <AppHeader />
          {children}
        </FleetProvider>
      </body>
    </html>
  );
}
