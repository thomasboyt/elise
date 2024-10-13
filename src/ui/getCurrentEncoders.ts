import { getTrackOrThrow } from '../state/accessors';
import { EliseState } from '../state/state';
import { getUIMidiParameter, noteParameters } from './uiParameters';
import { Encoder } from './uiModels';

export function getNoteEncoders(state: EliseState): (Encoder | null)[] {
  return [
    {
      name: noteParameters.velocity.label(state),
      value: noteParameters.velocity.get(state),
    },
    {
      name: noteParameters.gate.label(state),
      value: noteParameters.gate.get(state),
    },
    {
      name: noteParameters.offset.label(state),
      value: noteParameters.offset.get(state),
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
    const param = getUIMidiParameter(idx);
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
