import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/map'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Gujarat Power Infrastructure Map
        </h1>
        <MapComponent />
      </div>
    </div>
  );
}