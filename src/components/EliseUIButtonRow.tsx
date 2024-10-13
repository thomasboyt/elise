import { ReactNode } from 'react';
import classNames from 'classnames';
import css from './EliseUI.module.css';

interface Props {
  className: string;
  children: ReactNode;
}

export function EliseUIButtonRow({ className, children }: Props) {
  return <div className={classNames(className, css.buttonRow)}>{children}</div>;
}
