import { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useEliseContext } from '../../state/useEliseContext';
import { UiParameterConfig } from '../../ui/uiParameters';
import css from './ParameterSlider.module.css';

interface Props {
  parameter: UiParameterConfig<unknown>;
}

export function ParameterSlider({ parameter }: Props) {
  const { state, update } = useEliseContext();
  const [sliderWidth, setSliderWidth] = useState(0);
  const rawValue = parameter.getRawValue(state);
  const displayValue =
    rawValue !== null ? parameter.getDisplayValue(rawValue) : 'OFF';

  let isParameterLock = false;
  if (parameter.type === 'midi') {
    isParameterLock = parameter.hasParameterLock(state);
  }

  const handleSliderEl = useCallback((el: HTMLDivElement) => {
    setSliderWidth(el?.clientWidth ?? 0);
  }, []);

  const fillWidth = ((rawValue ?? 0) / 127) * sliderWidth;

  return (
    <li
      className={classNames(css.parameterSlider, {
        [css.parameterLock]: isParameterLock,
      })}
    >
      <div className={css.slider} ref={handleSliderEl}>
        <div className={css.fill} style={{ width: `${fillWidth}px` }} />

        <input
          type="range"
          min={0}
          max={127}
          step={1}
          value={rawValue ?? 0}
          onChange={(e) =>
            parameter.setRawValue(update, parseInt(e.target.value))
          }
        />

        <div className={css.label}>
          <div className={css.labelContent}>
            {parameter.label(state)}: {displayValue}
          </div>
        </div>
      </div>
      {parameter.type === 'midi' &&
        (rawValue !== null ? (
          <button
            className={css.offButtonContainer}
            onClick={() => parameter.setRawValue(update, null)}
          >
            X
          </button>
        ) : (
          <button
            className={css.offButtonContainer}
            onClick={() => parameter.setRawValue(update, 0)}
          >
            OFF
          </button>
        ))}
    </li>
  );
}
