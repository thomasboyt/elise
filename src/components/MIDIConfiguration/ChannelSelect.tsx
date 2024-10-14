interface Props {
  noteChannel?: number | null;
  value: number | null;
  onChange(channel: number | null): void;
}

const channelItems = [...new Array(16)].map((_, idx) => (
  <option key={idx} value={idx + 1}>
    Channel {idx + 1}
  </option>
));

export function ChannelSelect(props: Props) {
  const { value, onChange, noteChannel } = props;

  let unsetItem = (
    <option key="unset" value="unset">
      ---
    </option>
  );
  if (noteChannel !== undefined) {
    unsetItem = (
      <option key="unset" value="unset">
        Use note channel {noteChannel !== null && `(${noteChannel})`}
      </option>
    );
  }
  const items = [unsetItem, ...channelItems];

  return (
    <select
      value={value ?? 'unset'}
      onChange={(e) => {
        const channel = parseInt(e.target.value);
        onChange(isNaN(channel) ? null : channel);
      }}
    >
      {items}
    </select>
  );
}
