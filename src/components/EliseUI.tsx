import classNames from 'classnames';
import { useHardwareConnected } from '../controllers/useMidiController';
import {
  handleEnterPadClipMode,
  handleEnterPadSceneMode,
  handleEnterPadTrackMode,
  handleChangeDisplayScreen,
} from '../state/actions';
import { useEliseContext } from '../state/useEliseContext';
import { EliseUIButtonRow } from './EliseUIButtonRow';
import {
  getMaximumStepPage,
  getStepIndexFromPadInClipMode,
} from '../state/accessors';
import { EliseUIEncoderBanks } from './EliseUIEncoderBanks';
import { GridView } from './GridView/GridView';
import { EliseUIPads } from './EliseUIPads';
import { MIDIConfiguration } from './MIDIConfiguration/MIDIConfiguration';
import { PianoRoll } from './PianoRoll/PianoRoll';
import css from './EliseUI.module.css';

export function EliseUI() {
  const { state, update } = useEliseContext();
  const hardwareConnected = useHardwareConnected();

  const currentStepIndex =
    state.ui.heldPad === null || state.ui.padMode !== 'clip'
      ? null
      : getStepIndexFromPadInClipMode(state, state.ui.heldPad);

  const padMode = state.ui.padMode;
  const maxPage = getMaximumStepPage(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
  );

  return (
    <div className={css.eliseUi}>
      <div className={css.display}>
        <div className={css.topBar}>
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
          <button
            className={classNames({
              [css.activeButton]:
                state.ui.displayScreen === 'midiConfiguration',
            })}
            onClick={() =>
              handleChangeDisplayScreen(state, update, 'midiConfiguration')
            }
          >
            MIDI Configuration
          </button>
          <button
            className={classNames({
              [css.activeButton]: state.ui.displayScreen === 'pianoRoll',
            })}
            onClick={() =>
              handleChangeDisplayScreen(state, update, 'pianoRoll')
            }
          >
            Piano Roll
          </button>
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
          {state.ui.displayScreen === 'midiConfiguration' && (
            <MIDIConfiguration />
          )}
          {state.ui.displayScreen === 'pianoRoll' && <PianoRoll />}
          {state.ui.displayScreen === 'gridView' && <GridView />}
        </div>

        <EliseUIButtonRow className={css.padButtons}>
          <button
            className={classNames({ [css.activeButton]: padMode === 'clip' })}
            onClick={() => handleEnterPadClipMode(state, update)}
          >
            Bar ({state.ui.currentStepsPage + 1}/{maxPage + 1})
          </button>
          <button
            className={classNames({ [css.activeButton]: padMode === 'track' })}
            onClick={() => handleEnterPadTrackMode(state, update)}
          >
            Track ({state.ui.currentTrack + 1})
          </button>
          <button
            className={classNames({ [css.activeButton]: padMode === 'scene' })}
            onClick={() => handleEnterPadSceneMode(state, update)}
          >
            Scene ({state.ui.currentScene + 1})
          </button>
          <button disabled>Mute States</button>
          <button disabled>Drum</button>
          <button disabled>Chromatic</button>
        </EliseUIButtonRow>
      </div>

      <EliseUIPads />
    </div>
  );
}
