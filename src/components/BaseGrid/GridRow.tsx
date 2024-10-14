import { ReactNode } from 'react';
import css from './BaseGrid.module.css';

interface Props {
  children: ReactNode;
  rowLabel: string;
}

export function GridRow({ children, rowLabel }: Props) {
  return (
    <>
      <div className={css.rowLabel}>{rowLabel}</div>
      <div className={css.gridTrack}>{children}</div>
    </>
  );
}
