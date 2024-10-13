import { useEffect, useRef } from 'react';
import { Updater } from 'use-immer';
import { useEliseContext } from '../state/useEliseContext';
import { useMidiController } from './useMidiController';
import { EliseState } from '../state/state';
import { getControllerState } from './ControllerState';
import {
  handleEnterPadClipMode,
  handleEnterPadSceneMode,
  handleEnterPadTrackMode,
  handleKeyboardNoteOn,
  handleKeyboardNoteOff,
  handlePadOff,
  handlePadOn,
} from '../state/actions';
import {
  getUIMidiParameter,
  noteParametersByEncoderIndex,
} from '../ui/uiParameters';

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
      if (stateRef.current.ui.encoderBank === 'note') {
        const noteParameter = noteParametersByEncoderIndex[encoderIndex];
        if (!noteParameter) {
          return;
        }
        noteParameter.set(update, value);
      } else if (stateRef.current.ui.encoderBank === 'parameters') {
        const midiParameter = getUIMidiParameter(encoderIndex);
        midiParameter.set(update, value);
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
    const boundKeyboardNoteOn = bind(handleKeyboardNoteOn);
    const boundKeyboardNoteOff = bind(handleKeyboardNoteOff);

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
    controller.on('keyboardNoteOn', boundKeyboardNoteOn);
    controller.on('keyboardNoteOff', boundKeyboardNoteOff);

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
      controller.off('keyboardNoteOn', boundKeyboardNoteOn);
      controller.off('keyboardNoteOff', boundKeyboardNoteOff);
    };
  }, [update, controller]);

  return <div />;
}
