import { useContext } from 'react';
import { IControllerSurface } from './ControllerSurface';
import { MIDIControllerContext } from './MIDIControllerContext';
import { VirtualControllerSurface } from './VirtualControllerSurface';

export function useMidiController(): IControllerSurface | null {
  const context = useContext(MIDIControllerContext);
  if (!context) {
    throw new Error('Missing midi controller context');
  }
  return context.controller;
}

export function useVirtualController(): VirtualControllerSurface {
  const context = useContext(MIDIControllerContext);
  if (!context) {
    throw new Error('Missing midi controller context');
  }
  if (!context.virtualController) {
    throw new Error('Missing virtual controller in context');
  }
  return context.virtualController;
}

export function useHardwareConnected(): boolean {
  const context = useContext(MIDIControllerContext);
  if (!context) {
    throw new Error('Missing midi controller context');
  }
  return context.hardwareConnected;
}
