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

function minInOctave(noteNumber: number) {
  return Math.floor(noteNumber / 12) * 12;
}
function maxInOctave(noteNumber: number) {
  return (Math.ceil(noteNumber / 12) + 1) * 12 - 1;
}

export function PianoRoll() {
  const { state } = useEliseContext();

  const track = getTrackOrThrow(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
  );
  const cells = getCells(track); // memoize me probably
  let minRow = cells.findIndex((row) => row.some((cell) => cell === 'on'));
  minRow = minInOctave(minRow);
  let maxRow = cells.reduce((prevMax, row, rowIndex) => {
    if (row.some((cell) => cell === 'on')) {
      return rowIndex;
    }
    return prevMax;
  }, 0);
  maxRow = maxInOctave(maxRow);

  const gridRows = cells
    .slice(minRow, maxRow + 1)
    .map((row, idx) => {
      const noteNumber = idx + minRow;
      return (
        <GridRow
          key={noteNumber}
          rowLabel={WebMidiUtilities.toNoteIdentifier(noteNumber, 0)}
        >
          {row.map((cell, idx) => (
            <GridCell key={idx} state={cell} />
          ))}
        </GridRow>
      );
    })
    .reverse();

  return <BaseGrid scroll>{gridRows}</BaseGrid>;
}
