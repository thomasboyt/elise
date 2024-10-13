import { getSceneOrThrow, getTrackOrThrow } from '../state/accessors';
import { EliseState } from '../state/state';
import { extendArrayToLength } from '../util/extendArrayToLength';
import { PadColor } from './uiModels';

export function getPadColors(state: EliseState): PadColor[] {
  const { currentScene, currentTrack, currentStepsPage, padMode } = state.ui;

  if (padMode === 'clip') {
    const track = getTrackOrThrow(state, currentScene, currentTrack);
    const offset = currentStepsPage * track.pageLength;
    const steps = track.steps.slice(offset, offset + track.pageLength);

    const pads = steps.map((step, idx): PadColor => {
      if (!step) {
        return 'off';
      }
      if (state.ui.heldPad === idx) {
        if (state.ui.protectHeldPadDeletion) {
          return 'white';
        } else {
          return 'red';
        }
      }
      // TODO: different colors for different types of notes?
      return 'green';
    });
    return extendArrayToLength(pads, 16, 'off');
  } else if (padMode === 'track') {
    const scene = getSceneOrThrow(state, currentScene);
    return scene.tracks.map((track, idx) => {
      if (idx === currentTrack) {
        return 'green';
      }
      return track === null ? 'off' : 'blue';
    });
  } else if (padMode === 'scene') {
    return state.project.scenes.map((scene, idx) => {
      if (idx === currentScene) {
        return 'green';
      }
      return scene === null ? 'off' : 'blue';
    });
  }

  // TODO: mute mode
  // TODO: drum mode
  // TODO: chromatic mode

  return new Array(16).fill('off');
}
