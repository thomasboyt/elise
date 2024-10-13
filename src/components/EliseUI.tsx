import { useHardwareConnected } from '../controllers/useMidiController';
import { handlePadOff, handlePadOn } from '../state/actions';
import { useEliseContext } from '../state/useEliseContext';
import { getStepIndexFromPad } from '../ui/getHeldStepIndex';
import { getPadColors } from '../ui/getPadColors';
import { ElisePad } from './ElisePad';
import { EliseUISection } from './EliseUISection';
import * as parameters from '../ui/uiParameters';
import { EliseUIParameterList } from './EliseUIParameterList';
import { EliseUINoteDisplay } from './EliseUINoteDisplay';
import css from './EliseUI.module.css';

export function EliseUI() {
  const { state, update } = useEliseContext();
  const hardwareConnected = useHardwareConnected();

  const currentStepIndex =
    state.ui.heldPad === null
      ? null
      : getStepIndexFromPad(state, state.ui.heldPad);

  const pads = getPadColors(state);

  return (
    <div className={css.eliseUi}>
      <div className={css.display}>
        <p>
          Launchkey{' '}
          {hardwareConnected ? <strong>connected</strong> : 'disconnected'}
          {` | Scene: ${state.ui.currentScene} / Track: ${state.ui.currentTrack} / Bar: ${state.ui.currentStepsPage} / Step: ${currentStepIndex ?? '---'}`}
        </p>
        <EliseUISection encoderBank="note" label="Note">
          <EliseUINoteDisplay />
          <EliseUIParameterList
            parameters={[
              parameters.velocity,
              parameters.gate,
              parameters.offset,
            ]}
          />
        </EliseUISection>
        <EliseUISection encoderBank="parameters" label="Params">
          <EliseUIParameterList
            parameters={[...new Array(8)].map((_, idx) =>
              parameters.getUIMidiParameter(idx),
            )}
          />
        </EliseUISection>
        <EliseUISection encoderBank="lfo" label="LFO">
          <span />
        </EliseUISection>
      </div>

      <ul className={css.pads}>
        {pads.map((color, idx) => (
          <ElisePad
            key={idx}
            padIndex={idx}
            color={color}
            onDown={() => {
              handlePadOn(state, update, idx);
            }}
            onUp={() => {
              handlePadOff(state, update, idx);
            }}
          />
        ))}
      </ul>
    </div>
  );
}
