import { createContext, ReactNode, useState } from 'react';
import {
  ControllerSurface,
  HardwareControllerSurface,
} from './ControllerSurface';
import { LaunchkeyControllerSurface } from './launchkey/LaunchkeyControllerSurface';
import { WebMidi } from 'webmidi';

interface MIDIControllerContextShape {
  controller: ControllerSurface | null;
}

export const MIDIControllerContext = createContext<MIDIControllerContextShape>({
  // softwareController: ControllerSurface,
  controller: null,
});

interface Props {
  children: ReactNode;
  inputId: string;
  outputId: string;
}

export function MIDIControllerProvider({ children, inputId, outputId }: Props) {
  const [hardwareController, setHardwareController] =
    useState<HardwareControllerSurface | null>(null);

  if (inputId && outputId) {
    if (
      !hardwareController ||
      hardwareController.input.id !== inputId ||
      hardwareController.output.id !== outputId
    ) {
      const input = WebMidi.getInputById(inputId);
      const output = WebMidi.getOutputById(outputId);
      if (
        input &&
        output &&
        input.name.includes('Launchkey') &&
        input.name.includes('MIDIIN2') &&
        output.name.includes('Launchkey') &&
        output.name.includes('MIDIOUT2')
      ) {
        const controller = new LaunchkeyControllerSurface(
          input,
          output,
          input.name.includes('Mini') ? 'mini' : 'regular',
        );
        setHardwareController(controller);
      } else {
        if (hardwareController) {
          console.log('setting hardware controller to null');
          setHardwareController(null);
        }
      }
    }
  }

  // TODO: This bootup process causes some major confusion, not sure what we need here yet.
  // Seems like we get weirdness around the enter/exit/enter process happening very quickly.
  // Could be some kind of debounce-y solution.
  // Also we might not actually want to re-init controller state here?
  //
  // Putting this in a useEffect *should* mean this cleanup is called if either
  // (a) hardwareController changes or (b) if the component is unmounted.
  // useEffect(() => {
  //   hardwareController?.initController();
  //   return () => {
  //     hardwareController?.teardownController();
  //   };
  // }, [hardwareController]);

  return (
    <MIDIControllerContext.Provider value={{ controller: hardwareController }}>
      {children}
    </MIDIControllerContext.Provider>
  );
}
