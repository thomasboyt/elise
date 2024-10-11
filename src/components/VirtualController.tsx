import { ReactNode, useSyncExternalStore } from 'react';
import { useVirtualController } from '../controllers/useMidiController';
import { VirtualPad } from './VirtualPad';

const defaultGridBoxColor = 'white';

const gridContainerStyle = {
  display: 'grid',
  // "border" color
  backgroundColor: 'black',
  gridGap: '1px',
};
const resetUlStyle = {
  listStyle: 'none',
  marginLeft: 0,
  marginTop: 0,
  marginBottom: 0,
  paddingLeft: 0,
};

export function VirtualController() {
  const controller = useVirtualController();
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getVirtualControllerState,
  );

  return (
    <div
      style={{
        width: '600px',
        height: '400px',
        border: '1px solid black',
        overflow: 'hidden',
        display: 'flex',
        flexFlow: 'column',
      }}
    >
      <ul
        style={{
          ...gridContainerStyle,
          ...resetUlStyle,
          flex: '0 0 70%',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          borderBottom: '1px solid black',
        }}
      >
        {state.encoders.map((encoder, idx) => {
          let content: ReactNode = 'Disabled';
          if (encoder?.label) {
            content = (
              <label>
                {encoder.label}:
                <input
                  type="number"
                  disabled={encoder.value === null}
                  value={encoder.value ?? '---'}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (Number.isNaN(value)) {
                      return;
                    }
                    controller.emit('absoluteEncoderUpdated', idx, value);
                  }}
                />
              </label>
            );
          }
          return (
            <li
              key={idx}
              style={{
                display: 'block',
                backgroundColor: defaultGridBoxColor,
                overflow: 'hidden',
              }}
            >
              {content}
            </li>
          );
        })}
      </ul>

      <ul
        style={{
          ...gridContainerStyle,
          ...resetUlStyle,
          flex: '1 0 auto',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr',
        }}
      >
        {state.pads.map((pad, idx) => (
          <VirtualPad key={idx} padIndex={idx} color={pad.color} />
        ))}
      </ul>
    </div>
  );
}
