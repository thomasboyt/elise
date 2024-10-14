import { Utilities as WebMidiUtilities } from 'webmidi';
import { getTrackOrThrow } from '../../state/accessors';
import { MidiClipTrack } from '../../state/state';
import { useEliseContext } from '../../state/useEliseContext';
import { extendArrayToLength } from '../../util/extendArrayToLength';
import { CellState, GridCell } from '../BaseGrid/GridCell';
import { GridRow } from '../BaseGrid/GridRow';
import { BaseGrid } from '../BaseGrid/BaseGrid';

function getCells(track: MidiClipTrack): CellState[][] {
  const steps = extendArrayToLength(track.steps, 64, null);
  return [...new Array(128)].map((_, rowNote) => {
    return steps.map((step, stepIdx): CellState => {
      if (stepIdx > track.steps.length) {
        return 'disabled';
      }
      const hasNote = step?.notes.find((note) => note === rowNote);
      return hasNote ? 'on' : 'off';
    });
  });
}

export function PianoRoll() {
  const { state } = useEliseContext();

  const track = getTrackOrThrow(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
  );
  const cells = getCells(track); // memoize me probably

  const gridRows = cells
    .map((row, idx) => (
      <GridRow key={idx} rowLabel={WebMidiUtilities.toNoteIdentifier(idx, 0)}>
        {row.map((cell, idx) => (
          <GridCell key={idx} state={cell} />
        ))}
      </GridRow>
    ))
    .reverse();

  return <BaseGrid scroll>{gridRows}</BaseGrid>;
}
