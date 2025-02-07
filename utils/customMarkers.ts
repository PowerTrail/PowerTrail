// utils/customMarkers.ts
import L from 'leaflet';

const createIcon = (color: string) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Substation Icon (Zap symbol)
export const powerStationIcon = L.divIcon({
  html: `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background-color: #FFA500; border-radius: 50%; padding: 8px;">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Wind Farm Icon (Factory symbol)
export const windFarmIcon = L.divIcon({
  html: `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background-color: #3B82F6; border-radius: 50%; padding: 8px;">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Solar Park Icon (Power symbol)
export const solarParkIcon = L.divIcon({
  html: `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background-color: #10B981; border-radius: 50%; padding: 8px;">
      <path d="M12 2v20"/>
      <path d="M10 14l-2 2 2 2"/>
      <path d="M14 14l2 2-2 2"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});