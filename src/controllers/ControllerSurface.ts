import { TypedEventEmitter } from '../util/TypedEventEmitter';
import { ControllerState, initControllerState } from './ControllerState';
import { EncoderBank } from '../state/state';
import { PadColor, PadMode } from '../ui/uiModels';

export type ControllerSurfaceEvents = {
  padOn: [padIndex: number, velocity: number];
  padOff: [padIndex: number];
  // eventually: padAftertouch
  keyboardNoteOn: [channel: number, note: number, velocity: number];
  keyboardNoteOff: [channel: number, note: number];
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
  keyboardNoteOn: true,
  keyboardNoteOff: true,
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

export interface IControllerSurface
  extends TypedEventEmitter<ControllerSurfaceEvents> {
  initController(): void;
  teardownController(): void;
  resetState(snapshot: ControllerState): void;
  handleStateUpdate(snapshot: ControllerState): void;
}

/**
 * A generic MIDI controller binding, to be subclassed by individual implementations
 * of controllers for hardware/software.
 */
export abstract class ControllerSurface
  extends TypedEventEmitter<ControllerSurfaceEvents>
  implements IControllerSurface
{
  abstract initController(): void;
  abstract teardownController(): void;
  abstract changeEncoderBank(encoderBank: EncoderBank): void;
  abstract changePadMode(padMode: PadMode): void;
  abstract updatePadColor(padIndex: number, color: PadColor): void;
  abstract updateEncoderName(encoderIndex: number, name: string): void;
  abstract updateEncoderValue(encoderIndex: number, value: number): void;

  private lastSnapshot: ControllerState = initControllerState();

  resetState(snapshot: ControllerState): void {
    this.lastSnapshot = snapshot;
    this.changePadMode(snapshot.padMode);
    this.changeEncoderBank(snapshot.encoderBank);
    for (let padIndex = 0; padIndex < snapshot.pads.length; padIndex += 1) {
      this.updatePadColor(padIndex, snapshot.pads[padIndex]);
    }
    for (
      let encoderIndex = 0;
      encoderIndex < snapshot.encoders.length;
      encoderIndex += 1
    ) {
      // TODO: handle null encoders - review what the different states mean...
      this.updateEncoderName(
        encoderIndex,
        snapshot.encoders[encoderIndex]?.name ?? '---',
      );
      this.updateEncoderValue(
        encoderIndex,
        snapshot.encoders[encoderIndex]?.value ?? 0,
      );
    }
  }

  handleStateUpdate(snapshot: ControllerState): void {
    const prev = this.lastSnapshot!;
    this.lastSnapshot = snapshot;

    if (snapshot.padMode !== prev.padMode) {
      this.changePadMode(snapshot.padMode);
    }
    if (snapshot.encoderBank !== prev.encoderBank) {
      this.changeEncoderBank(snapshot.encoderBank);
    }

    for (let padIndex = 0; padIndex < snapshot.pads.length; padIndex += 1) {
      if (prev.pads[padIndex] !== snapshot.pads[padIndex]) {
        this.updatePadColor(padIndex, snapshot.pads[padIndex]);
      }
    }
    for (
      let encoderIndex = 0;
      encoderIndex < snapshot.encoders.length;
      encoderIndex += 1
    ) {
      // TODO: handle null encoders - review what the different states mean...
      if (
        prev.encoders[encoderIndex]?.name !==
        snapshot.encoders[encoderIndex]?.name
      ) {
        this.updateEncoderName(
          encoderIndex,
          snapshot.encoders[encoderIndex]?.name ?? '---',
        );
      }
      if (
        prev.encoders[encoderIndex]?.value !==
        snapshot.encoders[encoderIndex]?.value
      ) {
        this.updateEncoderValue(
          encoderIndex,
          snapshot.encoders[encoderIndex]?.value ?? 0,
        );
      }
    }
  }
}
