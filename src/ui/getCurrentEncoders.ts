import { getTrackOrThrow } from '../state/accessors';
import { EliseState } from '../state/state';
import * as parameters from './uiParameters';
import { Encoder } from './uiModels';

export function getNoteEncoders(state: EliseState): (Encoder | null)[] {
  return [
    {
      name: parameters.velocity.label(state),
      value: parameters.velocity.get(state),
    },
    {
      name: parameters.gate.label(state),
      value: parameters.gate.get(state),
    },
    {
      name: parameters.offset.label(state),
      value: parameters.offset.get(state),
    },
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

  return track.parameterConfiguration.map((_, idx): Encoder => {
    const param = parameters.getUIMidiParameter(idx);
    return {
      name: param.label(state),
      value: param.get(state),
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
