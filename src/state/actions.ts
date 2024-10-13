import { Updater } from 'use-immer';
import { EliseState, EncoderBank } from './state';
import {
  getHeldStep,
  getStepIndexFromPadInClipMode,
  getTrackOrThrow,
} from './accessors';
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

    const stepIndex = getStepIndexFromPadInClipMode(currentState, padIndex);
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
    const stepIndex = getStepIndexFromPadInClipMode(currentState, padIndex);
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

export function handleKeyboardNoteOn(
  currentState: EliseState,
  update: Updater<EliseState>,
  _channel: number,
  note: number,
) {
  if (currentState.ui.heldNotes.includes(note)) {
    return;
  }

  if (currentState.ui.heldNotes.length === 0) {
    // starting a new "chord"
    update((draft) => {
      const step = getHeldStep(draft);
      if (step) {
        step.notes = [note];
      } else {
        draft.ui.nextStepSettings.notes = [note];
      }
    });
  } else {
    // add to existing chord
    update((draft) => {
      const step = getHeldStep(draft);
      if (step && !step.notes.includes(note)) {
        step.notes.push(note);
      } else if (!draft.ui.nextStepSettings.notes.includes(note)) {
        draft.ui.nextStepSettings.notes.push(note);
      }
    });
  }

  update((draft) => {
    if (!draft.ui.heldNotes.includes(note)) {
      draft.ui.heldNotes.push(note);
    }
  });

  // TODO: start note for live playback, somehow
}

export function handleKeyboardNoteOff(
  _currentState: EliseState,
  update: Updater<EliseState>,
  _channel: number,
  note: number,
) {
  update((draft) => {
    const index = draft.ui.heldNotes.findIndex((held) => held === note);

    if (index === -1) {
      return;
    }

    draft.ui.heldNotes.splice(index, 1);
  });
  // TODO: stop note for live playback, somehow
}

export function handlePrevEncoderBank(
  currentState: EliseState,
  update: Updater<EliseState>,
) {
  let prevPage: EncoderBank;
  if (currentState.ui.encoderBank === 'global') {
    return;
  }
  if (currentState.ui.encoderBank === 'note') {
    return;
  }
  if (currentState.ui.encoderBank === 'parameters') {
    prevPage = 'note';
  }
  if (currentState.ui.encoderBank === 'lfo') {
    prevPage = 'parameters';
  }

  update((draft) => {
    draft.ui.encoderBank = prevPage;
  });
}

export function handleNextEncoderBank(
  currentState: EliseState,
  update: Updater<EliseState>,
) {
  let nextPage: EncoderBank;
  if (currentState.ui.encoderBank === 'global') {
    return;
  }
  if (currentState.ui.encoderBank === 'note') {
    nextPage = 'parameters';
  }
  if (currentState.ui.encoderBank === 'parameters') {
    nextPage = 'lfo';
  }
  if (currentState.ui.encoderBank === 'lfo') {
    return;
  }

  update((draft) => {
    draft.ui.encoderBank = nextPage;
  });
}
