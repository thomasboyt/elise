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
  handlePrevEncoderBank,
  handleNextEncoderBank,
  handleNextClipBar,
  handlePrevClipBar,
} from '../state/actions';
import {
  getUIMidiParameter,
  noteParametersByEncoderIndex,
} from '../ui/uiParameters';
import { getTrackOrThrow } from '../state/accessors';

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
        noteParameter.setRawValue(update, value);
      } else if (stateRef.current.ui.encoderBank === 'parameters') {
        const track = getTrackOrThrow(
          stateRef.current,
          stateRef.current.ui.currentScene,
          stateRef.current.ui.currentTrack,
        );
        const paramId = track.parameterOrder[encoderIndex];
        if (paramId) {
          const midiParameter = getUIMidiParameter(paramId);
          midiParameter.setRawValue(update, value);
        }
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
    const boundNextEncoderBank = bind(handleNextEncoderBank);
    const boundPrevEncoderBank = bind(handlePrevEncoderBank);
    const boundKeyboardNoteOn = bind(handleKeyboardNoteOn);
    const boundKeyboardNoteOff = bind(handleKeyboardNoteOff);
    const boundNextClipBar = bind(handleNextClipBar);
    const boundPrevClipBar = bind(handlePrevClipBar);

    controller.on('padOn', boundPadOn);
    controller.on('padOff', boundPadOff);
    controller.on('enterPadClipMode', boundEnterPadClipMode);
    controller.on('enterPadSceneMode', boundEnterPadSceneMode);
    controller.on('enterPadTrackMode', boundEnterPadTrackMode);
    // controller.on('enterPadMuteMode', handleEnterPadMuteMode);
    // controller.on('enterPadDrumMode', handleEnterPadDrumMode);
    // controller.on('enterPadChromaticMode', handleEnterPadChromaticMode);
    controller.on('nextClipBar', boundNextClipBar);
    controller.on('prevClipBar', boundPrevClipBar);
    controller.on('absoluteEncoderUpdated', handleAbsoluteEncoderUpdated);
    // controller.on('relativeEncoderUpdated', handleRelativeEncoderUpdated);
    controller.on('nextEncoderBank', boundNextEncoderBank);
    controller.on('prevEncoderBank', boundPrevEncoderBank);
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
      controller.off('nextClipBar', boundNextClipBar);
      controller.off('prevClipBar', boundPrevClipBar);
      controller.off('absoluteEncoderUpdated', handleAbsoluteEncoderUpdated);
      // controller.off('relativeEncoderUpdated', handleRelativeEncoderUpdated);
      controller.off('nextEncoderBank', boundNextEncoderBank);
      controller.off('prevEncoderBank', boundPrevEncoderBank);
      controller.off('keyboardNoteOn', boundKeyboardNoteOn);
      controller.off('keyboardNoteOff', boundKeyboardNoteOff);
    };
  }, [update, controller]);

  return <div />;
}
