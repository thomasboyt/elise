import { EliseMIDIDevice } from './types';

interface Props {
  label: string;
  devices: EliseMIDIDevice[];
  currentId: string | null;
  onChange: (value: string) => void;
}

export function DeviceSelector(props: Props) {
  const { label, devices, currentId, onChange } = props;
  return (
    <label>
      {label}{' '}
      <select
        value={currentId ?? undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {devices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name}
          </option>
        ))}
      </select>
    </label>
  );
}
