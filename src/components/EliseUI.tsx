import { useEliseContext } from '../state/useEliseContext';

export function EliseUI() {
  const { state } = useEliseContext();

  return (
    <div>
      <p>{`Scene: ${state.ui.currentScene} -> Track: ${state.ui.currentTrack}`}</p>
      <p>Bar: {state.ui.currentStepsPage}</p>
    </div>
  );
}
