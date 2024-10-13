import { useEliseContext } from '../state/useEliseContext';
import { UIParameterConfig } from '../ui/uiParameters';

interface Props {
  parameter: UIParameterConfig;
}

export function EliseUIParameter({ parameter }: Props) {
  const { state } = useEliseContext();
  return (
    <li>
      {parameter.label(state)}: {parameter.get(state) ?? '---'}
    </li>
  );
}
