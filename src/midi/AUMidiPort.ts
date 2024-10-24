import { KaoriIncomingControllerMidiMessage } from '../util/kaoriIncomingMessages';
import { sendControllerMidiMessage, KaoriBridge } from '../util/KaoriBridge';
import { MidiInputPort, MidiOutputPort } from './MidiPort';

export class AUMidiOutputPort extends MidiOutputPort {
  port: number;

  constructor(port: number) {
    const label = `AU Output ${port}`;
    super(label);
    this.port = port;
  }

  sendControlChange(channel: number, controllerNumber: number, value: number) {
    sendControllerMidiMessage({
      port: this.port,
      type: 'controlChange',
      channel: channel - 1, // 0-indexed
      controllerNumber,
      value,
    });
  }

  sendNoteOn(channel: number, note: number, velocity: number) {
    sendControllerMidiMessage({
      port: this.port,
      type: 'noteOn',
      channel: channel - 1, // 0-indexed
      note,
      velocity,
    });
  }

  sendRaw(data: number[]) {
    sendControllerMidiMessage({
      port: this.port,
      type: 'raw',
      data,
    });
  }
}

export class AUMidiInputPort extends MidiInputPort {
  port: number;
  bridge: KaoriBridge;

  constructor(port: number, bridge: KaoriBridge) {
    const label = `AU Input ${port}`;
    super(label);
    this.port = port;
    this.bridge = bridge;
  }

  registerEventListeners() {
    this.bridge.on('controllerMidiMessage', this.handleControllerMidiMessage);
  }

  unregisterEventListeners() {
    this.bridge.off('controllerMidiMessage', this.handleControllerMidiMessage);
  }

  private handleControllerMidiMessage = (
    msg: KaoriIncomingControllerMidiMessage,
  ) => {
    if (msg.port !== this.port) {
      return;
    }
    if (msg.type === 'controlChange') {
      this.emit(
        'controlChange',
        msg.channel + 1,
        msg.controllerNumber,
        msg.value,
      );
    } else if (msg.type === 'noteOn') {
      this.emit('noteOn', msg.channel + 1, msg.note, msg.velocity);
    } else if (msg.type === 'noteOff') {
      this.emit('noteOff', msg.channel + 1, msg.note);
    }
  };
}
