import { PadMode } from '../ui/uiModels';
import { extendArrayToLength } from '../util/extendArrayToLength';

// Ideally these would be stable between plugging in and unplugging things.
// Not sure what options exist for that!
interface MidiHardwareDestination {
  type: 'hardware';
  id: string; // beef this up with stability - name, manufacturer, port?
}

interface MidiAllHardwareDestination {
  type: 'allHardware';
}

type MidiDestination = MidiAllHardwareDestination | MidiHardwareDestination;

export type MidiParameterType = 'midiCc' | 'midiPc' | 'midiPitchBend';
interface BaseMidiParameter {
  type: MidiParameterType;
  channel: number | null;
  destination: MidiDestination | null;
}
interface MidiCcParameter extends BaseMidiParameter {
  type: 'midiCc';
  controllerNumber: number;
  label: string;
  displayValueType: 'number' | 'percent';
}
interface MidiPcParameter extends BaseMidiParameter {
  type: 'midiPc';
}
interface MidiPitchBendParameter extends BaseMidiParameter {
  type: 'midiPitchBend';
}
export type MidiParameter =
  | MidiCcParameter
  | MidiPcParameter
  | MidiPitchBendParameter;

// ------------------
// Sequencer storage
// ------------------

interface ParameterLock {
  // Eventually I might want to add support for parameter-locking the LFO
  // settings, but for now I am lazy
  type: 'midiParameter';
  id: string;
  value: number;
}

export interface MidiStep {
  // These are stored as a map of name -> value
  // For now the only name format is `midiParameter-${idx}`
  parameterLocks: Record<string, ParameterLock>;
  // conditionalLogic: ...
  notes: number[];
  velocity: number;
  gate: number;
  offset: number;
}

export interface MidiClipTrack {
  steps: (MidiStep | null)[];
  pageLength: number;
  lfo: null; // TODO (obviously)
  // these are settings that may not be exposed in pages, but only changed
  // via touch screen
  /**
   * This scene-level configuration will not be plockable. We might want to do
   * that in the future, but this will make it easier to build a separate
   * management UI for CCs that can support MIDI learn and stuff without it
   * getting too weird.
   */
  parameterConfiguration: Record<string, MidiParameter>;
  parameterOrder: string[];
  parameterValues: Record<string, number | null>;
  swing: number;
  midiNoteChannel: number | null;
}

export interface Scene {
  tracks: (MidiClipTrack | null)[];
  bpmOverride: number | null;
}

/**
 * ProjectStorage is anything that gets saved when you press "save".
 */
export interface ProjectStorage {
  scenes: (Scene | null)[];
  bpm: number;
}

// ------------------
// UI concerns
// ------------------

export type EncoderBank = 'note' | 'parameters' | 'lfo' | 'global';
export type NoteParameter = 'gate' | 'velocity' | 'offset';
export type DisplayScreen =
  | 'main'
  | 'midiConfiguration'
  | 'pianoRoll'
  | 'gridView';

export interface NextStepSettings {
  notes: number[];
  gate: number;
  velocity: number;
  offset: number;
}

/**
 * UIState is anything that doesn't persist in the project.
 *
 * This may expand to include playback state, not sure yet. Might make sense to
 * keep in a separate thing, but there's stuff like "mute states" that could be
 * in either.
 */
export interface UIState {
  padMode: PadMode;
  encoderBank: EncoderBank;
  displayScreen: DisplayScreen;

  heldPad: number | null;
  heldPadStartTime: number | null; // used to distinguish between "toggle" and "hold"
  protectHeldPadDeletion: boolean; // set true after a note is toggled on so we don't remove it when it's let go

  heldNotes: number[];

  // UI navigation
  currentTrack: number;
  currentScene: number;
  currentStepsPage: number;

  // The settings that the next note will be placed at.
  // This is different from how Elektron sequencers work - those just require
  // p-locking after placing a trig. This is more like a Circuit Tracks (IIRC?).
  nextStepSettings: NextStepSettings;
}

export interface EliseState {
  project: ProjectStorage;
  ui: UIState;
}

export function createEmptyTrack(): MidiClipTrack {
  return {
    lfo: null,
    parameterConfiguration: {},
    parameterOrder: [],
    parameterValues: {},
    steps: new Array(16).fill(null),
    swing: 0,
    pageLength: 16,
    midiNoteChannel: null,
  };
}

export function createEmptyScene(): Scene {
  return {
    bpmOverride: null,
    tracks: extendArrayToLength([createEmptyTrack()], 16, null),
  };
}

export function createDefaultProjectStorage(): ProjectStorage {
  return {
    bpm: 120,
    scenes: extendArrayToLength([createEmptyScene()], 16, null),
  };
}

export function createDefaultUIState(): UIState {
  return {
    padMode: 'clip',
    encoderBank: 'note',
    displayScreen: 'main',

    heldPad: null,
    heldPadStartTime: null,
    protectHeldPadDeletion: false,
    heldNotes: [],

    currentScene: 0,
    currentTrack: 0,
    currentStepsPage: 0,

    nextStepSettings: {
      notes: [60],
      gate: 1,
      velocity: 127,
      offset: 0,
    },
  };
}

export function createDefaultEliseState(project: ProjectStorage): EliseState {
  return {
    project,
    ui: createDefaultUIState(),
  };
}
