import classNames from 'classnames';
import { useHardwareConnected } from '../controllers/useMidiController';
import {
  handlePadOff,
  handlePadOn,
  handleEnterPadClipMode,
  handleEnterPadSceneMode,
  handleEnterPadTrackMode,
  handleChangeDisplayScreen,
} from '../state/actions';
import { useEliseContext } from '../state/useEliseContext';
import { getPadColors } from '../ui/getPadColors';
import { ElisePad } from './ElisePad';
import { EliseUIButtonRow } from './EliseUIButtonRow';
import { getStepIndexFromPadInClipMode } from '../state/accessors';
import { EliseUIEncoderBanks } from './EliseUIEncoderBanks';
import { GridView } from './GridView/GridView';
import css from './EliseUI.module.css';

export function EliseUI() {
  const { state, update } = useEliseContext();
  const hardwareConnected = useHardwareConnected();

  const currentStepIndex =
    state.ui.heldPad === null || state.ui.padMode !== 'clip'
      ? null
      : getStepIndexFromPadInClipMode(state, state.ui.heldPad);

  const pads = getPadColors(state);
  const padMode = state.ui.padMode;

  return (
    <div className={css.eliseUi}>
      <div className={css.display}>
        <div className={css.topBarr}>
          Launchkey{' '}
          {hardwareConnected ? <strong>connected</strong> : 'disconnected'}
          {` | Scene: ${state.ui.currentScene} / Track: ${state.ui.currentTrack} / Bar: ${state.ui.currentStepsPage} / Step: ${currentStepIndex ?? '---'}`}
        </div>
        <EliseUIButtonRow className={css.topButtons}>
          <button
            className={classNames({
              [css.activeButton]: state.ui.displayScreen === 'main',
            })}
            onClick={() => handleChangeDisplayScreen(state, update, 'main')}
          >
            Main
          </button>
          <button disabled>MIDI Configuration</button>
          <button disabled>Piano Roll</button>
          <button
            className={classNames({
              [css.activeButton]: state.ui.displayScreen === 'gridView',
            })}
            onClick={() => handleChangeDisplayScreen(state, update, 'gridView')}
          >
            Grid View
          </button>
        </EliseUIButtonRow>

        <div className={css.mainSection}>
          {state.ui.displayScreen === 'main' && <EliseUIEncoderBanks />}
          {state.ui.displayScreen === 'gridView' && <GridView />}
        </div>

        <EliseUIButtonRow className={css.padButtons}>
          <button
            className={classNames({ [css.activeButton]: padMode === 'clip' })}
            onClick={() => handleEnterPadClipMode(state, update)}
          >
            Step
          </button>
          <button
            className={classNames({ [css.activeButton]: padMode === 'track' })}
            onClick={() => handleEnterPadTrackMode(state, update)}
          >
            Track
          </button>
          <button
            className={classNames({ [css.activeButton]: padMode === 'scene' })}
            onClick={() => handleEnterPadSceneMode(state, update)}
          >
            Scene
          </button>
          <button disabled>Mute States</button>
          <button disabled>Drum</button>
          <button disabled>Chromatic</button>
        </EliseUIButtonRow>
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
