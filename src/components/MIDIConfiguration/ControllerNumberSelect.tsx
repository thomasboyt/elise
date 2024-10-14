interface Props {
  value: number;
  onChange(controllerNumber: number): void;
}

const items = [...new Array(128)].map((_, idx) => (
  <option key={idx} value={idx}>
    {idx}
  </option>
));

export function ControllerNumberSelect(props: Props) {
  const { value, onChange } = props;

  return (
    <select
      value={value}
      onChange={(e) => {
        onChange(parseInt(e.target.value));
      }}
    >
      {items}
    </select>
  );
}
