import { getTrackOrThrow } from '../state/accessors';
import { EliseState } from '../state/state';
import { parameterPlockKey } from '../state/stateUtils';
import { getHeldStepIndex } from './getHeldStepIndex';
import {
  Encoder,
  gateEncoder,
  offsetEncoder,
  velocityEncoder,
} from './uiModels';

export function getNoteEncoders(state: EliseState) {
  const { currentScene, currentTrack, nextStepSettings, padMode } = state.ui;
  const track = getTrackOrThrow(state, currentScene, currentTrack);

  const heldStep = padMode === 'clip' ? getHeldStepIndex(state) : null;
  const currentNote = heldStep !== null ? track.steps[heldStep] : null;

  let velocity, gate, offset;
  if (currentNote) {
    velocity = currentNote.velocity;
    gate = currentNote.gate;
    offset = currentNote.offset;
  } else {
    velocity = nextStepSettings.velocity;
    gate = nextStepSettings.gate;
    offset = nextStepSettings.offset;
  }

  return [
    velocityEncoder(velocity),
    gateEncoder(gate),
    offsetEncoder(offset),
    null,
    null,
    null,
    null,
    null,
  ];
}

export function getParameterEncoders(state: EliseState) {
  const { currentScene, currentTrack, padMode } = state.ui;
  const track = getTrackOrThrow(state, currentScene, currentTrack);

  const heldStep = padMode === 'clip' ? getHeldStepIndex(state) : null;
  const currentNote = heldStep !== null ? track.steps[heldStep] : null;

  const parameters = track.parameterConfiguration.parameters;
  const trackParameters = track.parameterValues;
  const stepParameters = currentNote?.parameterLocks ?? null;
  return parameters.map((parameterConfiguration, idx): Encoder => {
    const parameterValue =
      stepParameters?.[parameterPlockKey(idx)]?.value ??
      trackParameters[idx] ??
      null;
    if (parameterConfiguration.type === 'midiPc') {
      return {
        name: 'Program Change',
        value: parameterValue,
        displayType: 'number',
      };
    } else if (parameterConfiguration.type === 'midiPitchBend') {
      return {
        name: 'Pitch Bend',
        value: parameterValue,
        displayType: 'number',
      };
    }
    return {
      name: parameterConfiguration.label,
      value: parameterValue,
      displayType: parameterConfiguration.displayValueType,
    };
  });
}

export function getCurrentEncoders(state: EliseState): (Encoder | null)[] {
  const { encoderBank } = state.ui;

  if (encoderBank === 'note') {
    return getNoteEncoders(state);
  } else if (encoderBank === 'parameters') {
    return getParameterEncoders(state);
  } else {
    return [null, null, null, null, null, null, null, null];
  }
}
