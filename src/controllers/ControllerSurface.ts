import * as WebMidi from 'webmidi';
import { TypedEventEmitter } from '../util/TypedEventEmitter';
import { ControllerState } from './ControllerState';
import { UIPage } from '../state/state';
import { PadColor, PadMode } from '../ui/uiModels';

export type ControllerSurfaceEvents = {
  padOn: [padIndex: number, velocity: number];
  padOff: [padIndex: number];
  // eventually: padAftertouch
  absoluteEncoderUpdated: [encoderIndex: number, value: number];
  relativeEncoderUpdated: [encoderIndex: number, offset: number];
  nextEncoderBank: [];
  prevEncoderBank: [];
  nextClipBar: [];
  prevClipBar: [];

  // Launchkey: Hold "Func"
  // Virtual controller: Select button
  enterPadTrackMode: [];
  // Launchkey: Hold ">"
  // Virtual controller: Select button
  enterPadSceneMode: [];
  // Launchkey: Hold "Func" + >"
  // Virtual controller: Select button
  enterPadMuteMode: [];
  // Launchkey: Enter drum mode in UI (1/2)
  // Virtual controller: Select button
  enterPadDrumMode: [];
  // Launchkey: Enter drum mode in UI (2/2) - make sure this is "cycleable" (we receive sysex/CC twice)
  // Virtual controller: Select button
  enterPadChromaticMode: [];
  // Launchkey: let go of shift state or select DAW mode in UI (from drum mode)
  // Virtual controller: Select button
  enterPadClipMode: [];
};
export const controllerSurfaceEventNames: Record<
  keyof ControllerSurfaceEvents,
  true
> = {
  padOn: true,
  padOff: true,
  absoluteEncoderUpdated: true,
  relativeEncoderUpdated: true,
  nextEncoderBank: true,
  prevEncoderBank: true,
  nextClipBar: true,
  prevClipBar: true,
  enterPadChromaticMode: true,
  enterPadClipMode: true,
  enterPadDrumMode: true,
  enterPadMuteMode: true,
  enterPadSceneMode: true,
  enterPadTrackMode: true,
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
  abstract changePadMode(padMode: PadMode): void;
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
