/**
 * The ControllerState is a "snapshot" that can be computed from the overall
 * Elise state at any time and sent to a controller to reset the current
 * controller state.
 */

import { PadColor } from '../util/PadColor';
import { UIPage } from '../util/UIPage';

export interface ControllerStateSnapshot {
  page: UIPage;
  encoders: { name: string; value: number }[];
  pads: PadColor[];
}

export const defaultControllerState: ControllerStateSnapshot = {
  page: 'one',
  encoders: [...new Array(8)].map((_, idx) => ({
    name: `Encoder ${idx}`,
    value: Math.round(Math.random() * 127),
  })),
  pads: [...new Array(16)].map(() => 'green'),
};
