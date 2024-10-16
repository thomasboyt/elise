import { produce } from 'immer';
import { ControllerSurface } from './ControllerSurface';
import { PadColor } from '../ui/uiModels';

export interface VirtualDeviceEncoder {
  label: string | null;
  value: number | null;
}

export interface VirtualDevicePad {
  color: PadColor;
}

/**
 * This is pretty close to ControllerState but contains extra stuff we don't
 * capture in its snapshot.
 */
export interface VirtualControllerState {
  encoders: VirtualDeviceEncoder[];
  pads: VirtualDevicePad[];
}

/**
 * This is a virtual implementation of ControllerSurface that's used with
 * <VirtualController />.
 *
 * Technically, this could not maintain any state and VirtualController could
 * just receive EliseState directly and display the corresponding UI. However,
 * that wouldn't be a very good debug implementation of ControllerSurface.
 */
export class VirtualControllerSurface extends ControllerSurface {
  private subscribers = new Set<() => void>([]);
  private deviceState: VirtualControllerState = {
    encoders: [...new Array(8)].map(() => ({ label: null, value: null })),
    pads: [...new Array(16)].map(() => ({ color: 'off' })),
  };

  // Used for React components to get state
  getVirtualControllerState = () => {
    return this.deviceState;
  };

  // Used for React components to subscriber to state changes
  subscribe = (cb: () => void) => {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  };

  private updateSubscribers() {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  }

  initController(): void {}

  teardownController(): void {}

  changeEncoderBank(): void {
    // no-op since we don't have a visual display of this
  }

  changePadMode(): void {
    // no-op since we don't do anything differently based on pad mode here
  }

  updateEncoderName(encoderIndex: number, name: string): void {
    this.deviceState = produce(this.deviceState, (draft) => {
      draft.encoders[encoderIndex].label = name;
    });
    this.updateSubscribers();
  }

  updateEncoderValue(encoderIndex: number, value: number): void {
    this.deviceState = produce(this.deviceState, (draft) => {
      draft.encoders[encoderIndex].value = value;
    });
    this.updateSubscribers();
  }

  updatePadColor(padIndex: number, color: PadColor): void {
    this.deviceState = produce(this.deviceState, (draft) => {
      draft.pads[padIndex].color = color;
    });
    this.updateSubscribers();
  }
}
