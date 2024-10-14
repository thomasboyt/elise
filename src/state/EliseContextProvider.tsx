import { ReactNode } from 'react';
import { EliseContext } from './useEliseContext';
import { useImmer } from 'use-immer';
import { createDefaultEliseState, ProjectStorage } from './state';

interface Props {
  children: ReactNode;
  project: ProjectStorage;
}

export function EliseContextProvider({ children, project }: Props) {
  const [state, update] = useImmer(() => createDefaultEliseState(project));

  return (
    <EliseContext.Provider value={{ state, update }}>
      {children}
    </EliseContext.Provider>
  );
}
