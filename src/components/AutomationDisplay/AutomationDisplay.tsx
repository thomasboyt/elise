import { getTrackOrThrow } from '../../state/accessors';
import { useEliseContext } from '../../state/useEliseContext';
import { getMidiParameterLabel } from '../../ui/uiParameters';
import { AutomationGraph } from './AutomationGraph';
import css from './AutomationDisplay.module.css';

interface Props {
  xOffset: number;
}

export function AutomationDisplay({ xOffset }: Props) {
  const { state } = useEliseContext();
  const track = getTrackOrThrow(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
  );

  let parameterId = state.ui.currentAutomationDisplay;
  if (!parameterId || !track.parameterConfiguration[parameterId]) {
    parameterId = track.parameterOrder[0] ?? null;
  }

  if (!parameterId) {
    // TODO: maybe need a placeholder div for spacing here
    return null;
  }

  const parameter = track.parameterConfiguration[parameterId];

  return (
    <div className={css.automationDisplay}>
      <div className={css.label} style={{ width: xOffset }}>
        {getMidiParameterLabel(parameter)}
      </div>
      <AutomationGraph track={track} parameterId={parameterId} />
    </div>
  );
}
