import { createContext } from 'react';
import { MidiInputPort, MidiOutputPort } from './MidiPort';

export interface MidiPortContextShape {
  inputs: Record<string, MidiInputPort>;
  outputs: Record<string, MidiOutputPort>;
}

export const MidiPortContext = createContext<MidiPortContextShape>({
  inputs: {},
  outputs: {},
});
