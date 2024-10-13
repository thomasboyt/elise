import { useEffect, useRef } from 'react';
import { useEliseContext } from '../state/useEliseContext';
import { useMidiController } from './useMidiController';
import { getStepIndexFromPad } from '../ui/getHeldStepIndex';
import { EliseState, NoteParameter } from '../state/state';
import { getControllerState } from './ControllerState';
import {
  setNextStepNoteParameter,
  setStepNoteParameter,
} from '../state/updateState';
import {
  handleEnterPadClipMode,
  handleEnterPadSceneMode,
  handleEnterPadTrackMode,
  handlePadOff,
  handlePadOn,
} from '../state/actions';
import { Updater } from 'use-immer';

// This is basically stopgap non-architecture.
//
// I think probably I need to add some handlers to the EliseContext for a lot of
// this logic. But I do also need to figure out how to return side effects, that
// classic trick. Could also always consider updating controller something that
// the callsite has to manually account for - everything should be synchronous,
// at least? or could always try going full react and either sending everything
// to the controller every update, or get fancy and try to diff it
export function ControllerMessageHandler() {
  const controller = useMidiController();
  const { state, update } = useEliseContext();

  // Stick current state in a ref so that the useEffect() with the
  // event listeners can reference current state without actually
  // re-running and triggering a render and all that
  const stateRef = useRef<EliseState>(state);
  useEffect(() => {
    if (stateRef.current !== state) {
      controller?.handleStateUpdate(getControllerState(state));
    }
    stateRef.current = state;
  });

  useEffect(() => {
    if (!controller) {
      return;
    }

    function handleAbsoluteEncoderUpdated(encoderIndex: number, value: number) {
      const { currentTrack, currentScene } = stateRef.current.ui;
      let currentStep = null;
      if (stateRef.current.ui.heldPad !== null) {
        currentStep = getStepIndexFromPad(
          stateRef.current,
          stateRef.current.ui.heldPad,
        );
      }

      if (stateRef.current.ui.encoderBank === 'note') {
        // TODO: better mapping here lmao
        const mapping: Record<number, NoteParameter> = {
          0: 'velocity',
          1: 'gate',
          2: 'offset',
        };
        const parameter = mapping[encoderIndex];
        if (!parameter) {
          return;
        }
        if (currentStep === null) {
          setNextStepNoteParameter(update, parameter, value);
        } else {
          setStepNoteParameter(
            update,
            currentScene,
            currentTrack,
            currentStep,
            parameter,
            value,
          );
        }
      } else if (stateRef.current.ui.encoderBank === 'parameters') {
        // TODO
      }
    }

    // i am too tired to type this properly rn
    // the ...args T[] bit is super not workin but at least it type checks
    function bind<T>(
      fn: (
        state: EliseState,
        update: Updater<EliseState>,
        ...args: T[]
      ) => void,
    ) {
      return (...args: T[]) => fn(stateRef.current, update, ...args);
    }
    const boundPadOn = bind(handlePadOn);
    const boundPadOff = bind(handlePadOff);
    const boundEnterPadClipMode = bind(handleEnterPadClipMode);
    const boundEnterPadSceneMode = bind(handleEnterPadSceneMode);
    const boundEnterPadTrackMode = bind(handleEnterPadTrackMode);

    controller.on('padOn', boundPadOn);
    controller.on('padOff', boundPadOff);
    controller.on('enterPadClipMode', boundEnterPadClipMode);
    controller.on('enterPadSceneMode', boundEnterPadSceneMode);
    controller.on('enterPadTrackMode', boundEnterPadTrackMode);
    // controller.on('enterPadMuteMode', handleEnterPadMuteMode);
    // controller.on('enterPadDrumMode', handleEnterPadDrumMode);
    // controller.on('enterPadChromaticMode', handleEnterPadChromaticMode);
    // controller.on('nextClipBar', handleNextClipBar);
    // controller.on('prevClipBar', handlePrevClipBar);
    controller.on('absoluteEncoderUpdated', handleAbsoluteEncoderUpdated);
    // controller.on('relativeEncoderUpdated', handleRelativeEncoderUpdated);
    // controller.on('nextEncoderBank', handleNextEncoderBank);
    // controller.on('prevEncoderBank', handlePrevEncoderBank);

    return () => {
      controller.off('padOn', boundPadOn);
      controller.off('padOff', boundPadOff);
      controller.off('enterPadClipMode', boundEnterPadClipMode);
      controller.off('enterPadSceneMode', boundEnterPadSceneMode);
      controller.off('enterPadTrackMode', boundEnterPadTrackMode);
      // controller.off('enterPadMuteMode', handleEnterPadMuteMode);
      // controller.off('enterPadDrumMode', handleEnterPadDrumMode);
      // controller.off('enterPadChromaticMode', handleEnterPadChromaticMode);
      // controller.off('nextClipBar', handleNextClipBar);
      // controller.off('prevClipBar', handlePrevClipBar);
      controller.off('absoluteEncoderUpdated', handleAbsoluteEncoderUpdated);
      // controller.off('relativeEncoderUpdated', handleRelativeEncoderUpdated);
      // controller.off('nextEncoderBank', handleNextEncoderBank);
      // controller.off('prevEncoderBank', handlePrevEncoderBank);
    };
  }, [update, controller]);

  return <div />;
}
