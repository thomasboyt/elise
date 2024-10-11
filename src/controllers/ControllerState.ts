/**
 * The ControllerState is a "snapshot" that can be computed from the overall
 * Elise state at any time and sent to a controller to reset the current
 * controller state.
 */

import { EliseState, UIPage } from '../state/state';
import { getCurrentPageEncoders } from '../ui/getCurrentPageEncoders';
import { Encoder, PadColor } from '../ui/uiModels';

export interface ControllerState {
  page: UIPage;
  encoders: (Encoder | null)[];
  pads: PadColor[];
}

export function getControllerState(state: EliseState): ControllerState {
  const { currentPattern, currentTrack, currentPage } = state.ui;

  // TODO: paint pads differently when holding func to select track
  // TODO: paint pads differently when holding > to select pattern
  // TODO: paint pads differently for drum mode!

  const pattern = state.project.patterns[currentPattern];
  const track = pattern.tracks[currentTrack];
  const steps = track.steps;

  const pads: PadColor[] = steps.map((step): PadColor => {
    if (!step) {
      return 'off';
    }
    // TODO: different colors for different types of notes?
    return 'green';
  });

  const encoders = getCurrentPageEncoders(state);

  return {
    page: currentPage,
    encoders,
    pads,
  };
}
