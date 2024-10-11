import { createContext, useContext } from 'react';
import { createDefaultEliseState, EliseState } from './state';
import { Updater } from 'use-immer';

export interface EliseStateContextShape {
  state: EliseState;
  update: Updater<EliseState>;
}

export const EliseContext = createContext<EliseStateContextShape>({
  state: createDefaultEliseState(),
  update: () => {},
});

export function useEliseContext(): EliseStateContextShape {
  return useContext(EliseContext);
}
