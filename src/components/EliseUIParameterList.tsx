import { UIParameterConfig } from '../ui/uiParameters';
import { EliseUIParameter } from './EliseUIParameter';
import css from './EliseUI.module.css';

interface Props {
  parameters: UIParameterConfig<unknown>[];
}

export function EliseUIParameterList(props: Props) {
  const { parameters } = props;
  return (
    <ul className={css.paramList}>
      {parameters.map((param, idx) => (
        <EliseUIParameter key={idx} parameter={param} />
      ))}
    </ul>
  );
}
