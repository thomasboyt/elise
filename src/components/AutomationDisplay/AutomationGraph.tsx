import { useEffect, useRef, useState } from 'react';
import { MidiClipTrack } from '../../state/state';
import css from './AutomationDisplay.module.css';
import { AutomationGraphSVG } from './AutomationGraphSVG';

interface Props {
  track: MidiClipTrack;
  parameterId: string;
}

export function AutomationGraph({ track, parameterId }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  useEffect(() => {
    // TODO: can we use a ref here
    const el = document.getElementById('automationGraph');
    if (!el) {
      return;
    }

    const resizeObserver = new ResizeObserver((event) => {
      // Depending on the layout, you may need to swap inlineSize with blockSize
      // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/contentBoxSize
      setContainerWidth(event[0].contentBoxSize[0].inlineSize);
      setContainerHeight(event[0].contentBoxSize[0].blockSize);
    });

    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
    };
  });

  const stepWidth = containerWidth ? containerWidth / 64 : null;

  return (
    <div className={css.automationGraph} ref={elRef} id="automationGraph">
      {stepWidth && containerHeight && (
        <AutomationGraphSVG
          track={track}
          parameterId={parameterId}
          stepWidth={stepWidth}
          height={containerHeight}
        />
      )}
    </div>
  );
}
