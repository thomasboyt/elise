import { useContext } from 'react';
import { MidiPortContext } from './MidiPortContext';

export function useMidiPorts() {
  return useContext(MidiPortContext);
}
