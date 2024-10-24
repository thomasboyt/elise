import { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { IControllerSurface } from './ControllerSurface';
import { LaunchkeyControllerSurface } from './launchkey/LaunchkeyControllerSurface';
import { ControllerSurfaceGroup } from './ControllerSurfaceGroup';
import { VirtualControllerSurface } from './VirtualControllerSurface';
import { useEliseContext } from '../state/useEliseContext';
import { getControllerState } from './ControllerState';
import { useMidiPorts } from '../midi/useMidiPorts';
import { MidiInputPort, MidiOutputPort } from '../midi/MidiPort';

interface MIDIControllerContextShape {
  controller: IControllerSurface | null;
  virtualController: VirtualControllerSurface | null;
  launchkeyPortsAvailable: boolean;
  controllerEnabled: boolean;
  handleEnableLaunchkey: () => void;
}

export const MIDIControllerContext = createContext<MIDIControllerContextShape>({
  controller: null,
  virtualController: null,
  launchkeyPortsAvailable: false,
  controllerEnabled: false,
  handleEnableLaunchkey: () => {},
});

const LAUNCHKEY_MK4_49_MIDI_INPUT = 'Launchkey MK4 49 MIDI';
const LAUNCHKEY_MK4_49_DAW_INPUT = 'MIDIIN2 (Launchkey MK4 49 MIDI)';
const LAUNCHKEY_MK4_49_DAW_OUTPUT = 'MIDIOUT2 (Launchkey MK4 49 MIDI';

function getLaunchkeyPorts(
  inputs: Record<string, MidiInputPort>,
  outputs: Record<string, MidiOutputPort>,
) {
  return {
    midiInput: Object.values(inputs).find(
      (port) =>
        port.label === LAUNCHKEY_MK4_49_MIDI_INPUT ||
        port.label === 'AU Input 0',
    ),
    dawInput: Object.values(inputs).find(
      (port) =>
        port.label === LAUNCHKEY_MK4_49_DAW_INPUT ||
        port.label === 'AU Input 1',
    ),
    dawOutput: Object.values(outputs).find(
      (port) =>
        port.label === LAUNCHKEY_MK4_49_DAW_OUTPUT ||
        port.label === 'AU Output 1', // 0 will be reserved for the actual sequencer output
    ),
  };
}

interface Props {
  children: ReactNode;
}

// TODO: obvs this is hardcoded for launchkey right now
// a future version of this probably should rely on a user-selected controller, then
// the user assigning specific ports from the host (or AU) to ports for that controller
export function MIDIControllerProvider({ children }: Props) {
  const { state } = useEliseContext();
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const [controllerSurfaceGroup] = useState(
    () => new ControllerSurfaceGroup(getControllerState(state)),
  );
  const [launchkeyPortsAvailable, setLaunchkeyPortsAvailable] = useState(false);
  const [controllerEnabled, setControllerEnabled] = useState(false);

  const { inputs, outputs } = useMidiPorts();

  function handleEnableLaunchkey() {
    const existing = controllerSurfaceGroup.getHardwareController();
    if (existing) {
      existing.teardownController();
      controllerSurfaceGroup.setHardwareController(null);
    }
    const { midiInput, dawInput, dawOutput } = getLaunchkeyPorts(
      inputs,
      outputs,
    );
    if (!(midiInput && dawInput && dawOutput)) {
      return;
    }
    const controller = new LaunchkeyControllerSurface(
      midiInput,
      dawInput,
      dawOutput,
      'regular',
    );
    controllerSurfaceGroup.setHardwareController(controller);
    controller.initController();
    controller.resetState(getControllerState(stateRef.current));
    setControllerEnabled(true);
  }

  useEffect(() => {
    const { midiInput, dawInput, dawOutput } = getLaunchkeyPorts(
      inputs,
      outputs,
    );
    const controller = controllerSurfaceGroup.getHardwareController();
    if (!controller && midiInput && dawInput && dawOutput) {
      setLaunchkeyPortsAvailable(true);
    } else if (controller && !(midiInput && dawInput && dawOutput)) {
      controller.teardownController();
      controllerSurfaceGroup.setHardwareController(null);
      setLaunchkeyPortsAvailable(false);
      setControllerEnabled(false);
    }
  }, [inputs, outputs, controllerSurfaceGroup]);

  return (
    <MIDIControllerContext.Provider
      value={{
        controller: controllerSurfaceGroup,
        // we can get away with this because the virtual controller isn't
        // reset after construction
        virtualController: controllerSurfaceGroup.getVirtualController(),
        launchkeyPortsAvailable,
        controllerEnabled,
        handleEnableLaunchkey,
      }}
    >
      {children}
    </MIDIControllerContext.Provider>
  );
}
