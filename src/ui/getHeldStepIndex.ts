import { getTrackOrThrow } from '../state/accessors';
import { EliseState } from '../state/state';

export function getHeldStepIndex(state: EliseState): number | null {
  if (state.ui.padMode !== 'clip') {
    throw new Error('Refusing to get held step index in non-clip mode');
  }

  const { heldPad } = state.ui;
  if (heldPad === null) {
    return null;
  }
  return getStepIndexFromPad(state, heldPad);
}

export function getStepIndexFromPad(
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
