import {
  WKMidiControlChangeMessage,
  WKMidiNoteOffMessage,
  WKMidiNoteOnMessage,
} from './kaoriSharedMessages';

export type KaoriIncomingControllerMidiMessage =
  | WKMidiNoteOnMessage
  | WKMidiNoteOffMessage
  | WKMidiControlChangeMessage;
