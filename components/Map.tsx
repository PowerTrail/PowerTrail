import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity } from 'lucide-react';
import { getLineStyle } from '@/utils/lineStyles';
import { powerStationIcon, windFarmIcon, solarParkIcon } from '@/utils/customMarkers';
import { InfrastructurePopup } from './InfrastructurePopup';
import type { Substation, WindFarm, SolarPark, TransmissionLine, MapFilters } from '@/types/powerGrid';
import L from 'leaflet';

// Gujarat bounds with extra padding
const GUJARAT_BOUNDS = {
  minLat: 20.1,
  maxLat: 24.7,
  minLng: 68.1,
  maxLng: 74.4
};

const INITIAL_CENTER: [number, number] = [22.2587, 71.8924];

// Component to fix map display and fitting
function MapController() {
  const map = useMap();
  
  useEffect(() => {
    // Force map to resize and fit bounds
    setTimeout(() => {
      map.invalidateSize();
      
      // Fit map bounds to Gujarat region
      map.fitBounds([
        [GUJARAT_BOUNDS.minLat, GUJARAT_BOUNDS.minLng],
        [GUJARAT_BOUNDS.maxLat, GUJARAT_BOUNDS.maxLng]
      ]);
    }, 100);
    
    // Handle window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  return null;
}

// Component to add district labels
function EnhancedLabels() {
  const map = useMap();
  
  useEffect(() => {
    const mapLabels: L.Marker[] = [];
    
    // Only add district labels where needed
    const districts = [
      { name: 'KUTCH', position: [23.7, 69.8], size: 150 },
      { name: 'SAURASHTRA', position: [21.6, 70.5], size: 150 }
    ];
    
    districts.forEach(district => {
      const districtLabel = L.marker(district.position as L.LatLngExpression, {
        icon: L.divIcon({
          className: 'district-label',
          html: `<div class="text-gray-700 text-sm font-bold uppercase tracking-wide opacity-70">${district.name}</div>`,
          iconSize: [district.size, 20],
          iconAnchor: [district.size/2, 10]
        }),
        interactive: false,
        zIndexOffset: 900
      });
      
      districtLabel.addTo(map);
      mapLabels.push(districtLabel);
    });
    
    // Add state label
    const stateLabel = L.marker([22.9, 71.5] as L.LatLngExpression, {
      icon: L.divIcon({
        className: 'state-label',
        html: `<div class="text-gray-800 text-xl font-bold tracking-wider opacity-50">GUJARAT</div>`,
        iconSize: [200, 40],
        iconAnchor: [100, 20]
      }),
      interactive: false,
      zIndexOffset: 800
    });
    
    stateLabel.addTo(map);
    mapLabels.push(stateLabel);
    
    return () => {
      mapLabels.forEach(label => {
        map.removeLayer(label);
      });
    };
  }, [map]);
  
  return null;
}

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
  // Memoized filtered data
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
      center={INITIAL_CENTER}
      zoom={7}
      className="map-container"
      maxBounds={[
        [GUJARAT_BOUNDS.minLat - 2, GUJARAT_BOUNDS.minLng - 2],
        [GUJARAT_BOUNDS.maxLat + 2, GUJARAT_BOUNDS.maxLng + 2]
      ]}
      minZoom={6}
      maxZoom={12}
      boundsOptions={{ padding: [0, 0] }}
      maxBoundsViscosity={1.0}
      zoomControl={false}
    >
      <div className="leaflet-top leaflet-left" style={{ marginTop: '20px', marginLeft: '20px' }}>
        <div className="leaflet-control-zoom leaflet-bar leaflet-control">
          <a className="leaflet-control-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">+</a>
          <a className="leaflet-control-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">−</a>
        </div>
      </div>

      {/* Map controller to properly set the bounds */}
      <MapController />

      {/* Using CartoDB Voyager map */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
        noWrap={true}
      />
      
      <EnhancedLabels />
      
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