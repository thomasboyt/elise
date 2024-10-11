import { EliseState } from '../state/state';
import { parameterPlockKey } from '../state/stateUtils';
import { getHeldStepIndex } from './getHeldStepIndex';
import {
  Encoder,
  gateEncoder,
  offsetEncoder,
  velocityEncoder,
} from './uiModels';

export function getCurrentPageEncoders(state: EliseState): (Encoder | null)[] {
  const { currentPage, currentPattern, currentTrack, nextStepSettings } =
    state.ui;
  const track = state.project.patterns[currentPattern].tracks[currentTrack];

  const heldStep = getHeldStepIndex(state);
  const currentNote = heldStep !== null ? track.steps[heldStep] : null;

  if (currentPage === 'note') {
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
  } else if (currentPage === 'parameters') {
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
  } else {
    return [null, null, null, null, null, null, null, null];
  }
}
