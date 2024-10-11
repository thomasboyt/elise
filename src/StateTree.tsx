import { useEliseContext } from './state/useEliseContext';

export function StateTree() {
  const { state } = useEliseContext();
  return (
    <div>
      <pre>{JSON.stringify(state, undefined, 2)}</pre>
    </div>
  );
}
