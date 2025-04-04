import { useState } from 'react';
import { Activity, Battery, Calendar, Factory, Power, Shield, Zap, Info, Settings, Gauge, Users, Box } from 'lucide-react';
import type { Substation, WindFarm, SolarPark } from '@/types/powerGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SubstationModelViewer } from './SubstationModelViewer';
import { useRouter } from 'next/navigation';

interface PopupProps {
  type: 'substation' | 'windFarm' | 'solarPark';
  data: Substation | WindFarm | SolarPark;
}

const MODEL_CONFIGS = {
  substation: {
    url: 'https://sketchfab.com/models/1e9432d8baac4e169d93b78039cdcba3/embed?autostart=1&ui_controls=1&ui_infos=1&ui_watermark=1',
    title: 'Electrical Substation 3D Model'
  },
  windFarm: {
    url: 'https://sketchfab.com/models/6c32b85f43424ed8be9d6404a231d85d/embed?autostart=1&ui_controls=1&ui_infos=1&ui_watermark=1',
    title: 'Wind Farm 3D Model'
  },
  solarPark: {
    url: 'https://sketchfab.com/models/5ad8541772a14b24a196878074aba4af/embed?autostart=1&ui_controls=1&ui_infos=1&ui_watermark=1',
    title: 'Solar Park 3D Model'
  }
};

interface IframeProps {
  type: keyof typeof MODEL_CONFIGS;
  className?: string;
}

function Model3D({ type, className }: IframeProps) {
  const config = MODEL_CONFIGS[type];
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      )}
      <iframe
        title={config.title}
        className="absolute inset-0 w-full h-full"
        src={config.url}
        onLoad={() => setIsLoading(false)}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        frameBorder="0"
      />
    </div>
  );
}

export function InfrastructurePopup({ type, data }: PopupProps) {
  const [substationViewerOpen, setSubstationViewerOpen] = useState(false);
  const router = useRouter();

  if (type === 'substation') {
    const substation = data as Substation;
    return (
      <>
        <div className="p-4 min-w-[400px] max-w-[600px]">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Info className="w-4 h-4" /> Info
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Technical
              </TabsTrigger>
              <TabsTrigger value="3d" className="flex items-center gap-2">
                <Gauge className="w-4 h-4" /> 3D View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  {substation.name}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={<Battery className="text-blue-500" />} label="Voltage" value={substation.voltage_level} />
                  <InfoItem icon={<Power className="text-green-500" />} label="Capacity" value={`${substation.transformer_capacity} MVA`} />
                  <InfoItem icon={<Shield className="text-purple-500" />} label="Reliability" value={`${substation.reliability_percentage}%`} />
                  {substation.feeders_count && (
                    <InfoItem icon={<Users className="text-orange-500" />} label="Feeders" value={String(substation.feeders_count)} />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-4 space-y-4">
              <div className="space-y-3">
                <TechnicalItem label="Control System" value={substation.control_system} />
                <TechnicalItem label="Last Maintenance" value={substation.last_maintenance_date} />
                <TechnicalItem label="Backup Systems" value={substation.backup_systems} />
                <TechnicalItem label="Safety Rating" value={substation.safety_certification} />
                <TechnicalItem label="Status" value={substation.operational_status} />
              </div>
            </TabsContent>

            <TabsContent value="3d" className="mt-4">
  <div className="space-y-4">
    <div className="aspect-video bg-gradient-to-b from-gray-900 to-blue-900 rounded-lg flex items-center justify-center overflow-hidden group relative">
      {/* Animated background with flowing lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-blue-400 transform -translate-y-1/2" 
             style={{filter: 'blur(1px)', animation: 'flowRight 8s linear infinite'}}></div>
        <div className="absolute top-2/4 left-0 right-0 h-px bg-blue-300 transform -translate-y-1/2" 
             style={{filter: 'blur(1px)', animation: 'flowRight 12s linear infinite'}}></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-blue-200 transform -translate-y-1/2" 
             style={{filter: 'blur(1px)', animation: 'flowRight 10s linear infinite'}}></div>
      </div>
      
      <div className="text-center p-6 z-10 transition-transform duration-500 group-hover:scale-105">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-blue-500/30">
          <Box className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Interactive 3D Explorer</h3>
        <p className="text-blue-200 mb-6 max-w-md">
          Experience an immersive, interactive visualization of the substation components with detailed information and animations.
        </p>
        <Button 
          onClick={() => router.push('/immersive')} 
          className="bg-blue-600/80 hover:bg-blue-500 text-white backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
        >
          Launch Experience
        </Button>
      </div>
    </div>
  </div>
</TabsContent>
          </Tabs>
        </div>

        <SubstationModelViewer
          isOpen={substationViewerOpen}
          onOpenChange={setSubstationViewerOpen}
        />
      </>
    );
  }

  if (type === 'windFarm') {
    const farm = data as WindFarm;
    return (
      <div className="p-4 min-w-[400px] max-w-[600px]">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" /> Info
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Details
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" /> 3D View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Factory className="w-6 h-6 text-blue-500" />
                {farm.owner}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={<Power className="text-green-500" />} label="Capacity" value={`${farm.installed_capacity} MW`} />
                <InfoItem icon={<Activity className="text-blue-500" />} label="Village" value={farm.village} />
                {farm.turbine_count && (
                  <InfoItem icon={<Factory className="text-purple-500" />} label="Turbines" value={String(farm.turbine_count)} />
                )}
                {farm.avg_wind_speed && (
                  <InfoItem icon={<Gauge className="text-orange-500" />} label="Wind Speed" value={farm.avg_wind_speed} />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-4">
            <div className="space-y-3">
              <TechnicalItem label="Connected to" value={farm.substation} />
              <TechnicalItem label="Annual Generation" value={farm.annual_generation} />
              <TechnicalItem label="Commissioned" value={farm.commissioned_date} />
              <TechnicalItem label="Maintenance" value={farm.maintenance_schedule} />
            </div>
          </TabsContent>

          <TabsContent value="3d" className="mt-4">
            <Model3D type="windFarm" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (type === 'solarPark') {
    const park = data as SolarPark;
    return (
      <div className="p-4 min-w-[400px] max-w-[600px]">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" /> Info
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Details
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" /> 3D View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Power className="w-6 h-6 text-green-500" />
                {park.name}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={<Battery className="text-yellow-500" />} label="DC Capacity" value={`${park.total_capacity_dc} MW`} />
                <InfoItem icon={<Power className="text-green-500" />} label="AC Capacity" value={`${park.total_capacity_ac} MW`} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-4">
            <div className="space-y-3">
              {park.connectivity_details && (
                <TechnicalItem 
                  label="Connectivity" 
                  value={typeof park.connectivity_details === 'string' 
                    ? park.connectivity_details 
                    : JSON.stringify(park.connectivity_details, null, 2)
                  } 
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="3d" className="mt-4">
            <Model3D type="solarPark" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return null;
}

// Helper components for consistent styling
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
      {icon}
      <div>
        <span className="text-sm text-gray-500">{label}</span>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function TechnicalItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <span className="text-sm text-gray-500">{label}</span>
      <p className="font-medium whitespace-pre-wrap">{value}</p>
    </div>
  );
}

<style jsx global>{`
  @keyframes flowRight {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`}</style>