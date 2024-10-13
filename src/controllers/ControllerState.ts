import { EliseState, EncoderBank } from '../state/state';
import { getCurrentEncoders } from '../ui/getCurrentEncoders';
import { getPadColors } from '../ui/getPadColors';
import { Encoder, PadColor, PadMode } from '../ui/uiModels';

/**
 * The ControllerState is a "snapshot" that can be computed from the overall
 * Elise state at any time and sent to a controller to reset the current
 * controller state.
 */
export interface ControllerState {
  encoderBank: EncoderBank;
  encoders: (Encoder | null)[];
  pads: PadColor[];
  /**
   * The controller needs to know about the pad mode so that certain
   * controls that only make sense in certain modes are ignored.
   *
   * Basically: pad and encoder values are always sent off to the controller
   * message handler, and it'll figure out what to do with those. But any
   * controller-specific actions like shift states need to be handled on the
   * controller, and some only make sense in some contexts.
   */
  padMode: PadMode;
  // TODO: current scene (for display state)
  // TODO: current track (for display state)
  // TODO: current bar (for display state)
}

export function getControllerState(state: EliseState): ControllerState {
  const { encoderBank, padMode } = state.ui;
  const pads = getPadColors(state);
  const encoders = getCurrentEncoders(state);

  return {
    encoderBank,
    encoders,
    pads,
    padMode,
  };
}

export function initControllerState(): ControllerState {
  return {
    padMode: 'clip',
    encoderBank: 'note',
    encoders: new Array(8).fill(null),
    pads: new Array(16).fill('off'),
  };
}
