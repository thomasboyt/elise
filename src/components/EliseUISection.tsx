import { ReactNode } from 'react';
import classNames from 'classnames';
import { EncoderBank } from '../state/state';
import css from './EliseUI.module.css';
import { useEliseContext } from '../state/useEliseContext';

interface Props {
  label: string;
  encoderBank: EncoderBank;
  children: ReactNode;
}

export function EliseUISection(props: Props) {
  const { state } = useEliseContext();
  const { label, encoderBank, children } = props;

  return (
    <section className={css.section}>
      <div
        className={classNames(css.sectionHeaderContainer, {
          [css.sectionHeaderContainerActive]:
            encoderBank === state.ui.encoderBank,
        })}
      >
        <h3 className={css.sectionHeader}>{label}</h3>
      </div>
      <div className={css.sectionContent}>{children}</div>
    </section>
  );
}
