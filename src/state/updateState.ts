import { Updater } from 'use-immer';
import {
  createEmptyScene,
  createEmptyTrack,
  EliseState,
  MidiParameter,
  MidiParameterType,
  MidiStep,
  NoteParameter,
} from './state';
import { PadMode } from '../ui/uiModels';
import { getMaximumStepPage, getScene, getTrack } from './accessors';
import { extendArrayToLength } from '../util/extendArrayToLength';

export function setHeldPad(
  update: Updater<EliseState>,
  padIndex: number,
  time: number,
) {
  update((draft) => {
    draft.ui.heldPad = padIndex;
    draft.ui.heldPadStartTime = time;
  });
}

export function unsetHeldPad(update: Updater<EliseState>) {
  update((draft) => {
    draft.ui.heldPad = null;
    draft.ui.protectHeldPadDeletion = false;
  });
}

export function changePadMode(update: Updater<EliseState>, mode: PadMode) {
  update((draft) => {
    draft.ui.padMode = mode;
  });
}

export function changeTrack(update: Updater<EliseState>, trackIndex: number) {
  update((draft) => {
    const { currentScene } = draft.ui;
    if (!getTrack(draft, currentScene, trackIndex)) {
      draft.project.scenes[currentScene]!.tracks[trackIndex] =
        createEmptyTrack();
    }
    draft.ui.currentTrack = trackIndex;
    const maxStepPage = getMaximumStepPage(draft, currentScene, trackIndex);
    if (draft.ui.currentStepsPage > maxStepPage) {
      draft.ui.currentStepsPage = maxStepPage;
    }
  });
}

export function changeScene(update: Updater<EliseState>, sceneIndex: number) {
  update((draft) => {
    if (!getScene(draft, sceneIndex)) {
      draft.project.scenes[sceneIndex] = createEmptyScene();
      draft.project.scenes[sceneIndex]!.tracks[draft.ui.currentTrack] =
        createEmptyTrack();
    }
    draft.ui.currentScene = sceneIndex;
    const maxStepPage = getMaximumStepPage(
      draft,
      sceneIndex,
      draft.ui.currentTrack,
    );
    if (draft.ui.currentStepsPage > maxStepPage) {
      draft.ui.currentStepsPage = maxStepPage;
    }
  });
}

export function insertNewStep(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
) {
  update((draft) => {
    const step: MidiStep = {
      gate: draft.ui.nextStepSettings.gate,
      notes: [...draft.ui.nextStepSettings.notes],
      parameterLocks: {},
      offset: draft.ui.nextStepSettings.offset,
      velocity: draft.ui.nextStepSettings.velocity,
    };

    const track = draft.project.scenes[sceneIndex]!.tracks[trackIndex]!;
    const steps = track.steps;

    if (stepIndex > steps.length) {
      track.steps = extendArrayToLength(
        steps,
        steps.length + track.pageLength,
        null,
      );
    }

    track.steps[stepIndex] = step;
    draft.ui.protectHeldPadDeletion = true;
  });
}

export function removeStep(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
) {
  update((draft) => {
    draft.project.scenes[sceneIndex]!.tracks[trackIndex]!.steps[stepIndex] =
      null;
  });
}

export function enableProtectHeldPadDeletion(update: Updater<EliseState>) {
  update((draft) => {
    draft.ui.protectHeldPadDeletion = true;
  });
}

/* ---
 * Update steps
 * ---
 */

function addNote(notes: number[], note: number) {
  if (notes.some((existing) => existing === note)) {
    return;
  }
  notes.push(note);
}

function removeNote(notes: number[], note: number) {
  const noteIndex = notes.findIndex((existing) => existing === note);
  if (noteIndex === -1) {
    return;
  }
  notes.splice(noteIndex, 1);
}

export function addNoteToStep(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
  note: number,
) {
  update((draft) => {
    const notes =
      draft.project.scenes[sceneIndex]!.tracks[trackIndex]!.steps[stepIndex]!
        .notes;
    addNote(notes, note);
  });
}

export function removeNoteFromStep(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
  note: number,
) {
  update((draft) => {
    const notes =
      draft.project.scenes[sceneIndex]!.tracks[trackIndex]!.steps[stepIndex]!
        .notes;
    removeNote(notes, note);
  });
}

export function addNoteToNextStepSettings(
  update: Updater<EliseState>,
  note: number,
) {
  update((draft) => {
    const notes = draft.ui.nextStepSettings.notes;
    addNote(notes, note);
  });
}

export function removeNoteFromNextStepSettings(
  update: Updater<EliseState>,
  note: number,
) {
  update((draft) => {
    const notes = draft.ui.nextStepSettings.notes;
    removeNote(notes, note);
  });
}

export function setStepNoteParameter(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
  parameter: NoteParameter,
  value: number,
) {
  update((draft) => {
    draft.project.scenes[sceneIndex]!.tracks[trackIndex]!.steps[stepIndex]![
      parameter
    ] = value;
  });
}

export function setNextStepNoteParameter(
  update: Updater<EliseState>,
  parameter: NoteParameter,
  value: number,
) {
  update((draft) => {
    draft.ui.nextStepSettings[parameter] = value;
  });
}

export function addMidiParameterConfigurationForTrack(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  id: string,
  configuration: MidiParameter,
) {
  update((draft) => {
    const track = draft.project.scenes[sceneIndex]!.tracks[trackIndex]!;
    track.parameterConfiguration[id] = configuration;
    track.parameterOrder.push(id);
  });
}

export function removeMidiParameterConfigurationForTrack(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  id: string,
) {
  update((draft) => {
    const track = draft.project.scenes[sceneIndex]!.tracks[trackIndex]!;
    delete track.parameterConfiguration[id];
    track.parameterOrder = track.parameterOrder.filter((item) => item !== id);
    const activeSteps = track.steps.filter((step) => step !== null);
    for (const step of activeSteps) {
      delete step.parameterLocks[id];
    }
  });
}

export function changeMidiNoteChannelForTrack(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  channel: number | null,
) {
  update((draft) => {
    const track = draft.project.scenes[sceneIndex]!.tracks[trackIndex]!;
    track.midiNoteChannel = channel;
  });
}

export function setMidiParameterLabel(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  id: string,
  label: string | null,
) {
  update((draft) => {
    const track = draft.project.scenes[sceneIndex]!.tracks[trackIndex]!;
    track.parameterConfiguration[id].label = label;
  });
}

export function setMidiParameterChannel(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  id: string,
  channel: number | null,
) {
  update((draft) => {
    const track = draft.project.scenes[sceneIndex]!.tracks[trackIndex]!;
    track.parameterConfiguration[id].channel = channel;
  });
}

export function setMidiParameterType(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  id: string,
  type: MidiParameterType,
) {
  update((draft) => {
    const track = draft.project.scenes[sceneIndex]!.tracks[trackIndex]!;
    track.parameterConfiguration[id].type = type;
    if (
      track.parameterConfiguration[id].type === 'midiCc' &&
      !track.parameterConfiguration[id].controllerNumber
    ) {
      track.parameterConfiguration[id].controllerNumber = 0;
    }
  });
}

export function setMidiParameterControllerNumber(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  id: string,
  controllerNumber: number,
) {
  update((draft) => {
    const track = draft.project.scenes[sceneIndex]!.tracks[trackIndex]!;
    const param = track.parameterConfiguration[id];
    if (param.type === 'midiCc') {
      param.controllerNumber = controllerNumber;
    }
  });
}
