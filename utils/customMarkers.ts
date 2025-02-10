import L from 'leaflet';

const createIcon = (color: string) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 50], // Increased size
    iconAnchor: [15, 50], // Centering
    popupAnchor: [0, -45], // Adjust popup position
    shadowSize: [50, 50]
});

const markerStyles = `
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
`;

const wrapIcon = (svg: string, colorClass: string) => L.divIcon({
  html: `<div style="${markerStyles}" class="${colorClass}">${svg}</div>`,
  className: '',
  iconSize: [50, 50], // Increased size
  iconAnchor: [25, 25], // Center
});

// Substation Icon (Zap symbol)
export const powerStationIcon = wrapIcon(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
</svg>`, "text-yellow-500");

// Wind Farm Icon (Factory symbol)
export const windFarmIcon = wrapIcon(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
  <path d="M17 18h1"></path>
  <path d="M12 18h1"></path>
  <path d="M7 18h1"></path>
</svg>`, "text-blue-500");

// Solar Park Icon (Power symbol)
export const solarParkIcon = wrapIcon(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2v10"></path>
  <path d="M18.4 6.6a9 9 0 1 1-12.77.04"></path>
</svg>`, "text-green-500");
