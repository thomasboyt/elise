import { useHardwareConnected } from '../controllers/useMidiController';
import { getStepOrThrow } from '../state/accessors';
import { useEliseContext } from '../state/useEliseContext';
import { getStepIndexFromPad } from '../ui/getHeldStepIndex';

export function EliseUI() {
  const { state } = useEliseContext();
  const hardwareConnected = useHardwareConnected();
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

  const noteValuesSource = currentStep
    ? currentStep
    : state.ui.nextStepSettings;
  const noteValues = {
    velocity: noteValuesSource.velocity,
    notes: noteValuesSource.notes,
    offset: noteValuesSource.offset,
    gate: noteValuesSource.gate,
  };

  return (
    <div style={{ height: '300px' }}>
      <p>
        Launchkey{' '}
        {hardwareConnected ? <strong>connected</strong> : 'disconnected'}
      </p>
      <p>{`Scene: ${state.ui.currentScene} -> Track: ${state.ui.currentTrack}`}</p>
      <p>Bar: {state.ui.currentStepsPage}</p>
      <p>
        {currentStep ? (
          <span>Current step: {currentStepIndex}</span>
        ) : (
          <span>No step</span>
        )}
      </p>
      <p>
        Notes: {noteValues.notes} / Velocity: {noteValues.velocity} / Length:{' '}
        {noteValues.gate} / Offset: {noteValues.offset}
      </p>
    </div>
  );
}
