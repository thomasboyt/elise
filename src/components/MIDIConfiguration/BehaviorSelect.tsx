import { MidiCcBehavior } from '../../state/state';

interface Props {
  value: MidiCcBehavior;
  onChange(channel: MidiCcBehavior): void;
}

// this ensures type checking in the <option>s below
const STEP_OPTION: MidiCcBehavior = 'step';
const SLIDE_OPTION: MidiCcBehavior = 'slide';

export function BehaviorSelect(props: Props) {
  const { value, onChange } = props;

  return (
    <select
      value={value}
      onChange={(e) => {
        onChange(e.target.value as MidiCcBehavior);
      }}
    >
      <option value={STEP_OPTION}>Step</option>
      <option value={SLIDE_OPTION}>Slide</option>
    </select>
  );
}
