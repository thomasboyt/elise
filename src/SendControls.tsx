import * as LaunchkeyMIDIConstants from './launchkey/LaunchkeyMIDIConstants';
import { launchkeySysexMessageFactories } from './launchkey/LaunchkeyMIDIAdapter';

interface Props {
  onSendSysex: (data: number[]) => void;
}

export function SendControls(props: Props) {
  const { onSendSysex } = props;

  function handleInit() {
    onSendSysex(launchkeySysexMessageFactories.enableDawMode());
    onSendSysex(
      launchkeySysexMessageFactories.setDisplayText(
        'regular',
        LaunchkeyMIDIConstants.messageTargets.dawModeLabel,
        0,
        'Elise',
      ),
    );
  }

  function handleExit() {
    onSendSysex(launchkeySysexMessageFactories.disableDawMode());
  }

  return (
    <>
      <button onClick={handleInit}>Init DAW mode</button>
      <button onClick={handleExit}>Exit DAW mode</button>
    </>
  );
}
