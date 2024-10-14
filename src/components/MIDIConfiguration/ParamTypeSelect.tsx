import { MidiParameterType } from '../../state/state';

interface Props {
  value: MidiParameterType;
  onChange(channel: MidiParameterType): void;
}

// this ensures type checking in the <option>s below
const MIDI_CC_OPTION: MidiParameterType = 'midiCc';
const MIDI_PC_OPTION: MidiParameterType = 'midiPc';
const MIDI_PITCHBEND_OPTION: MidiParameterType = 'midiPitchBend';

export function ParamTypeSelect(props: Props) {
  const { value, onChange } = props;

  return (
    <select
      value={value}
      onChange={(e) => {
        onChange(e.target.value as MidiParameterType);
      }}
    >
      <option value={MIDI_CC_OPTION}>CC</option>
      <option value={MIDI_PC_OPTION}>PC</option>
      <option value={MIDI_PITCHBEND_OPTION}>Pitch Bend</option>
    </select>
  );
}
