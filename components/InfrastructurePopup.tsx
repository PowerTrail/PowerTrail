import { Activity, Battery, Calendar, Factory, Power, Shield, Zap } from 'lucide-react';
import type { Substation, WindFarm, SolarPark } from '@/types/powerGrid';

interface PopupProps {
  type: 'substation' | 'windFarm' | 'solarPark';
  data: Substation | WindFarm | SolarPark;
}

export function InfrastructurePopup({ type, data }: PopupProps) {
  if (type === 'substation') {
    const substation = data as Substation;
    return (
      <div className="p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          {substation.name}
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">Voltage:</span>
            <span>{substation.voltage_level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4 text-green-500" />
            <span className="font-semibold">Capacity:</span>
            <span>{substation.transformer_capacity} MVA</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="font-semibold">Reliability:</span>
            <span>{substation.reliability_percentage}%</span>
          </div>
          {substation.last_maintenance_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span className="font-semibold">Last Maintained:</span>
              <span>{substation.last_maintenance_date}</span>
            </div>
          )}
        </div>
        {substation.control_system && (
          <div className="mt-4 pt-4 border-t">
            <p className="font-semibold">Control System:</p>
            <p className="text-sm">{substation.control_system}</p>
          </div>
        )}
      </div>
    );
  }

  if (type === 'windFarm') {
    const farm = data as WindFarm;
    return (
      <div className="p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Factory className="w-5 h-5 text-blue-500" />
          {farm.owner}
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4 text-green-500" />
            <span className="font-semibold">Capacity:</span>
            <span>{farm.installed_capacity} MW</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">Village:</span>
            <span>{farm.village}</span>
          </div>
          {farm.village && (
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-purple-500" />
              <span className="font-semibold">Village:</span>
              <span>{farm.village}</span>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="font-semibold">Connected to:</p>
          <p className="text-sm">{farm.substation}</p>
        </div>
      </div>
    );
  }

  if (type === 'solarPark') {
    const park = data as SolarPark;
    return (
      <div className="p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Power className="w-5 h-5 text-green-500" />
          {park.name}
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">DC Capacity:</span>
            <span>{park.total_capacity_dc} MW</span>
          </div>
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4 text-green-500" />
            <span className="font-semibold">AC Capacity:</span>
            <span>{park.total_capacity_ac} MW</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}