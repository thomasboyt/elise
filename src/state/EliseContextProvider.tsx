import { ReactNode } from 'react';
import { EliseContext } from './useEliseContext';
import { useImmer } from 'use-immer';
import { createDefaultEliseState } from './state';

interface Props {
  children: ReactNode;
}

export function EliseContextProvider({ children }: Props) {
  const [state, update] = useImmer(() => createDefaultEliseState());

  return (
    <EliseContext.Provider value={{ state, update }}>
      {children}
    </EliseContext.Provider>
  );
}
