import { createContext, useContext } from 'react';
import { EliseState } from './state';
import { Updater } from 'use-immer';

export interface EliseStateContextShape {
  state: EliseState;
  update: Updater<EliseState>;
}

export const EliseContext = createContext<EliseStateContextShape | null>(null);

export function useEliseContext(): EliseStateContextShape {
  const ctx = useContext(EliseContext);
  if (!ctx) {
    throw new Error('missing elise context');
  }
  return ctx;
}
