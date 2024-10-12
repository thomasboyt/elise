import { EliseState, MidiClipTrack, Scene } from './state';

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
