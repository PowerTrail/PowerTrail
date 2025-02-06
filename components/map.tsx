'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
import { Battery, Factory, Zap, Gauge, Calendar, Users, AlertTriangle, Activity, Cpu, Power, Shield } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom markers for different infrastructure types
const substationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const powerPlantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const discomIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Rest of the data constants remain the same
const substations = [
  {
    id: 1,
    name: 'Ahmedabad Substation',
    type: '400kV',
    position: [23.0225, 72.5714],
    details: {
      voltage: '400kV',
      transformerCapacity: '500 MVA',
      peakLoad: '420 MVA',
      feeders: 12,
      lastMaintenance: '2024-02-15',
      reliability: '99.9%',
      backupSystems: 'N-1 redundancy',
      controlSystem: 'SCADA',
      safety: 'ISO 45001 certified',
      operationalStatus: 'Fully operational',
      maintenanceSchedule: 'Quarterly',
      emergencyResponse: '24/7 team available'
    }
  },
  {
    id: 2,
    name: 'Vadodara Substation',
    type: '220kV',
    position: [22.3072, 73.1812],
    details: {
      voltage: '220kV',
      transformerCapacity: '300 MVA',
      peakLoad: '250 MVA',
      feeders: 8,
      lastMaintenance: '2024-03-01',
      reliability: '99.7%',
      backupSystems: 'Redundant transformers',
      controlSystem: 'Digital control system',
      safety: 'ISO 45001 certified',
      operationalStatus: 'Fully operational',
      maintenanceSchedule: 'Bi-monthly',
      emergencyResponse: 'On-call team'
    }
  },
  {
    id: 3,
    name: 'Surat Substation',
    type: '132kV',
    position: [21.1702, 72.8311],
    details: {
      voltage: '132kV',
      transformerCapacity: '150 MVA',
      peakLoad: '120 MVA',
      feeders: 6,
      lastMaintenance: '2024-03-10',
      reliability: '99.5%',
      backupSystems: 'Emergency generators',
      controlSystem: 'Automated switching',
      safety: 'ISO 45001 compliant',
      operationalStatus: 'Under maintenance',
      maintenanceSchedule: 'Monthly',
      emergencyResponse: 'Local team'
    }
  },
];

const powerPlants = [
  {
    id: 1,
    name: 'Kakrapar Nuclear Power Plant',
    type: 'Nuclear',
    position: [21.2437, 73.3502],
    details: {
      capacity: '2200 MW',
      units: 4,
      fuelType: 'Uranium',
      commissionDate: '1993',
      lastRefueling: '2024-01-15',
      safetyLevel: 'Level 7 (Maximum)',
      coolingSystem: 'Closed-cycle cooling',
      wasteManagement: 'On-site storage',
      efficiency: '91%',
      carbonEmissions: '0 tons/year',
      operationalStatus: 'Full capacity',
      employeeCount: '1200',
      certification: 'IAEA compliant'
    }
  },
  {
    id: 2,
    name: 'Ukai Thermal Power Plant',
    type: 'Thermal',
    position: [21.2505, 73.5933],
    details: {
      capacity: '1350 MW',
      units: 5,
      fuelType: 'Coal',
      commissionDate: '1975',
      efficiency: '85%',
      carbonEmissions: '2.5M tons/year',
      coalConsumption: '12000 tons/day',
      waterConsumption: '380000 m³/day',
      pollutionControl: 'ESP & FGD installed',
      operationalStatus: 'Partial capacity',
      employeeCount: '850',
      certification: 'ISO 14001:2015'
    }
  },
];

const discomAreas = [
  {
    id: 1,
    name: 'UGVCL',
    area: 'North Gujarat',
    position: [23.8500, 72.1200],
    details: {
      consumers: '3.8 million',
      coverage: '49,200 sq km',
      substations: '220',
      peakDemand: '3200 MW',
      reliability: '99.2%',
      smartMeters: '1.2 million',
      renewableShare: '25%',
      customerCare: '24/7',
      paymentChannels: 'Online, Mobile, Physical',
      employeeCount: '8500',
      operationalEfficiency: '92%',
      lastAudit: '2024-02'
    }
  },
  {
    id: 2,
    name: 'MGVCL',
    area: 'Central Gujarat',
    position: [22.4707, 73.2120],
    details: {
      consumers: '3.2 million',
      coverage: '23,800 sq km',
      substations: '180',
      peakDemand: '2800 MW',
      reliability: '99.4%',
      smartMeters: '900,000',
      renewableShare: '30%',
      customerCare: '24/7',
      paymentChannels: 'Online, Mobile, Physical',
      employeeCount: '7200',
      operationalEfficiency: '94%',
      lastAudit: '2024-01'
    }
  },
];

export default function MapComponent() {
  const [showSubstations, setShowSubstations] = useState(true);
  const [showPowerPlants, setShowPowerPlants] = useState(true);
  const [showDiscom, setShowDiscom] = useState(true);
  const [selectedVoltage, setSelectedVoltage] = useState('all');

  const filteredSubstations = substations.filter(
    (sub) => selectedVoltage === 'all' || sub.type === selectedVoltage
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-6 md:col-span-1 bg-white/50 backdrop-blur-lg border border-gray-200 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <Gauge className="w-6 h-6" />
          Controls
        </h2>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-lg text-gray-700">Infrastructure Types</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-white/80 p-3 rounded-lg">
                <Checkbox
                  id="substations"
                  checked={showSubstations}
                  onCheckedChange={setShowSubstations}
                />
                <label
                  htmlFor="substations"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Substations
                </label>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 p-3 rounded-lg">
                <Checkbox
                  id="powerplants"
                  checked={showPowerPlants}
                  onCheckedChange={setShowPowerPlants}
                />
                <label
                  htmlFor="powerplants"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Factory className="w-4 h-4 text-red-500" />
                  Power Plants
                </label>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 p-3 rounded-lg">
                <Checkbox
                  id="discom"
                  checked={showDiscom}
                  onCheckedChange={setShowDiscom}
                />
                <label
                  htmlFor="discom"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Power className="w-4 h-4 text-blue-500" />
                  DISCOM Areas
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-lg text-gray-700">Substation Voltage</Label>
            <Select value={selectedVoltage} onValueChange={setSelectedVoltage}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select voltage level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voltages</SelectItem>
                <SelectItem value="400kV">400kV</SelectItem>
                <SelectItem value="220kV">220kV</SelectItem>
                <SelectItem value="132kV">132kV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Legend */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Label className="text-lg text-gray-700">Legend</Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Substations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Power Plants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>DISCOM Areas</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="md:col-span-3 h-[700px] rounded-xl overflow-hidden shadow-xl border border-gray-200">
        <MapContainer
          center={[22.2587, 71.1924]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showSubstations &&
            filteredSubstations.map((substation) => (
              <Marker 
                key={substation.id} 
                position={substation.position}
                icon={substationIcon}
              >
                <Popup className="min-w-[300px]">
                  <div className="p-2">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      {substation.name}
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Battery className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">Capacity:</span>
                        </div>
                        <span>{substation.details.transformerCapacity}</span>
                        
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-green-500" />
                          <span className="font-semibold">Peak Load:</span>
                        </div>
                        <span>{substation.details.peakLoad}</span>
                        
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold">Reliability:</span>
                        </div>
                        <span>{substation.details.reliability}</span>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-red-500" />
                          <span className="font-semibold">Last Maintenance:</span>
                        </div>
                        <span>{substation.details.lastMaintenance}</span>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t">
                        <h4 className="font-semibold mb-1 flex items-center gap-1">
                          <Cpu className="w-4 h-4 text-indigo-500" />
                          Control System
                        </h4>
                        <p className="text-sm">{substation.details.controlSystem}</p>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <h4 className="font-semibold mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          Safety Status
                        </h4>
                        <p className="text-sm">{substation.details.safety}</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {showPowerPlants &&
            powerPlants.map((plant) => (
              <Marker 
                key={plant.id} 
                position={plant.position}
                icon={powerPlantIcon}
              >
                <Popup className="min-w-[300px]">
                  <div className="p-2">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Factory className="w-5 h-5 text-red-500" />
                      {plant.name}
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">Capacity:</span>
                        </div>
                        <span>{plant.details.capacity}</span>
                        
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-green-500" />
                          <span className="font-semibold">Efficiency:</span>
                        </div>
                        <span>{plant.details.efficiency}</span>
                        
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">Employees:</span>
                        </div>
                        <span>{plant.details.employeeCount}</span>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold">Commission Date:</span>
                        </div>
                        <span>{plant.details.commissionDate}</span>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t">
                        <h4 className="font-semibold mb-1">Technical Details</h4>
                        <p className="text-sm">
                          Fuel Type: {plant.details.fuelType}<br />
                          Units: {plant.details.units}
                        </p>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <h4 className="font-semibold mb-1">Environmental Impact</h4>
                        <p className="text-sm">
                          Carbon Emissions: {plant.details.carbonEmissions}
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {showDiscom &&
            discomAreas.map((discom) => (
              <Marker 
                key={discom.id} 
                position={discom.position}
                icon={discomIcon}
              >
                <Popup className="min-w-[300px]">
                  <div className="p-2">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Power className="w-5 h-5 text-blue-500" />
                      {discom.name}
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-semibold">Consumers:</span>
                        </div>
                        <span>{discom.details.consumers}</span>
                        
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">Peak Demand:</span>
                        </div>
                        <span>{discom.details.peakDemand}</span>
                        
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold">Reliability:</span>
                        </div>
                        <span>{discom.details.reliability}</span>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t">
                        <h4 className="font-semibold mb-1">Coverage Details</h4>
                        <p className="text-sm">
                          Area: {discom.details.coverage}<br />
                          Substations: {discom.details.substations}
                        </p>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <h4 className="font-semibold mb-1">Smart Infrastructure</h4>
                        <p className="text-sm">
                          Smart Meters: {discom.details.smartMeters}<br />
                          Renewable Share: {discom.details.renewableShare}
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}