import { useContext } from 'react';
import { ControllerSurface } from './ControllerSurface';
import { MIDIControllerContext } from './MIDIControllerContext';

export function useMidiController(): ControllerSurface | null {
  const context = useContext(MIDIControllerContext);
  if (!context) {
    throw new Error('Missing midi controller context');
  }
  return context.controller;
}
