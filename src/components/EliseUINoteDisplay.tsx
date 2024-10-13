import { getCurrentStep } from '../state/accessors';
import { useEliseContext } from '../state/useEliseContext';

export function EliseUINoteDisplay() {
  const { state } = useEliseContext();
  const currentNote = getCurrentStep(state);
  const notes = (currentNote ?? state.ui.nextStepSettings).notes;
  return <div>Notes: {notes}</div>;
}
