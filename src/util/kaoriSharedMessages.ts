export interface WKMidiBaseMessage {
  type: string;
  port: number;
}

export interface WKMidiNoteOnMessage extends WKMidiBaseMessage {
  type: 'noteOn';
  channel: number;
  note: number;
  velocity: number;
}

export interface WKMidiNoteOffMessage extends WKMidiBaseMessage {
  type: 'noteOff';
  channel: number;
  note: number;
}

export interface WKMidiControlChangeMessage extends WKMidiBaseMessage {
  type: 'controlChange';
  channel: number;
  controllerNumber: number;
  value: number | null;
}

export interface WKMidiRawMessage extends WKMidiBaseMessage {
  type: 'raw';
  data: number[];
}

export type WKMidiMessage =
  | WKMidiControlChangeMessage
  | WKMidiNoteOnMessage
  | WKMidiNoteOffMessage
  | WKMidiRawMessage;
