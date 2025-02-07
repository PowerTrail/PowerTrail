'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Factory, Zap, Gauge, Power, AlertTriangle } from 'lucide-react';
import { useInfrastructureData } from '@/hooks/useInfrastructureData';
import type { MapFilters } from '@/types/powerGrid';

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="h-[700px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )
});

export default function PowerGridMap() {
  const { data, loading, error } = useInfrastructureData();
  const [filters, setFilters] = React.useState<MapFilters>({
    showSubstations: true,
    showWindFarms: true,
    showSolarParks: true,
    showTransmissionLines: true,
    voltageLevel: 'all'
  });

  const filteredSubstations = React.useMemo(() => 
    data.substations.filter((sub: { voltage_level: string; }) => 
      filters.voltageLevel === 'all' || sub.voltage_level === filters.voltageLevel
    ),
    [data.substations, filters.voltageLevel]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[700px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[700px] text-red-500">
        <AlertTriangle className="w-6 h-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-6 md:col-span-1 bg-white/50 backdrop-blur-lg">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Gauge className="w-6 h-6" />
          Controls
        </h2>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg">Infrastructure Types</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={filters.showSubstations}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, showSubstations: !!checked }))
                  }
                />
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Substations ({filteredSubstations.length})
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={filters.showWindFarms}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, showWindFarms: !!checked }))
                  }
                />
                <Label className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-blue-500" />
                  Wind Farms ({data.windFarms.length})
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={filters.showSolarParks}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, showSolarParks: !!checked }))
                  }
                />
                <Label className="flex items-center gap-2">
                  <Power className="w-4 h-4 text-green-500" />
                  Solar Parks ({data.solarParks.length})
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-lg">Voltage Level</Label>
            <Select 
              value={filters.voltageLevel}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, voltageLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voltage level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voltages</SelectItem>
                <SelectItem value="765kV">765kV</SelectItem>
                <SelectItem value="400kV">400kV</SelectItem>
                <SelectItem value="220kV">220kV</SelectItem>
                <SelectItem value="132kV">132kV</SelectItem>
                <SelectItem value="66kV">66kV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="md:col-span-3 h-[700px] rounded-xl overflow-hidden">
        <Map 
          substations={filteredSubstations}
          windFarms={data.windFarms}
          solarParks={data.solarParks}
          transmissionLines={data.transmissionLines}
          filters={filters}
        />
      </div>
    </div>
  );
}