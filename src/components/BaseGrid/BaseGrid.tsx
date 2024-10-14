import { ReactNode } from 'react';
import css from './BaseGrid.module.css';

interface Props {
  children: ReactNode;
  scroll?: boolean;
}

export function BaseGrid({ children, scroll }: Props) {
  return (
    <div className={scroll ? css.baseGridScroll : css.baseGrid}>{children}</div>
  );
}
