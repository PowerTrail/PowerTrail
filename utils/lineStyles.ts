// utils/lineStyles.ts
import { VoltageLevel } from '@/types/powerGrid';
import { PathOptions } from 'leaflet';

export interface LineStyle extends Omit<PathOptions, 'dashArray'> {
  color: string;
  weight: number;
  dashArray?: string | number[] | undefined;
}

export const lineStyles: Record<VoltageLevel, LineStyle> = {
  '765kV': { color: '#FF0000', weight: 3, dashArray: undefined },
  '400kV': { color: '#00FF00', weight: 3, dashArray: undefined },
  '220kV': { color: '#0000FF', weight: 2, dashArray: undefined },
  '132kV': { color: '#800080', weight: 2, dashArray: '5,5' },
  '66kV': { color: '#000000', weight: 1, dashArray: '2,2' }
};

export const getLineStyle = (voltageLevel: VoltageLevel): LineStyle => {
  return lineStyles[voltageLevel] || lineStyles['66kV'];
};