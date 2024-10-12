import { ReactNode } from 'react';
import { VirtualDeviceEncoder } from '../controllers/VirtualControllerSurface';
import { useVirtualController } from '../controllers/useMidiController';
import css from './VirtualController.module.css';

function getFormValue(form: HTMLFormElement, key: string): string | null {
  const data = new FormData(form);
  const value = data.get(key);
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error(`unexpected form value ${value}`);
  }
  return value;
}

interface Props {
  encoder: VirtualDeviceEncoder;
  encoderIndex: number;
}

export function VirtualEncoder(props: Props) {
  const { encoder, encoderIndex } = props;
  const controller = useVirtualController();

  let content: ReactNode = 'Disabled';
  if (encoder?.label) {
    content = (
      <>
        {encoder.label}
        <br />
        {encoder.value}
        <br />
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const form = e.target as HTMLFormElement;
            const value = parseInt(getFormValue(form, 'value') ?? '');
            if (Number.isNaN(value)) {
              return;
            }
            if (value > 127 || value < 0) {
              return;
            }
            controller.emit('absoluteEncoderUpdated', encoderIndex, value);
          }}
        >
          <input
            type="number"
            name="value"
            disabled={encoder.value === null}
            defaultValue={0}
            style={{ display: 'block', width: '80px' }}
          />
          <button type="submit">Send</button>
        </form>
      </>
    );
  }
  return <li className={css.encoder}>{content}</li>;
}
