import { MIDIControllerProvider } from './controllers/MIDIControllerContext';
import { EliseContextProvider } from './state/EliseContextProvider';
import { ControllerMessageHandler } from './controllers/ControllerMessageHandler';
import { VirtualController } from './components/VirtualController/VirtualController';
import { EliseUI } from './components/EliseUI';
import { demoProject } from './demoProject';
import { WebMidiPortProvider } from './midi/WebMidiPortProvider';
import { WebMidiLoader } from './midi/WebMidiLoader';
import { AUMidiPortProvider } from './midi/AUMidiPortProvider';

function App() {
  const audioUnitMode = document.location.search.includes('au');

  const inner = (
    <EliseContextProvider project={demoProject}>
      <MIDIControllerProvider>
        <EliseUI />
        <ControllerMessageHandler />
        <VirtualController />
      </MIDIControllerProvider>
    </EliseContextProvider>
  );

  if (audioUnitMode) {
    return <AUMidiPortProvider>{inner}</AUMidiPortProvider>;
  }

  return (
    <WebMidiLoader>
      <WebMidiPortProvider>{inner}</WebMidiPortProvider>
    </WebMidiLoader>
  );
}

export default App;
