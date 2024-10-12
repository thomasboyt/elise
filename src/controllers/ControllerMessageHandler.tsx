import { useEffect, useRef } from 'react';
import { useEliseContext } from '../state/useEliseContext';
import { useMidiController } from './useMidiController';
import { PAD_HOLD_TIME } from '../ui/uiConstants';
import { getStepIndexFromPad } from '../ui/getHeldStepIndex';
import { EliseState } from '../state/state';
import { getControllerState } from './ControllerState';
import {
  changePadMode,
  changeScene,
  changeTrack,
  enableProtectHeldPadDeletion,
  insertNewStep,
  removeStep,
  setHeldPad,
  unsetHeldPad,
} from '../state/updateState';

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
  const updateColorTimeout = useRef<NodeJS.Timeout | null>(null);

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

    function handlePadOn(padIndex: number) {
      if (stateRef.current.ui.heldPad !== null) {
        return;
      }

      if (stateRef.current.ui.padMode === 'clip') {
        const { currentTrack, currentScene } = stateRef.current.ui;

        const stepIndex = getStepIndexFromPad(stateRef.current, padIndex);
        const existingStep =
          stateRef.current.project.scenes[currentScene].tracks[currentTrack]
            .steps[stepIndex!];

        if (!existingStep) {
          insertNewStep(update, currentScene, currentTrack, stepIndex);
        }
      } else if (stateRef.current.ui.padMode === 'track') {
        changeTrack(update, padIndex);
      } else if (stateRef.current.ui.padMode === 'scene') {
        changeScene(update, padIndex);
      }

      setHeldPad(update, padIndex, Date.now());

      updateColorTimeout.current = setTimeout(() => {
        enableProtectHeldPadDeletion(update);
      }, PAD_HOLD_TIME);
    }

    function handlePadOff(padIndex: number) {
      clearTimeout(updateColorTimeout.current ?? undefined);
      updateColorTimeout.current = null;

      if (stateRef.current.ui.heldPad !== padIndex) {
        return;
      }

      if (stateRef.current.ui.padMode === 'clip') {
        const { currentTrack, currentScene } = stateRef.current.ui;
        const stepIndex = getStepIndexFromPad(stateRef.current, padIndex);
        if (stepIndex !== null) {
          if (!stateRef.current.ui.protectHeldPadDeletion) {
            removeStep(update, currentScene, currentTrack, stepIndex);
          }
        }
      }

      unsetHeldPad(update);
    }

    function handleEnterPadClipMode() {
      if (stateRef.current.ui.heldPad !== null) {
        handlePadOff(stateRef.current.ui.heldPad);
      }
      changePadMode(update, 'clip');
    }
    function handleEnterPadSceneMode() {
      if (stateRef.current.ui.heldPad !== null) {
        handlePadOff(stateRef.current.ui.heldPad);
      }
      changePadMode(update, 'scene');
    }
    function handleEnterPadTrackMode() {
      if (stateRef.current.ui.heldPad !== null) {
        handlePadOff(stateRef.current.ui.heldPad);
      }
      changePadMode(update, 'track');
    }

    controller.on('padOn', handlePadOn);
    controller.on('padOff', handlePadOff);
    // controller.on('absoluteEncoderUpdated', handleAbsoluteEncoderUpdated);
    // controller.on('relativeEncoderUpdated', handleRelativeEncoderUpdated);
    controller.on('enterPadClipMode', handleEnterPadClipMode);
    controller.on('enterPadSceneMode', handleEnterPadSceneMode);
    controller.on('enterPadTrackMode', handleEnterPadTrackMode);
    // controller.on('enterPadMuteMode', handleEnterPadMuteMode);
    // controller.on('enterPadDrumMode', handleEnterPadDrumMode);
    // controller.on('enterPadChromaticMode', handleEnterPadChromaticMode);
    // controller.on('nextClipBar', handleNextClipBar);
    // controller.on('prevClipBar', handlePrevClipBar);
    // controller.on('nextEncoderBank', handleNextEncoderBank);
    // controller.on('prevEncoderBank', handlePrevEncoderBank);

    return () => {
      controller.off('padOn', handlePadOn);
      controller.off('padOff', handlePadOff);
      // controller.off('absoluteEncoderUpdated', handleAbsoluteEncoderUpdated);
      // controller.off('relativeEncoderUpdated', handleRelativeEncoderUpdated);
      controller.off('enterPadClipMode', handleEnterPadClipMode);
      controller.off('enterPadSceneMode', handleEnterPadSceneMode);
      controller.off('enterPadTrackMode', handleEnterPadTrackMode);
      // controller.off('enterPadMuteMode', handleEnterPadMuteMode);
      // controller.off('enterPadDrumMode', handleEnterPadDrumMode);
      // controller.off('enterPadChromaticMode', handleEnterPadChromaticMode);
      // controller.off('nextClipBar', handleNextClipBar);
      // controller.off('prevClipBar', handlePrevClipBar);
      // controller.off('nextEncoderBank', handleNextEncoderBank);
      // controller.off('prevEncoderBank', handlePrevEncoderBank);
    };
  }, [update, controller]);

  return <div />;
}
