import { useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';
// import { DebugLog } from './DebugLog';
import { MIDIControllerProvider } from './controllers/MIDIControllerContext';
import { DebugControls } from './DebugControls';
import { EliseContextProvider } from './state/EliseContextProvider';
import { StateTree } from './StateTree';
import { ControllerMessageHandler } from './controllers/ControllerMessageHandler';
import { VirtualController } from './components/VirtualController/VirtualController';
import { EliseUI } from './components/EliseUI';

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
      <EliseContextProvider>
        <MIDIControllerProvider>
          <EliseUI />
          <ControllerMessageHandler />
          <div>
            <DebugControls />
            <VirtualController />
            {/* <DebugLog /> */}
            <StateTree />
          </div>
        </MIDIControllerProvider>
      </EliseContextProvider>
    </>
  );
}

export default App;
