import { useState, useEffect, useRef } from 'react';
import { Activity, Battery, Calendar, Factory, Power, Shield, Zap, Info, Settings, Gauge, Users, Compass, Eye, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import type { Substation, WindFarm, SolarPark } from '@/types/powerGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PopupProps {
  type: 'substation' | 'windFarm' | 'solarPark';
  data: Substation | WindFarm | SolarPark;
}

const MODEL_CONFIGS = {
  substation: {
    url: "T:\INTERN\PowerTrail\a1b2.skp", // Replace with your model URL
    title: 'Electrical Substation 3D Model',
    supportsFPV: true // Set to true for your custom model
  },
  windFarm: {
    url: 'https://sketchfab.com/models/6c32b85f43424ed8be9d6404a231d85d/embed?autostart=1&ui_controls=1&ui_infos=1&ui_watermark=1',
    title: 'Wind Farm 3D Model',
    supportsFPV: false
  },
  solarPark: {
    url: 'https://sketchfab.com/models/5ad8541772a14b24a196878074aba4af/embed?autostart=1&ui_controls=1&ui_infos=1&ui_watermark=1',
    title: 'Solar Park 3D Model',
    supportsFPV: false
  }
};

interface IframeProps {
  type: keyof typeof MODEL_CONFIGS;
  className?: string;
  viewMode: 'standard' | 'first-person';
}

function Model3D({ type, className, viewMode }: IframeProps) {
  const config = MODEL_CONFIGS[type];
  const [isLoading, setIsLoading] = useState(true);
  
  // Modify URL based on viewMode for models that support FPV
  const modelUrl = () => {
    let url = config.url;
    if (config.supportsFPV && viewMode === 'first-person') {
      // Add first-person view parameters to your custom model URL
      // This will depend on your model platform's API (Sketchfab, etc.)
      url += url.includes('?') ? '&' : '?';
      url += 'fpv=1&auto_rotate=0&camera_mode=first_person';
    }
    return url;
  };

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
        src={modelUrl()}
        onLoad={() => setIsLoading(false)}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        frameBorder="0"
      />
    </div>
  );
}

function FirstPersonControls({ type }: { type: keyof typeof MODEL_CONFIGS }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  // Controls for navigation in first-person view
  const sendCommand = (command: string) => {
    if (iframeRef.current?.contentWindow) {
      // This would need to be customized based on your model viewer's API
      iframeRef.current.contentWindow.postMessage({
        action: 'navigate',
        direction: command
      }, '*');
    }
  };

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-500 mb-3">First-Person Navigation</h4>
      <div className="grid grid-cols-3 gap-2">
        <div></div>
        <Button size="sm" onClick={() => sendCommand('forward')} className="flex items-center justify-center">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div></div>
        
        <Button size="sm" onClick={() => sendCommand('left')} className="flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={() => sendCommand('down')} className="flex items-center justify-center">
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={() => sendCommand('right')} className="flex items-center justify-center">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function InfrastructurePopup({ type, data }: PopupProps) {
  const [viewMode, setViewMode] = useState<'standard' | 'first-person'>('standard');
  const supportsFirstPerson = MODEL_CONFIGS[type].supportsFPV;

  if (type === 'substation') {
    const substation = data as Substation;
    return (
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
            {supportsFirstPerson && (
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium">View Mode</h4>
                <div className="flex border rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('standard')}
                    className={cn(
                      "px-3 py-1 text-sm flex items-center gap-1",
                      viewMode === 'standard' ? "bg-blue-500 text-white" : "bg-gray-100"
                    )}
                  >
                    <Compass className="w-4 h-4" /> Standard
                  </button>
                  <button
                    onClick={() => setViewMode('first-person')}
                    className={cn(
                      "px-3 py-1 text-sm flex items-center gap-1",
                      viewMode === 'first-person' ? "bg-blue-500 text-white" : "bg-gray-100"
                    )}
                  >
                    <Eye className="w-4 h-4" /> First Person
                  </button>
                </div>
              </div>
            )}
            <Model3D type="substation" viewMode={viewMode} />
            {supportsFirstPerson && viewMode === 'first-person' && (
              <FirstPersonControls type="substation" />
            )}
          </TabsContent>
        </Tabs>
      </div>
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
            <Model3D type="windFarm" viewMode="standard" />
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
            <Model3D type="solarPark" viewMode="standard" />
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