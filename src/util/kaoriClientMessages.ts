import { z } from 'zod';
import { WKMidiMessage } from './kaoriSharedMessages';

export type KaoriClientRequest =
  | { type: 'midiController'; detail: WKMidiMessage }
  | { type: 'getInitialPorts' };

export const getInitialPortsReplySchema = z.object({
  inputCount: z.number(),
  outputCount: z.number(),
});
