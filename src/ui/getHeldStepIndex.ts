import { EliseState } from '../state/state';

export function getHeldStepIndex(state: EliseState): number | null {
  const { currentPattern, currentTrack, currentStepsPage, heldPad } = state.ui;
  if (heldPad === null) {
    return null;
  }
  // TODO: if drum mode, return null
  const track = state.project.patterns[currentPattern].tracks[currentTrack];
  const offset = currentStepsPage * track.pageLength;
  return offset + heldPad;
}
