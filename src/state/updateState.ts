import { Updater } from 'use-immer';
import {
  createEmptyScene,
  createEmptyTrack,
  EliseState,
  MidiStep,
} from './state';
import { PadMode } from '../ui/uiModels';
import { getScene, getTrack } from './accessors';

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

    draft.project.scenes[sceneIndex]!.tracks[trackIndex]!.steps[stepIndex] =
      step;
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
    if (notes.some((existing) => existing === note)) {
      return;
    }
    notes.push(note);
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
    const noteIndex = notes.findIndex((existing) => existing === note);
    if (noteIndex === -1) {
      return;
    }
    notes.splice(noteIndex, 1);
  });
}

// TODO: maybe use some currying for less boilerplate here?

export function setStepVelocity(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
  velocity: number,
) {
  update((draft) => {
    draft.project.scenes[sceneIndex]!.tracks[trackIndex]!.steps[
      stepIndex
    ]!.velocity = velocity;
  });
}

export function setStepOffset(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
  offset: number,
) {
  update((draft) => {
    draft.project.scenes[sceneIndex]!.tracks[trackIndex]!.steps[
      stepIndex
    ]!.offset = offset;
  });
}

export function setStepLength(
  update: Updater<EliseState>,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
  length: number,
) {
  update((draft) => {
    draft.project.scenes[sceneIndex]!.tracks[trackIndex]!.steps[
      stepIndex
    ]!.gate = length;
  });
}
