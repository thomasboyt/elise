import { PadColor } from '../ui/uiModels';
import css from './EliseUI.module.css';

interface Props {
  padIndex: number;
  color: PadColor;
  onDown: () => void;
  onUp: () => void;
}

export function ElisePad({ padIndex, color, onDown, onUp }: Props) {
  let cssBgColor;
  if (color === 'off') {
    cssBgColor = 'black';
  } else {
    cssBgColor = color;
  }

  return (
    <li
      className={css.pad}
      style={{ backgroundColor: cssBgColor }}
      onMouseDown={onDown}
      onMouseUp={onUp}
    >
      <div className={css.padLabel}>{padIndex}</div>
    </li>
  );
}
