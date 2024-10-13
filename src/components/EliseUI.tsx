import { useHardwareConnected } from '../controllers/useMidiController';
import { getStepOrThrow, getTrackOrThrow } from '../state/accessors';
import { EliseState, MidiParameter, MidiStep } from '../state/state';
import { parameterPlockKey } from '../state/stateUtils';
import { useEliseContext } from '../state/useEliseContext';
import { getStepIndexFromPad } from '../ui/getHeldStepIndex';

function getCurrentStep(state: EliseState): MidiStep | null {
  const currentStepIndex =
    state.ui.heldPad === null
      ? null
      : getStepIndexFromPad(state, state.ui.heldPad);
  return currentStepIndex === null
    ? null
    : getStepOrThrow(
        state,
        state.ui.currentScene,
        state.ui.currentTrack,
        currentStepIndex,
      );
}

interface ParameterItem {
  parameter: MidiParameter;
  value: number | null;
  isParameterLock: boolean;
}

function getParameterItems(state: EliseState): ParameterItem[] {
  const track = getTrackOrThrow(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
  );
  const currentStep = getCurrentStep(state);
  const parameterConfiguration = track.parameterConfiguration;
  const trackParameterValues = track.parameterValues;

  return parameterConfiguration.map((configuration, idx) => {
    const parameterLock = currentStep?.parameterLocks[parameterPlockKey(idx)];
    const value = parameterLock
      ? parameterLock.value
      : trackParameterValues[idx];
    return {
      isParameterLock: !!parameterLock,
      parameter: configuration,
      value,
    };
  });
}

function getParameterLabel(parameter: MidiParameter): string {
  if (parameter.type === 'midiCc') {
    return parameter.label ?? `CC ${parameter.controllerNumber}`;
  }
  if (parameter.type === 'midiPc') {
    return 'PC';
  }
  if (parameter.type === 'midiPitchBend') {
    return 'Pitch Bend';
  }
  throw new Error(`Unrecognized parameter type ${parameter}`);
}

export function EliseUI() {
  const { state } = useEliseContext();
  const hardwareConnected = useHardwareConnected();

  const currentStepIndex =
    state.ui.heldPad === null
      ? null
      : getStepIndexFromPad(state, state.ui.heldPad);
  const currentStep = getCurrentStep(state);

  const noteValuesSource = currentStep
    ? currentStep
    : state.ui.nextStepSettings;
  const noteValues = {
    velocity: noteValuesSource.velocity,
    notes: noteValuesSource.notes,
    offset: noteValuesSource.offset,
    gate: noteValuesSource.gate,
  };

  const parameterItems = getParameterItems(state);

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
      <ul>
        {parameterItems.map((item, idx) => (
          <li key={idx}>
            {getParameterLabel(item.parameter)}: {item.value ?? '---'}
          </li>
        ))}
      </ul>
    </div>
  );
}
