import { TypedEventEmitter } from '../util/TypedEventEmitter';
import { ControllerState } from './ControllerState';
import {
  ControllerSurface,
  controllerSurfaceEventNames,
  ControllerSurfaceEvents,
  IControllerSurface,
} from './ControllerSurface';
import { VirtualControllerSurface } from './VirtualControllerSurface';

/**
 * This is an abstraction allowing the code to treat a virtual controller and
 * hardware controller as if it was just dealing with a single controller.
 */
export class ControllerSurfaceGroup
  extends TypedEventEmitter<ControllerSurfaceEvents>
  implements IControllerSurface
{
  private virtualController: VirtualControllerSurface;
  private hardwareController?: ControllerSurface;

  constructor(virtualControllerSnapshot: ControllerState) {
    super();
    this.virtualController = new VirtualControllerSurface();
    this.virtualController.resetState(virtualControllerSnapshot);
    this.registerEvents(this.virtualController);
  }

  getVirtualController() {
    return this.virtualController;
  }

  getHardwareController() {
    return this.hardwareController;
  }

  setHardwareController(controller: ControllerSurface | null) {
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

  resetState = (snapshot: ControllerState) => {
    this.eachController((c) => c.resetState(snapshot));
  };

  handleStateUpdate = (snapshot: ControllerState) => {
    this.eachController((c) => c.handleStateUpdate(snapshot));
  };

  private eachController(cb: (controller: ControllerSurface) => void) {
    if (this.virtualController) {
      cb(this.virtualController);
    }
    if (this.hardwareController) {
      cb(this.hardwareController);
    }
  }

  private createGroupEmit(eventName: keyof ControllerSurfaceEvents) {
    return (...args: ControllerSurfaceEvents[typeof eventName]) => {
      console.debug('Controller event', eventName, ...args);
      this.emit(eventName, ...args);
    };
  }
  private eventCallbacks: Record<string, () => void> = {};

  private registerEvents(c: ControllerSurface) {
    const events = Object.keys(
      controllerSurfaceEventNames,
    ) as (keyof ControllerSurfaceEvents)[];
    for (const eventName of events) {
      const callback = this.createGroupEmit(eventName);
      this.eventCallbacks[eventName] = callback;
      c.on(eventName, callback);
    }
  }

  private unregisterEvents(c: ControllerSurface) {
    for (const [eventName, callback] of Object.entries(this.eventCallbacks)) {
      c.off(eventName as keyof ControllerSurfaceEvents, callback);
      delete this.eventCallbacks[eventName];
    }
  }
}
