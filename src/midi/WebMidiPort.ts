import { MidiInputPort, MidiOutputPort } from './MidiPort';
import {
  Output as WMOutput,
  Input as WMInput,
  ControlChangeMessageEvent,
  NoteMessageEvent,
} from 'webmidi';

export class WebMidiOutputPort extends MidiOutputPort {
  port: WMOutput;

  constructor(label: string, port: WMOutput) {
    super(label);
    this.port = port;
  }

  sendControlChange(channel: number, controllerNumber: number, value: number) {
    this.port.sendControlChange(controllerNumber, value, {
      channels: [channel],
    });
  }

  sendNoteOn(channel: number, note: number, velocity: number) {
    this.port.sendNoteOn(note, {
      rawAttack: velocity,
      channels: [channel],
    });
  }

  sendRaw(data: number[]) {
    this.port.send(data);
  }
}

export class WebMidiInputPort extends MidiInputPort {
  port: WMInput;

  constructor(label: string, port: WMInput) {
    super(label);
    this.port = port;
  }

  registerEventListeners() {
    this.port.addListener('controlchange', this.handleControlChange);
    this.port.addListener('noteon', this.handleNoteOn);
    this.port.addListener('noteoff', this.handleNoteOff);
  }

  unregisterEventListeners() {
    this.port.removeListener('controlchange', this.handleControlChange);
    this.port.removeListener('noteon', this.handleNoteOn);
    this.port.removeListener('noteoff', this.handleNoteOff);
  }

  private handleControlChange = (e: ControlChangeMessageEvent) => {
    this.emit(
      'controlChange',
      e.message.channel,
      e.controller.number,
      e.rawValue ?? null,
    );
  };

  private handleNoteOn = (e: NoteMessageEvent) => {
    this.emit('noteOn', e.message.channel, e.note.number, e.note.rawAttack);
  };

  private handleNoteOff = (e: NoteMessageEvent) => {
    this.emit('noteOff', e.message.channel, e.note.number);
  };
}
