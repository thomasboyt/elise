interface MidiChannelEventBase {
  type: string;
  channel: number;
}

interface MidiNoteOnEvent extends MidiChannelEventBase {
  type: 'noteOn';
  key: number; // 0-127
  velocity: number; // 0-127
}

interface MidiNoteOffEvent extends MidiChannelEventBase {
  type: 'noteOff';
  key: number; // 0-127
  velocity: number; // 0-127
}

interface MidiPolyKeyPressureEvent extends MidiChannelEventBase {
  type: 'polyKeyPressure';
  key: number; // 0-127
  pressure: number; // 0-127
}

interface MidiControllerChangeEvent extends MidiChannelEventBase {
  type: 'controllerChange';
  controller: number;
  value: number; // 0-127
}

interface MidiProgramChangeEvent extends MidiChannelEventBase {
  type: 'programChange';
  preset: number;
}

interface MidiChannelPressureEvent extends MidiChannelEventBase {
  type: 'channelPressure';
  pressure: number;
}

interface MidiPitchBend extends MidiChannelEventBase {
  type: 'pitchBend';
  coarse: number;
  fine: number;
}

export type MidiChannelEvent =
  | MidiNoteOffEvent
  | MidiNoteOnEvent
  | MidiPolyKeyPressureEvent
  | MidiControllerChangeEvent
  | MidiProgramChangeEvent
  | MidiChannelPressureEvent
  | MidiPitchBend;
