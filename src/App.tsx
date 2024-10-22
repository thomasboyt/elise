import { MIDIControllerProvider } from './controllers/MIDIControllerContext';
import { EliseContextProvider } from './state/EliseContextProvider';
import { ControllerMessageHandler } from './controllers/ControllerMessageHandler';
import { VirtualController } from './components/VirtualController/VirtualController';
import { EliseUI } from './components/EliseUI';
import { demoProject } from './demoProject';
import { WebMidiPortProvider } from './midi/WebMidiPortProvider';
import { WebMidiLoader } from './midi/WebMidiLoader';

function App() {
  return (
    <WebMidiLoader>
      <WebMidiPortProvider>
        <EliseContextProvider project={demoProject}>
          <MIDIControllerProvider>
            <EliseUI />
            <ControllerMessageHandler />
            <VirtualController />
          </MIDIControllerProvider>
        </EliseContextProvider>
      </WebMidiPortProvider>
    </WebMidiLoader>
  );
}

export default App;
