import {
  getInitialPortsReplySchema,
  KaoriClientRequest,
} from './kaoriClientMessages';
import { KaoriIncomingControllerMidiMessage } from './kaoriIncomingMessages';
import { WKMidiMessage } from './kaoriSharedMessages';
import { TypedEventEmitter } from './TypedEventEmitter';

export const sendControllerMidiMessage = (msg: WKMidiMessage) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).webkit.messageHandlers.kaori.postMessage({
    type: 'midiController',
    detail: msg,
  });
};

export type WKBridgeEvents = {
  controllerMidiMessage: [KaoriIncomingControllerMidiMessage];
  updatePorts: [{ inputCount: number; outputCount: number }];
};

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

  private wkPostMessage(msg: KaoriClientRequest) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).webkit.messageHandlers.kaori.postMessage(msg);
  }

  async getInitialPorts() {
    const reply = await this.wkPostMessage({
      type: 'getInitialPorts',
    });
    const parsed = getInitialPortsReplySchema.parse(reply);

    return {
      inputCount: parsed.inputCount,
      outputCount: parsed.outputCount,
    };
  }

  // Global functions called by native app injecting with evaluateJavascript():
  sendMidiFromNativeApp(msg: KaoriIncomingControllerMidiMessage) {
    // TODO: this is over an i/o barrier and runtime validation of message might be nice
    this.emit('controllerMidiMessage', msg);
  }

  updatePorts(inputCount: number, outputCount: number) {
    this.emit('updatePorts', { inputCount, outputCount });
  }
}
