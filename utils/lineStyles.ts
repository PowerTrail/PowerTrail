import { VoltageLevel } from '@/types/powerGrid';
import { PathOptions } from 'leaflet';

export const lineStyles: Record<VoltageLevel, PathOptions> = {
  '765kV': { 
    color: '#FF0000', 
    weight: 3, 
    opacity: 1,
    dashArray: undefined 
  },
  '400kV': { 
    color: '#0000FF', 
    weight: 2.5, 
    opacity: 1,
    dashArray: undefined 
  },
  '220kV': { 
    color: '#008000', 
    weight: 2, 
    opacity: 1,
    dashArray: undefined 
  },
  '132kV': { 
    color: '#800080', 
    weight: 1.5, 
    opacity: 0.8,
    dashArray: '5,5' 
  },
  '66kV': { 
    color: '#000000', 
    weight: 1, 
    opacity: 0.7,
    dashArray: '3,3' 
  }
};

export const getLineStyle = (voltageLevel: VoltageLevel): PathOptions => {
  return lineStyles[voltageLevel] || lineStyles['66kV'];
};