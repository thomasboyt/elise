import { useEffect, useState } from 'react';
import { Input, Output, PortEvent, WebMidi } from 'webmidi';
import { EliseMIDIDevice } from './types';
import { DeviceSelector } from './DeviceSelector';
import { DebugLog } from './DebugLog';
import { MIDIControllerProvider } from './controllers/MIDIControllerContext';
import { DebugControls } from './DebugControls';
import { EliseContextProvider } from './state/EliseContextProvider';
import { StateTree } from './StateTree';
import { ControllerMessageHandler } from './controllers/ControllerMessageHandler';
import { VirtualController } from './components/VirtualController';

function addDeviceIfNotPresent(
  devices: EliseMIDIDevice[],
  device: EliseMIDIDevice,
) {
  if (devices.some((existing) => existing.id === device.id)) {
    return devices;
  }
  return [...devices, device];
}

function App() {
  const [webMidiEnabled, setWebMidiEnabled] = useState(false);
  const [inputDevices, setInputDevices] = useState<EliseMIDIDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<EliseMIDIDevice[]>([]);
  const [selectedInputDeviceId, setSelectedInputDeviceId] = useState<
    string | null
  >(null);
  const [selectedOutputDeviceId, setSelectedOutputDeviceId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function startWebMidi() {
      await WebMidi.enable({ sysex: true });

      if (!cancelled) {
        setWebMidiEnabled(true);
        const inputs = WebMidi.inputs.map((input) => ({
          id: input.id,
          name: input.name,
        }));
        setInputDevices(inputs);
        if (inputs.length) {
          const launchkeyDawInput = inputs.find(
            (input) =>
              input.name.includes('Launchkey') &&
              input.name.includes('MIDIIN2'),
          );
          if (launchkeyDawInput) {
            setSelectedInputDeviceId(launchkeyDawInput.id);
          } else {
            setSelectedInputDeviceId(inputs[0].id);
          }
        }
        const outputs = WebMidi.outputs.map((output) => ({
          id: output.id,
          name: output.name,
        }));
        setOutputDevices(outputs);
        if (outputs.length) {
          const launchkeyDawOutput = outputs.find(
            (output) =>
              output.name.includes('Launchkey') &&
              output.name.includes('MIDIOUT2'),
          );
          if (launchkeyDawOutput) {
            setSelectedOutputDeviceId(launchkeyDawOutput.id);
          } else {
            setSelectedOutputDeviceId(outputs[0].id);
          }
        }
      }
    }
    startWebMidi();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!webMidiEnabled) {
      return;
    }

    const handleWebMidiConnected = (e: PortEvent) => {
      const port = e.port as Input | Output;
      const device: EliseMIDIDevice = {
        name: port.name,
        id: port.id,
      };

      // the function form of setState is used here because often a whole bunch of these
      // events are fired at once and if we didn't use it, we'd be referencing the stale
      // state until the next render cycle
      if (port.type === 'input') {
        setInputDevices((inputDevices) =>
          addDeviceIfNotPresent(inputDevices, device),
        );
        if (inputDevices.length === 0) {
          setSelectedInputDeviceId(device.id);
        }
      } else {
        setOutputDevices((outputDevices) =>
          addDeviceIfNotPresent(outputDevices, device),
        );
        if (outputDevices.length === 0) {
          setSelectedOutputDeviceId(device.id);
        }
      }
    };

    WebMidi.addListener('connected', handleWebMidiConnected);

    return () => {
      WebMidi.removeListener('connected', handleWebMidiConnected);
    };
  }, [webMidiEnabled, outputDevices, inputDevices]);

  if (!webMidiEnabled) {
    return <div>Waiting for web MIDI to be enabled...</div>;
  }

  return (
    <>
      <DeviceSelector
        label="Input"
        devices={inputDevices}
        currentId={selectedInputDeviceId}
        onChange={setSelectedInputDeviceId}
      />
      <DeviceSelector
        label="Output"
        devices={outputDevices}
        currentId={selectedOutputDeviceId}
        onChange={setSelectedOutputDeviceId}
      />
      <MIDIControllerProvider
        inputId={selectedInputDeviceId}
        outputId={selectedOutputDeviceId}
      >
        <EliseContextProvider>
          <ControllerMessageHandler />
          <DebugControls />
          <VirtualController />
          <DebugLog />
          <StateTree />
        </EliseContextProvider>
      </MIDIControllerProvider>
    </>
  );
}

export default App;
