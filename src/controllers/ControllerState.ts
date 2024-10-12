import { getSceneOrThrow, getTrackOrThrow } from '../state/accessors';
import { EliseState, UIPage } from '../state/state';
import { getCurrentPageEncoders } from '../ui/getCurrentPageEncoders';
import { Encoder, PadColor, PadMode } from '../ui/uiModels';
import { extendArrayToLength } from '../util/extendArrayToLength';

/**
 * The ControllerState is a "snapshot" that can be computed from the overall
 * Elise state at any time and sent to a controller to reset the current
 * controller state.
 */
export interface ControllerState {
  page: UIPage;
  encoders: (Encoder | null)[];
  pads: PadColor[];
  /**
   * The controller needs to know about the pad mode so that certain
   * controls that only make sense in certain modes are ignored.
   *
   * Basically: pad and encoder values are always sent off to the controller
   * message handler, and it'll figure out what to do with those. But any
   * controller-specific actions like shift states need to be handled on the
   * controller, and some only make sense in some contexts.
   */
  padMode: PadMode;
  // TODO: current scene (for display state)
  // TODO: current track (for display state)
  // TODO: current bar (for display state)
}

function getPadColors(state: EliseState): PadColor[] {
  const { currentScene, currentTrack, currentStepsPage, padMode } = state.ui;

  // TODO:
  // Draw held pad in different color.
  // For toggle vs p-lock in clip view this needs to be white or red
  // so might need to get fancy.

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

export function getControllerState(state: EliseState): ControllerState {
  const { currentPage, padMode } = state.ui;
  const pads = getPadColors(state);
  const encoders = getCurrentPageEncoders(state);

  return {
    page: currentPage,
    encoders,
    pads,
    padMode,
  };
}

export function initControllerState(): ControllerState {
  return {
    padMode: 'clip',
    page: 'note',
    encoders: new Array(8).fill(null),
    pads: new Array(16).fill('off'),
  };
}
