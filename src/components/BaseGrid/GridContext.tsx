import { createContext } from 'react';

export interface GridContextShape {
  cellWidth: number;
  labelWidth: number;
}

export const GridContext = createContext<GridContextShape | null>(null);
