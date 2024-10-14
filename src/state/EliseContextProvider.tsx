import { ReactNode, useEffect, useRef } from 'react';
import { EliseContext } from './useEliseContext';
import { useImmer } from 'use-immer';
import { createDefaultEliseState, ProjectStorage } from './state';

interface Props {
  children: ReactNode;
  project: ProjectStorage;
}

export function EliseContextProvider({ children, project }: Props) {
  const [state, update] = useImmer(() => createDefaultEliseState(project));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).getProjectStorage = () => {
      return stateRef.current.project;
    };
  }, []);

  return (
    <EliseContext.Provider value={{ state, update }}>
      {children}
    </EliseContext.Provider>
  );
}
