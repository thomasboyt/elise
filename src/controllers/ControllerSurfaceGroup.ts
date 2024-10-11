import { UIPage } from '../state/state';
import { PadColor } from '../ui/uiModels';
import { ControllerState } from './ControllerState';
import {
  ControllerSurface,
  ControllerSurfaceEvents,
  HardwareControllerSurface,
} from './ControllerSurface';
import { VirtualControllerSurface } from './VirtualControllerSurface';

/**
 * This is an abstraction allowing the code to treat a virtual controller and
 * hardware controller as if it was just dealing with a single controller.
 *
 * One weird aspect of this is that any "implicit state" on a controller needs
 * to be duplicated to the other controller - e.g. setting a MIDI CC on one
 * controller needs to update that CC on the other. One way to do this might
 * just be to regularly send resetFromState() snapshots. Another could be to
 * just send the snapshot to the Launchkey after an event from the virtual
 * controller is handled, or vice versa. Both of these would require "waiting
 * for" the state to be updated though, which is challenging.
 *
 * Really need to start figuring out whether the Launchkey can handle constant
 * snapshots.
 */
export class ControllerSurfaceGroup extends ControllerSurface {
  private virtualController: VirtualControllerSurface;
  private hardwareController?: HardwareControllerSurface;

  constructor() {
    super();
    this.virtualController = new VirtualControllerSurface();
    this.registerEvents(this.virtualController);
  }

  getVirtualController() {
    return this.virtualController;
  }

  getHardwareController() {
    return this.hardwareController;
  }

  setHardwareController(controller: HardwareControllerSurface | null) {
    if (this.hardwareController) {
      this.unregisterEvents(this.hardwareController);
    }
    this.hardwareController = controller ?? undefined;
    if (this.hardwareController) {
      this.registerEvents(this.hardwareController);
    }
  }

  initController = () => {
    this.eachController((c) => c.initController());
  };

  teardownController = () => {
    this.eachController((c) => c.teardownController());
  };

  changePage = (page: UIPage) => {
    this.eachController((c) => c.changePage(page));
  };

  resetFromState = (snapshot: ControllerState) => {
    this.eachController((c) => c.resetFromState(snapshot));
  };

  updateEncoderName = (encoderIndex: number, name: string) => {
    this.eachController((c) => c.updateEncoderName(encoderIndex, name));
  };

  updateEncoderValue = (encoderIndex: number, value: number) => {
    this.eachController((c) => c.updateEncoderValue(encoderIndex, value));
  };

  updatePadColor = (padIndex: number, color: PadColor) => {
    this.eachController((c) => c.updatePadColor(padIndex, color));
  };

  private eachController(cb: (controller: ControllerSurface) => void) {
    if (this.virtualController) {
      cb(this.virtualController);
    }
    if (this.hardwareController) {
      cb(this.hardwareController);
    }
  }

  private padOnCb = (...args: ControllerSurfaceEvents['padOn']) =>
    this.emit('padOn', ...args);
  private padOffCb = (...args: ControllerSurfaceEvents['padOff']) =>
    this.emit('padOff', ...args);
  private absoluteEncoderUpdated = (
    ...args: ControllerSurfaceEvents['absoluteEncoderUpdated']
  ) => this.emit('absoluteEncoderUpdated', ...args);

  private registerEvents(c: ControllerSurface) {
    c.on('padOn', this.padOnCb);
    c.on('padOff', this.padOffCb);
    c.on('absoluteEncoderUpdated', this.absoluteEncoderUpdated);
  }

  private unregisterEvents(c: ControllerSurface) {
    c.off('padOn', this.padOnCb);
    c.off('padOff', this.padOffCb);
    c.off('absoluteEncoderUpdated', this.absoluteEncoderUpdated);
  }
}
