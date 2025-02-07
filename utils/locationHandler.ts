interface LocationData {
    name?: string;
    village?: string;
    district?: string;
    latitude?: number | null;
    longitude?: number | null;
  }
  
  // Default coordinates for major cities in Gujarat
  const defaultLocations: Record<string, [number, number]> = {
    'Ahmedabad': [23.0225, 72.5714],
    'Vadodara': [22.3072, 73.1812],
    'Surat': [21.1702, 72.8311],
    'Rajkot': [22.3039, 70.8022],
    'Bhavnagar': [21.7645, 72.1519],
    'Jamnagar': [22.4707, 70.0577],
    'Gandhinagar': [23.2156, 72.6369],
    'Bhuj': [23.2419, 69.6669],
    'Anand': [22.5645, 72.9289],
    'Bharuch': [21.7051, 72.9959],
    'Nadiad': [22.6916, 72.8634],
    'Porbandar': [21.6417, 69.6293],
    'Ankleshwar': [21.6266, 73.0017],
    'Vapi': [20.3893, 72.9106],
    'Navsari': [20.9467, 72.9520],
    'Morbi': [22.8252, 70.8374],
    'Surendranagar': [22.7400, 71.6480],
    'Godhra': [22.7788, 73.6143],
    'Palanpur': [24.1747, 72.4323],
    'Valsad': [20.5992, 72.9342]
  };
  
  // Function to get coordinates for a location
  export function getCoordinates(location: LocationData): [number, number] | null {
    // If we have direct coordinates, use them
    if (location.latitude && location.longitude) {
      return [location.latitude, location.longitude];
    }
  
    // Try to find coordinates based on name/village
    const locationName = location.name || location.village || '';
    
    // Check for city names in the location string
    for (const [city, coords] of Object.entries(defaultLocations)) {
      if (locationName.toLowerCase().includes(city.toLowerCase())) {
        return coords;
      }
    }
  
    // If we have a district, use its coordinates as fallback
    if (location.district && defaultLocations[location.district]) {
      return defaultLocations[location.district];
    }
  
    // Return null if no coordinates found
    return null;
  }
  
  // Function to check if a location has valid coordinates
  export function hasValidCoordinates(location: LocationData): boolean {
    return getCoordinates(location) !== null;
  }