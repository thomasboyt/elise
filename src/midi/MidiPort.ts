import { TypedEventEmitter } from '../util/TypedEventEmitter';

export type MidiPortEvents = {
  noteOn: [channel: number, value: number, velocity: number];
  noteOff: [channel: number, value: number];
  controlChange: [channel: number, controller: number, value: number | null];
};

export abstract class MidiOutputPort {
  readonly label: string;

  constructor(label: string) {
    this.label = label;
  }

  abstract sendControlChange(
    channel: number,
    controllerNumber: number,
    value: number,
  ): void;
  abstract sendNoteOn(channel: number, note: number, velocity: number): void;
  abstract sendRaw(data: number[]): void;
}

export abstract class MidiInputPort extends TypedEventEmitter<MidiPortEvents> {
  readonly label: string;

  constructor(label: string) {
    super();
    this.label = label;
  }

  abstract registerEventListeners(): void;
  abstract unregisterEventListeners(): void;
}
