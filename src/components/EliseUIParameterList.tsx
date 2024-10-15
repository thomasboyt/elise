import { UiParameterConfig } from '../ui/uiParameters';
import { ParameterSlider } from './ParameterSlider/ParameterSlider';
import css from './EliseUI.module.css';
import classNames from 'classnames';

interface Props {
  parameters: UiParameterConfig<unknown>[];
  oneRow?: boolean;
}

export function EliseUIParameterList(props: Props) {
  const { parameters, oneRow } = props;
  return (
    <ul
      className={classNames(css.paramList, { [css.paramListOneRow]: oneRow })}
    >
      {parameters.map((param, idx) => (
        <ParameterSlider key={idx} parameter={param} />
      ))}
    </ul>
  );
}
