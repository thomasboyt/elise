import { useEliseContext } from '../state/useEliseContext';
import { UIParameterConfig } from '../ui/uiParameters';

interface Props {
  parameter: UIParameterConfig<unknown>;
}

export function EliseUIParameter({ parameter }: Props) {
  const { state } = useEliseContext();
  const rawValue = parameter.getRawValue(state);
  const displayValue =
    rawValue !== null ? parameter.getDisplayValue(rawValue) : '---';
  return (
    <li>
      {parameter.label(state)}: {displayValue}
    </li>
  );
}
