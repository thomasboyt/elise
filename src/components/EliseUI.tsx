import { getStepOrThrow } from '../state/accessors';
import { useEliseContext } from '../state/useEliseContext';
import { getStepIndexFromPad } from '../ui/getHeldStepIndex';

export function EliseUI() {
  const { state } = useEliseContext();
  const currentStepIndex =
    state.ui.heldPad === null
      ? null
      : getStepIndexFromPad(state, state.ui.heldPad);
  const currentStep =
    currentStepIndex === null
      ? null
      : getStepOrThrow(
          state,
          state.ui.currentScene,
          state.ui.currentTrack,
          currentStepIndex,
        );

  return (
    <div style={{ height: '300px' }}>
      <p>{`Scene: ${state.ui.currentScene} -> Track: ${state.ui.currentTrack}`}</p>
      <p>Bar: {state.ui.currentStepsPage}</p>
      {currentStep && (
        <p>
          Current step: {currentStepIndex}
          <br />
          Velocity: {currentStep.velocity} / Length: {currentStep.gate} /
          Offset: {currentStep.offset}
        </p>
      )}
    </div>
  );
}
