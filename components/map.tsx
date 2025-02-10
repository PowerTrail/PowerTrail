import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity } from 'lucide-react';
import { getLineStyle } from '@/utils/lineStyles';
import { powerStationIcon, windFarmIcon, solarParkIcon } from '@/utils/customMarkers';
import { InfrastructurePopup } from './InfrastructurePopup';
import type { Substation, WindFarm, SolarPark, TransmissionLine, MapFilters } from '@/types/powerGrid';

// Gujarat bounds
const GUJARAT_BOUNDS = {
  minLat: 20.1,
  maxLat: 24.7,
  minLng: 68.1,
  maxLng: 74.4
};

interface MapComponentProps {
  substations: Substation[];
  windFarms: WindFarm[];
  solarParks: SolarPark[];
  transmissionLines: TransmissionLine[];
  filters: MapFilters;
}

export default function Map({
  substations,
  windFarms,
  solarParks,
  transmissionLines,
  filters
}: MapComponentProps) {
  // Memoized filtered and validated data
  const filteredSubstations = useMemo(() => 
    substations.filter(substation => 
      filters.showSubstations && 
      substation.latitude && 
      substation.longitude &&
      (filters.voltageLevel === 'all' || substation.voltage_level === filters.voltageLevel)
  ), [substations, filters]);

  const filteredWindFarms = useMemo(() => 
    windFarms.filter(farm => 
      filters.showWindFarms && 
      farm.latitude && 
      farm.longitude
  ), [windFarms, filters]);

  const filteredSolarParks = useMemo(() => 
    solarParks.filter(park => 
      filters.showSolarParks && 
      park.latitude && 
      park.longitude
  ), [solarParks, filters]);

  const filteredTransmissionLines = useMemo(() => 
    transmissionLines.filter(line => 
      filters.showTransmissionLines && 
      line.from_latitude && 
      line.from_longitude && 
      line.to_latitude && 
      line.to_longitude &&
      (filters.voltageLevel === 'all' || line.voltage_level === filters.voltageLevel)
  ), [transmissionLines, filters]);

  return (
    <MapContainer
      center={[22.2587, 71.1924]}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      // maxBounds={[
      //   [GUJARAT_BOUNDS.minLat, GUJARAT_BOUNDS.minLng],
      //   [GUJARAT_BOUNDS.maxLat, GUJARAT_BOUNDS.maxLng]
      // ]}
      minZoom={7}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {filteredSubstations.map(substation => (
        <Marker
          key={substation.id}
          position={[substation.latitude, substation.longitude]}
          icon={powerStationIcon}
        >
          <Popup maxWidth={500} minWidth={400}>
            <InfrastructurePopup type="substation" data={substation} />
          </Popup>
        </Marker>
      ))}

      {filteredWindFarms.map(farm => (
        <Marker
          key={farm.id}
          position={[farm.latitude, farm.longitude]}
          icon={windFarmIcon}
        >
          <Popup maxWidth={500} minWidth={400}>
            <InfrastructurePopup type="windFarm" data={farm} />
          </Popup>
        </Marker>
      ))}

      {filteredTransmissionLines.map(line => (
        <Polyline
          key={line.id}
          positions={[
            [line.from_latitude, line.from_longitude],
            [line.to_latitude, line.to_longitude]
          ]}
          pathOptions={getLineStyle(line.voltage_level)}
        >
          <Popup>
            <div className="p-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                {line.name}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <span className="font-semibold">Type:</span>
                <span>{line.type}</span>
                <span className="font-semibold">Voltage:</span>
                <span>{line.voltage_level}</span>
                <span className="font-semibold">Length:</span>
                <span>{line.length_ckm} CKm</span>
                <span className="font-semibold">Circuit:</span>
                <span>{line.circuit_type}</span>
              </div>
            </div>
          </Popup>
        </Polyline>
      ))}

      {filteredSolarParks.map(park => (
        <Marker
          key={park.id}
          position={[park.latitude, park.longitude]}
          icon={solarParkIcon}
        >
          <Popup maxWidth={500} minWidth={400}>
            <InfrastructurePopup type="solarPark" data={park} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}