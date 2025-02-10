// types/powerGrid.ts

export type VoltageLevel = '765kV' | '400kV' | '220kV' | '132kV' | '66kV';

export interface Substation {
  id: string;
  name: string;
  voltage_level: VoltageLevel;
  transformer_capacity: number;
  reliability_percentage: number;
  latitude: number;
  longitude: number;
  control_system?: string;
  peak_load?: number;
  feeders_count?: number;
  last_maintenance_date?: string;
  backup_systems?: string;
  safety_certification?: string;
  operational_status?: string;
}

export interface WindFarm {
  id: string;
  owner: string;
  village: string;
  substation: string;
  installed_capacity: number;
  latitude: number;
  longitude: number;
  turbine_count?: number;
  avg_wind_speed?: string;
  annual_generation?: string;
  commissioned_date?: string;
  maintenance_schedule?: string;
}

export interface SolarPark {
  id: string;
  name: string;
  total_capacity_dc: number;
  total_capacity_ac: number;
  latitude: number;
  longitude: number;
  connectivity_details?: {
    transformers?: string;
    mainLines?: string[];
  };
}

export interface TransmissionLine {
  id: string;
  name: string;
  type: string;
  voltage_level: VoltageLevel;
  length_ckm: number;
  circuit_type: string;
  from_latitude: number;
  from_longitude: number;
  to_latitude: number;
  to_longitude: number;
}

export interface MapFilters {
  showSubstations: boolean;
  showWindFarms: boolean;
  showSolarParks: boolean;
  showTransmissionLines: boolean;
  voltageLevel: string;
}

export type InfrastructureType = 'substation' | 'windFarm' | 'solarPark';