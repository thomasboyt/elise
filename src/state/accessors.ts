import { getStepIndexFromPad } from '../ui/getHeldStepIndex';
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

export function getCurrentStep(state: EliseState): MidiStep | null {
  const currentStepIndex =
    state.ui.heldPad === null
      ? null
      : getStepIndexFromPad(state, state.ui.heldPad);
  return currentStepIndex === null
    ? null
    : getStepOrThrow(
        state,
        state.ui.currentScene,
        state.ui.currentTrack,
        currentStepIndex,
      );
}
