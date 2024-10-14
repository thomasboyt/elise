import { useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';
import { MIDIControllerProvider } from './controllers/MIDIControllerContext';
import { EliseContextProvider } from './state/EliseContextProvider';
import { ControllerMessageHandler } from './controllers/ControllerMessageHandler';
import { VirtualController } from './components/VirtualController/VirtualController';
import { EliseUI } from './components/EliseUI';
import { demoProject } from './demoProject';

function App() {
  const [webMidiEnabled, setWebMidiEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startWebMidi() {
      await WebMidi.enable({ sysex: true });

      if (!cancelled) {
        setWebMidiEnabled(true);
      }
    }
    startWebMidi();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!webMidiEnabled) {
    return <div>Waiting for web MIDI to be enabled...</div>;
  }

  return (
    <>
      <EliseContextProvider project={demoProject}>
        <MIDIControllerProvider>
          <EliseUI />
          <ControllerMessageHandler />
          <VirtualController />
        </MIDIControllerProvider>
      </EliseContextProvider>
    </>
  );
}

export default App;
