'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Update the import path to match your folder structure exactly
const PowerGridMap = dynamic(
  () => import('@/components/PowerGridMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[700px] flex items-center justify-center">
        Loading map...
      </div>
    )
  }
);

export default function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Power Grid Infrastructure</h1>
      <Suspense 
        fallback={
          <div className="h-[700px] flex items-center justify-center">
            Loading map...
          </div>
        }
      >
        <PowerGridMap />
      </Suspense>
    </main>
  );
}