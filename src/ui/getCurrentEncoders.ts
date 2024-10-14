import { getTrackOrThrow } from '../state/accessors';
import { EliseState } from '../state/state';
import {
  getUIMidiParameter,
  noteParameters,
  UIParameterConfig,
} from './uiParameters';
import { Encoder } from './uiModels';

function parameterToEncoder(
  parameter: UIParameterConfig<unknown>,
  state: EliseState,
): Encoder {
  const name = parameter.label(state);
  const rawValue = parameter.getRawValue(state);
  const displayValue =
    rawValue !== null ? parameter.getDisplayValue(rawValue) : null;
  return { name, rawValue, displayValue };
}

export function getNoteEncoders(state: EliseState): (Encoder | null)[] {
  return [
    parameterToEncoder(noteParameters.velocity, state),
    parameterToEncoder(noteParameters.gate, state),
    parameterToEncoder(noteParameters.offset, state),
    null,
    null,
    null,
    null,
    null,
  ];
}

export function getParameterEncoders(state: EliseState): Encoder[] {
  const { currentScene, currentTrack } = state.ui;
  const track = getTrackOrThrow(state, currentScene, currentTrack);

  return track.parameterOrder.map((id): Encoder => {
    const param = getUIMidiParameter(id);
    return parameterToEncoder(param, state);
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
