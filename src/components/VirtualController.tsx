import { useSyncExternalStore } from 'react';
import { useVirtualController } from '../controllers/useMidiController';
import { VirtualPad } from './VirtualPad';
import css from './VirtualController.module.css';
import { VirtualEncoder } from './VirtualEncoder';

export function VirtualController() {
  const controller = useVirtualController();
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getVirtualControllerState,
  );

  return (
    <div className={css.VirtualController}>
      <ul className={css.encoders}>
        {state.encoders.map((encoder, idx) => (
          <VirtualEncoder encoder={encoder} encoderIndex={idx} key={idx} />
        ))}
      </ul>

      <ul className={css.pads}>
        {state.pads.map((pad, idx) => (
          <VirtualPad key={idx} padIndex={idx} color={pad.color} />
        ))}
      </ul>
    </div>
  );
}
