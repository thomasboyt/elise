import { Updater } from 'use-immer';
import { EliseState } from './state';
import { getStepIndexFromPad } from '../ui/getHeldStepIndex';
import { getTrackOrThrow } from './accessors';
import {
  changePadMode,
  changeScene,
  changeTrack,
  enableProtectHeldPadDeletion,
  insertNewStep,
  removeStep,
  setHeldPad,
  unsetHeldPad,
} from './updateState';
import { PAD_HOLD_TIME } from '../ui/uiConstants';

// TODO: should this be in state? timeouts are weird lol
let updateColorTimeout: NodeJS.Timeout | null = null;

export function handlePadOn(
  currentState: EliseState,
  update: Updater<EliseState>,
  padIndex: number,
) {
  if (currentState.ui.heldPad !== null) {
    return;
  }

  if (currentState.ui.padMode === 'clip') {
    const { currentTrack, currentScene } = currentState.ui;

    const stepIndex = getStepIndexFromPad(currentState, padIndex);
    const existingStep = getTrackOrThrow(
      currentState,
      currentScene,
      currentTrack,
    ).steps[stepIndex!];

    if (!existingStep) {
      insertNewStep(update, currentScene, currentTrack, stepIndex);
    }
  } else if (currentState.ui.padMode === 'track') {
    changeTrack(update, padIndex);
  } else if (currentState.ui.padMode === 'scene') {
    changeScene(update, padIndex);
  }

  setHeldPad(update, padIndex, Date.now());

  updateColorTimeout = setTimeout(() => {
    enableProtectHeldPadDeletion(update);
  }, PAD_HOLD_TIME);
}

export function handlePadOff(
  currentState: EliseState,
  update: Updater<EliseState>,
  padIndex: number,
) {
  clearTimeout(updateColorTimeout ?? undefined);
  updateColorTimeout = null;

  if (currentState.ui.heldPad !== padIndex) {
    return;
  }

  if (currentState.ui.padMode === 'clip') {
    const { currentTrack, currentScene } = currentState.ui;
    const stepIndex = getStepIndexFromPad(currentState, padIndex);
    if (stepIndex !== null) {
      if (!currentState.ui.protectHeldPadDeletion) {
        removeStep(update, currentScene, currentTrack, stepIndex);
      }
    }
  }

  unsetHeldPad(update);
}

export function handleEnterPadClipMode(
  currentState: EliseState,
  update: Updater<EliseState>,
) {
  if (currentState.ui.heldPad !== null) {
    handlePadOff(currentState, update, currentState.ui.heldPad);
  }
  changePadMode(update, 'clip');
}

export function handleEnterPadSceneMode(
  currentState: EliseState,
  update: Updater<EliseState>,
) {
  if (currentState.ui.heldPad !== null) {
    handlePadOff(currentState, update, currentState.ui.heldPad);
  }
  changePadMode(update, 'scene');
}

export function handleEnterPadTrackMode(
  currentState: EliseState,
  update: Updater<EliseState>,
) {
  if (currentState.ui.heldPad !== null) {
    handlePadOff(currentState, update, currentState.ui.heldPad);
  }
  changePadMode(update, 'track');
}
