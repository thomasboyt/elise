import { useSyncExternalStore } from 'react';
import { useVirtualController } from '../controllers/useMidiController';
import { VirtualPad } from './VirtualPad';
import { VirtualEncoder } from './VirtualEncoder';
import css from './VirtualController.module.css';

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

      <div className={css.buttonRow}>
        <button onClick={() => controller.emit('prevEncoderBank')}>
          Encoders ^
        </button>
        <button onClick={() => controller.emit('nextEncoderBank')}>
          Encoders V
        </button>
        <button onClick={() => controller.emit('prevClipBar')}>
          Bar {'<'}
        </button>
        <button onClick={() => controller.emit('nextClipBar')}>
          Bar {'>'}
        </button>
      </div>

      <div className={css.buttonRow}>
        <button onClick={() => controller.emit('enterPadClipMode')}>
          Clip
        </button>
        <button onClick={() => controller.emit('enterPadTrackMode')}>
          Track
        </button>
        <button onClick={() => controller.emit('enterPadSceneMode')}>
          Scene
        </button>
        <button onClick={() => controller.emit('enterPadSceneMode')}>
          Mute
        </button>
        <button onClick={() => controller.emit('enterPadDrumMode')}>
          Drum
        </button>
        <button onClick={() => controller.emit('enterPadChromaticMode')}>
          Chromatic
        </button>
      </div>

      <ul className={css.pads}>
        {state.pads.map((pad, idx) => (
          <VirtualPad key={idx} padIndex={idx} color={pad.color} />
        ))}
      </ul>
    </div>
  );
}
