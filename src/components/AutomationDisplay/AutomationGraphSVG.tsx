import { MidiClipTrack } from '../../state/state';
import {
  getAutomationTriggerAtStep,
  getPolylinePoints,
  getRepeatedFirstAutomationValueForTrack,
  getStepX,
  getStepY,
} from './automationGraphLogic';

export const POINT_RADIUS = 4;

interface Props {
  stepWidth: number;
  height: number;
  track: MidiClipTrack;
  parameterId: string;
}

export function AutomationGraphSVG({
  stepWidth,
  track,
  height,
  parameterId,
}: Props) {
  const automationTriggers = track.steps
    .map((_step, idx) => getAutomationTriggerAtStep(track, parameterId, idx))
    .filter((trig) => !!trig);

  const xValues = automationTriggers.map(({ stepIndex }) =>
    getStepX(stepIndex, stepWidth),
  );
  const yValues = automationTriggers.map((trig) =>
    getStepY(trig?.value ?? null, height),
  );
  const points: [number, number][] = xValues
    .map((x, idx) => [x, yValues[idx]] as [number, number | null])
    .filter((point): point is [number, number] => point[1] !== null);

  const initY = getStepY(
    getRepeatedFirstAutomationValueForTrack(track, automationTriggers),
    height,
  );

  return (
    <svg style={{ width: '100%', height: '100%' }}>
      {initY !== null && points[0] && (
        <>
          <line
            x1={0}
            y1={initY}
            x2={points[0][0]}
            y2={points[0][1]}
            stroke="orange"
            strokeDasharray="4 4"
          />
          <line
            x1={points[points.length - 1][0]}
            y1={points[points.length - 1][1]}
            x2={track.steps.length * stepWidth}
            y2={initY}
            stroke="orange"
            strokeDasharray="4 4"
          />
        </>
      )}

      <polyline
        points={getPolylinePoints(xValues, yValues)}
        stroke="orange"
        fill="none"
      />
      {points.map(([x, y], idx) => (
        <rect
          key={x}
          width={POINT_RADIUS * 2}
          height={POINT_RADIUS * 2}
          x={x - POINT_RADIUS}
          y={y - POINT_RADIUS}
          stroke="orange"
          fill={automationTriggers[idx].isPlock ? 'orange' : 'black'}
        />
      ))}
    </svg>
  );
}
