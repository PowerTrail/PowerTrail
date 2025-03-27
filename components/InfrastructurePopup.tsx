import { useState } from "react";
import { Activity, Battery, Calendar, Factory, Power, Shield, Zap, Info, Settings, Gauge, Users, Box } from "lucide-react";
import type { Substation, WindFarm, SolarPark } from "@/types/powerGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubstationModelViewer } from "./SubstationModelViewer";
import { useRouter } from "next/navigation";

interface PopupProps {
  type: "substation" | "windFarm" | "solarPark";
  data: Substation | WindFarm | SolarPark;
}

// Function now only displays video
function Model3D({ videoUrl, className }: { videoUrl?: string; className?: string }) {
  return (
    <div className={cn("relative w-full space-y-4", className)}>
      {videoUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <video controls className="w-full h-full rounded-lg">
            <source src={'/videos/hehehe.mp4'} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

export function InfrastructurePopup({ type, data }: PopupProps) {
  const [substationViewerOpen, setSubstationViewerOpen] = useState(false);
  const router = useRouter();

  if (type === "substation") {
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
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Gauge className="w-4 h-4" /> 3dmodel
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

            <TabsContent value="video" className="mt-4">
              <Model3D videoUrl="\videos\hehehe.mp4" />
            </TabsContent>
          </Tabs>
        </div>

        <SubstationModelViewer isOpen={substationViewerOpen} onOpenChange={setSubstationViewerOpen} />
      </>
    );
  }

  if (type === "windFarm") {
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
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" /> 3D Model
            </TabsTrigger>
          </TabsList>
  
          {/* Info Section */}
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
  
          {/* Technical Details Section */}
          <TabsContent value="technical" className="mt-4">
            <div className="space-y-3">
              <TechnicalItem label="Connected to" value={farm.substation} />
              <TechnicalItem label="Annual Generation" value={farm.annual_generation} />
              <TechnicalItem label="Commissioned" value={farm.commissioned_date} />
              <TechnicalItem label="Maintenance" value={farm.maintenance_schedule} />
            </div>
          </TabsContent>
  
          {/* Video/3D Model Section */}
          <TabsContent value="video" className="mt-4">
            <Model3D videoUrl="/videos/hehehe.mp4" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  if (type === "solarPark") {
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
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" /> 3D Model
            </TabsTrigger>
          </TabsList>
  
          {/* Info Section */}
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
  
          {/* Technical Details Section */}
          <TabsContent value="technical" className="mt-4">
            <TechnicalItem label="Panel Type" value={park.panel_type} />
            <TechnicalItem label="Grid Connection" value={park.grid_connection} />
            <TechnicalItem label="Maintenance Schedule" value={park.maintenance_schedule} />
          </TabsContent>
  
          {/* Video/3D Model Section */}
          <TabsContent value="video" className="mt-4">
            <Model3D videoUrl="/videos/hehehe.mp4" />
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
