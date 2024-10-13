import { getHeldStep } from '../state/accessors';
import { useEliseContext } from '../state/useEliseContext';

export function EliseUINoteDisplay() {
  const { state } = useEliseContext();
  const currentNote = getHeldStep(state);
  const notes = (currentNote ?? state.ui.nextStepSettings).notes.join(', ');
  return <div>Notes: {notes}</div>;
}
