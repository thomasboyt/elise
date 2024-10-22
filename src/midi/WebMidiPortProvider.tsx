import { ReactNode, useEffect, useRef, useState } from 'react';
import { Input, Output, PortEvent, WebMidi } from 'webmidi';
import { MidiPortContext } from './MidiPortContext';
import { MidiInputPort, MidiOutputPort } from './MidiPort';
import { WebMidiInputPort, WebMidiOutputPort } from './WebMidiPort';

interface Props {
  children: ReactNode;
}

export const WebMidiPortProvider = ({ children }: Props) => {
  const [inputs, setInputs] = useState<Record<string, MidiInputPort>>({});
  const [outputs, setOutputs] = useState<Record<string, MidiOutputPort>>({});
  const inputsRef = useRef<Record<string, MidiInputPort>>(inputs);
  const outputsRef = useRef<Record<string, MidiOutputPort>>(outputs);

  useEffect(() => {
    inputsRef.current = inputs;
    outputsRef.current = outputs;
  });

  useEffect(() => {
    function registerInput(port: Input) {
      const midiPort = new WebMidiInputPort(port.name, port as Input);
      midiPort.registerEventListeners();
      setInputs((inputs) => ({ ...inputs, [port.id]: midiPort }));
    }
    function registerOutput(port: Output) {
      const midiPort = new WebMidiOutputPort(port.name, port as Output);
      setOutputs((outputs) => ({ ...outputs, [port.id]: midiPort }));
    }

    // init ports
    WebMidi.inputs.forEach((input) => {
      registerInput(input as Input);
    });
    WebMidi.outputs.forEach((output) => {
      registerOutput(output as Output);
    });

    function handleWebMidiConnected(e: PortEvent) {
      if (e.type === 'input') {
        registerInput(e.port as Input);
      } else {
        registerOutput(e.port as Output);
      }
    }

    function handleWebMidiDisconnected(e: PortEvent) {
      if (e.type === 'input') {
        const port = e.port as Input;
        const midiPort = inputsRef.current[port.id];
        midiPort.unregisterEventListeners();
        setInputs((inputs) => {
          const copy = { ...inputs };
          delete copy[port.id];
          return copy;
        });
      } else {
        const port = e.port as Output;
        setOutputs((outputs) => {
          const copy = { ...outputs };
          delete copy[port.id];
          return copy;
        });
      }
    }

    WebMidi.addListener('connected', handleWebMidiConnected);
    WebMidi.addListener('disconnected', handleWebMidiDisconnected);

    return () => {
      WebMidi.removeListener('connected', handleWebMidiConnected);
      WebMidi.removeListener('disconnected', handleWebMidiDisconnected);
      for (const input of Object.values(inputsRef.current)) {
        input.unregisterEventListeners();
      }
    };
  }, []);

  return (
    <MidiPortContext.Provider value={{ inputs, outputs }}>
      {children}
    </MidiPortContext.Provider>
  );
};
