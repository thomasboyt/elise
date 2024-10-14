import classNames from 'classnames';
import css from './BaseGrid.module.css';

export type CellState = 'on' | 'off' | 'disabled';

interface Props {
  state: CellState;
}

export function GridCell({ state }: Props) {
  return (
    <div
      className={classNames(css.step, {
        [css.filledStep]: state === 'on',
        [css.emptyStep]: state === 'off',
        [css.disabledStep]: state === 'disabled',
      })}
    />
  );
}
