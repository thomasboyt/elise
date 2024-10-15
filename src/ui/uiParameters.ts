import { Updater } from 'use-immer';
import {
  getHeldStep,
  getHeldStepIndex,
  getTrackOrThrow,
} from '../state/accessors';
import { EliseState, MidiParameter, NoteParameter } from '../state/state';
import { parameterPlockKey } from '../state/stateUtils';

/**
 * TODO: I hate this system lmao
 * Really I should just have getParameterData(state) and updateParameter() public functions in each config
 * The rest is internal, could be like a closed over object
 */
interface UiBaseParameterConfig<T> {
  type: string;
  key: string;
  label(state: EliseState): string;
  getRawValue(state: EliseState): number | null;
  setRawValue(update: Updater<EliseState>, value: number): void;
  getDerivedValue(rawValue: number): T;
  getDisplayValue(rawValue: number): string;
}

export interface UiNoteParameterConfig<T> extends UiBaseParameterConfig<T> {
  type: 'note';
}
export interface UiMidiParameterConfig<T> extends UiBaseParameterConfig<T> {
  type: 'midi';
  hasParameterLock(state: EliseState): boolean;
  setRawValue(update: Updater<EliseState>, value: number | null): void;
}

export type UiParameterConfig<T> =
  | UiNoteParameterConfig<T>
  | UiMidiParameterConfig<T>;

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

const velocity: UiNoteParameterConfig<number> = {
  type: 'note',
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
const gate: UiNoteParameterConfig<number> = {
  type: 'note',
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

const offset: UiNoteParameterConfig<number> = {
  type: 'note',
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

export function getDefaultMidiParameterLabel(parameter: MidiParameter): string {
  const prefix = `Ch${parameter.channel ?? 'XX'} `;
  if (parameter.type === 'midiCc') {
    return `${prefix} CC ${parameter.controllerNumber}`;
  }
  if (parameter.type === 'midiPc') {
    return `${prefix} PC`;
  }
  if (parameter.type === 'midiPitchBend') {
    return `${prefix} Pitch Bend`;
  }
  throw new Error(`Unrecognized parameter type ${parameter}`);
}

export function getMidiParameterLabel(parameter: MidiParameter): string {
  if (parameter.label) {
    return parameter.label;
  }
  return getDefaultMidiParameterLabel(parameter);
}

export function getUIMidiParameter(id: string): UiMidiParameterConfig<number> {
  return {
    type: 'midi',
    key: `midiParameter-${id}`,
    label(state) {
      const track = getTrackOrThrow(
        state,
        state.ui.currentScene,
        state.ui.currentTrack,
      );
      const parameter = track.parameterConfiguration[id];
      if (!parameter) {
        return '---';
      }
      return getMidiParameterLabel(parameter);
    },
    hasParameterLock(state) {
      const currentStep = getHeldStep(state);
      const parameterLock = currentStep?.parameterLocks[parameterPlockKey(id)];
      return !!parameterLock;
    },
    getRawValue(state) {
      const track = getTrackOrThrow(
        state,
        state.ui.currentScene,
        state.ui.currentTrack,
      );
      const currentStep = getHeldStep(state);
      const trackParameterValues = track.parameterValues;

      const parameterLock = currentStep?.parameterLocks[parameterPlockKey(id)];
      const value = parameterLock
        ? parameterLock.value
        : trackParameterValues[id];
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
          if (value === null) {
            delete currentStep.parameterLocks[parameterPlockKey(id)];
          } else {
            currentStep.parameterLocks[parameterPlockKey(id)] = {
              id,
              type: 'midiParameter',
              value,
            };
          }
        } else {
          track.parameterValues[id] = value;
          // TODO: this would be where we broadcast the MIDI CC to a live track, I guess??
          // that COULD be done as a diff thing, I guess, seems kind of silly though
        }
        draft.ui.currentAutomationDisplay = id;
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
