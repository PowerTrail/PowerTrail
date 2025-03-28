import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import '@/styles/substation-explorer.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PowerTrail',
  description: 'Interactive map showing power infrastructure in Gujarat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        {children}
      </body>
    </html>
  );
}