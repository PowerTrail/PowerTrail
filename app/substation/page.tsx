'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the SubstationExplorer component to avoid SSR issues with THREE.js
const SubstationExplorer = dynamic(
  () => import('@/components/SubstationExplorer'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-xl">Loading 3D models...</div>
        </div>
      </div>
    )
  }
);

export default function SubstationPage() {
  return (
    <div className="h-screen w-full">
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-black text-white">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-xl">Loading 3D models...</div>
          </div>
        </div>
      }>
        <SubstationExplorer />
      </Suspense>
    </div>
  );
}