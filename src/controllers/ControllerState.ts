import { EliseState, UIPage } from '../state/state';
import { getCurrentPageEncoders } from '../ui/getCurrentPageEncoders';
import { Encoder, PadColor, PadMode } from '../ui/uiModels';

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
  // TODO: current pattern (for display state)
  // TODO: current track (for display state)
  // TODO: current bar (for display state)
}

function getPadColors(state: EliseState): PadColor[] {
  const { currentPattern, currentTrack, padMode } = state.ui;

  if (padMode === 'clip') {
    // TODO: use current bar!
    const pattern = state.project.patterns[currentPattern];
    const track = pattern.tracks[currentTrack];
    const steps = track.steps;

    // TODO: fill up to 16 steps for shorter bar lengths
    return steps.map((step): PadColor => {
      if (!step) {
        return 'off';
      }
      // TODO: different colors for different types of notes?
      return 'green';
    });
  }

  // TODO: track mode
  // TODO: scene mode
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
