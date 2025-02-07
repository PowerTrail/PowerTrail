import { useState, useEffect } from 'react';
import { 
  fetchSubstations, 
  fetchWindFarms, 
  fetchSolarParks, 
  fetchTransmissionLines 
} from '@/utils/powerGridData';
import type { 
  Substation, 
  WindFarm, 
  SolarPark, 
  TransmissionLine 
} from '@/types/powerGrid';

export interface InfrastructureDataResponse {
  substations: Substation[];
  windFarms: WindFarm[];
  solarParks: SolarPark[];
  transmissionLines: TransmissionLine[];
}

export const useInfrastructureData = () => {
  const [data, setData] = useState<InfrastructureDataResponse>({
    substations: [],
    windFarms: [],
    solarParks: [],
    transmissionLines: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all infrastructure data in parallel
        const [substations, windFarms, solarParks, transmissionLines] = await Promise.all([
          fetchSubstations(),
          fetchWindFarms(),
          fetchSolarParks(),
          fetchTransmissionLines()
        ]);

        setData({
          substations,
          windFarms,
          solarParks,
          transmissionLines
        });
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};