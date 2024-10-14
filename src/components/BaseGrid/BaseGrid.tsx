import { ReactNode } from 'react';
import css from './BaseGrid.module.css';

interface Props {
  children: ReactNode;
  labelWidth: number;
  scroll?: boolean;
}

export function BaseGrid({ children, scroll, labelWidth }: Props) {
  return (
    <div
      className={scroll ? css.baseGridScroll : css.baseGrid}
      style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}
    >
      {children}
    </div>
  );
}
