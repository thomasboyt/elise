import { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { WebMidi } from 'webmidi';
import { IControllerSurface } from './ControllerSurface';
import { LaunchkeyControllerSurface } from './launchkey/LaunchkeyControllerSurface';
import { ControllerSurfaceGroup } from './ControllerSurfaceGroup';
import { VirtualControllerSurface } from './VirtualControllerSurface';
import { useEliseContext } from '../state/useEliseContext';
import { getControllerState } from './ControllerState';

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
const LAUNCHKEY_MK4_49_MIDI_OUTPUT = 'Launchkey MK4 49 MIDI';
const LAUNCHKEY_MK4_49_DAW_OUTPUT = 'MIDIOUT2 (Launchkey MK4 49 MIDI';

function getLaunchkeyDevices() {
  return {
    midiInput: WebMidi.inputs.find(
      (port) => port.name === LAUNCHKEY_MK4_49_MIDI_INPUT,
    ),
    midiOutput: WebMidi.outputs.find(
      (port) => port.name === LAUNCHKEY_MK4_49_MIDI_OUTPUT,
    ),
    dawInput: WebMidi.inputs.find(
      (port) => port.name === LAUNCHKEY_MK4_49_DAW_INPUT,
    ),
    dawOutput: WebMidi.outputs.find(
      (port) => port.name === LAUNCHKEY_MK4_49_DAW_OUTPUT,
    ),
  };
}

export function MIDIControllerProvider({ children }: Props) {
  const { state } = useEliseContext();
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const [controllerSurfaceGroup] = useState(() => new ControllerSurfaceGroup());
  const [hardwareConnected, setHardwareConnected] = useState(false);

  useEffect(() => {
    function createLaunchkeyHardwareControllerIfConnected() {
      const { midiInput, midiOutput, dawInput, dawOutput } =
        getLaunchkeyDevices();
      if (midiInput && midiOutput && dawInput && dawOutput) {
        if (!controllerSurfaceGroup.getHardwareController()) {
          const controller = new LaunchkeyControllerSurface(
            midiInput,
            dawInput,
            midiOutput,
            dawOutput,
            'regular',
          );
          controllerSurfaceGroup.setHardwareController(controller);
          controller.initController();
          controller.resetState(getControllerState(stateRef.current));
          setHardwareConnected(true);
        }
      }
    }

    createLaunchkeyHardwareControllerIfConnected();

    function handleWebMidiConnected() {
      createLaunchkeyHardwareControllerIfConnected();
    }

    function handleWebMidiDisconnected() {
      const controller = controllerSurfaceGroup.getHardwareController();
      const { midiInput, midiOutput, dawInput, dawOutput } =
        getLaunchkeyDevices();
      if (controller && !(midiInput && midiOutput && dawInput && dawOutput)) {
        controller.teardownController();
        controllerSurfaceGroup.setHardwareController(null);
        setHardwareConnected(false);
      }
    }

    WebMidi.addListener('connected', handleWebMidiConnected);
    WebMidi.addListener('disconnected', handleWebMidiDisconnected);

    return () => {
      WebMidi.removeListener('connected', handleWebMidiConnected);
      WebMidi.removeListener('disconnected', handleWebMidiDisconnected);
    };
  }, [controllerSurfaceGroup]);

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
