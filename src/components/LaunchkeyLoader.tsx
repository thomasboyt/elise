import { useLaunchkeyContext } from '../controllers/useMidiController';

export function LaunchkeyLoader() {
  const launchkey = useLaunchkeyContext();
  if (launchkey.available) {
    return <a onClick={launchkey.handleEnableLaunchkey}>Reset Launchkey</a>;
  }
  return <span>Launchkey disconnected</span>;
}
