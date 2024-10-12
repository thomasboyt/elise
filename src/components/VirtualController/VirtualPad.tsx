import { useVirtualController } from '../../controllers/useMidiController';
import { PadColor } from '../../ui/uiModels';

interface Props {
  padIndex: number;
  color: PadColor;
}

export function VirtualPad(props: Props) {
  const { padIndex, color } = props;

  const controller = useVirtualController();

  let cssBgColor;
  if (color === 'off') {
    cssBgColor = '#ddd';
  } else {
    cssBgColor = color;
  }

  return (
    <li
      style={{ display: 'block', backgroundColor: cssBgColor }}
      onMouseDown={() => controller.emit('padOn', padIndex, 127)}
      onMouseUp={() => controller.emit('padOff', padIndex)}
    >
      {padIndex}
    </li>
  );
}
