import { EliseState, MidiClipTrack, MidiStep, Scene } from './state';

export function getScene(state: EliseState, index: number): Scene | null {
  return state.project.scenes[index];
}

export function getSceneOrThrow(state: EliseState, index: number): Scene {
  const scene = getScene(state, index);
  if (!scene) {
    throw new Error(`Scene ${index} is null`);
  }
  return scene;
}

export function getTrack(
  state: EliseState,
  sceneIndex: number,
  trackIndex: number,
): MidiClipTrack | null {
  return state.project.scenes[sceneIndex]?.tracks[trackIndex] ?? null;
}

export function getTrackOrThrow(
  state: EliseState,
  sceneIndex: number,
  trackIndex: number,
): MidiClipTrack {
  const track = getTrack(state, sceneIndex, trackIndex);
  if (!track) {
    throw new Error(`Track ${trackIndex} in Scene ${sceneIndex} is null`);
  }
  return track;
}

export function getStep(
  state: EliseState,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
): MidiStep | null {
  return (
    state.project.scenes[sceneIndex]?.tracks[trackIndex]?.steps[stepIndex] ??
    null
  );
}

export function getStepOrThrow(
  state: EliseState,
  sceneIndex: number,
  trackIndex: number,
  stepIndex: number,
): MidiStep {
  const step = getStep(state, sceneIndex, trackIndex, stepIndex);
  if (!step) {
    throw new Error(
      `Step ${stepIndex} in Track ${trackIndex} in Scene ${sceneIndex} is null`,
    );
  }
  return step;
}

export function getHeldStepIndex(state: EliseState): number | null {
  if (state.ui.padMode !== 'clip') {
    return null;
  }

  const { heldPad } = state.ui;
  if (heldPad === null) {
    return null;
  }
  return getStepIndexFromPadInClipMode(state, heldPad);
}

export function getStepIndexFromPadInClipMode(
  state: EliseState,
  padIndex: number,
): number {
  if (state.ui.padMode !== 'clip') {
    throw new Error('Refusing to get held step index in non-clip mode');
  }

  const { currentScene, currentTrack, currentStepsPage } = state.ui;
  const track = getTrackOrThrow(state, currentScene, currentTrack);
  const offset = currentStepsPage * track.pageLength;
  return offset + padIndex;
}

export function getHeldStep(state: EliseState): MidiStep | null {
  if (state.ui.heldPad === null || state.ui.padMode !== 'clip') {
    return null;
  }

  const currentStepIndex = getStepIndexFromPadInClipMode(
    state,
    state.ui.heldPad,
  );
  return getStepOrThrow(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
    currentStepIndex,
  );
}

export function getMaximumStepPage(
  state: EliseState,
  sceneIndex: number,
  trackIndex: number,
): number {
  const track = state.project.scenes[sceneIndex]!.tracks[trackIndex]!;
  const { pageLength, steps } = track;
  return Math.ceil(steps.length / pageLength) - 1;
}
