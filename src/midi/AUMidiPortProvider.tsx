import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { MidiPortContext } from './MidiPortContext';
import { MidiInputPort, MidiOutputPort } from './MidiPort';
import { AUMidiInputPort, AUMidiOutputPort } from './AUMidiPort';
import { WKBridge } from '../util/WKBridge';

const portNumberKey = (number: number) => `port-${number}`;
function portsById<T extends MidiInputPort | MidiOutputPort>(
  ports: T[],
): Record<string, T> {
  const byId: Record<string, T> = {};
  for (let i = 0; i < ports.length; i++) {
    byId[portNumberKey(i)] = ports[i];
  }
  return byId;
}

interface Props {
  children: ReactNode;
}

/**
 * Audio Unit MIDI ports are just numbered, with no additional information
 * available about what's attached to them. Thus we just use arrays to keep
 * track of how many ports there are.
 *
 * I'm treating this as a dynamic number so users could eventually get kind of
 * weird with the port setups - there's a lot of use cases for splitting up the
 * sequencer output into multiple ports to make it easier to route MIDI without
 * having to map everything by channel. Similarly, inputs might get
 * added/removed based on which controller a user selects, to ensure there's the
 * correct amount of ports for the controller.
 */
export const AUMidiPortProvider = ({ children }: Props) => {
  // TODO: move this to a separate provider
  const [bridge] = useState(() => new WKBridge());

  const [inputs, setInputs] = useState<MidiInputPort[]>([]);
  const [outputs, setOutputs] = useState<MidiOutputPort[]>([]);
  const inputsRef = useRef(inputs);
  const outputsRef = useRef(outputs);

  const inputsById = useMemo(() => portsById(inputs), [inputs]);
  const outputsById = useMemo(() => portsById(outputs), [outputs]);

  useEffect(() => {
    inputsRef.current = inputs;
    outputsRef.current = outputs;
  });

  useEffect(() => {
    let unregistered = false;

    function registerInput(portNumber: number) {
      const midiPort = new AUMidiInputPort(portNumber, bridge);
      midiPort.registerEventListeners();
      setInputs((inputs) => [...inputs, midiPort]);
    }
    function registerOutput(portNumber: number) {
      const midiPort = new AUMidiOutputPort(portNumber);
      setOutputs((outputs) => [...outputs, midiPort]);
    }

    function updatePorts({
      inputCount,
      outputCount,
    }: {
      inputCount: number;
      outputCount: number;
    }) {
      if (inputsRef.current.length > inputCount) {
        // remove extra inputs
        const diff = inputCount - inputsRef.current.length;
        inputsRef.current
          .slice(-diff)
          .forEach((input) => input.unregisterEventListeners());
        setInputs((inputs) => inputs.concat().slice(0, diff));
      } else if (inputsRef.current.length < inputCount) {
        // add inputs
        const diff = inputCount - inputsRef.current.length;
        for (let i = 0; i < diff; i++) {
          registerInput(inputCount + i);
        }
      }

      if (outputsRef.current.length > outputCount) {
        // remove extra outputs
        const diff = outputCount - outputsRef.current.length;
        setOutputs((outputs) => outputs.concat().slice(0, diff));
      } else if (outputsRef.current.length < outputCount) {
        // add outputs
        const diff = outputCount - outputsRef.current.length;
        for (let i = 0; i < diff; i++) {
          registerOutput(outputCount + i);
        }
      }
    }

    async function setInitialPorts() {
      const { inputCount, outputCount } = await bridge.getInitialPorts();
      if (!unregistered) {
        updatePorts({ inputCount, outputCount });
      }
    }

    setInitialPorts();

    bridge.register();
    bridge.on('updatePorts', updatePorts);

    return () => {
      unregistered = true;
      bridge.unregister();
      bridge.off('updatePorts', updatePorts);
      for (const input of inputsRef.current) {
        input.unregisterEventListeners();
      }
    };
  }, [bridge]);

  return (
    <MidiPortContext.Provider
      value={{ inputs: inputsById, outputs: outputsById }}
    >
      {children}
    </MidiPortContext.Provider>
  );
};
