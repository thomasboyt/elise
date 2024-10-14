import { Utilities as WebmidiUtilities } from 'webmidi';
import { getHeldStep } from '../state/accessors';
import { useEliseContext } from '../state/useEliseContext';

export function EliseUINoteDisplay() {
  const { state } = useEliseContext();
  const currentNote = getHeldStep(state);
  const notes = (currentNote ?? state.ui.nextStepSettings).notes
    .concat() // copy array
    .sort((a, b) => (a > b ? 1 : -1))
    .map((numberNote) => WebmidiUtilities.toNoteIdentifier(numberNote, 0))
    .join(', ');
  return <div>Notes: {notes}</div>;
}
