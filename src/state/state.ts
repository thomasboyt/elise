import { PadMode } from '../ui/uiModels';

interface MidiCcParameter {
  type: 'midiCc';
  controllerNumber: number;
  label: string;
  displayValueType: 'number' | 'percent';
}
interface MidiPcParameter {
  type: 'midiPc';
}
interface MidiPitchBendParameter {
  type: 'midiPitchBend';
}
type MidiParameter = MidiCcParameter | MidiPcParameter | MidiPitchBendParameter;

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

/**
 * This scene-level configuration will not be plockable. We might want to do that in
 * the future, but this will make it easier to build a separate management UI for CCs
 * that can support MIDI learn and stuff without it getting too weird.
 */
interface MidiParameterConfiguration {
  channel: number | null;
  destination: MidiDestination | null;
  parameters: MidiParameter[];
}

// ------------------
// Sequencer storage
// ------------------

interface ParameterLock {
  // Eventually I might want to add support for parameter-locking the LFO
  // settings, but for now I am lazy
  type: 'midiParameter';
  index: number;
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

interface MidiPatternTrack {
  // TODO: should steps lose their p-lock values when deactivated?
  steps: (MidiStep | null)[];
  pageLength: number;
  parameterValues: (number | null)[];
  lfo: null; // TODO (obviously)
  // these are settings that may not be exposed in pages, but only changed
  // via touch screen
  parameterConfiguration: MidiParameterConfiguration;
  swing: number;
}

interface Scene {
  tracks: MidiPatternTrack[];
  // these are settings that may not be exposed in pages, but only changed
  // via touch screen
  bpm: number;
}

export interface ProjectStorage {
  scenes: Scene[];
}

// ------------------
// UI concerns
// ------------------

export type UIPage = 'note' | 'parameters' | 'lfo';

export interface NextStepSettings {
  notes: number[];
  gate: number;
  velocity: number;
  offset: number;
}

export interface UIState {
  padMode: PadMode;

  heldPad: number | null;
  heldPadStartTime: number | null; // used to distinguish between "toggle" and "hold"
  protectHeldPadDeletion: boolean; // set true after a note is toggled on so we don't remove it when it's let go

  // UI navigation
  currentTrack: number;
  currentScene: number;
  currentPage: UIPage;
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

export function createEmptyTrack(): MidiPatternTrack {
  return {
    lfo: null,
    parameterConfiguration: {
      channel: null,
      destination: null,
      parameters: [
        {
          controllerNumber: 30,
          displayValueType: 'number',
          label: 'MIDI CC 30',
          type: 'midiCc',
        },
      ],
    },
    parameterValues: [null],
    steps: [...new Array(16)].map(() => null),
    swing: 0,
    pageLength: 16,
  };
}

export function createDefaultProjectStorage(): ProjectStorage {
  return {
    scenes: [
      {
        bpm: 120,
        tracks: [createEmptyTrack()],
      },
    ],
  };
}

export function createDefaultUIState(): UIState {
  return {
    padMode: 'clip',

    heldPad: null,
    heldPadStartTime: null,
    protectHeldPadDeletion: false,

    currentPage: 'note',
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

export function createDefaultEliseState(): EliseState {
  return {
    project: createDefaultProjectStorage(),
    ui: createDefaultUIState(),
  };
}
