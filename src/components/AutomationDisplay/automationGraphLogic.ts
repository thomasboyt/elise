import { getMaximumStepPageForTrack } from '../../state/accessors';
import { MidiClipTrack } from '../../state/state';
import { parameterPlockKey } from '../../state/stateUtils';

export interface AutomationTrigger {
  isPlock: boolean;
  value: number;
  stepIndex: number;
}

/**
 * When a track's sequence loops, we can parameter slide from the last set step
 * of one sequence to the first set step of the next. This is a little tricky to
 * reason about, but basically it's just an interpolation between the two
 * values.
 *
 * This method might only really matter for visualizing this - I think for
 * parameter slides in playback we'll be using a more generalized interpolation.
 * Can probably borrow the start/end distance math if nothing else.
 */
export function getRepeatedFirstAutomationValueForTrack(
  track: MidiClipTrack,
  automationTriggers: AutomationTrigger[],
): number | null {
  if (!automationTriggers.length) {
    return null;
  }
  const firstTrigger = automationTriggers[0];
  const lastTrigger = automationTriggers[automationTriggers.length - 1];
  const page = getMaximumStepPageForTrack(track);
  const endStepIndex = (page + 1) * track.pageLength;
  const distanceToEnd = endStepIndex - lastTrigger.stepIndex;
  const distanceFromStart = firstTrigger.stepIndex;
  const total = distanceFromStart + distanceToEnd;
  const interp = distanceToEnd / total;
  return lastTrigger.value + (firstTrigger.value - lastTrigger.value) * interp;
}

export function getAutomationTriggerAtStep(
  track: MidiClipTrack,
  parameterId: string,
  stepIndex: number,
): AutomationTrigger | null {
  const trackValue = track.parameterValues[parameterId];
  const step = track.steps[stepIndex];
  if (!step) {
    return null;
  }
  const plock = step?.parameterLocks[parameterPlockKey(parameterId)];
  if (plock) {
    return { isPlock: true, value: plock.value, stepIndex };
  }
  if (trackValue !== null) {
    return { isPlock: false, value: trackValue, stepIndex };
  }
  return null;
}

export function getPolylinePoints(
  xValues: number[],
  yValues: (number | null)[],
): string {
  return xValues
    .map((x, idx) => (yValues[idx] !== null ? `${x},${yValues[idx]}` : null))
    .filter((value) => value !== null)
    .join(' ');
}

export function getStepX(step: number, stepWidth: number) {
  return step * stepWidth;
}

export function getStepY(value: number | null, height: number) {
  return value !== null ? ((127 - value) / 127) * height : null;
}
