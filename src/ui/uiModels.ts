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
  displayType: EncoderDisplayType;
}

export const velocityEncoder = (value: number): Encoder => {
  return {
    name: 'Velocity',
    value,
    displayType: 'number',
  };
};

export const gateEncoder = (value: number): Encoder => {
  return {
    name: 'Length',
    value,
    // TODO: do something different from 1-127 here...
    displayType: 'number',
  };
};

export const offsetEncoder = (value: number): Encoder => {
  return {
    name: 'Offset',
    value,
    // TODO: this should be +/- 50% eventually, for now can just push forward
    // I guess...
    displayType: 'percent',
  };
};
