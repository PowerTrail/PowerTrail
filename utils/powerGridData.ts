import { supabase } from '@/lib/supabase';
import type { 
  Substation, 
  WindFarm, 
  SolarPark, 
  TransmissionLine 
} from '@/types/powerGrid';

export async function fetchSubstations() {
  const { data, error } = await supabase
    .from('substations')
    .select('*');
  
  if (error) {
    console.error('Error fetching substations:', error);
    return [];
  }
  
  return data as Substation[];
}

export async function fetchWindFarms() {
  const { data, error } = await supabase
    .from('wind_farms')
    .select('*');
  
  if (error) {
    console.error('Error fetching wind farms:', error);
    return [];
  }
  
  return data as WindFarm[];
}

export async function fetchSolarParks() {
  const { data, error } = await supabase
    .from('solar_parks')
    .select('*');
  
  if (error) {
    console.error('Error fetching solar parks:', error);
    return [];
  }
  
  return data as SolarPark[];
}

export async function fetchTransmissionLines() {
  const { data, error } = await supabase
    .from('transmission_lines')
    .select('*');
  
  if (error) {
    console.error('Error fetching transmission lines:', error);
    return [];
  }
  
  return data as TransmissionLine[];
}

export function getVoltageColor(voltage: string): string {
  if (voltage.includes('765')) return '#FF0000';
  if (voltage.includes('400')) return '#00FF00';
  if (voltage.includes('220')) return '#0000FF';
  if (voltage.includes('132')) return '#800080';
  return '#FFA500'; // Default for 66kV and others
}