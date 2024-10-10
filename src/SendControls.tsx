import { defaultControllerState } from './controllers/ControllerState';
import { useMidiController } from './controllers/useMidiController';

export function SendControls() {
  const controller = useMidiController();

  return (
    <>
      <button onClick={() => controller?.initController()}>
        Init controller
      </button>
      <button onClick={() => controller?.teardownController()}>
        Tear down controller
      </button>
      <button
        onClick={() => controller?.resetFromState(defaultControllerState)}
      >
        Send default controller state
      </button>
    </>
  );
}
