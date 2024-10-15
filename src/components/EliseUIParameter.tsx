import classNames from 'classnames';
import { useEliseContext } from '../state/useEliseContext';
import { UiParameterConfig } from '../ui/uiParameters';
import css from './EliseUI.module.css';

interface Props {
  parameter: UiParameterConfig<unknown>;
}

export function EliseUIParameter({ parameter }: Props) {
  const { state, update } = useEliseContext();
  const rawValue = parameter.getRawValue(state);
  const displayValue =
    rawValue !== null ? parameter.getDisplayValue(rawValue) : 'OFF';

  let isParameterLock = false;
  if (parameter.type === 'midi') {
    isParameterLock = parameter.hasParameterLock(state);
  }
  return (
    <li className={classNames({ [css.parameterLock]: isParameterLock })}>
      {parameter.label(state)}: {displayValue}
      {parameter.type === 'midi' && rawValue !== null && (
        <button onClick={() => parameter.setRawValue(update, null)}>x</button>
      )}
    </li>
  );
}
