import { ElisePad } from './ElisePad';
import {
  handleNextClipBar,
  handlePadOff,
  handlePadOn,
  handlePrevClipBar,
} from '../state/actions';
import { useEliseContext } from '../state/useEliseContext';
import { getPadColors } from '../ui/getPadColors';
import css from './EliseUI.module.css';

export function EliseUIPads() {
  const { state, update } = useEliseContext();
  const pads = getPadColors(state);
  const arrowsDisabled = state.ui.padMode !== 'clip';

  return (
    <div className={css.padsSection}>
      <ul className={css.pads}>
        {pads.map((color, idx) => (
          <ElisePad
            key={idx}
            padIndex={idx}
            color={color}
            onDown={() => {
              handlePadOn(state, update, idx);
            }}
            onUp={() => {
              handlePadOff(state, update, idx);
            }}
          />
        ))}
      </ul>
      <div className={css.padArrows}>
        <button
          onClick={() => handlePrevClipBar(state, update)}
          disabled={arrowsDisabled}
        >
          ^
        </button>
        <button
          onClick={() => handleNextClipBar(state, update)}
          disabled={arrowsDisabled}
        >
          V
        </button>
      </div>
    </div>
  );
}
