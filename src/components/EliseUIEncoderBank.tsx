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

export function EliseUIEncoderBank(props: Props) {
  const { label, encoderBank, children } = props;
  const { state, update } = useEliseContext();

  return (
    <section className={css.encoderBank}>
      <div
        onClick={() =>
          update((draft) => {
            draft.ui.encoderBank = encoderBank;
          })
        }
        className={classNames(css.encoderBankHeaderContainer, {
          [css.encoderBankHeaderContainerActive]:
            encoderBank === state.ui.encoderBank,
        })}
      >
        <h3 className={css.encoderBankHeader}>{label}</h3>
      </div>
      <div className={css.encoderBankContent}>{children}</div>
    </section>
  );
}
