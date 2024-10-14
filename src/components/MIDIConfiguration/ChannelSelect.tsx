interface Props {
  value: number | null;
  onChange(channel: number | null): void;
}

const channelItems = [...new Array(16)].map((_, idx) => (
  <option key={idx} value={idx + 1}>
    Channel {idx + 1}
  </option>
));

export function ChannelSelect(props: Props) {
  const { value, onChange } = props;
  const items = [
    <option key="unset" value="unset">
      ---
    </option>,
    ...channelItems,
  ];

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
