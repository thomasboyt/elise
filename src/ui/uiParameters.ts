import { Updater } from 'use-immer';
import { getHeldStepIndex } from './getHeldStepIndex';
import { getCurrentStep, getTrackOrThrow } from '../state/accessors';
import { EliseState, MidiParameter, NoteParameter } from '../state/state';
import { parameterPlockKey } from '../state/stateUtils';

export interface UIParameterConfig {
  key: string;
  label(state: EliseState): string;
  get(state: EliseState): number | null;
  set(update: Updater<EliseState>, value: number): void;
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

const velocity: UIParameterConfig = {
  key: 'velocity',
  label: () => 'Velocity',
  get(state) {
    const currentNote = getCurrentStep(state);
    return (currentNote ?? state.ui.nextStepSettings).velocity;
  },
  set(update, value) {
    update((draft) => {
      setNoteValue(draft, 'velocity', value);
    });
  },
};

const gate: UIParameterConfig = {
  key: 'gate',
  label: () => 'Gate length',
  get(state) {
    const currentNote = getCurrentStep(state);
    return (currentNote ?? state.ui.nextStepSettings).gate;
  },
  set(update, value) {
    update((draft) => {
      setNoteValue(draft, 'gate', value);
    });
  },
};

const offset: UIParameterConfig = {
  key: 'offset',
  label: () => 'Offset',
  get(state) {
    const currentNote = getCurrentStep(state);
    return (currentNote ?? state.ui.nextStepSettings).offset;
  },
  set(update, value) {
    update((draft) => {
      setNoteValue(draft, 'offset', value);
    });
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

export function getUIMidiParameter(index: number): UIParameterConfig {
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
    get(state) {
      const track = getTrackOrThrow(
        state,
        state.ui.currentScene,
        state.ui.currentTrack,
      );
      const currentStep = getCurrentStep(state);
      const trackParameterValues = track.parameterValues;

      const parameterLock =
        currentStep?.parameterLocks[parameterPlockKey(index)];
      const value = parameterLock
        ? parameterLock.value
        : trackParameterValues[index];
      return value;
    },
    set(update, value) {
      update((draft) => {
        const track = getTrackOrThrow(
          draft,
          draft.ui.currentScene,
          draft.ui.currentTrack,
        );
        const currentStep = getCurrentStep(draft);
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
  };
}
