import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './components/Providers';

// Force dynamic rendering to prevent context issues during static generation
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'History Time',
  description: 'Learn history by placing events on a timeline in the correct order',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
