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
 * This pattern-level configuration will not be plockable. We might want to do that in
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

interface MidiStep {
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

interface Pattern {
  tracks: MidiPatternTrack[];
  // these are settings that may not be exposed in pages, but only changed
  // via touch screen
  bpm: number;
}

export interface ProjectStorage {
  patterns: Pattern[];
}

// ------------------
// UI concerns
// ------------------

export type UIPage = 'note' | 'parameters' | 'lfo';

export interface UIState {
  heldPad: number | null;
  heldPadStartTime: number | null; // used to distinguish between "toggle" and "hold"
  protectHeldPadDeletion: boolean; // set true after a note is toggled on so we don't remove it when it's let go

  // UI navigation
  currentTrack: number;
  currentPattern: number;
  currentPage: UIPage;
  currentStepsPage: number;

  // The settings that the next note will be placed at.
  // This is different from how Elektron sequencers work - those just require
  // p-locking after placing a trig. This is more like a Circuit Tracks (IIRC?).
  nextStepSettings: {
    notes: number[];
    gate: number;
    velocity: number;
    offset: number;
  };
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

export function insertNewStep(
  state: EliseState,
  patternIndex: number,
  trackIndex: number,
  stepIndex: number,
) {
  const step: MidiStep = {
    gate: state.ui.nextStepSettings.gate,
    notes: [...state.ui.nextStepSettings.notes],
    parameterLocks: {},
    offset: state.ui.nextStepSettings.offset,
    velocity: state.ui.nextStepSettings.velocity,
  };

  state.project.patterns[patternIndex].tracks[trackIndex].steps[stepIndex] =
    step;
}

export function createDefaultProjectStorage(): ProjectStorage {
  return {
    patterns: [
      {
        bpm: 120,
        tracks: [createEmptyTrack()],
      },
    ],
  };
}

export function createDefaultUIState(): UIState {
  return {
    heldPad: null,
    heldPadStartTime: null,
    protectHeldPadDeletion: false,

    currentPage: 'note',
    currentPattern: 0,
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