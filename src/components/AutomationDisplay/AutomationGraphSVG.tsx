import { MidiClipTrack } from '../../state/state';
import { parameterPlockKey } from '../../state/stateUtils';

interface Props {
  stepWidth: number;
  height: number;
  track: MidiClipTrack;
  parameterId: string;
}

function getAutomationCurveAtStep(
  track: MidiClipTrack,
  parameterId: string,
  stepIndex: number,
): number | null {
  const trackValue = track.parameterValues[parameterId];
  const step = track.steps[stepIndex];
  const plock = step?.parameterLocks[parameterPlockKey(parameterId)];
  if (plock) {
    return plock.value;
  }
  if (stepIndex === 0) {
    return trackValue;
  }
  return null;
  // some day: interpolation time!
  // find previous plock (or if none, use trackValue)
  // find next plock (or if none, use trackValue)
}

function getPolylinePoints(
  xValues: number[],
  yValues: (number | null)[],
): string {
  return xValues
    .map((x, idx) => (yValues[idx] !== null ? `${x},${yValues[idx]}` : null))
    .filter((value) => value !== null)
    .join(' ');
}

const POINT_RADIUS = 4;

export function AutomationGraphSVG({
  stepWidth,
  track,
  height,
  parameterId,
}: Props) {
  const values = track.steps
    .map((_step, idx) => getAutomationCurveAtStep(track, parameterId, idx))
    .concat(getAutomationCurveAtStep(track, parameterId, 0));

  const xValues = values.map((_, idx) => idx * stepWidth);
  const yValues = values.map((value) =>
    value !== null ? ((127 - value) / 127) * height : null,
  );

  return (
    <svg style={{ width: '100%', height: '100%' }}>
      <polyline
        points={getPolylinePoints(xValues, yValues)}
        stroke="orange"
        fill="none"
      />
      {values.map(
        (value, idx) =>
          value !== null && (
            <rect
              key={idx}
              width={POINT_RADIUS * 2}
              height={POINT_RADIUS * 2}
              x={xValues[idx] - POINT_RADIUS}
              y={yValues[idx]! - POINT_RADIUS}
              fill="orange"
            />
          ),
      )}
    </svg>
  );
}
