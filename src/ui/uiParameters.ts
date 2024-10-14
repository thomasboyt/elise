import { Updater } from 'use-immer';
import {
  getHeldStep,
  getHeldStepIndex,
  getTrackOrThrow,
} from '../state/accessors';
import { EliseState, MidiParameter, NoteParameter } from '../state/state';
import { parameterPlockKey } from '../state/stateUtils';

export interface UIParameterConfig<T> {
  key: string;
  label(state: EliseState): string;
  getRawValue(state: EliseState): number | null;
  setRawValue(update: Updater<EliseState>, value: number): void;
  getDerivedValue(rawValue: number): T;
  getDisplayValue(rawValue: number): string;
}

function setNoteValue(draft: EliseState, key: NoteParameter, value: number) {
  const { currentScene, currentTrack, padMode } = draft.ui;
  const heldStep = padMode === 'clip' ? getHeldStepIndex(draft) : null;
  if (heldStep !== null) {
    draft.project.scenes[currentScene]!.tracks[currentTrack]!.steps[heldStep]![
      key
    ] = value;
  } else {
    draft.ui.nextStepSettings[key] = value;
  }
}

const velocity: UIParameterConfig<number> = {
  key: 'velocity',
  label: () => 'Velocity',
  getRawValue(state) {
    const currentNote = getHeldStep(state);
    return (currentNote ?? state.ui.nextStepSettings).velocity;
  },
  setRawValue(update, value) {
    update((draft) => {
      setNoteValue(draft, 'velocity', value);
    });
  },
  getDerivedValue(rawValue) {
    return rawValue;
  },
  getDisplayValue(rawValue) {
    return `${Math.round((rawValue / 127) * 100)}%`;
  },
};

// Gate is defined as a number of steps, 1-64
// going to have to see how much this sucks in practice lol
const gate: UIParameterConfig<number> = {
  key: 'gate',
  label: () => 'Gate length',
  getRawValue(state) {
    const currentNote = getHeldStep(state);
    return (currentNote ?? state.ui.nextStepSettings).gate;
  },
  setRawValue(update, value) {
    update((draft) => {
      setNoteValue(draft, 'gate', value);
    });
  },
  getDerivedValue(rawValue) {
    return Math.ceil((rawValue + 1) / 2);
  },
  getDisplayValue(rawValue) {
    return `${Math.ceil((rawValue + 1) / 2)}`;
  },
};

const offset: UIParameterConfig<number> = {
  key: 'offset',
  label: () => 'Offset',
  getRawValue(state) {
    const currentNote = getHeldStep(state);
    return (currentNote ?? state.ui.nextStepSettings).offset;
  },
  setRawValue(update, value) {
    update((draft) => {
      setNoteValue(draft, 'offset', value);
    });
  },
  getDerivedValue(rawValue) {
    return rawValue;
  },
  getDisplayValue(rawValue) {
    return rawValue.toString();
  },
};

export const noteParameters = { velocity, gate, offset };
export const noteParametersByEncoderIndex = [velocity, gate, offset];

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

export function getUIMidiParameter(index: number): UIParameterConfig<number> {
  return {
    key: `midiParameter-${index}`,
    label(state) {
      const track = getTrackOrThrow(
        state,
        state.ui.currentScene,
        state.ui.currentTrack,
      );
      const parameter = track.parameterConfiguration[index];
      if (!parameter) {
        return '---';
      }
      return getParameterLabel(parameter);
    },
    getRawValue(state) {
      const track = getTrackOrThrow(
        state,
        state.ui.currentScene,
        state.ui.currentTrack,
      );
      const currentStep = getHeldStep(state);
      const trackParameterValues = track.parameterValues;

      const parameterLock =
        currentStep?.parameterLocks[parameterPlockKey(index)];
      const value = parameterLock
        ? parameterLock.value
        : trackParameterValues[index];
      return value ?? null;
    },
    setRawValue(update, value) {
      update((draft) => {
        const track = getTrackOrThrow(
          draft,
          draft.ui.currentScene,
          draft.ui.currentTrack,
        );
        const currentStep = getHeldStep(draft);
        if (currentStep) {
          currentStep.parameterLocks[parameterPlockKey(index)] = {
            index,
            type: 'midiParameter',
            value,
          };
        } else {
          track.parameterValues[index] = value;
          // TODO: this would be where we broadcast the MIDI CC to a live track, I guess??
          // that COULD be done as a diff thing, I guess, seems kind of silly though
        }
      });
    },
    getDerivedValue(rawValue) {
      return rawValue;
    },
    getDisplayValue(rawValue) {
      return rawValue.toString();
    },
  };
}
