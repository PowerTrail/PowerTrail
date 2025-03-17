'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Update the import path to match your folder structure exactly
const PowerGridMap = dynamic(
  () => import('@/components/PowerGridMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center">
        Loading map...
      </div>
    )
  }
);

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Power Grid Infrastructure</h1>
      <div className="flex-grow">
        <Suspense 
          fallback={
            <div className="h-full flex items-center justify-center">
              Loading map...
            </div>
          }
        >
          <PowerGridMap />
        </Suspense>
      </div>
    </main>
  );
}