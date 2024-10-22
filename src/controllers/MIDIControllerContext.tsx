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
  hardwareConnected: boolean;
}

export const MIDIControllerContext = createContext<MIDIControllerContextShape>({
  controller: null,
  virtualController: null,
  hardwareConnected: false,
});

interface Props {
  children: ReactNode;
}

const LAUNCHKEY_MK4_49_MIDI_INPUT = 'Launchkey MK4 49 MIDI';
const LAUNCHKEY_MK4_49_DAW_INPUT = 'MIDIIN2 (Launchkey MK4 49 MIDI)';
const LAUNCHKEY_MK4_49_DAW_OUTPUT = 'MIDIOUT2 (Launchkey MK4 49 MIDI';

function getLaunchkeyDevices(
  inputs: Record<string, MidiInputPort>,
  outputs: Record<string, MidiOutputPort>,
) {
  return {
    midiInput: Object.values(inputs).find(
      (port) =>
        port.label === LAUNCHKEY_MK4_49_MIDI_INPUT ||
        port.label === 'AU Input 1',
    ),
    dawInput: Object.values(inputs).find(
      (port) =>
        port.label === LAUNCHKEY_MK4_49_DAW_INPUT ||
        port.label === 'AU Input 2',
    ),
    dawOutput: Object.values(outputs).find(
      (port) =>
        port.label === LAUNCHKEY_MK4_49_DAW_OUTPUT ||
        port.label === 'AU Output 2', // 1 will be reserved for the actual sequencer output
    ),
  };
}

export function MIDIControllerProvider({ children }: Props) {
  const { state } = useEliseContext();
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const [controllerSurfaceGroup] = useState(
    () => new ControllerSurfaceGroup(getControllerState(state)),
  );
  const [hardwareConnected, setHardwareConnected] = useState(false);

  const { inputs, outputs } = useMidiPorts();
  useEffect(() => {
    // TODO: obvs this is hardcoded for launchkey right now
    // a future version of this probably should rely on a user-selected controller, then
    // the user assigning specific ports from the host (or AU) to ports for that controller

    const { midiInput, dawInput, dawOutput } = getLaunchkeyDevices(
      inputs,
      outputs,
    );
    const controller = controllerSurfaceGroup.getHardwareController();
    if (!controller && midiInput && dawInput && dawOutput) {
      const controller = new LaunchkeyControllerSurface(
        midiInput,
        dawInput,
        dawOutput,
        'regular',
      );
      controllerSurfaceGroup.setHardwareController(controller);
      controller.initController();
      controller.resetState(getControllerState(stateRef.current));
      setHardwareConnected(true);
    } else if (controller && !(midiInput && dawInput && dawOutput)) {
      controller.teardownController();
      controllerSurfaceGroup.setHardwareController(null);
      setHardwareConnected(false);
    }
  }, [inputs, outputs, controllerSurfaceGroup]);

  return (
    <MIDIControllerContext.Provider
      value={{
        controller: controllerSurfaceGroup,
        // we can get away with this because the virtual controller isn't
        // reset after construction
        virtualController: controllerSurfaceGroup.getVirtualController(),
        hardwareConnected,
      }}
    >
      {children}
    </MIDIControllerContext.Provider>
  );
}
