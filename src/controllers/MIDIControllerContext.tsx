import { createContext, ReactNode, useState } from 'react';
import { ControllerSurface } from './ControllerSurface';
import { LaunchkeyControllerSurface } from './launchkey/LaunchkeyControllerSurface';
import { WebMidi } from 'webmidi';
import { ControllerSurfaceGroup } from './ControllerSurfaceGroup';
import { VirtualControllerSurface } from './VirtualControllerSurface';

interface MIDIControllerContextShape {
  controller: ControllerSurface | null;
  virtualController: VirtualControllerSurface | null;
}

export const MIDIControllerContext = createContext<MIDIControllerContextShape>({
  controller: null,
  virtualController: null,
});

interface Props {
  children: ReactNode;
  inputId: string | null;
  outputId: string | null;
}

export function MIDIControllerProvider({ children, inputId, outputId }: Props) {
  // const [virtualController, setVirtualController] = useState(
  //   () => new VirtualControllerSurface(),
  // );
  // const [hardwareController, setHardwareController] =
  //   useState<HardwareControllerSurface | null>(null);

  const [controllerSurfaceGroup] = useState(() => new ControllerSurfaceGroup());

  if (inputId && outputId) {
    const hardwareController = controllerSurfaceGroup.getHardwareController();
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
        controllerSurfaceGroup.setHardwareController(controller);
      } else {
        if (hardwareController) {
          console.log(
            'selected hardware is not a launchkey; setting hardware controller to null',
          );
          controllerSurfaceGroup.setHardwareController(null);
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
    <MIDIControllerContext.Provider
      value={{
        controller: controllerSurfaceGroup,
        // we can get away with this because the virtual controller isn't
        // reset after construction
        virtualController: controllerSurfaceGroup.getVirtualController(),
      }}
    >
      {children}
    </MIDIControllerContext.Provider>
  );
}
