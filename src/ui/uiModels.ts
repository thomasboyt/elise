export type EncoderDisplayType = 'number' | 'percent';

export type PadMode =
  | 'clip'
  | 'track'
  | 'scene'
  | 'mute'
  | 'drum'
  | 'chromatic';

export type PadColor = 'off' | 'red' | 'green' | 'blue' | 'white';
export interface Encoder {
  name: string;
  // A null value means the parameter is disabled and any inputs
  // will be ignored
  value: number | null;
  // TODO
  // displayType: EncoderDisplayType;
}
