import { useContext } from 'react';
import { GridContext, GridContextShape } from './GridContext';

export function useGridContext(): GridContextShape {
  const ctx = useContext(GridContext);
  if (!ctx) {
    throw new Error('missing grid context');
  }
  return ctx;
}
