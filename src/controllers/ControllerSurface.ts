import * as WebMidi from 'webmidi';
import { TypedEventEmitter } from '../util/TypedEventEmitter';
import { ControllerState } from './ControllerState';
import { UIPage } from '../state/state';
import { PadColor } from '../ui/uiModels';

export type ControllerSurfaceEvents = {
  padOn: [padIndex: number, velocity: number];
  padOff: [padIndex: number];
  absoluteEncoderUpdated: [encoderIndex: number, value: number];
  relativeEncoderUpdated: [encoderIndex: number, offset: number];
  nextEncoderPage: () => void;
  prevEncoderPage: () => void;

  // These are all 1:1 with Launchkey controls and might need tweaking based on
  // what controls we actually wind up with
  setEncoderMode: (mode: number) => void;
  setPadMode: (mode: number) => void;
  padUp: () => void;
  padDown: () => void;
  sceneLaunch: () => void;
  func: () => void; // probably going to turn this into a "shift" with on/off events
  shift: () => void; // same as above, but can't be used with pads!
  play: () => void;
  record: () => void;

  // Launchkey regular only!
  trackLeft: () => void; // labeled as shift+padUp on mini
  trackRight: () => void; // labeled as shift+padDown on mini
  stop: () => void;
  loop: () => void;
  captureMidi: () => void;
  metronome: () => void;
  quantize: () => void;
  undo: () => void;
};

/**
 * A generic MIDI controller binding, to be subclassed by individual implementations
 * of controllers for hardware/software.
 */
export abstract class ControllerSurface extends TypedEventEmitter<ControllerSurfaceEvents> {
  abstract initController(): void;
  abstract teardownController(): void;
  abstract resetFromState(snapshot: ControllerState): void;
  abstract changePage(page: UIPage): void;
  abstract updatePadColor(padIndex: number, color: PadColor): void;
  abstract updateEncoderName(encoderIndex: number, name: string): void;
  abstract updateEncoderValue(encoderIndex: number, value: number): void;
}

export abstract class HardwareControllerSurface extends ControllerSurface {
  input: WebMidi.Input;
  output: WebMidi.Output;

  constructor(input: WebMidi.Input, output: WebMidi.Output) {
    super();
    this.input = input;
    this.output = output;
  }
}
