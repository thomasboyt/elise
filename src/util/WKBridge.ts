import { TypedEventEmitter } from './TypedEventEmitter';

interface WKMidiBaseMessage {
  type: string;
  port: number;
}

interface WKMidiNoteOnMessage extends WKMidiBaseMessage {
  type: 'noteOn';
  channel: number;
  note: number;
  velocity: number;
}

interface WKMidiNoteOffMessage extends WKMidiBaseMessage {
  type: 'noteOff';
  channel: number;
  note: number;
}

interface WKMidiControlChangeMessage extends WKMidiBaseMessage {
  type: 'controlChange';
  channel: number;
  controllerNumber: number;
  value: number | null;
}

interface WKMidiRawMessage extends WKMidiBaseMessage {
  type: 'raw';
  data: number[];
}

type WKMidiMessage =
  | WKMidiControlChangeMessage
  | WKMidiNoteOnMessage
  | WKMidiNoteOffMessage
  | WKMidiRawMessage;

export const sendControllerMidiMessage = (msg: WKMidiMessage) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).webkit.messageHandlers.kaori.postMessage({
    type: 'midiController',
    detail: msg,
  });
};

export type IncomingControlerMidiMessage =
  | WKMidiNoteOnMessage
  | WKMidiNoteOffMessage
  | WKMidiControlChangeMessage;

export type WKBridgeEvents = {
  controllerMidiMessage: [IncomingControlerMidiMessage];
  updatePorts: [{ inputCount: number; outputCount: number }];
};

type KaoriMessage =
  | { type: 'midiController'; detail: WKMidiMessage }
  | { type: 'getInitialPorts' };

/**
 * Native app will call with evaluateJavascript():
 * window.wkBridge.sendMidiFromNativeApp(midiMessage);
 */
export class WKBridge extends TypedEventEmitter<WKBridgeEvents> {
  register() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).wkBridge = this;
  }

  unregister() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).wkBridge;
  }

  private wkPostMessage(msg: KaoriMessage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).webkit.messageHandlers.kaori.postMessage(msg);
  }

  async getInitialPorts() {
    const reply = await this.wkPostMessage({
      type: 'getInitialPorts',
    });

    return {
      inputCount: reply.inputCount,
      outputCount: reply.outputCount,
    };
  }

  // Global functions called by native app injecting with evaluateJavascript():
  sendMidiFromNativeApp(msg: IncomingControlerMidiMessage) {
    // TODO: this is over an i/o barrier and runtime validation of message might be nice
    this.emit('controllerMidiMessage', msg);
  }

  updatePorts(inputCount: number, outputCount: number) {
    this.emit('updatePorts', { inputCount, outputCount });
  }
}
