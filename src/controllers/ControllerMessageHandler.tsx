import { useEffect, useRef } from 'react';
import { useEliseContext } from '../state/useEliseContext';
import { useMidiController } from './useMidiController';
import { PAD_HOLD_TIME } from '../ui/uiConstants';
import { getHeldStepIndex } from '../ui/getHeldStepIndex';
import { EliseState, insertNewStep } from '../state/state';

// This is basically stopgap architecture.
// I think probably I need to add some handlers to the EliseContext for a lot of this logic. But I do also need to figure out how to return side effects, that classic trick.
// Could also always consider updating controller something that the callsite has to manually account for - everything should be synchronous, at least?
// or could always try going full react and either sending everything to the controller every update, or get fancy and try to diff it
export function ControllerMessageHandler() {
  const controller = useMidiController();
  const { state, update } = useEliseContext();
  const updateColorTimeout = useRef<NodeJS.Timeout | null>(null);

  // Stick current state in a ref so that the useEffect() with the
  // event listeners can reference current state without actually
  // re-running and triggering a render and all that
  const stateRef = useRef<EliseState>(state);
  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (!controller) {
      return;
    }

    function handlePadOn(padIndex: number) {
      // TODO: IGNORE DRUM MODE
      const now = Date.now();

      if (stateRef.current.ui.heldPad !== null) {
        return;
      }

      update((draft) => {
        const { currentTrack, currentPattern } = draft.ui;
        draft.ui.heldPad = padIndex;
        draft.ui.heldPadStartTime = now;

        const stepIndex = getHeldStepIndex(draft);
        const existingStep =
          draft.project.patterns[currentPattern].tracks[currentTrack].steps[
            stepIndex!
          ];

        if (!existingStep) {
          const stepIndex = getHeldStepIndex(draft);
          insertNewStep(draft, currentPattern, currentTrack, stepIndex!);
          draft.ui.protectHeldPadDeletion = true;
        }
      });

      controller?.updatePadColor(padIndex, 'red');

      updateColorTimeout.current = setTimeout(() => {
        controller?.updatePadColor(padIndex, 'white');
      }, PAD_HOLD_TIME);
    }

    function handlePadOff(padIndex: number) {
      // TODO: IGNORE DRUM MODE
      clearTimeout(updateColorTimeout.current ?? undefined);
      updateColorTimeout.current = null;

      if (stateRef.current.ui.heldPad !== padIndex) {
        return;
      }

      const now = Date.now();

      const currentState = stateRef.current;
      const { currentTrack, currentPattern } = currentState.ui;
      const stepIndex = getHeldStepIndex(currentState);
      update((draft) => {
        draft.ui.heldPad = null;
      });
      const delta = now - (currentState.ui.heldPadStartTime ?? 0);

      if (stepIndex !== null) {
        if (delta < PAD_HOLD_TIME && !currentState.ui.protectHeldPadDeletion) {
          // turn off the step
          update((draft) => {
            draft.project.patterns[currentPattern].tracks[currentTrack].steps[
              stepIndex
            ] = null;
          });
          controller?.updatePadColor(padIndex, 'off');
        } else {
          // plocked stuff so just set back to green
          controller?.updatePadColor(padIndex, 'green');
        }
      } else {
        controller?.updatePadColor(padIndex, 'green');
      }
      update((draft) => {
        draft.ui.protectHeldPadDeletion = false;
      });
    }

    controller.on('padOn', handlePadOn);
    controller.on('padOff', handlePadOff);

    return () => {
      controller.off('padOn', handlePadOn);
      controller.off('padOff', handlePadOff);
    };
  }, [update, controller]);

  return <div />;
}
