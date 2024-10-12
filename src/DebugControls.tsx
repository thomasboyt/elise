import { getControllerState } from './controllers/ControllerState';
import { useMidiController } from './controllers/useMidiController';
import { useEliseContext } from './state/useEliseContext';

export function DebugControls() {
  const controller = useMidiController();
  const { state } = useEliseContext();

  return (
    <div>
      <button
        onClick={() => {
          controller?.initController();
          controller?.resetState(getControllerState(state));
        }}
      >
        Init controller
      </button>
      <button onClick={() => controller?.teardownController()}>
        Tear down controller
      </button>
    </div>
  );
}
