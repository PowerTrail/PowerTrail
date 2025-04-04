'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the ImmersiveSubstationExplorer component
const ImmersiveSubstationExplorer = dynamic(
  () => import('@/components/ImmersiveSubstationExplorer'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-xl">Loading immersive experience...</div>
        </div>
      </div>
    )
  }
);

export default function ImmersivePage() {
  return (
    <div className="h-screen w-full bg-black">
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-black text-white">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-xl">Loading immersive experience...</div>
          </div>
        </div>
      }>
        <ImmersiveSubstationExplorer />
      </Suspense>
    </div>
  );
}