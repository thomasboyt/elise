function arrayToMapByIndex<T>(array: T[]): Map<number, T> {
  return new Map(array.map((v, k) => [k, v]));
}

function reverseMap<K, V>(map: Map<K, V>): Map<V, K> {
  return new Map([...map.entries()].map(([k, v]) => [v, k]));
}

const padIndexToDawModeNote = arrayToMapByIndex([
  96, 97, 98, 99, 100, 101, 102, 103, 112, 113, 114, 115, 116, 117, 118, 119,
]);
const dawModeNoteToPadIndex = reverseMap(padIndexToDawModeNote);

const padIndexToDrumModeNote = arrayToMapByIndex([
  40, 41, 42, 43, 48, 49, 50, 51, 36, 37, 38, 39, 44, 45, 46, 47,
]);
const drumModeNoteToPadIndex = reverseMap(padIndexToDrumModeNote);

export const DawModePad = {
  fromNote(note: number): number {
    const index = dawModeNoteToPadIndex.get(note);
    console.log(dawModeNoteToPadIndex);
    if (index === undefined) {
      throw new Error(`Could not get pad index from DAW mode pad note ${note}`);
    }
    return index;
  },
  toNote(padIndex: number): number {
    const note = padIndexToDawModeNote.get(padIndex);
    if (note === undefined) {
      throw new Error(`Pad index out of bounds ${padIndex}`);
    }
    return note;
  },
};

export const DrumModePad = {
  fromNote(note: number): number {
    const index = drumModeNoteToPadIndex.get(note);
    if (index === undefined) {
      throw new Error(
        `Could not get pad index from drum mode pad note ${note}`,
      );
    }
    return index;
  },
  toNote(padIndex: number): number {
    const note = padIndexToDrumModeNote.get(padIndex);
    if (note === undefined) {
      throw new Error(`Pad index out of bounds ${padIndex}`);
    }
    return note;
  },
};

export type LaunchkeySkuType = 'regular' | 'mini';

// Page 9
export const regularButtonCCs = {
  Shift: 63,
  'Track Left': 103,
  'Track Right': 102,
  'Encoders Up': 51,
  'Encoders Down': 52,
  'Capture MIDI': 74,
  Undo: 77,
  Quantise: 75,
  Metronome: 76,
  Stop: 116,
  Loop: 118,
  Play: 115,
  Record: 117,
  'Pads Up': 106,
  'Pads Down': 107,
  'Pads Launch': 104,
  'Pads Function': 105,
};

// Page 9
export const miniButtonCCs = {
  Shift: 63,
  Play: 115,
  Record: 117,
  'Encoders Up': 55,
  'Encoders Down': 56,
  'Pads Up': 106,
  'Pads Down': 107,
  'Pads Launch': 104,
  'Pads Function': 105,
};

export const messageTargets = {
  dawModeLabel: 34,
};

// Page 5: SysEx message format used by the device
export function getSysExPrefix(sku: LaunchkeySkuType): number[] {
  return [240, 0, 32, 41, 2, sku === 'regular' ? 20 : 19];
}
